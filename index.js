const https = require('https');
const express = require('express');
const mongoose = require("mongoose");
var app = express();
var bodyparser = require('body-parser');
var nodemailer = require('nodemailer');

app.use(bodyparser.urlencoded({ extended: true }));

// connection
mongoose.connect('mongodb://localhost:27017/myapp', {useNewUrlParser: true, useUnifiedTopology: true});

//defining schema
const mySchema = new mongoose.Schema({
    name: String,
    email : String,
    pin : Number
})

// adding collection using model
const collection = new mongoose.model("collection",mySchema);

//get index page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

//get registration page
app.get("/registration.html",(req,res)=>{
  res.sendFile(__dirname + "/registration.html");
})
var pin;
var email;

//post registration page
app.post("/registration.html",(req,res)=>{
  res.send("Submitted successfully, kindly go back and log in");
  name = req.body.name;
  var email = req.body.email;
  var pin = req.body.pin;

  //create or insert document
  const data = new collection({
  name : name,
  email: email,
  pin: pin
  })
  data.save();
})

//post log in page
app.post("/",async (req, res) => {
    pin = req.body.login_pin;
    email = req.body.login_email;
    // console.log(pin+"\n"+email);
    var user = await collection.findOne({email: email,pin: pin}, (err,obj)=>{
    }) 
    if(user){
      res.send("a mail will be sent to your given mail id about vaccine details");
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      today = dd + '-' + mm + '-' + yyyy;
      const link = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=" + pin + "&date=" + today
  
      https.get(link, (response) => {
          response.on('data', (chunk) => {
              const objdata = JSON.parse(chunk);
              var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: 'docwilliam98@gmail.com',
                    pass: 'sinusharma'
                  }
                });
                
                var mailOptions = {
                  from: 'docwilliam98@gmail.com',
                  to: `${email}`,
                  subject: 'cowin info',
                  text: `center name: ${objdata.sessions[0].name}
                           address: ${objdata.sessions[0].address}
                           date: ${objdata.sessions[0].date}
                           vaccine name: ${objdata.sessions[0].vaccine}
                           vaccine doses available: Dose 1: ${objdata.sessions[0].available_capacity_dose1} Dose 2: ${objdata.sessions[0].available_capacity_dose2}`
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
          })
      })
    }else{
        res.send("invalid details");
    } 

})
app.listen(8000);
