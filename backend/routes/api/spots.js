const router = require("express").Router();
const { Sequelize } = require("sequelize");
const {
  Spot,
  Review,
  SpotImage,
  User,
  ReviewImage,
  Booking,
} = require("../../db/models");
const {
  requireAuth,
  checkIfExists,
  checkForAuth,
} = require("../../utils/auth");
const { validSpot, validReview, validBooking, validQuery } = require("../../utils/validation");

router.get("/", async (req, res) => {
  const { options, page, size } = validQuery(req.query);
  const spots = await Spot.findAll(options);
  const ratings = await Review.findAll({
    attributes: [
      "spotId",
      [Sequelize.fn("AVG", Sequelize.col("stars")), "stars"],
    ], 
    group: ["spotId"]
  });
  const previews = await SpotImage.findAll();
  const Spots = spots.map((spot) => {
    const avgRatingObj = ratings.find((rating) => {
      return rating.spotId === spot.id;
    });
    const avgRating = avgRatingObj ? avgRatingObj.stars : null;
    const previewImageObj = previews.find((preview) => {
      return preview.spotId === spot.id;
    });
    const previewImage = previewImageObj ? previewImageObj.url : null;
    return {
      ...spot.toJSON(),
      avgRating,
      previewImage,
    };
  });
  res.json({ size, page, Spots });
});

router.get("/current", requireAuth, async (req, res) => {
  const Spots = await Spot.findAll({
    where: { ownerId: req.user.id },
    attributes: {
      include: [
        [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
        [Sequelize.fn("MAX", Sequelize.col("SpotImages.url")), "previewImage"],
      ],
    },
    include: [
      { model: SpotImage, attributes: [] },
      { model: Review, attributes: [] },
    ],
    group: ["Spot.id"],
  });

  res.json({ Spots });
});

router.get("/:spotId", async (req, res) => {
  const spotId = req.params.spotId;
  const spot = await Spot.findOne({
    where: {
      id: spotId,
    },
  });
  checkIfExists(spot);
  const reviews = await Review.findAll({
    where: { spotId },
  });
  const images = await SpotImage.findAll({
    where: { spotId },
    attributes: ["id", "url", "preview"],
  });
  const owner = await User.findOne({
    where: { id: spot.ownerId },
    attributes: ["id", "firstName", "lastName"],
    as: "Owner"
  });
  const numReviews = reviews.length;
  const avgStarRating =
    numReviews > 0
      ? reviews.reduce((sum, review) => sum + review.stars, 0) / numReviews
      : 0;

  res.json({
    ...spot.toJSON(),
    numReviews,
    avgStarRating,
    SpotImages: images,
    Owner: owner,
  });
});

router.post("/", requireAuth, async (req, res) => {
  const spots = await Spot.create({
    ownerId: req.user.id,
    ...validSpot(req.body),
  });
  res.status(201).json(spots);
});

router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { url, preview } = req.body;
  const spotId = req.params.spotId;
  const spot = await Spot.findByPk(spotId);
  checkIfExists(spot);
  checkForAuth(spot.ownerId === req.user.id);
  const image = await SpotImage.create({
    spotId,
    url,
    preview,
  });
  res.json({ id: image.id, url: image.url, preview: image.preview });
});

router.put("/:spotId", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const spot = await Spot.findByPk(spotId);
  checkIfExists(spot);
  checkForAuth(spot.ownerId === req.user.id);
  await spot.update(validSpot(req.body));
  res.json(spot);
});

router.delete("/:spotId", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const spot = await Spot.findByPk(spotId);
  checkIfExists(spot);
  checkForAuth(spot.ownerId === req.user.id);
  await spot.destroy();
  res.json({
    message: "Successfully deleted",
  });
});

router.get("/:spotId/reviews", async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId);
  checkIfExists(spot);
  const Reviews = await Review.findAll({
    where: {
      spotId: req.params.spotId,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"],
      },
    ],
  });
  res.json({ Reviews });
});

router.post("/:spotId/reviews", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;
  const spot = await Spot.findByPk(spotId);
  checkIfExists(spot);
  const hasReviewed = await Review.findOne({
    where: {
      spotId,
      userId,
    },
  });
  if (hasReviewed) {
    throw { status: 500, message: "User already has a review for this spot" };
  }
  const review = await Review.create({
    spotId,
    userId,
    ...validReview(req.body),
  });
  res.status(201).json(review);
});

router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const spot = await Spot.findByPk(spotId);
  checkIfExists(spot);
  const isOwner = spot.ownerId === req.user.id;
  const options = { where: { spotId } };
  if (isOwner) {
    options.include = [
      { model: User, attributes: ["id", "firstName", "lastName"] },
    ];
  } else {
    options.attributes = ["startDate", "endDate", "spotId"];
  }
  const Bookings = await Booking.findAll(options);
  res.json({ Bookings });
});

router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;
  const { startDate, endDate } = req.body
  const spot = await Spot.findByPk(spotId);
  checkIfExists(spot);
  checkForAuth(userId !== spot.ownerId)
  await validBooking(startDate, endDate, spotId)
  const booking = await Booking.create({
    spotId, userId, startDate, endDate
  })
  await booking.reload({
    attributes: { include: ["id"] },
  });

  res.json(booking)
});

module.exports = router;
