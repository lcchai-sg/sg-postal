const fetch = require("cross-fetch");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
const href = require("./db/href");
const db_url =
    "mongodb+srv://root:sysadmin@cluster0.jrvjy.mongodb.net/?retryWrites=true&w=majority";
const mdb = { name: "blowwind", coll: "members" };

(async () => {
    try {
        const conn = await MongoClient.connect(db_url);
        const db = conn.db(mdb.name);
        // const r = await db.collection(mdb.coll).find().toArray();
        // if (r.length > 0) {
        console.log(`members : ${href.length}`);
        for (let i = 325; i < href.length; i++) {
            const res = await fetch(href[i]);
            const data = await res.text();
            const $ = cheerio.load(data);
            let pname = $(".cProfileHeader_name").find("h1").text();
            pname = pname ? pname.replace(/\t| |\n/g, "") : pname;
            let pimg = $("#elProfilePhoto").find("img").attr("src");
            pimg = pimg ? (pimg.match(/data:image/i) ? null : pimg) : pimg;
            let img = $(".ipsCoverPhoto_container")
                .find("img")
                .attr("data-src");
            img = img ? (img.match(/data:image/i) ? null : img) : img;
            const props = {};
            let lastActive = $("#elProfileStats").find("time").last().text();
            $(".ipsDataItem").each((idx, el) => {
                let propname = $(el).find(".ipsDataItem_size3").text();
                let propval = $(el).find(".ipsContained").text();
                propval = propval
                    ? propval
                    : $(el).find(".ipsDataItem_generic").text();
                propval = propval
                    ? propval.match(/birthday/i)
                        ? propval.replace(/birthday/i, "")
                        : propval
                    : propval;
                if (propname) props[propname] = propval;
            });
            const r = await db.collection(mdb.coll).updateOne(
                { href: href[i] },
                {
                    $set: {
                        profileName: pname,
                        profileImg: pimg,
                        backImg: img,
                        props: props,
                    },
                }
            );
            // console.log(r);
            // console.log({
            //     href: href[i],
            //     lastActive,
            //     pname,
            //     pimg,
            //     img,
            //     props,
            // });
            if (i % 100 === 0 && i > 0)
                console.log(`processing ${i} / ${href.length}`);
            await new Promise((r) => setTimeout(r, 3000));
        }
    } catch (error) {
        console.log(error);
    }

    process.exit();
})();
