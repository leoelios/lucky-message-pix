const { MongoClient } = require('mongodb');
const { DATABASE_DATABASE, DATABASE_URL: url } = process.env;

async function getDonationByTxId(txid) {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DATABASE_DATABASE);

    const donate = await dbo.collection('donations').findOne({
        txid
    });

    return donate;
}

async function getTopDonations() {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DATABASE_DATABASE);

    const tops = await dbo.collection('donations').find()
        .sort({valor: -1}).limit(3)
        .toArray();

    return tops;
}

async function markDonationAsPaid({
    txid,
    chave,
    valor,
    horario,
    infoPagador
}) {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DATABASE_DATABASE);

    const donation = getDonationByTxId(txid);

    return dbo.collection('donations').updateOne({
        txid
    }, {
        $set: {
            ...donation,
            chave,
            valor,
            horario,
            paid: true,
            infoPagador
        }
    })
}

function insertUserCobGenerated({
    nickname,
    txid
}) {

    MongoClient.connect(url, (err, db) => {
        if(err) throw err;

        const dbo = db.db(DATABASE_DATABASE);
        const obj = { 
            txid,
            nickname
         };

        dbo.collection("donations").insertOne(obj, function(err, res) {
            if (err) throw err;
            db.close();
        });
    })

}

module.exports = {
    insertUserCobGenerated,
    getTopDonations,
    getDonationByTxId,
    markDonationAsPaid
}