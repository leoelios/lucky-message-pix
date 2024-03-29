require('./config/dotenv');

const PORT = process.env.APP_PORT;
const { CERT_FULLCHAIN_PATH, CERT_PRIVATE_KEY_PATH, CERT_PUBLIC_GNET } = process.env;
const fs = require('fs');
const WebSocket = require('ws');
const https = require('https')
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const { devolution, createCob, generateQrCode } = require('./client/GerenciaNet');
const { insertUserCobGenerated, getTopDonations, getDonationByTxId, markDonationAsPaid } = require('./config/mongodb');

const httpsOptions = {
  cert: fs.readFileSync(CERT_FULLCHAIN_PATH), // Certificado fullchain do dominio
  key: fs.readFileSync(CERT_PRIVATE_KEY_PATH), // Chave privada do domínio
  ca: fs.readFileSync(CERT_PUBLIC_GNET),   // Certificado público da Gerencianet
  minVersion: "TLSv1.2",
  requestCert: true,
  rejectUnauthorized: false, //Mantenha como false para que os demais endpoints da API não rejeitem requisições sem MTLS
};

const httpsOptionsWebsocketServer = {
  cert: fs.readFileSync(CERT_FULLCHAIN_PATH), 
  key: fs.readFileSync(CERT_PRIVATE_KEY_PATH)
}

const httpsWebsocketServer = https.createServer(httpsOptionsWebsocketServer);
  
const sockets = [];
const server = new WebSocket.Server({
  server: httpsWebsocketServer
});

httpsWebsocketServer.listen(8080);

server.on('connection', (socket) => {
  console.log('[SOCKET] Connected: ' + socket)
  sockets.push(socket);
})

const app = express();
const httpsServer = https.createServer(httpsOptions, app);

app.use(cors());
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

app.post('/pix', async (req,res ) => {

  const { value, nickname } = req.body;

  const cob = await createCob({
    valor: Number(value).toFixed(2),
    chave: process.env.CHAVE_PIX,
    expiracao: 3600,
    solicitacaoPagador: "Mensagem para => FEC"
  });

  const qrcode = await generateQrCode(cob.loc.id); 

  insertUserCobGenerated({
    nickname,
    txid: cob.txid,
  })

  res.send(qrcode);
})

app.get('/top-donation', async(req,res) => {
  const donations = await getTopDonations();
  res.send(donations);
})

app.post("/webhook", (request, response) => {
  if (request.socket.authorized) { 
      response.status(200).end();
  } else {
      response.status(401).end();
  }
});

app.post("/webhook/pix", async (request, response) => {
  if (request.socket.authorized){  
        const { pix: pixs} = request.body;

        for (const pix of pixs) {
          const { endToEndId, valor, devolucoes, txid, horario, chave, infoPagador } = pix;
          console.log('Pix recebido', pix);

          if (!devolucoes?.length) {

            await markDonationAsPaid({
              chave,
              horario,
              txid,
              valor,
              infoPagador
            })
            
            const cob = await getDonationByTxId(txid);

            sendThroughSocket(
              JSON.stringify({
                event: 'pix_received',
                data: {
                  ...cob
                }
              })
            )

            const dev = await devolution({
              endToEndId,
              valor: ((valor - valor * 0.02) > 0.01 ? Number(valor - valor * 0.02).toFixed(2) : 0.01).toString() 
            })

            console.log(dev);
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

function sendThroughSocket(msg) {
  console.log('[SOCKET] ' +  msg);
  sockets.forEach(socket => {
    socket.send(msg)
  })
}