import { Request } from "crawlee";
import { Dataset, createPlaywrightRouter } from "crawlee";
import * as stringManager from "scraper-core/Helpers/FieldManager.js";
import DateManager from "scraper-core/Helpers/DateManager.js";
import { runCrawler } from "scraper-core/Helpers/runCrawler.js";
import { validateData } from "scraper-core/Helpers/dataValidation.js";
import moment from "moment";

let dateManager = new DateManager("America/Indiana/Indianapolis");
const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks, page, request, log }) => {
  await page.locator("button#dropdownMenu1").last().click();
  await page
    .locator(
      "div.col-sm-4 > div > div >ul.dropdown-menu.scrollable-menu > li:first-child > a"
    )
    .click();
  let events = await page.locator("li.movie-info-box").all();
  for (let event of events) {
    //Grab the title of the event.
    let title = await event
      .locator("h2.media-heading >a:first-child")
      .textContent();
    title = stringManager.cleanString(title);
    //Grab the Location of the event.
    let location = null;
    //Get the start/end date and time for the event.
    let dates = await getDatesInformation(event);
    let eventURL = await event
      .locator("h2.media-heading > a:first-child")
      .getAttribute("href");
    eventURL = "https://www.showtimes.com" + eventURL;
    await enqueueLinks({
      urls: [eventURL],
      label: "detail",
      userData: {
        title,
        dates,
        location,
      },
    });
  }
});
router.addHandler("detail", async ({ request, page, log }) => {
  let dates = request.userData.dates;
  let description = await page.locator("div.description").last().textContent();
  description = stringManager.cleanString(description);
  let runTime = await page.locator("p:has(>span.mpaa)").textContent();
  runTime = stringManager.cleanString(runTime);
  runTime = runTime.split("|")[1];
  runTime = stringManager.cleanString(runTime);
  for (let i = 0; i < dates.length; i++) {
    for (let j = 1; j < dates[i].length; j++) {
      let date = await dateInformation(dates[i][0], dates[i][j], runTime);
      //return and dont push data if bad date.
      if (!date) {
        return;
      }
      //Check if event is multiDay or not
      let multiDay = "N";
      if (dateManager.isMultiDay(date.start, date.end)) {
        multiDay = "Y";
      }
      let img = await page
        .locator("img.img-responsive")
        .first()
        .getAttribute("src");
      //If available, grab the tags for the event.
      let tags = [];
      //EventID of the event.
      let external_event_id = stringManager.generateExternalEventID(
        request.userData.title,
        date.start
      );
      //If available, grab the URL for the event
      let url = request.loadedUrl;
      //Pushing Data
      let eventData = {
        url: url,
        external_event_id: external_event_id,
        event_name: request.userData.title,
        start_on: date.start,
        end_on: date.end,
        location: request.userData.location,
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
  }
});
async function getDatesInformation(event) {
  let icons = await event.locator("div.ticketicons").innerHTML();
  let dates;
  let eventDates = [];
  icons = icons.split("/h3")[1];
  icons = icons.split("<br>");
  for (let i = 0; i < icons.length; i++) {
    dates = icons[i].split("</button>");
    dates.pop();
    for (let j = 0; j < dates.length; j++) {
      dates[j] = dates[j].split('">')[1];
    }
    eventDates.push(dates);
  }
  return eventDates;
}
async function dateInformation(date, time, runTime) {
  let startDate = date.replace(":", ", " + moment().year());
  let runTimeHour = runTime.split("h ");
  runTimeHour = parseInt(runTimeHour);
  let runTimeMinute = runTime.split(" ")[1].replace("m", "");
  runTimeMinute = parseInt(runTimeMinute);
  let dates = dateManager.getDate(startDate + " " + time);
  if (!dates) {
    return null;
  }
  startDate = dates.start;
  let endDate = dateManager.addToDate(dates.start, runTimeHour, "hour");
  endDate = dateManager.addToDate(parseInt(endDate), runTimeMinute, "minute");
  return {
    start: startDate,
    end: parseInt(endDate),
  };
}
export async function crawl(message) {
  const request = new Request({
    url: "https://www.showtimes.com/movie-theaters/ritz-cinema-8203/",
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
