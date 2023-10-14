const mongoose = require("mongoose") 
const db = mongoose.connect(process.env.DB_URL, {
   useNewUrlParser: true, 
   useUnifiedTopology: true
    
})
if (db) { 
  console.log("connected to database")
}

exports.modules = db ;