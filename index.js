const https = require('https');
var requests = require('requests');
const express = require('express');
var app = express();
var bodyparser = require('body-parser');
var nodemailer = require('nodemailer');

app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/main.html")
})

var pin;
var email;

app.post("/", (req, res) => {
    res.send("successfully submitted and you will recieve a mail on given mail address");
    pin = req.body.pin;
    email = req.body.email;
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

})
app.listen(8000);