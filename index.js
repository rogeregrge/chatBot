const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Armazenamento em memória por número de telefone
const conversations = {};

app.post('/webhook', (req, res) => {
  const twiml = new MessagingResponse();
  const msg = req.body.Body.trim().toLowerCase();
  const from = req.body.From;

  // Criar novo usuário se ainda não existe
  if (!conversations[from]) {
    conversations[from] = { step: 1 };
  }

  const user = conversations[from];

  switch (user.step) {
    case 1:
      twiml.message('Olá! Você deseja solicitar uma entrega? (responda "sim" ou "não")');
      user.step = 2;
      break;

    case 2:
      if (msg.includes('sim')) {
        twiml.message('Perfeito! Qual o bairro da coleta?');
        user.step = 3;
      } else {
        twiml.message('Tudo bem! Se precisar, estamos à disposição.');
        delete conversations[from]; // Resetar conversa
      }
      break;

    case 3:
      user.bairro = msg;
      twiml.message('Ótimo! Qual o horário desejado para a retirada?');
      user.step = 4;
      break;

    case 4:
      user.horario = msg;
      twiml.message('Obrigado! Um atendente entrará em contato com você em breve para confirmar os detalhes.');

      console.log('🚨 Atendimento humano necessário:');
      console.log(`Telefone: ${from}`);
      console.log(`Bairro: ${user.bairro}`);
      console.log(`Horário: ${user.horario}`);

      // Aqui você pode disparar alerta por WhatsApp, e-mail, etc.
      delete conversations[from]; // Conversa finalizada
      break;

    default:
      twiml.message('Não entendi. Vamos começar de novo...');
      delete conversations[from];
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
})

// Envio manual de mensagem via query param
app.get('/send', async (req, res) => {
  const numero = req.query.numero;

  if (!numero || !numero.startsWith('+55')) {
    return res.status(400).send('Número inválido. Use o formato: +55DDDNÚMERO');
  }

  try {
    const message = await client.messages.create({
      body: 'Olá! Aqui é o bot da Super Expansão. Se você recebeu esta mensagem, está funcionando! 🚀',
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${numero}`
    });

    res.send('✅ Mensagem enviada com sucesso! SID: ' + message.sid);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem:', err.message);
    res.status(500).send('Erro ao enviar mensagem');
  }
});

app.get('/', (req, res) => {
  res.send('✅ Bot de WhatsApp está rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
;
