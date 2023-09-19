const fetch = require("cross-fetch");
const cheerio = require("cheerio");
const u = "https://sgp.postcodebase.com/all";
const base = "https://sgp.postcodebase.com";
const pd = [];

(async () => {
    try {
        let zip, zUrl, region, rUrl;
        let next = u;
        do {
            console.log(next);
            const res = await fetch(next);
            const data = await res.text();
            const $ = cheerio.load(data);
            $("td").each((idx, el) => {
                let clas = $(el).attr("class");
                if (clas.match(/zip/i)) {
                    zip = $(el).find("a").text();
                    zUrl = $(el).find("a").attr("href");
                    zUrl = zUrl
                        ? zUrl.match(/https/i)
                            ? zUrl
                            : base + zUrl
                        : zUrl;
                } else if (clas.match(/region/i)) {
                    region = $(el).find("a").text();
                    rUrl = $(el).find("a").attr("href");
                    rUrl = rUrl
                        ? rUrl.match(/https/i)
                            ? rUrl
                            : base + rUrl
                        : rUrl;
                }
                zip &&
                    pd.push({
                        postcode: zip,
                        postcodeUrl: zUrl,
                        region1: region,
                        region1Url: rUrl,
                    });
            });
            next = $(".pager-next").find("a").attr("href");
            next = next ? (next.match(/https/i) ? next : base + next) : next;
            await new Promise((r) => setTimeout(r, 2000));
        } while (next);
        console.log(`records : ${pd.length}`);
        pd.forEach((r) => console.log(r));
    } catch (error) {
        console.log(error);
    }
})();
