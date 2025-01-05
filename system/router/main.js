const config = require("../../config.js");

const passport = require("passport");
const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../lib/api");

const _path = process.cwd();

router.get("/", (req, res) => {
  res.sendFile(_path + "/views/html/home.html")
});

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("index", {
    title: `${config.web.title} | Dashboard`,
    pages: config.web.title, 
    user: req.user,
    apikey: req.user.apikey,
    admin: req.user.isAdmin,
    message: req.flash(),
    layout: "layouts/main"
  });
});

router.get("/pricing", isAuthenticated, (req, res) => {
  res.render("pricing")
});

router.get("/feature/:action", isAuthenticated, (req, res) => {
  const action = req.params.action;

  try {
    let feature;
    switch (action) {
      case "download":
        feature = "download";
        break;
      case "ai":
        feature = "ai";
        break;
      case "anime":
        feature = "anime";
        break;
      case "sfw": 
        feature = "sfw";
        break
      case "stalker":
        feature = "stalker";
        break;
      case "search":
        feature = "search";
        break;    
      case "maker": 
        feature = "maker";
        break
      case "tools":
        feature = "tools";
        break
      default:
        feature = "404";
    }

    res.render("feature/" + action, {
      title: `${config.web.title} | Feature ` + action,
      pages: config.web.title, 
      user: req.user,
      apikey: req.user.apikey, 
      layout: "layouts/main"
    });
  } catch (e) {
    res.render("404", {
    	layout: "layouts/main"
    })
    console.error(e);
  }
});

router.get("/docs", (req, res) => {
  res.sendFile(_path + "/views/html/docs.html")
});


module.exports = router;
