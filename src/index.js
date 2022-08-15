require('./config/dotenv');

const PORT = 443;
const { CERT_FULLCHAIN_PATH, CERT_PRIVATE_KEY_PATH, CERT_PUBLIC_GNET } = process.env;
const fs = require('fs');
const https = require('https')
const express = require('express');
const logger = require('morgan');
const { GerenciaNet } = require('./client');
const { auth } = require('./client/GerenciaNet');

const httpsOptions = {
  cert: fs.readFileSync(CERT_FULLCHAIN_PATH), // Certificado fullchain do dominio
  key: fs.readFileSync(CERT_PRIVATE_KEY_PATH), // Chave privada do domínio
  ca: fs.readFileSync(CERT_PUBLIC_GNET),   // Certificado público da Gerencianet
  minVersion: "TLSv1.2",
  requestCert: true,
  rejectUnauthorized: false, //Mantenha como false para que os demais endpoints da API não rejeitem requisições sem MTLS
};
  
const app = express();
const httpsServer = https.createServer(httpsOptions, app);

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

app.get('/', (req, res) => {
  res.send('Hello')
})

app.post('//pix', (req, res) => {
  
  console.log(req.body);
  res.status(200).end();
})

app.post("/webhook", (request, response) => {
  // Verifica se a requisição que chegou nesse endpoint foi autorizada
  if (request.socket.authorized) { 
      response.status(200).end();
  } else {
      response.status(401).end();
  }
});

// Endpoind para recepção do webhook tratando o /pix
app.post("/webhook/pix", async (request, response) => {
  if (request.socket.authorized){
      //Seu código tratando a callback
      /* EXEMPLO:
      var body = request.body;
      filePath = __dirname + "/data.json";
      fs.appendFile(filePath, JSON.stringify(body) + "\n", function (err) {
          if (err) {
              console.log(err);
          } else {
              response.status(200).end();
          }
      })*/

        const authResponse = await auth();
        console.log('Authentication', authResponse);
        console.log(request.body);
      response.status(200).end();
  }else{
      response.status(401).end();
  }
});

httpsServer.listen(PORT, () => {
  console.log('Server running at ' + PORT + ' port.')
})