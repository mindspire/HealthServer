const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: './uploads/' });

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var nano = require('nano')('http://J:jake007ad@localhost:5984');
// nano.db.create('voicereadings');
const voicedb = nano.db.use('voicereadings');
// nano.db.create('notes');
const notesdb = nano.db.use('notes');
// nano.db.create('analysis');
const analysisdb = nano.db.use('analysis');
// nano.db.create('bgusage');
const bgusagedb = nano.db.use('bgusage');

const port = 3000;

const spawn = require('child_process').spawn;


app.get('/', (req, res) => res.send('Server Running'))

app.get('/runscript', (req, res) => {

    // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will 
    // so, first name = Mike and last name = Will 
    var process = spawn('python', ["./script.py",
        req.query.firstname,
        req.query.lastname]);

    // Takes stdout data from script which executed 
    // with arguments and send this data to res object 
    process.stdout.on('data', (data) => {
        res.send(data.toString());
    })
})

app.post('/submitnotes', (req, res) => {
    var note = req.body.notes;
    var wheelreading = req.body.wheelreading;
    var time = new Date();

    var currenttime = time.getDay() + "/" + time.getMonth()
        + "/" + time.getFullYear() + " @ "
        + time.getHours() + ":"
        + time.getMinutes() + ":" + time.getSeconds();

    console.log(note);
    console.log(wheelreading);
    console.log(currenttime);

    // Insert the readings in the mental database
    notesdb.insert({ note: note, wheelreading: wheelreading, currentime: currenttime }, null, function (err, body) {
        if (err) {
            console.log(err)
            res.send(err.toString());
        } else {
            console.log(body)
            res.send(data.toString());
        }
    })
})

app.post('/uploadAnalysis', (req, res) => {
    var analysis = req.body;
    console.log(analysis);

    // Insert the readings in the mental database
    analysisdb.insert({ analysis: analysis }, null, function (err, body) {
        if (err) {
            console.log(err)
            res.send(err.toString());
        } else {
            console.log(body)
            res.send(analysis);
        }
    })
})

app.post('/submitBGUsage', (req, res) => {
    var analysis = req.body;
    console.log(analysis);

    // Insert the readings in the mental database
    bgusagedb.insert({ analysis: analysis }, null, function (err, body) {
        if (err) {
            console.log(err)
            res.send(err.toString());
        } else {
            console.log(body)
            res.send(analysis);
        }
    })
})

app.post('/upload', upload.single('recording'), (req, res) => {
    if (req.file) {
        console.log('Uploading file...');
        var filename = 'untitled.wav'; //THIS IS THE FILE NAME
        var uploadStatus = 'File Uploaded Successfully';

        // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will 
        // so, first name = Mike and last name = Will 
        var process = spawn('python', ["./script.py"]);

        // Takes stdout data from script which executed 
        // with arguments and send this data to res object 
        process.stdout.on('data', (data) => {
            //res.send(data.toString());

            // Insert the readings in the mental database
            voicedb.insert({ info: data.toString() }, null, function (err, body) {
                if (err) {
                    console.log(err)
                    res.send(err.toString());
                } else {
                    console.log(body)
                    res.send(data.toString());
                }
            })
        })
    } else {
        console.log('No File Uploaded');
        var filename = 'FILE NOT UPLOADED';
        var uploadStatus = 'File Upload Failed';
    }

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))