const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/deviceDB')
.then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));
//mongoose.connect('mongodb://127.0.0.1:27017/deviceDB', { useNewUrlParser: true, useUnifiedTopology: true })
    

// Define Mongoose Schema and Model
const deviceSchema = new mongoose.Schema({
    serialNumber: String,
    temperature: Number,
    humidity: Number,
    dateTime: Date
});

const Device = mongoose.model('Device', deviceSchema);

// Routes
// Render HTML table
app.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const devices = await Device.find().sort({ dateTime: -1 }).skip(skip).limit(limit);
    const total = await Device.countDocuments();

    res.render('index', {
        devices,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    });
});

// POST data to the database
app.post('/devices', async (req, res) => {
    const { serialNumber, temperature, humidity, dateTime } = req.body;
    const device = new Device({ serialNumber, temperature, humidity, dateTime: new Date(dateTime) });
    await device.save();
    res.send({ message: 'Device data saved successfully' });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));