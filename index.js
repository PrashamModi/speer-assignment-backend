const connectToMongo = require("./db");
const express = require('express')
const app = express()
var cors = require('cors');
const rateLimitMiddleware = require("./middleware/rateLimiter"); 

const port = 3000

connectToMongo();

app.use(express.json()) 
app.use(cors());
app.use(rateLimitMiddleware);

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})