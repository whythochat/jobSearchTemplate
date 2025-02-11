const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'src')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.post('/generate', upload.single('picture'), async function (req, res) {

    let param = {
        'fullName': req.body.fullName,
        'qualification': req.body.qualification,
        'jobTypes': req.body.jobTypes,
        'experience': req.body.experience,
        'email': req.body.email,
        'phone': req.body.phone,
        'font': req.body.fontDropdown,
        'fontColor': req.body.fontColor,
        'bgColor': req.body.bgColor
    }
    const picName = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const picPath = `uploads/${picName}.jpeg`
    const buffer = req.file.buffer;
    const metadata = await sharp(buffer).metadata();
    const uncimageWidth = metadata.width;
    const uncimageHeight = metadata.height;
    await sharp(buffer).resize(Math.floor(uncimageWidth / 2), Math.floor(uncimageHeight / 2)).jpeg({ quality: 50 }).toFile(picPath);

    const pdf = new PDFDocument({margin: 10, size: [252, 144]});

    pdf.rect(0, 0, pdf.page.width, pdf.page.height).fill(param.bgColor);
    pdf.fillColor(param.fontColor);
    const pdfImageWidth = 0.3 * pdf.page.width; // Adjust as needed
    const pdfImageHeight = (uncimageHeight / uncimageWidth) * pdfImageWidth; // Maintain aspect ratio
    const imageX = pdf.page.width - pdfImageWidth - 20; // Right side, 20px from the edge
    const imageY = 20; // Top, 20px from the top

    pdf.image(picPath, imageX, imageY, { fit: [pdfImageWidth, pdfImageHeight] });

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
    pdf.fontSize(8).text(`I have a qualification in ${param.qualification} so you know I'd be good at ${param.jobTypes}.`,{ align: "left", width: textWidth });
    if (param.experience) {
        pdf.fontSize(8).text(`I have ${param.experience} experience so I am a professional.`,{ align: "left", width: textWidth });
    }
    pdf.fontSize(8).text(`Feel free to contact me on my email(${param.email}) or my phone number(${param.phone}).`,{ align: "left", width: textWidth });
    res.attachment('job_request.pdf');
    pdf.pipe(res);
    pdf.end();  
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
})