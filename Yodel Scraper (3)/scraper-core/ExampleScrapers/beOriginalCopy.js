import { PlaywrightCrawler, ProxyConfiguration, Request } from "crawlee";
import { Dataset, createPlaywrightRouter } from "crawlee";
const router = createPlaywrightRouter();
import DateManager from "scraper-core/Helpers/DateManager.js";
import * as stringManager from "scraper-core/Helpers/FieldManager.js";
import {runCrawler} from "scraper-core/Helpers/runCrawler.js";

let dateManager = new DateManager();
router.addDefaultHandler(
  async ({ enqueueLinks, page, request, log, proxyInfo }) => {
    log.info("Starting crawl for " + page.url());
    //Wait and click away popups before we begin our search for events.

    await page
      .frameLocator("[title='Facebook Like Popup']")
      .locator("#close")
      .click({ timeout: 10000 });
		
    try{
    await page
      .frameLocator(".D3gDT9")
      .locator("i.close-popup")
      .click({ timeout: 10000 });
    }
    catch(error){
      console.log("Popup not clicked");
    }

    let eventCount;
    let monthCount = 0;
    //Do while loop continuously clicks until our page had no events on it. Then we stop.
    do {
      eventCount = 0;
      await page.locator("#TPSctn0-12gk").waitFor({ state: "visible" });
      //Uses another locator to make sure we only get one frame locator for .nKphmK
      let calendar = page.locator("#TPSctn0-12gk");
      await calendar
        .frameLocator(".nKphmK")
        .locator("div.general_view_date")
        .first()
        .waitFor({ state: "visible" });
      //Access the frame and get all of the events.
      let frame = calendar.frameLocator(".nKphmK");
      calendar = await frame.locator("div.general_view_date").all();
      for (const metaData of calendar) {
        //Tells us if there is at least one event on a date.
        if (await metaData.locator("div.event_preview").first().isVisible()) {
          //get all the events on one date.
          let events = await metaData.locator("div.event_preview").all();
          //Iterate through each event on that date and push data from it.
          for (const event of events) {
            //Uses locators to obtain each piece of metaData.
            let date = await metaData.locator("div.col_date").textContent();
            let title = await event
              .locator("div.event_preview_title")
              .textContent();
            let time = await event
              .locator("div.event_preview_time")
              .textContent();
            let instructor = await event
              .locator("div.event_preview_subtitle")
              .textContent();
            let cost = await event
              .locator("div.event_preview_price")
              .textContent();

            let imageURL = await event
              .locator("div.img_wrapper img")
              .getAttribute("src");
            //Clean data to fit with our DB

            //DateLogic
            let dates = dateManager.getDate(date + " " + time)
            let start_on = dates.start;
            let end_on = dates.end;
            //Site has no id for each event. Use title + start_on time
            let external_event_id = stringManager.generateExternalEventID(
              title,
              start_on,
              true
            );
            //Push tags
            let tags = [];
            if (title.includes("Adult Class")) {
              tags.push("Adult Class");
            }

            //Prints out all of our data to make sure it is correct.
            //console.log("This is our date", date);
            //console.log("This is our time", time);
            //console.log("This is our title", title);
            //console.log("This is our instructor", instructor);
            //console.log("This is our cost", cost);

            //Submit data to queue
            await Dataset.pushData({
              url: page.url(),
              external_event_id: external_event_id,
              event_name: title,
              start_on: start_on,
              end_on: end_on,
              location: null,
              tags: tags,
              description: instructor + "," + cost,
              rule: null,
              recurring: "N",
              image_url: imageURL,
              all_day: "N",
              multi_day: "N",
            });
            eventCount++;
          }
        }
      }
      //Navigates to next frame.
      await frame.locator(".next").click();
      monthCount++
     
    } while (eventCount != 0 || monthCount == 1);
  }
);


export async function crawl(message) {
  const request = new Request({
    url: 'https://www.justbeoriginal.com/simpl-e-schedule',
  });
  
  let properties = 
  {
    "message": message, 
    "request": request, 
    
    "options": {
      "useProxy": false, 
      "type": "playwright",
      "router": router,
      "crawlerOptions": {}
    }
  }
  return runCrawler(properties);
}
