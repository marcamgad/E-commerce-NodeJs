const express = require("express");

const { check, body } = require("express-validator");

const router = express.Router();

const authController = require("../Controller/auth");

const User = require("../models/user");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter Valid Email Address")
      .normalizeEmail(),
    body("password", "Password has to be valid")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter Valid Email")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden");
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail exists already, please pick different one"
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter password with only numbers and text and at least 5 characters "
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password have to match");
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
