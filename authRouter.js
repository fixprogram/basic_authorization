const controller = require("./authController");
const Router = require("express");
const router = new Router();
const { check } = require("express-validator");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

router.post(
  "/registration",
  [
    check("username", "User name cannot be empty").notEmpty(),
    check("password", "Password cannot be less than 4 symbols").isLength({
      min: 4,
    }),
  ],
  controller.registration
);
router.post("/login", controller.login);
router.get("/users", roleMiddleware(["ADMIN"]), controller.getUsers);

module.exports = router;
