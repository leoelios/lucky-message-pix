require('./config/dotenv');

const PORT = 443;
const { CERT_FULLCHAIN_PATH, CERT_PRIVATE_KEY_PATH, CERT_PUBLIC_GNET } = process.env;
const fs = require('fs');
const https = require('https')
const express = require('express');
const logger = require('morgan');
const { devolution, createCob, generateQrCode } = require('./client/GerenciaNet');

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

app.get('/', async (req, res) => {

  const cob = await createCob({
    valor: '0.01',
    chave: 'a106321f-8854-4112-a425-09425f9c9ca4',
    expiracao: 3600,
    solicitacaoPagador: "[FEC] Nos envie uma mensagem =D"
  })

  const { imagemQrcode } = await generateQrCode(cob.loc.id);

  res.send(`
    <img src="${imagemQrcode}" alt="qrcode" />
  `)
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
        const { pix: pixs} = request.body;


        for (const pix of pixs) {
          const { endToEndId, valor, devolucoes } = pix;
          console.log('Pix recebido', pix);

          if (!devolucoes?.length) {
            devolution({
              endToEndId,
              valor: ((valor - valor * 0.02) > 0.01 ? (valor - valor * 0.02) : 0.01).toString() 
            })
          }

        }

      response.status(200).end();
  }else{
      response.status(401).end();
  }
});

httpsServer.listen(PORT, () => {
  console.log('Server running at ' + PORT + ' port.')
})