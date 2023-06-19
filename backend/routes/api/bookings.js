const router = require("express").Router();
const { Sequelize } = require("sequelize");
const { Spot, SpotImage, Booking } = require("../../db/models");
const {
  requireAuth,
  checkIfExists,
  checkForAuth,
} = require("../../utils/auth");
const { validBooking } = require("../../utils/validation");

router.get("/current", requireAuth, async (req, res) => {
  const bookings = await Booking.findAll({
    where: {
      userId: req.user.id,
    },
    attributes: { include: ["id"] },
    include: [
      { model: Spot, attributes: { exclude: ["createdAt", "updatedAt"] } },
    ],
  });
  const previews = await SpotImage.findAll();
  const Bookings = bookings.map((booking) => {
    const previewImageObj = previews.find((preview) => {
      return booking.spotId === preview.spotIdd;
    });
    const previewImage = previewImageObj ? previewImageObj.url : null;
    return {
      ...booking.toJSON(),
      Spot: {
        ...booking.Spot.toJSON(),
        previewImage,
      },
    };
  });
  res.json({ Bookings });
});

const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

router.put("/:bookingId", requireAuth, async (req, res) => {
  const booking = await Booking.findOne({
    where: {
      id: req.params.bookingId,
    },
    attributes: [
      "id",
      "userId",
      "startDate",
      "endDate",
      "spotId",
      "createdAt",
      "updatedAt",
    ],
  });
  checkIfExists(booking, "Booking");
  checkForAuth(booking.userId === req.user.id);
  await validBooking(
    booking.startDate,
    booking.endDate,
    booking.spotId,
    booking.id
  );
  await booking.update(req.body);
  res.json(booking);
});

router.delete("/:bookingId", requireAuth, async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  checkIfExists(booking, "Booking");
  const spot = await Spot.findByPk(booking.spotId);
  checkIfExists(spot);

  checkForAuth(
    booking.userId === req.user.id || spot.ownerId === req.user.id
  );
  const bookingConflict =
    booking.startDate <= getToday() && booking.endDate >= getToday();
  if (bookingConflict) {
    throw {
      status: 402,
      message: "Bookings that have been started cant be deleted",
    };
  }
  await Booking.destroy({ where: { id: req.params.bookingId } });
  res.json({ message: "Successfully deleted" });
});
module.exports = router;
