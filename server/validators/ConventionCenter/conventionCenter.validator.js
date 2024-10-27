import Joi from "joi";

export const conventionCenterValidationSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().optional(),
    country: Joi.string().required(),
    zipCode: Joi.string().optional(),
  }).required(),
  coordinates: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array()
      .items(Joi.number().min(-180).max(180))
      .length(2)
      .required(), // [longitude, latitude]
  }).required(),
  facilities: Joi.array().items(Joi.string()).optional(),
  pricePerHour: Joi.number().positive().required(),
  availability: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().required(),
        isAvailable: Joi.boolean().default(true),
      })
    )
    .optional(),
  images: Joi.array().items(Joi.string().uri()).optional(), // URLs for images
  videos: Joi.array().items(Joi.string().uri()).optional(), // URLs for videos
  contact: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/) // Basic international phone format
      .required(),
    email: Joi.string().email().required(),
  }).required(),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now),
});
