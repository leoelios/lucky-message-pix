require('./config/dotenv');

const { GerenciaNet } = require('./client');

GerenciaNet.auth()
  .then(as => console.log(as.data))
  .catch(err => console.error(err));
