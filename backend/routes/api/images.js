const { requireAuth, checkIfExists, check, checkIfExistsForAuth } = require("../../utils/auth");
const {
  Spot,
  Review,
  SpotImage,
  ReviewImage,
} = require("../../db/models");
const router = require("express").Router();

router.delete("/spot-images/:imageId", requireAuth, async (req, res) => {
  const image = await SpotImage.findByPk(req.params.imageId);
  checkIfExists(image, "Spot Image");
  const spot = await Spot.findByPk(image.spotId);
  checkForAuth(spot.ownerId === req.user.id) 
  await image.destroy()
  res.json({message: "Successfully deleted"})
});

router.delete("/review-images/:imageId", requireAuth, async (req, res) => {
    const image = await ReviewImage.findByPk(req.params.imageId);
    checkIfExists(image, "Review Image");
    const review = await Review.findByPk(image.reviewId);
    checkForAuth(review.userId === req.user.id) 
    await image.destroy()
    res.json({message: "Successfully deleted"})
  });

module.exports = router;
