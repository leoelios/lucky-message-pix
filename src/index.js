require('./config/dotenv');

const PORT = 443;
const fs = require('fs');
const https = require('https')
const express = require('express');
const { GerenciaNet } = require('./client');

GerenciaNet.auth()
  .then(as => console.log(as.data))
  .catch(err => console.error(err));

  const httpsOptions = {
    cert: fs.readFileSync("cert.pem"), // Certificado fullchain do dominio
    key: fs.readFileSync("key.pem"), // Chave privada do domínio
    ca: fs.readFileSync("chain-pix-sandbox.crt"),   // Certificado público da Gerencianet
    minVersion: "TLSv1.2",
    requestCert: true,
    rejectUnauthorized: false, //Mantenha como false para que os demais endpoints da API não rejeitem requisições sem MTLS
  };


  
const app = express();
const httpsServer = https.createServer(httpsOptions, app);

app.get('/', (req, res) => {
  res.send('Hello')
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
app.post("/webhook/pix", (request, response) => {
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
      console.log(request.body);
      response.status(200).end();
  }else{
      response.status(401).end();
  }
});

httpsServer.listen(PORT, () => {
  console.log('Server running at ' + PORT + ' port.')
})