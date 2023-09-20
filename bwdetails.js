const fetch = require("cross-fetch");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
const u =
    "https://www.blowingwind.io/forum/profile/50718-jonathan_horny_sexy-btm/";
const db_url =
    "mongodb+srv://root:sysadmin@cluster0.jrvjy.mongodb.net/?retryWrites=true&w=majority";
const mdb = { name: "blowwind", coll: "members" };

(async () => {
    const conn = await MongoClient.connect(db_url);
    const db = conn.db(mdb.name);
    const r = await db.collection(mdb.coll).find().toArray();
    r && console.log(`records : ${r.length}`);

    const res = await fetch(u);
    const data = await res.text();
    const $ = cheerio.load(data);
    let pname = $(".cProfileHeader_name").find("h1").text();
    pname = pname ? pname.replace(/\t| |\n/g, "") : pname;
    const pimg = $("#elProfilePhoto").find("img").attr("src");
    const img = $(".ipsCoverPhoto_container").find("img").attr("data-src");
    const props = {};
    $(".ipsDataItem").each((idx, el) => {
        // let txt = $(el).text();
        // txt = txt ? txt.replace(/\n/g, "").replace(/\t/g, " ") : null;
        // if (txt) props.push(txt);
        let propname = $(el).find(".ipsDataItem_size3").text();
        let propval = $(el).find(".ipsContained").text();
        propval = propval ? propval : $(el).find(".ipsDataItem_generic").text();
        propval = propval
            ? propval.match(/birthday/i)
                ? propval.replace(/birthday/i, "")
                : propval
            : propval;
        if (propname) props[propname] = propval;
    });
    console.log({ pname, pimg, img, props });
    process.exit();
})();
