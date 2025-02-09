const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const PDFDocument = require('pdfkit');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'pictures'))
    },
    filename: function (req, file, cb) {
        var newFileName = Math.random().toString(36).substring(2, 10) + (path.extname(file.originalname)).toLowerCase();
        cb(null, newFileName)
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'src')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.post('/generate', upload.single('picture'), function (req, res) {

    param = {
        'fullName': req.body.fullName,
        'qualification': req.body.qualification,
        'jobTypes': req.body.jobTypes,
        'email': req.body.email,
        'phone': req.body.phone,
        'font': req.body.fontDropdown,
    }

    const buffer = req.file.path;

    const pdf = new PDFDocument({margin: 10, size: [252, 144]});
    pdf.pipe(res);

    const imageWidth = 50; // Adjust as needed
    const imageHeight = 100; // Adjust as needed
    const imageX = pdf.page.width - imageWidth - 20; // Right side, 20px from the edge
    const imageY = 20; // Top, 20px from the top

    pdf.image(buffer, imageX, imageY, { fit: [imageWidth, imageHeight] });

    switch (param.font) {
        case 'outfit':
            pdf.font(path.join(__dirname, 'src', 'font', 'outfit.ttf'));
            break;
        case 'Playfair':
            pdf.font(path.join(__dirname, 'src','font', 'Playfair.ttf'));
            break;
        case 'papyrus':
            pdf.font(path.join(__dirname, 'src','font', 'papyrus.ttf'));
            break;
        case 'comicsans':
            pdf.font(path.join(__dirname, 'src','font', 'comicsans.ttf'));
            break;
        default:
            pdf.font(path.join(__dirname, 'src','font', 'outfit.ttf'));
            break;
    }

    const textWidth = 150;
    pdf.fontSize(16).text("Job request", { align: "left" });
    pdf.moveDown();
    pdf.fontSize(8).text(`Hi my name is ${param.fullName}`,{ align: "left", width: textWidth});
    pdf.fontSize(8).text(`I have a qualification in ${param.qualification} so you know I'd be good at job(s) like ${param.jobTypes}.`,{ align: "left", width: textWidth });
    pdf.fontSize(8).text(`My email is ${param.email} and my phone number is ${param.phone}.`,{ align: "left", width: textWidth });
    pdf.end();
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
})