import { Request } from "crawlee";
import { Dataset, createPlaywrightRouter } from "crawlee";
import * as stringManager from "scraper-core/Helpers/FieldManager.js";
import DateManager from "scraper-core/Helpers/DateManager.js";
import { runCrawler } from "scraper-core/Helpers/runCrawler.js";
import { pushData } from "scraper-core/Helpers/dataValidation.js";

//Summary
//Place comments about crawler here.
//NOTES
//Place comments about crawler here.

//These examples are not runnable code
let dateManager = new DateManager();
const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks, page, request, log }) => {
  //Grab the title of the event.
  let title = await page.locator("Your locator to find title").textContent();
  title = stringManager.cleanString(title);

  //Grab the Description of the event.
  let description = await page.locator("Your locator to find Description").textContent();
  description = stringManager.cleanString(description);

  //Grab the Location of the event.
  let location = await page.locator("Your locator to find Location").textContent();
  location = stringManager.cleanString(location);

  //Grab the Image src attribute for the event.
  let img = await page.locator("Your Image Source Locator").getAttribute("src");

  //Get the start/end date and time for the event.
  let dates = await dateLogic(page);

  //return and dont push data if bad date.
  if (!dates) {
    return;
  }

  //If available, grab the tags for the event.
  let tags = [];

  //EventID of the event.
  let external_event_id = stringManager.generateExternalEventID(
    title,
    dates.start
  );

  //If available, grab the URL for the event
  let url = request.loadedUrl;

  //Pushing Data
  let event = {
    url: url,
    external_event_id: external_event_id,
    event_name: title,
    start_on: dates.start,
    end_on: dates.end,
    location: location,
    tags: tags,
    description: description,
    rule: null,
    recurring: "N",
    image_url: img,
    all_day: "N",
    multi_day: "N",
  };
  //Pushes the data.
  await pushData(event);
});

async function dateLogic(page) {
  let startDate;
  let endDate;
  let dates = startDate + " - " + endDate;
  return dateManager.getDate(dates);
}

export async function crawl(message) {
  const request = new Request({
    url: "URL GOES HERE",
  });

  let properties = {
    message: message,
    request: request,

    options: {
      useProxy: false,
      type: "playwright",
      router: router,
      crawlerOptions: {},
    },
  };
  return runCrawler(properties);
}
//Runs scraper
//Remove before turning in
await crawl({});
