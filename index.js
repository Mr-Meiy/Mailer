const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
let port = process.env.PORT || 80||6000;

app.get("/", (req, res) => {
    res.status(200).send('App Started');
    console.log('App Started');
})

// Read Template
var readHTMLFile = function(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
        if (err) {
            throw err;
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

// Transport Settings
smtpTransport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: '404mkhacks@gmail.com',
        pass: 'Meiy@#799'
    }
}));

//PDF START
var findDate = () => {
    var d = new Date()
    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return String(month[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear())
}
const getPdf = (name) => {
    const doc = new PDFDocument({
        size: [816, 1056],
        margins: {
            top: 72,
            bottom: 72,
            left: 72,
            right: 72
        },
        layout: 'portrait',
        info: {
            Title: 'Internship Offer Letter',
            Author: 'Coding Bachelors',
            Subject: 'CB Internship Offer Letter',
            Keywords: 'pdf;CB;'
        }
    });
    const certificateName = "certificate.pdf";
    const certificatePath = path.join("views", certificateName);

    var filepath = doc.pipe(fs.createWriteStream(certificatePath));
    // doc.pipe(name);
    doc.image(__dirname + '/assets/CBInternOffer.png', 0, 0, { fit: [816, 1056] })
    doc.fillColor('#083240').font(__dirname + '/fonts/Aileron-Bold.otf').fontSize(15).text(name + ',', 128, 265);
    doc.fillColor('black').font(__dirname + '/fonts/Aileron-Bold.otf').fontSize(15).text(findDate() + ',', 128, 870);
    doc.end();
    console.log("✔ Pdf Created");
    return filepath;
};
//PDF END


//POST - SendCallLetter
app.post("/SendCallLetter", async(req, res) => {
    //await generatePDF(req.body.name);
    console.log(req.body.name)
    readHTMLFile(__dirname + '/templates/template.html', function(err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            "Applicant": req.body.name
        }
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: '404mkhacks@gmail.com',
            to: req.body.email,
            subject: 'Welcome to CB',
            //text: req.body.email,
            html: htmlToSend,
            attachments: getPdf(req.body.name)
        };
        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                res.send("Error: " + info)
                console.log(error)
                callback(error)
            } else {
                res.send('✔ Email sent to ' + req.body.name + " | " + req.body.email + " | " + response.response)
                console.log('✔ Email sent : ' + req.body.name + " | " + req.body.email + " | " + response.response);
            }
        });
    });
})

//Port Specification
app.listen(port)
console.log("App runs at http://localhost:" + port)
