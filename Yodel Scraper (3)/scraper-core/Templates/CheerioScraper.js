import {
  CheerioCrawler,
  ProxyConfiguration,
  tryAbsoluteURL,
  Request,
} from "crawlee";
import { Dataset, createCheerioRouter } from "crawlee";
import * as stringManager from "scraper-core/Helpers/FieldManager.js";
import DateManager from "scraper-core/Helpers/DateManager.js";
import { runCrawler } from "scraper-core/Helpers/runCrawler.js";
import { pushData } from "scraper-core/Helpers/dataValidation.js";

//These examples are not runnable code
let dateManager = new DateManager();
const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, $, request, log }) => {
  //Grab the title of the event.
  let title = $("").text();
  title = stringManager.cleanString(title);

  //Grab the Description of the event.
  let description = $("").text();
  description = stringManager.cleanString(description);

  //Grab the Location of the event.
  let location = $("").text();
  location = stringManager.cleanString(location);

  //Grab the Image src attribute for the event.
  let img = (img = $("").attr("src"));

  //Get the start/end date and time for the event.
  let dates = dateLogic($);
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
  //Pushes the data
  await pushData(event);
});

function dateLogic($) {
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
      type: "cheerio",
      router: router,
      crawlerOptions: {},
    },
  };
  return runCrawler(properties);
}

//Runs crawler
//Remove before turning in
await crawl({});
