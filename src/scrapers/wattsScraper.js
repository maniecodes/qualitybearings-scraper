const fs = require('fs');

const scrap = async (newPage, table, dimension, dataObj, prodId) => {
    const tableSpec = await table.getProperty("children");
    const specLength = await (
        await tableSpec.getProperty("length")
    ).jsonValue();

    const dimensionSpec = await dimension.getProperty("children");
    const dimensionLength = await (await dimensionSpec.getProperty("length")).jsonValue()

    for (i = 1; i <= specLength; i++) {
        let title = `//*[@id="plp-item-page-specs"]/div[4]/div[1]/div/table/tbody/tr[${i}]/td[1]/h2/strong`
        let body = `//*[@id="plp-item-page-specs"]/div[4]/div[1]/div/table/tbody/tr[${i}]/td[2]/span/span[2]/span`

        const [header] = await newPage.$x(title);
        const headerSpec = await header.getProperty("textContent");
        let data = await headerSpec.jsonValue();
        data = data.replace(/[^a-zA-Z ]/g, "").trim();


        const [val] = await newPage.$x(body);
        const bodySpec = await val.getProperty("textContent");
        let value = await bodySpec.jsonValue();
        dataObj[data] = value;
    }

    for (j = 1; j <= dimensionLength; j++) {
        let title = `//*[@id="plp-item-page-specs"]/div[4]/div[2]/div/table/tbody/tr[${j}]/td[1]/h2/strong`
        let body = `//*[@id="plp-item-page-specs"]/div[4]/div[2]/div/table/tbody/tr[${j}]/td[2]/span/span[2]/span`

        const [header] = await newPage.$x(title);
        const headerSpec = await header.getProperty("textContent");
        let data = await headerSpec.jsonValue();
        data = data.replace(/[^a-zA-Z ]/g, "").trim();


        const [val] = await newPage.$x(body);
        const bodySpec = await val.getProperty("textContent");
        let value = await bodySpec.jsonValue();
        dataObj[data] = value;
    }
    dataObj["Product ID"] = prodId;

    return dataObj

}

const wattsScraperObject = {
    async scraper(browser) {
        let scrapedData = [];
        let newPage;

        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage() {
            //Loop through each of those links, open a new page instance and get the relevant data from them
            let urls = [
                "374a-brz-030",
            ];

            let pagePromise = (link, prodId) =>
                new Promise(async (resolve, reject) => {
                    console.log("start to scrape");
                    let dataObj = {};
                    newPage = await browser.newPage();

                    await newPage.goto(link, { waitUntil: "load", timeout: 100000 });

                    // await newPage.waitForSelector('input[name=keyword]');

                    // await newPage.$eval('input[name=keyword]', (el, b) => { el.value = b }, prodId);


                    // await newPage.click('input[name="search_btn"]');
                    // await newPage.waitForSelector('#plp-container');

                    const [table] = await newPage.$x(
                        `/html/body/div[1]/div[4]/div[1]/table/tbody`
                    );

                   

                    if (typeof (await table) !== "undefined") {
                        console.log('not undefined')
                        const divsSpec = await table.getProperty("children")
                        const divsLength = await (await divsSpec.getProperty("length")).jsonValue()

                        for (i = 1; i <= divsLength; i++) {
                            let title = `/html/body/div[1]/div[4]/div[1]/table/tbody/tr[${i}]/td[1]`
                            let body = `/html/body/div[1]/div[4]/div[1]/table/tbody/tr[${i}]/td[2]`
                            
                            const [header] = await newPage.$x(title);
                            const headerSpec = await header.getProperty("textContent");
                            let data = await headerSpec.jsonValue();
                    
                            const [val] = await newPage.$x(body);
                            const bodySpec = await val.getProperty("textContent");
                            let value = await bodySpec.jsonValue();
                            dataObj[data] = value;
                            

                            console.log(data);
                            console.log(value);
                        }
                       

                    } else {
                        console.log('i am scraping')
                        const [search] = await newPage.$x(
                            `//*[@id="plp-container"]/nav[2]/h1/span`
                        );

                        if (typeof (await search) !== "undefined") {
                            const [divs] = await newPage.$x(`//*[@id="plp-search-results-list"]/div[4]`)
                            if (typeof (await divs) !== "undefined") {
                                const divsSpec = await divs.getProperty("children")
                                const divsLength = await (await divsSpec.getProperty("length")).jsonValue()

                                for (k = 1; k <= divsLength; k++) {
                                    let v = `//*[@id="plp-search-results-list"]/div[4]/div[${k}]/span[1]/a`
                                    const [link] = await newPage.$x(v)
                                    if (typeof (await link) !== "undefined") {
                                        const linkSpec = await link.getProperty("href")
                                        const newLink = await linkSpec.jsonValue()
                                        await newPage.goto(newLink);

                                        const [title] = await newPage.$x(`//*[@id="plp-product-title"]/h1`)

                                        if (typeof (await title) !== "undefined") {
                                            const titleSpec = await title.getProperty("textContent");
                                            let tit = await titleSpec.jsonValue();
                                            let wordAfter = tit.substr(tit.indexOf("# ") + 1).trim()
                                            let prodIdToComp = wordAfter.substring(0, wordAfter.indexOf(","))
                                            console.log(prodId)
                                            console.log(prodIdToComp)
                                            if (prodId !== prodIdToComp) {
                                                // go back to original page
                                                await newPage.goBack();
                                            } else {
                                                console.log('do something')
                                                const [table] = await newPage.$x(
                                                    `//*[@id="plp-item-page-specs"]/div[4]/div[1]/div/table/tbody`
                                                );

                                                const [dimension] = await newPage.$x(
                                                    `//*[@id="plp-item-page-specs"]/div[4]/div[2]/div/table/tbody`
                                                );

                                                dataObj = await scrap(newPage, table, dimension, dataObj, prodId);

                                                break;
                                            }
                                        } else {
                                            dataObj["Product ID"] = prodId;
                                            //await newPage.goBack();
                                        }
                                    } else {
                                        dataObj["Product ID"] = prodId;
                                        //await newPage.goBack();
                                    }
                                }
                            } else {
                                dataObj["Product ID"] = prodId;
                            }


                        } else {
                            console.log('out')
                            console.log(prodId)
                            dataObj["Product ID"] = prodId;
                            resolve(dataObj);
                            //  await newPage.close();
                        }



                    }
                    console.log(dataObj)
                    resolve(dataObj);
                    await newPage.close();


                });


            for (link in urls) {

                console.log(urls[link]);
                if (urls[link] != null) {
                    let currentPageData = await pagePromise(
                        `https://www.watts.com/products/plumbing-flow-control-solutions/shutoff-valves/washing-machine-shutoffs/2/2m2-12`,
                        '2m2-12'
                    );

                    scrapedData.push(currentPageData);
                }
            }

            await newPage.close();
            return scrapedData;
        }
        let data = await scrapeCurrentPage();
        fs.writeFile("output.json", JSON.stringify(data), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }

            console.log("JSON file has been saved.");
        });
        return data;
    },
};

module.exports = wattsScraperObject;
