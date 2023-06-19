const { validationResult } = require("express-validator");
const { Booking } = require("../db/models");
const { Op } = require("sequelize");

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach((error) => (errors[error.param] = error.msg));

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

const throwIfError = (container) => {
  if (Object.keys(container.errors).length > 0) {
    throw container;
  }
};

const validSpot = ({
  address,
  city,
  state,
  country,
  lat,
  lng,
  name,
  description,
  price,
}) => {
  const container = { status: 400, message: "Bad Request", errors: {} };
  if (!address) {
    container.errors.address = "Street address is required";
  }
  if (!city) {
    container.errors.city = "City is required";
  }
  if (!state) {
    container.errors.state = "State is required";
  }
  if (!country) {
    container.errors.country = "Country is required";
  }
  if (!lat || isNaN(lat)) {
    container.errors.lat = "Latitude is not valid";
  }
  if (!lng || isNaN(lng)) {
    container.errors.lng = "Longitude is not valid";
  }
  if (!name || (name && name.length > 50)) {
    container.errors.name = "Name must be less than 50 characters";
  }
  if (!description) {
    container.errors.description = "Description is required";
  }
  if (!price || (price && price < 0)) {
    container.errors.price = "Price per day is required";
  }
  throwIfError(container);
  return {
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  };
};

// 
const setOptions = ({
  page,
  size,
  minLat,
  maxLat,
  minLng,
  maxLng,
  minPrice,
  maxPrice,
}) => {
  let options = { where: {} };

  page = page ?? 1;
  size = size ?? 20;
  options.limit = size;
  options.offset = (page - 1) * size;

  if (minLat && maxLat) {
    options.where.lat = {
      [Op.and]: [{ [Op.gte]: minLat }, { [Op.lte]: maxLat }],
    };
  } else if (minLat) {
    options.where.lat = { [Op.gte]: minLat };
  } else if (maxLat) {
    options.where.lat = { [Op.lte]: maxLat };
  }

  if (minLng && maxLng) {
    options.where.lng = {
      [Op.and]: [{ [Op.gte]: minLng }, { [Op.lte]: maxLng }],
    };
  } else if (minLng) {
    options.where.lng = { [Op.gte]: minLng };
  } else if (maxLng) {
    options.where.lng = { [Op.lte]: maxLng };
  }

  if (minPrice && maxPrice) {
    options.where.price = {
      [Op.and]: [{ [Op.gte]: minPrice }, { [Op.lte]: maxPrice }],
    };
  } else if (minPrice) {
    options.where.price = { [Op.gte]: minPrice };
  } else if (maxPrice) {
    options.where.price = { [Op.lte]: maxPrice };
  }

  return { options, page, size };
};
const validQuery = ({
  page,
  size,
  minLat,
  maxLat,
  minLng,
  maxLng,
  minPrice,
  maxPrice,
}) => {
  let container = { errors: {}, message: "Bad Request", status: 400 };
  if (page && page < 1) {
    container.errors.page = "Page must be greater than or equal to 1";
  }
  if (size && size < 1) {
    container.errors.size = "Size must be greater than or equal to 1";
  }
  if (maxLat && isNaN(parseInt(maxLat))) {
    container.errors.maxLat = "Maximum latitude is invalid";
  }
  if (minLat && isNaN(parseInt(minLat))) {
    container.errors.minLat = "Minimum latitude is invalid";
  }
  if (minLng && isNaN(parseInt(minLng))) {
    container.errors.minLng = "Minimum longitude is invalid";
  }
  if (maxLng && isNaN(parseInt(maxLng))) {
    container.errors.maxLng = "Maximum longitude is invalid";
  }
  if (minPrice && minPrice < 0) {
    container.errors.minPrice =
      "Minimum price must be greater than or equal to 0";
  }
  if (maxPrice && maxPrice < 0) {
    container.errors.maxPrice =
      "Maximum price must be greater than or equal to 0";
  }
  throwIfError(container);

  return setOptions({
    page,
    size,
    minLat,
    maxLat,
    minLng,
    maxLng,
    minPrice,
    maxPrice,
  });
};

module.exports = {
  handleValidationErrors,
  validSpot,
  validQuery
};
