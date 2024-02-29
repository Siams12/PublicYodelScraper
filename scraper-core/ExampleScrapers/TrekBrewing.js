import {Request} from "crawlee";
import { Dataset, createCheerioRouter } from "crawlee";
import * as stringManager from "scraper-core/Helpers/FieldManager.js";
import DateManager from "scraper-core/Helpers/DateManager.js";
import { runCrawler } from "scraper-core/Helpers/runCrawler.js";
import { validateData } from "scraper-core/Helpers/dataValidation.js";

let dateManager = new DateManager();
const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, $, request, log }) => {
 let events = $("div.entry-content > ul > li[class*='future']").get();
 for(let event of events){
    //Grab the title of the event.
    let title = $(event).find("span.eo-eb-event-title").text()
    title = stringManager.cleanString(title);

    //Grab the Description of the event.
    let fbLink = $(event).find("div.eo-eb-event-rsvp a").attr("href");
    let description = $(event).find("div.eo-eb-event-excerpt").text();
    description = stringManager.cleanString(description);
    description = description + " \n More information here: " + fbLink;

   

    //Grab the Location of the event.
    let location = null;

    //Grab the Image src attribute for the event.
    let img = $(event).find("div.eo-eb-event-photo img").attr("src");

    //Get the start/end date and time for the event.
    let dates = dateLogic($, event);
    //return and dont push data if bad date.
    if (!dates){
      continue;
    }

    //Check if event is multiDay or not
    let multiDay = "N"
    if(dateManager.isMultiDay(dates.start,dates.end)){
      multiDay = "Y"
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
    }
    if(!validateData(eventData)){
      await Dataset.pushData(eventData);
  }
}
});

function dateLogic($,event) {
 let month,day,startTime;
 month = $(event).find("span.eo-eb-date-month").text();
 day = $(event).find("span.eo-eb-date-day").text();
 startTime = $(event).find("span.eo-eb-event-meta").text();
 startTime = startTime.split(" ")[1];
 const dates = month + " " + day + ", " + startTime;
  return dateManager.getDate(dates);
}

  export async function crawl(message) {
    const request = new Request({
      url: 'https://trekbeer.com/news-events/',
    });

    let properties = 
    {
      "message": message, 
      "request": request, 
      "options": {
        "useProxy": false, 
        "type": "cheerio",
        "router": router,
        "crawlerOptions": {}
      }
    }
    return runCrawler(properties);
  }