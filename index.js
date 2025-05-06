require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });  

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

app.get('/main.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.post('/register-user', async (req, res) => {
    const {
        email, username, first_name, last_name, driving_license,
        national_id, number_plate, address, gps_tracker_no, password,
        country, emergency_contact_number,emergency_contact_number_of_a_related_person
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users SET ?', {
        email, username, first_name, last_name, driving_license,
        national_id, number_plate, address, gps_tracker_no,
        password: hashed, country, emergency_contact_number, emergency_contact_number_of_a_related_person
    }, (err) => {
        if (err) return res.send('Error saving user');
        res.send('User registered successfully');
    });
});

app.post('/register-admin', async (req, res) => {
    const {
        email, username, admin_type, country,
        emergency_response, service_info, latitude, longitude, password
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    db.query('INSERT INTO admins SET ?', {
        email, username, admin_type, country,
        emergency_response, service_info, latitude, longitude, password: hashed
    }, (err) => {
        if (err) return res.send('Error saving admin');
        res.send('Admin registered successfully');
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
