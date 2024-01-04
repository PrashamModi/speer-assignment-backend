const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://heckerbot007:hecker007@cluster0.9x1qpra.mongodb.net/'

const connectToMongo = async () => {
    await mongoose.connect(mongoURI);
    console.log("Connected To Mongo");
}
module.exports = connectToMongo;