import { PlaywrightCrawler, ProxyConfiguration, playwrightUtils } from "crawlee";

//Collection of crawler options. If there is a new subset of options you want on a scraper you can add it here to be reused.


export function getDefaultPlaywrightOptions(){
    return {
    headless: true,
    maxRequestRetries: 0,
    maxRequestsPerCrawl: 300,
    preNavigationHooks: [async ({ page }) => {
      await playwrightUtils.blockRequests(page, {urlPatterns: [".jpg", ".jpeg", ".png", ".gif", ".woff", ".pdf", ".zip"]});
  }],  
    //Set this to a smaller value as to not overload the site we are scraping.
    maxRequestsPerMinute: 15
}
}

export function getDefaultCheerioOptions(){
    return{
    //site has about 40 events right now. Should not hit this limit.
    maxRequestsPerCrawl: 300,
    //Set this to a smaller value as to not overload the site we are scraping.
    maxRequestsPerMinute: 15,
    maxRequestRetries: 0,
    }
  };