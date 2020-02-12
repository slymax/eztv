const fs = require("fs");
require("console-stamp")(console);
const cheerio = require("cheerio");
const fetch = require("node-fetch");
(async () => {
    const results = [];
    const domain = "https://eztv.io";
    try {
        const data = await fetch(domain + "/showlist");
        const text = await data.text();
        const $ = cheerio.load(text);
        const shows = $("a.thread_link").toArray().map(show => $(show).attr("href"));
        for (const show of shows) {
            try {
                console.log(show.split("/")[3]);
                const data = await fetch(domain + show);
                const text = await data.text();
                const $ = cheerio.load(text);
                results.push({
                    "id": show.split("/")[2],
                    "url": domain + show,
                    "image": domain + $(".show_info_main_logo img").attr("src"),
                    "title": $("span[itemprop=name]").first().text(),
                    "description": $("span[itemprop=description]").first().text(),
                    "imdb": {
                        "id": $(".show_info_rating_score a").attr("href").split("/")[4],
                        "url": $(".show_info_rating_score a").attr("href"),
                        "rating": $(".show_info_rating_score").text().trim().split(" ")[1],
                        "votes": $(".show_info_rating_score").text().trim().split(" ")[5]
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
    fs.writeFile("shows.json", JSON.stringify(results, null, 4), error => {
        if (error) console.error(error);
    });
})();
