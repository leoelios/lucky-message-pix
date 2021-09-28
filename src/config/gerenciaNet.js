const fs = require('fs');

const {
  CLIENT_ID,
  CLIENT_SECRET,
  CERT_PATH: cert,
  API_URL_GERENCIANET: baseURL,
} = process.env;

module.exports = {
  credentials: {
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    cert: fs.readFileSync(cert),
    grantType: 'client_credentials',
  },
  baseURL,
};
