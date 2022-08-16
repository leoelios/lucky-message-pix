const https = require('https');
const { default: axios } = require('axios');
const { gerenciaNet: config } = require('../config');
const { setContext, isAuthenticated, getContextData } = require('./AuthContext');
const { v4: uuid } = require('uuid');

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

  if (isAuthenticated()) {
    console.log('Returning cached context auth');
    return getContextData();
  }

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

  setContext(resp.data);

  return resp.data;
}

async function sendPix({
  valor,
  chavePagador,
  chaveReceptor,
  infoPagador
}) {
  const authResponse = await auth();

  const resp = await api.put('/v2/gn/pix/' + uuid(), 
  {
    "valor": valor,
    "pagador": {
      "chave": chavePagador,
      "infoPagador": infoPagador
    },
    "favorecido": {
      "chave": chaveReceptor
    }
  }, {
    headers: {
      Authorization: 'Bearer ' + authResponse.access_token
    },
    httpsAgent
  });

  return {
    status: resp.status,
    data: resp.data
  }
}

module.exports = {
  auth,
  sendPix
};
