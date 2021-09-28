const https = require('https');
const { default: axios } = require('axios');
const { gerenciaNet: config } = require('../config');

const { credentials: cred, baseURL } = config;
const { cert, clientID, clientSecret, grantType: grant_type } = cred;

const api = axios.create({
  baseURL,
});

const httpsAgent = new https.Agent({
  pfx: cert,
  passphrase: '',
});

async function auth() {
  const resp = await api.post(
    '/oauth/token',
    {
      grant_type,
    },
    {
      auth: {
        username: clientID,
        password: clientSecret,
      },
      httpsAgent,
    }
  );

  return resp;
}

module.exports = {
  auth,
};
