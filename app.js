const express = require('express');
const app = express();
const mongoose = require('mongoose');
const databaseURL = "mongodb://localhost:27017/eloDB";
const Person = require('./models/Person');
const personRoutes = require('./routes/Person');
const bodyParser = require('body-parser');
// ============ Connect Database ===============
mongoose.connect(process.env.DATABASEURL || databaseURL);
const db = mongoose.connection;
db.on('error', () => {
  console.error("ERROR CONNECTING TO DATABASE");
});
db.on('open', () => {
  console.log("Connected to Database");
});

// ============ Setup routes ===================
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use('*', personRoutes);
app.listen(process.env.PORT || 3000, process.env.IP,  () => {
  console.log("Running");
});
