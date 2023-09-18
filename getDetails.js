const fetch = require("cross-fetch");
const { MongoClient } = require("mongodb");

const baseUrl = "https://www.worldpostalcodes.org/";
const url =
    "https://geocode.search.hereapi.com/v1/geocode?q=530227+SG&apiKey=3Ddg4xhpOH-a3YUvzwA5tPkscWA9LNc01c80TcsOmlM";

(async () => {
    const mdb = {
        host: "127.0.0.1",
        port: 27017,
        user: "admin",
        pass: "sysadmin",
        name: "sgpostal",
        coll: "postal",
    };
    const db_url = `mongodb://${mdb.user}:${mdb.pass}@${mdb.host}:${mdb.port}/${mdb.name}?authSource=admin`;
    const conn = await MongoClient.connect(db_url);
    let result = await conn.db(mdb.name).collection(mdb.coll).find().toArray();
    let cnt = 0;
    for (const r of result) {
        if (r.pcode) {
            let u = `https://geocode.search.hereapi.com/v1/geocode?q=${r.pcode}+SG&apiKey=3Ddg4xhpOH-a3YUvzwA5tPkscWA9LNc01c80TcsOmlM`;
            const res = await fetch(u);
            const data = await res.json();
            if (data && data.items) {
                const res = await conn
                    .db(mdb.name)
                    .collection(mdb.coll)
                    .updateOne({ _id: r._id }, { $set: { items: data.items } });
                console.log(res);
            }
        }
        if (cnt > 10) process.exit();
        cnt++;
    }
})();
