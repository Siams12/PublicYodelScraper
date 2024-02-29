import * as fieldManager from "./FieldManager.js";

//Functions to collect data in one location, Can be used as one liners to grab certain fields if they aren't split up.
class DataCollectionPlaywright {
    //Return a properly formatted description given an input locator.
    async getDescription(page, locator){
        let description = await page.locator(locator).first().innerHTML();
        return fieldManager.cleanString(description);
    }

    async getTitle(page, locator){
        let title = await page.locator(locator).first().textContent()
        return fieldManager.cleanString(title);
    }

}

class DataCollectionCheerio {
     getDescription($, locator){
        let description = $(locator).first().html();
        return fieldManager.cleanString(description);
    }
    getTitle($, locator){
        let title = $(locator).first().text()
        return fieldManager.cleanString(title);
    }
}

export {
    DataCollectionCheerio,
    DataCollectionPlaywright
}