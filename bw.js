const fetch = require("cross-fetch");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
const u =
    "https://www.blowingwind.io/forum/search/?&q=%20&type=core_members&page=1";
const members = [];
const db_url =
    "mongodb+srv://root:sysadmin@cluster0.jrvjy.mongodb.net/?retryWrites=true&w=majority";
const mdb = { name: "blowwind", coll: "members" };

(async () => {
    let next = u;
    try {
        const conn = await MongoClient.connect(db_url);
        const db = conn.db(mdb.name);
        do {
            console.log(next);
            const res = await fetch(next);
            const data = await res.text();
            const $ = cheerio.load(data);
            $(".ipsStreamItem_member").each((idx, el) => {
                let href = $(el).find(".ipsUserPhoto_medium").attr("href");
                let img = $(el)
                    .find(".ipsUserPhoto_medium")
                    .find("img")
                    .attr("src");
                img = img
                    ? img.match(/default_profile|data:image/i)
                        ? ""
                        : img
                    : img;
                let joined = $(el).find("time").text();
                members.push({ href, img, joined });
            });
            next = $(".ipsPagination_next").find("a").attr("href");
            await new Promise((r) => setTimeout(r, 3000));
        } while (next);
        const result = await db.collection(mdb.coll).insertMany(members);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
    process.exit();
})();
