/**
 * Clean an input string by removing newline characters, double spaces, and non-printable characters.
 *
 * @param {string} str - The input string to be cleaned.
 * @returns {string} The cleaned string.
 */
export function cleanString(str, removeNewLines = true) {
    if (removeNewLines) {
      // Replace newline characters with space
      str = str.replace(/\n/g, " ");
    }
  
    // Replace double spaces with single spaces
    str = str.replace(/  +/g, " ");
  
    // Replace non-printable characters with nothing
    str = str.replace(/[^ -~]+/g, "");
  
    // Trim whitespace from beginning and end of string
    str = str.trim();
  
    return str;
  }
/**
 * Adds domain to image url
 * @param {string} pageURL URL of page
 * @param {string} imgURL URL of image
 * @returns {string} string with hostname added to imgURL
 */
 export function addDomainToImg(pageURL, imgURL){
    pageURL = new URL(pageURL);
    let hostname = pageURL.hostname;
    return hostname+imgURL;
    }
/**
 * Remove special chars from a single string.
 * @param {string} string string to remove chars from
 * @returns {string} string with special chars removed
 */
 export function clearSpecialChars(string){
    return string.replace(/[^a-zA-Z0-9]/g, "");
 }
  /**
 * Quick and function that handles the regex for cleaning up the title.  And Adds the unix to it for a unique External Event ID
 *
 * @param {String} title
 * @param {Int} start_on
 * @returns {String} external_event_id
 */
export function generateExternalEventID(title, start_on, clearSpecialChars = true) {
    let external_event_id = title.replace(/\s/g, "");
    if (clearSpecialChars) {
      external_event_id = this.clearSpecialChars(external_event_id);
    }
    
    external_event_id = external_event_id + start_on;
    return external_event_id;
  }


