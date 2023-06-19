const {
  requireAuth,
  checkIfExists,
  checkForAuth,
} = require("../../utils/auth");
const {
  Spot,
  Review,
  ReviewImage,
  SpotImage,
  User,
} = require("../../db/models");
const { validReview } = require("../../utils/validation");

const router = require("express").Router();

router.get("/current", requireAuth, async (req, res) => {
  const reviews = await Review.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"],
      },
    ],
  });
  const spotImages = await SpotImage.findAll();

  const Reviews = reviews.map((review) => {
    const previewImageObj = spotImages.find((preview) => {
      return preview.spotId === review.spotId;
    });
    const previewImage = previewImageObj ? previewImageObj.url : null;
    return {
      ...review.toJSON(),
      Spot: {
        ...review.Spot.toJSON(),
        previewImage,
      },
    };
  });

  res.json({ Reviews });
});

router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const reviewId = req.params.reviewId;
  const review = await Review.findByPk(reviewId);
  checkIfExists(review, "Review");
  checkForAuth(review.userId === req.user.id);
  const reviewImage = await ReviewImage.count({
    where: { reviewId },
  });
  if (reviewImage >= 10) {
    throw {
      status: 403,
      message: "Maximum number of images for this resource was reached",
    };
  }
  const createReviewImage = await ReviewImage.create({
    reviewId,
    url: req.body.url,
  });

  res.json({ id: createReviewImage.id, url: createReviewImage.url });
});

router.put("/:reviewId", requireAuth, async (req, res) => {
  const review = await Review.findByPk(req.params.reviewId);
  checkIfExists(review, "Review");
  checkForAuth(review.userId === req.user.id);
  await review.update(validReview(req.body));
  res.json(review);
});

router.delete("/:reviewId", requireAuth, async (req, res) => {
  const review = await Review.findByPk(req.params.reviewId);
  checkIfExists(review, "Review");
  checkForAuth(review.userId === req.user.id);
  await review.destroy();
  res.json({message: "Successfully deleted"});
});

module.exports = router;
