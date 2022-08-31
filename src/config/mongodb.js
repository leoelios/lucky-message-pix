const { MongoClient } = require('mongodb');
const { DATABASE_DATABASE, DATABASE_URL: url } = process.env;

function insertDonation({
    txid,
    chave,
    valor,
    horario
}) {
    MongoClient.connect(url, (err, db) => {
        if(err) throw err;

        const dbo = db.db(DATABASE_DATABASE);
        const myobj = { 
            txid,
            chave,
            valor,
            horario
         };
        dbo.collection("donations").insertOne(myobj, function(err, res) {
            if (err) throw err;
            db.close();
        });
    })
}

module.exports = {
    insertDonation
}