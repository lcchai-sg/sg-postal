const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("cross-fetch");

const u =
    "https://www.worldpostalcodes.org/l1/en/sg/singapore/list/r2/list-of-postalcodes-in-bukit-merah";

(async () => {
    // const { data } = await axios.get(u);
    const res = await fetch(u);
    const data = await res.text();
    console.log(data);
})();
