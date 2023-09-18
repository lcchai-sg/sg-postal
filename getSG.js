const cheerio = require("cheerio");
const fetch = require("cross-fetch");
const { MongoClient } = require("mongodb");

const baseUrl = "https://www.worldpostalcodes.org/";
const startUrl =
    "https://www.worldpostalcodes.org/search/l1/en/sg/singapore-postalcodes";
const urls = [];

const exist = (ar, it) => {
    const f = ar.filter((x) => x.url === it.url);
    if (f && f.length > 0) return true;
    else return false;
};

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
    if (result && result.length > 0)
        console.log(`found data : ${result.length}`);
    else console.log(`NO DATA FOUND!`);
    // const { data } = await axios.get(startUrl);
    const res = await fetch(startUrl);
    const data = await res.text();
    const $ = cheerio.load(data);
    $("td").each((idx, el) => {
        const href = $(el).find("a").attr("href");
        let url = href ? (href.match(/https/i) ? href : baseUrl + href) : href;
        let txt = $(el).find("a").text();
        txt = txt ? txt.split(" in ")[1] : txt;
        if (url) {
            let d = { code: null, url, district: txt };
            if (!exist(urls, d)) urls.push(d);
            else console.log(d);
        }
    });
    const p = [];
    for (const d of urls) {
        console.log(d.district, d.url);
        try {
            // const { data } = await axios.get(d.url);
            const res = await fetch(d.url);
            const data = await res.text();
            const $ = cheerio.load(data);
            $("tr").each((idx, el) => {
                let pcode, pname, url, region, rUrl;
                $(el)
                    .find("td")
                    .each((idx1, el1) => {
                        switch (idx1) {
                            case 0:
                                pcode = $(el1).find("a").text();
                                url = $(el1).find("a").attr("href");
                                url = url
                                    ? url.match(/https/i)
                                        ? url
                                        : baseUrl + url
                                    : url;
                                break;
                            case 1:
                                pname = $(el1).text();
                                break;
                            case 2:
                                rUrl = $(el1).find("a").attr("href");
                                rUrl = rUrl
                                    ? rUrl.match(/https/i)
                                        ? rUrl
                                        : baseUrl + rUrl
                                    : rUrl;
                                region = $(el1).find("a").text();
                                break;
                            default:
                                break;
                        }
                    });
                if (pcode) {
                    const dd = {
                        pcode,
                        pname,
                        url,
                        region,
                        rUrl,
                        district: d.district,
                        dUrl: d.url,
                    };
                    if (!exist(p, dd)) p.push(dd);
                    else console.log(dd);
                }
            });
        } catch (error) {
            console.log(error);
            // if (error.response.status === 404) console.log("NOT FOUND!");
        }
        await new Promise((r) => setTimeout(r, 5000));
    }
    try {
        const result = await conn
            .db(mdb.name)
            .collection(mdb.coll)
            .insertMany(p);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
})();
