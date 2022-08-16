
require('../config/dotenv')

const { sendPix } = require('../client/GerenciaNet');

(async() => {

    const as = await sendPix({
        chavePagador: "a106321f-8854-4112-a425-09425f9c9ca4",
        chaveReceptor: "50294939806",
        infoPagador: "Recebaaaa!",
        valor: "0.01"
    });

    console.log(as);

})()