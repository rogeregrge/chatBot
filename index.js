const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Rota básica para teste
app.get('/', (req, res) => {
    console.log('Recebido GET /');
    res.status(200).send('Tudo funcionand');
  });

// Rota de envio de mensagem
app.get('/send', async (req, res) => {
  try {
    const message = await client.messages.create({
      body: 'Olá! Aqui é a Super Expansão. Temos uma nova entrega para você!',
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:+5511959625178'
    });
    res.send('Message Delivered! SID: ' + message.sid);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem:', err);  // <-- Mostra erro real
    res.status(500).send('Erro ao enviar mensagem');
  }
});

// Rota do webhook do Twilio
app.post('/webhook', (req, res) => {
  const twiml = new MessagingResponse();
  const msg = req.body.Body.trim().toLowerCase();
  const from = req.body.From;

  if (msg.includes('sim')) {
    twiml.message('Ótimo! Um atendente entrará em contato com você em breve.');
    console.log('Interessado:', from);
  } else {
    twiml.message('Tudo bem! Qualquer coisa estamos à disposição.');
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Escutar na porta correta para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
