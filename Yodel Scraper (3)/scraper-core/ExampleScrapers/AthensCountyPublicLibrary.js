import { Request } from "crawlee";
import { Dataset, createPlaywrightRouter } from "crawlee";
import * as stringManager from "scraper-core/Helpers/FieldManager.js";
import DateManager from "scraper-core/Helpers/DateManager.js";
import { runCrawler } from "scraper-core/Helpers/runCrawler.js";
import { validateData } from "scraper-core/Helpers/dataValidation.js";

let dateManager = new DateManager();
const router = createPlaywrightRouter();

//Changes locator depending on associated schedule name we are scraping.
//Not needed if scraper is only used for one schedule.
function getLocator(crawlerName) {
  switch (crawlerName) {
    case "AthensCountyPublicLibrary_Athens":
      return "athens public";
    case "AthensCountyPublicLibrary_Chauncey":
      return "chauncey public";
    case "AthensCountyPublicLibrary_Coolville":
      return "coolville public";
    case "AthensCountyPublicLibrary_Glouster":
      return "glouster public";
    case "AthensCountyPublicLibrary_Nelsonville":
      return "nelsonville public";
    case "AthensCountyPublicLibrary_ThePlains":
      return "the plains";
    case "AthensCountyPublicLibrary_WellsPublic":
      return "wells";
  }
}
router.addDefaultHandler(async ({ enqueueLinks, page, request, log }) => {
for(let i=0; i<20; i++){
  let events = await page.locator("article.event-card").all();
  for(let event of events){
    await event.hover();
  //Grab the title of the event.
  let title = await event.locator("a.lc-event__link").first().textContent();
  title = stringManager.cleanString(title);

  //Checks to see if the word closed is on the card.
  if(await event.locator("div.lc-text-danger").first().isVisible()){
    continue;
  }
  //Grab the Description of the event.
  let description = null;
  if(await event.locator("div.lc-event__body").first().isVisible()){
  description = await event.locator("div.lc-event__body").first().textContent();
  description = stringManager.cleanString(description);
  }

  //Grab the Location of the event.
  let location = await event.locator("div.lc-event__branch").first().textContent();
  location = stringManager.cleanString(location);
  if(!location.toLowerCase().includes(getLocator(request.userData.name))){
    continue;
  }
if(await event.locator("div.lc-event__room").first().isVisible()){
  location = await event.locator("div.lc-event__room").first().textContent();
  location = location.replace("Room:","")
  location = stringManager.cleanString(location);
}
  //Grab the Image src attribute for the event.
  let img = null;

  //Get the start/end date and time for the event.
  let dates = await dateLogic(page,event);
  //return and dont push data if bad date.
  if (!dates) {
    return;
  }
  //Check if event is multiDay or not
  let multiDay = "N";
  if (dateManager.isMultiDay(dates.start, dates.end)) {
    multiDay = "Y";
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
  let eventData = {
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
    multi_day: multiDay,
  };
  if (!validateData(eventData)) {
    await Dataset.pushData(eventData);
  }
}
await page.locator("a[rel='next']").click();
await page.waitForLoadState("load");
}
});

async function dateLogic(page,event) {
  let month = await event.locator("span.lc-date-icon__item--month").first().textContent();
  let day = await event.locator("span.lc-date-icon__item--day").first().textContent();
  let year = await event.locator("span.lc-date-icon__item--year").first().textContent();
  let times = await event.locator("div.lc-event-info-item--time").first().textContent();
  if(times.toLowerCase().includes("all")){
    times = ""
  }
  let dates = month + " " + day + ", " + year + " " + times;
  dates = dates.replace(/\n/g, "");
  dates = dates.replace(/  +/g, " ");

  return dateManager.getDate(dates);
}

export async function crawl(message) {
  const request = new Request({
    url: "https://events.myacpl.org/events/upcoming",
    userData: { name: message.name },
  });

  let properties = {
    message: message,
    request: request,
    options: {
      useProxy: false,
      type: "playwright",
      router: router,
      crawlerOptions: {requestHandlerTimeoutSecs:180},
    },
  };
  return runCrawler(properties);
}
