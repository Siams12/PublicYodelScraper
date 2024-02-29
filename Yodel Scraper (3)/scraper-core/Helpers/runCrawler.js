import { PlaywrightCrawler, ProxyConfiguration, playwrightUtils, CheerioCrawler } from "crawlee";
import { getDefaultCheerioOptions, getDefaultPlaywrightOptions } from "./CrawlerOptions.js";

export async function runCrawler(properties){
    let crawlerOptions; 
    //Get default options for cheerio and playwright
    if (properties?.options.type === "playwright"){
        crawlerOptions = getDefaultPlaywrightOptions();
    }
    else {
        crawlerOptions = getDefaultCheerioOptions();
    }
    //Set router
    if (properties?.options?.router){
        crawlerOptions.requestHandler = properties.options.router;
    }
    //Copy over other specifications.
    if (properties?.options?.crawlerOptions){
        for (const key in properties.options.crawlerOptions) {
            if (properties.options.crawlerOptions.hasOwnProperty(key)) {
              crawlerOptions[key] = properties.options.crawlerOptions[key];
            }
        }
    }
    //Create Playwright or Cheerio Crawler
    let crawler;

    if (properties?.options.type === "playwright"){
        crawler = new PlaywrightCrawler(crawlerOptions);
    }
    else {
        crawler = new CheerioCrawler(crawlerOptions)
    }
   
    //Run scraper given our request
    let crawlerRun = await crawler.run([properties.request]);
}