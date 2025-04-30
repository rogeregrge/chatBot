const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/send', async (req, res) => {
    try {
        const message = await client.create({
            body: 'Hello from Super Expansão!',
            from: process.env.TWILIO_PHONE_NUMBER,
            to: 'whatsapp:+18383681723'
        });
        res.send('Message Delivered!' + message.sid);
    } catch (err) {
        console.error(err);
    res.status(500).send('Error when sending message');
}
    });