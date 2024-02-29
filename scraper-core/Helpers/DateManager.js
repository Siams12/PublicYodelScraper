import * as chrono from "chrono-node";
import moment from "moment-timezone";
//File for anything to do with dates.
export default class DateManager {
  //Make timezone a class variable so it does not have to be changed in between every function.
  custom = chrono.casual.clone();

  constructor(timeZone = "America/New_York") {
    this.timeZone = timeZone;
    this.custom.refiners.push({
      refine: (context, results) => {
        results.forEach((result) => {
          //Date but no accompanying hours. Date with no time.
          if (result.start && !result.start.isCertain("hour")) {
            result.start.assign("hour", 0);
          }
          if (result.end && !result.end.isCertain("hour")) {
            result.end.assign("hour", 23);
            result.end.assign("minute", 59);
          }
        });
        return results;
      },
    });
  }

  //takes in a piece of text saying when an event occurs. Will always occur ahead of time if unsure
  //Will return null for past dates.
  getDate(text) {
    let time = this.custom.parse(text, new Date(), { forwardDate: true });
    if (time.length >= 0) {
      time = time[0];
      let start = time.start;
      let end = time.end;
      let dates = {};
      dates.start = this.convertToTimezone(start.date());
      //if we have an end get time.
      if (end) {
        dates.end = this.convertToTimezone(end.date());
      }
      if (dates.end){
        if (Date.now() > dates.end) {
          return null;
        }
      }
      //If there is no end we send back null.
      else {
        dates.end = null;
      }
      //If our event ends before the current time we don't want it.
      return dates;
    }
    return null;
  }

  //Convert a date to proper timezone.
  convertToTimezone(date) {
    let time = date
      .toTimeString()
      .match(/(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/)[0];
    date = date.toDateString();
    return moment
      .tz(date + " " + time, "ddd MMM DD YYYY HH:mm:ss", true, this.timeZone)
      .valueOf();
  }

  //use to add or subtract minutes/hours/days/weeks/years onto a millisecond unixtimestamp.
  //current is the orignial unixtimestamp
  //add is the amount being added
  //type is the minute/hour/day/week/year
  addToDate(current, add, type) {
    //Converts
    while (Math.floor(Math.log10(current)) + 1 != 13) {
      current *= 10;
    }
    //current = moment(current).format("x");

    const currentDate = moment(current);
    let newDate;
    try {
      switch (type.toLowerCase()) {
        case "minute":
          newDate = currentDate.add(add, "m");
          break;
        case "hour":
          newDate = currentDate.add(add, "h");
          break;
        case "day":
          newDate = currentDate.add(add, "d");
          break;
        case "week":
          newDate = currentDate.add(add, "w");
          break;
        case "year":
          newDate = currentDate.add(add, "y");
          break;
        default:
          // Handle the case when 'type' doesn't match any of the specified values
          break;
      }
      newDate = newDate.tz("America/New_York"); // Converts to EST timezone
      newDate = newDate.format("x"); // millisecond unix time
    } catch (e) {
      console.log("invalid unixTimeStamp");
      return null;
    }
    return newDate;
  }

  subtractFromCurrentDate(current, subtract, type) {
    //If it is a second, converts to millisecond.
    while (Math.floor(Math.log10(current)) + 1 != 13) {
      current *= 10;
    }
    const currentDate = moment(current);
    let newDate;
    try {
      switch (type.toLowerCase()) {
        case "minute":
          newDate = currentDate.subtract(subtract, "m");
          break;
        case "hour":
          newDate = currentDate.subtract(subtract, "h");
          break;
        case "day":
          newDate = currentDate.subtract(subtract, "d");
          break;
        case "week":
          newDate = currentDate.subtract(subtract, "w");
          break;
        case "year":
          newDate = currentDate.subtract(subtract, "y");
          break;
        default:
          // Handle the case when 'type' doesn't match any of the specified values
          break;
      }
      newDate = newDate.tz("America/New_York"); // Converts to EST timezone
      newDate = newDate.format("x"); // millisecond unix time
    } catch (e) {
      console.log("invalid unixTimeStamp");
      return null;
    }

    return newDate;
  }

  isMultiDay(startUnixTime, endUnixTime) {
    let start = moment(startUnixTime);
    start = start.add(1, "d");
    start = start.set({ h: 0, m: 0 });
    start = start.format("x");
    start = Number(start);
    if (start < endUnixTime) {
      return true;
    } else {
      return false;
    }
  }
}
