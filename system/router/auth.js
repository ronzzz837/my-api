const express = require("express");
const passport = require("passport");
const { db } = require("../lib/database");
const router = express.Router();

const config = require("../../config");

router.get("/authentation", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  } else {
    return res.render("authentication");
  }
});

router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/authentation"); 
  },
);

router.post("/auth/login", async (req, res) => {
  const { apikey } = req.body;
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  try {
    const user = await db.findOne({ apikey });

    if (user) {
      req.logIn(user, (err) => {
        if (err) {
          console.error("Error during login:", err);
          req.flash("error", "An unexpected error occurred");
          res.redirect("/authentation");
        } else {
          req.flash("success", "Login Succes...");	
          res.redirect("/dashboard");
        }
      });
    } else {
      req.flash("error", "Invalid API key");
      res.redirect("/authentation");
    }
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("error", "An unexpected error occurred");
    res.redirect("/authentation");
  }
});

router.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/authentation");
  });
});

module.exports = router;
