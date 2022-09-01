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

async function getDonationByTxId(txid) {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DATABASE_DATABASE);

    const donate = await dbo.collection('donations').find({}, {
        txid
    }).toArray()

    return donate;
}

async function getTopDonations() {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DATABASE_DATABASE);

    const tops = await dbo.collection('donations').find()
        .sort({value: -1}).limit(3)
        .toArray();

    return tops;
}

async function markDonationAsPaid({
    txid,
    chave,
    valor,
    horario
}) {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DATABASE_DATABASE);

    const donation = getDonationByTxId(txid);

    await dbo.collection('donations').updateOne({
        txid
    }, {
        ...donation,
        chave,
        valor,
        horario,
        paid: true
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
    insertDonation,
    insertUserCobGenerated,
    getTopDonations,
    getDonationByTxId,
    markDonationAsPaid
}