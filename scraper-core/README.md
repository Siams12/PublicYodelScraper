# Guide for creating Yodel Scraper using a template

## Prereqs
Packages needed
- Moment
- Crawlee
- Playwright 

Knowledge of the following topics is required. 
- CSS Selectors
- Cheerio
- Playwright
- Crawlee 
- Date and Time issues 
- Recurring rules 

Before reading any further make sure you are familar with [Cheerio](https://cheerio.js.org/docs/intro) and [Playwright](https://playwright.dev/docs/intro).

## Fields

These are the fields you should use for pushing data and what each of them mean. 

1. url: URL where event is contained. (Nullable)
```
    url: "https://nomadsworld.com/great-emu-war/",
```
2. external_event_id: A unique string identifier for an event on a specific website. (REQUIRED)
external_event_id: "myUniqueID32566215675"
```
#### If there is something that represents an ID on the site use that for this field, otherwise Use event_name concatenated with start_on no spaces. There is a function for this in the FieldManager, you can usually use that.

#### If there are two events with same event name and start at same time, use UUIDV4. 
#### Always Clean for special characters
```
3. event_name: A string title of the event. (REQUIRED)
```
event_name: "Magic Summer Art Camp"
```
***
4. start_on: A unix timestamp in milliseconds of when the event started. Uses moment.js (REQUIRED)
```
start_on: 1686593937544
```
[Moment docs](https://momentjs.com/docs/)
[Chrono docs](https://github.com/wanasit/chrono)
***
5. end_on: A unix timestamp in milliseconds of when the event ended. Uses moment.js (REQUIRED)
```
end_on: 1686593937544
```
[Moment docs](https://momentjs.com/docs/)
[Chrono docs](https://github.com/wanasit/chrono)
***
6. location: A string address of the event (Nullable)
```
location: "10 College Dr, New Concord, OH 43762"
```
Has to be an address. If no address set to null.
***
7. tags: A list of strings representing any tags an event has. (Nullable)
```
tags: ['Nature', 'Music']
```
***
8. description: A string description of the event. (Nullable)
```
description: "This is a description of an event."
```
***
9. rule: A string created from the rrule library. (Nullable)
```
rule: 	
"DTSTART:20230614T143200Z
RRULE:FREQ=WEEKLY;UNTIL=20230622T143200Z;COUNT=30;INTERVAL=1;WKST=TU"
```
[rrule library](https://www.npmjs.com/package/rrule)
*** 
10. recurring: A string representing whether an event is recurring. (Default to "N")
```
recurring: "N"
```
#### Recurring rules are only generated if specifically stated by the website. Otherwise, they are individual events.
***
11. image_url: A URL with a link to an image. (NULLABLE)
```
image_url: "https://events-stage.yodel.today/images/Yodel-logo@2x.png"
```
***
12. all_day: A string representing whether an event is all day. (Default to "N")
```
all_day: "Y"
```
*** 
13. multi_day: A string representing whether or not the event goes on for multiple days. (Default to "N")
example: June 12, 2023 - June 15, 2023 as one long event.
```
multi_day: "Y"
``` 
#### The only fields needed to be collected for an event is title, start_on, and end_on
#### If a date is stated but no time. Default to 12:00AM the first day to 12:00AM the next day. (all_day is true, multi_day is true)
#### If there's a start time but no end time. End at 12AM the next day. (multi_day is true)

## Other notes

When creating a playwrightcrawler.

Scrapers should grab everything possible off of the first page. Then, if there is information missing that we know will be on the next page, we goto the next page and collect it. 
If there is an error on that page then we return an error and submit back everything we gathered from the first page and add line to description: "Some information maybe incomplete because of error on organization's website"


# Scraper Templates

Playwright scrapers are meant for websites with Javascript, while Cheerio scrapers are meant for websites Without Javascript.
If you can use Cheerio on a site, USE IT. It uses less resources than Playwright.

Copy and paste the template you want to use into whereever you want to run from. You can run it like all other node programs like 
```
node ./src/myScraper.js
```
**Using the template**
When you open the templates you will see something like this
```
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
```

That is how scrapers are called externally, this function must be named crawl and have a parameter. 
Change the url in the request to match the website your scraping. 

The properties object is the message we send to run the crawler, it is used in another function, you don't really have to mess with it much.
The only fields that need to change are type: and crawlerOptions. 

type takes in either the word "playwright" or the word "cheerio" depending on your type of crawler. 
crawlerOptions is any option you want changed specifically for this crawler. A list of options can be found [here](https://crawlee.dev/api/playwright-crawler/interface/PlaywrightCrawlerOptions) for playwright scrapers.

### Multiple Webpage Scraping
The default templates are designed for single page scraping only. If you are in a situation where you need to get to another webpage to scrape an events information, you want to use the enqueuelinks function from crawlee This allows you to go to a page, scrape the needed information.

## Setting up EnqueueLinks
There are multiple parts to the enqueuelinks. creating the add handler, Calling the method, and changing the parameters.

### Creating the AddHandler
The addHandler will contain the scraping code for the next webpage. This is how you create it.

1. Paste the following code in your scraper file:

```
router.addHandler("detail", async ({ request, $, log }) => {
});
```
Make sure to replace the "$" with "page" if you are using a Playwright Scraper.

You can also find examples in the ExampleScrapers folder. 

2. Take the code that will be used to define metadata and cut and paste it into the new addHandler funtion, along with the await Dataset.pushData.

3. Rename the addHandler by changing the text that says "detail", if needed. It doesnt need to change if you only have one addHandler in the scraper.

### Calling the Method
Inside of your scraper, copy and paste the following code where you want to travel to another webpage:
 enqueueLinks({
    selector: "",
    label: "detail",
  });

Inside of your selector quotes will be your locator that has the link to go to the next webpage. The label will be replaced with the label of the addHandler, if needed.

### Adding and Changing Enqueue Link Parameters.

* If you dont have a selector, but instead have a URL, you can remove the selector parameter, and use the following: urls: [eventLink]
The eventLink is a custom variable that will hold the String of the URL.

* If you have variables that are defined in the defaultHandler and you want to pass them through to the addHandler:
    1. Add a parameter called userData, 
    ```
    userData:{
        title, location, dates, img
    }
    2. In the add handler, add the following code:
     let location = request.userData.location;
    let title = request.userData.title;
    let img = request.userData.img;
    let dates = request.userData.dates;
   ```

You can find extra help and documentation on crawlee [here](https://crawlee.dev/)

## Scraping Tips 

1. Always use the getDate function to get the dates into unix timestamps. The getdate function takes in a string representation of the date and time. 

2. Make sure to wait for elements to be visible before trying to access them.

3. Use functions in DateManager, FieldManager, and dataValidation. 

4. By playwrights default options set for all scrapers, many images types are disabled, you can change this for your specific scraper if it causes issue. 

5. The DateManager takes in a timezone! If you are scraping outside of EST input the correct one. 

6. If you want to be sure your data is in the correct format you can use the data validation function or pushData function in dataValidation.js 

## Running this environment 

1. Make sure you have node up to date and npm. 

2. npm install

3. Create a .js file at the root of this project.

4. Call the crawl function from scraper at bottom of file. 

5. Run using node ./Yourfile.js

## Before turning in:

1. Remember to remove the call to crawl the crawl function 



