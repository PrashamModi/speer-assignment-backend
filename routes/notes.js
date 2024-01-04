const express = require("express");
var fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const router = express.Router();

//1. Get all notes using : GET "api/notes/". Login required

try {
  router.get("/", fetchuser, async (req, res) => {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  });
} catch (error) {
  console.log(error.message);
  res.status(500).send("Internal Server Errorr");
}

//1.1 Get note with an id
try {
  router.get("/:id", fetchuser, async (req, res) => {
    const note = await Notes.find({ user: req.user.id, id: req.params.id });
    res.json(note);
  });
} catch (error) {
  console.log(error.message);
  res.status(500).send("Internal Server Error");
}

//2. Add a new Note using: POST "api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchuser,
  [
    //Express validator checking the details entered by user are standard
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //If there are errors return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Errorr");
    }
  }
);

//3.Update an existing Note using : POST "/api/notes/updatenote". Login required
router.put("/update/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  //Create a newNote object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  //Check if logged in user is same as the user who created the node
  let note = await Notes.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not Found");
  }

  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }
  //Find the note to be updated and update it
  note = await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json(note);
});

//4.Delete an existing Note using : POST "/api/notes/deletenote". Login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    //Allow deleteion only if user owns this note.
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Error");
  }
});

//5. Search based on keywords
try {
  router.get("/search", fetchuser, async (req, res) => {
    const { keywords } = req.query;

    try {
      const notes = await Notes.find({
        content: { $regex: new RegExp(keywords, "i") },
      });
      return res.json(notes);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Error");
    }
  });
} catch (error) {
  console.log(error.message);
  res.status(500).send("Internal Error");
}

module.exports = router;
