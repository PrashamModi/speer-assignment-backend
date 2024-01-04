const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
var fetchuser = require("../middleware/fetchuser");
const router = express.Router();


const JWT_SECRET = 'PrashammmJodd';

//Route1 : Create a user using POST "/api/auth/createuser" . NO llogin required
router.post(
  "/signup",
  [
    //Express validator checking the details entered by user are standard
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Passwords must be atleast 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    //If there are errors return Bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
     

    //try catch is for some unwanted error occured.
    try {
      //Check wheather a user with same email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json(success, "Sorry user witih same email already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user : {
          id : user.id
        }
      } 
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success, authtoken})
    } catch (error) {
      console.error(error.message);
      res.status(500).json("Some Error Occured");
    }
  }
);

//Route2: Authenticate a user using POST "/api/auth/login" . NO llogin required
router.post(
  "/login",
  [
    //Express validator checking the details entered by user are standard
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password Cannot Be Blank").exists(),
  ],
  async (req, res) => {
    let  success = false;

    //If there are errors return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    try {
      let user = await User.findOne({email});
      if(!user){
        success = false;
        return res.status(400).json({error : "Please try to login with correct credentials"});
      }

      const comparePassword = await bcrypt.compare(password, user.password);
      if(!comparePassword){
        success = false;
        return res.status(400).json({success, error : "Please try to login with correct password"});
      }
      const data = {
        user : {
          id : user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.send({success, authtoken});

    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error")
    }
  })

//Route3: Get logged in user details using: POST "api/auth/getuser". Login Required
router.post('/getuser',fetchuser, async (req, res)=>{
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;