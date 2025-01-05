const express = require("express");
const router = express.Router();

const config = require("../../config");
const { Saweria } = require("../lib/saweria");
const { db } = require("../lib/database");
const { isAuthenticated, checkPremium } = require("../lib/api");
const Function = require("../lib/function");
const Func = new Function();

// API USER 
router.get("/profile", isAuthenticated, (req, res) => {
  res.render("profile", {
    title: `${config.web.title} | Dashboard`,
    pages: config.web.title, 
    user: req.user,
    apikey: req.user.apikey, 
    message: req.flash(),
    layout: "layouts/main"
  });
});

router.get("/cekApikey", async (req, res) => {
	const apikey = req.query.apikey;
  if (!apikey) return res.json(Func.resValid("Masukan Parameter Apikey!"));

  try {
    const users = await db.findOne({ apikey: apikey });
    if (!users)
      return res.json(Func.resValid(`apikey \"${apikey}\" Tidak Terdaftar.`));
    const result = {
      usename: users.username,
      email: users.email,
      apikey: users.apikey,
      limit: users.vip ? "Unlimited" : users.limit,
      vip: users.vip,
      premium: users.premium
    };
    res.json(Func.resSukses(result));
  } catch (e) {
    console.error(e);
  }
})

router.post("/settings", checkPremium, async (req, res) => {
	try {
      const user = await db.findOne({ _id: req.user._id });

      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/users/profile');
      }
      
      if (req.body.username) user.username = req.body.username;
      if (req.body.name) user.name = req.body.name;
      if (req.body.apikey) user.apikey = req.body.apikey;
      if (req.body.profile) user.profile = req.body.profile;
      
      await user.save()

      req.flash('success', 'Settings updated successfully');
      res.redirect('/users/profile'); 
    } catch (error) {
      console.error(error);
      req.flash('error', 'Internal server error');
      res.redirect('/users/profile'); 
    }
})

router.post("/users/changeApikey", isAuthenticated, async (req, res) => {
  const { apikey } = req.body;
  if (!apikey) return req.flash("error", "Masukan Apikey.");
  const user = req.user;
  const users = await db.findOne({ email: user.email });
  if (users.premium) {
    await db.updateOne({ email: user.email }, { apikey: apikey });
    req.flash("success", "Apikey berhasil di ubah.");
    res.redirect("/users/profile");
  } else {
    req.flash("error", "Kamu bukan user premium.");
    res.redirect("/users/profile");
  }
});

module.exports = router 