import Joi from "joi";
import { Dataset } from "crawlee";

export function validateData(metadata) {
  const schema = Joi.object({
    url: Joi.string().uri().allow(null), //String URL. Can be NULL
    urls: Joi.array().items(
      Joi.object({
        type: Joi.string().valid("website").required(),
        value: Joi.string().uri().required(),
      })
    ),
    external_event_id: Joi.string().required(), //String. Not nullable.
    event_name: Joi.string().required(), //String not nullable.
    start_on: Joi.date().timestamp("unix").required(), //unix timestamp. Not nullable
    end_on: Joi.date()
      .timestamp("unix")
      .required()
      .when("start_on", {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref("start_on")),
        otherwise: Joi.optional(),
      }).allow(null), //unix timestamp. Not nullable.
    location: Joi.string().allow(null), //String. Nullable.
    tags: Joi.array().items(Joi.string()).allow(null), //String Array NULL or empty
    description: Joi.string().allow("").allow(null), //String. NULL or empty
    rule: Joi.string().allow("").allow(null), //String empty or NULL
    recurring: Joi.any().valid("Y", "N").required(), //String required Y or N
    image_url: Joi.string().uri().allow("").allow(null), //not required NULL or empty. Valid URI
    all_day: Joi.any().valid("Y", "N").required(), //required Y or N
    multi_day: Joi.any().valid("Y", "N").required(), //required Y or N
    //Display_end time. //Not required Nullable
  }).or("url", "urls");

  const { error, value } = schema.validate(metadata);

  if (error) {
    console.log("Error in data pushed. Details provided --- ", error);
    return error;
  }
  return null;
}

export async function pushData(data) {
  //Make sure data is an object.
  if (!(typeof data === "object") || data === null) {
    return null;
  }
  //Swap fields that were changed by rewrite.
  if (data.url) {
    data.urls = [{ type: "website", value: data.url }];
    delete data.url;
  }
  //Validate data and push if correct.
  if (!validateData(data)) {
    await Dataset.pushData(data);
  }
}
