const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const logger = require("morgan")
const expressLayouts = require('express-ejs-layouts');

const fs = require("fs")
const chalk = require("chalk");
const figlet = require("figlet");
const path = require("path");
const cron = require("node-cron");
const JSONdb = require("simple-json-db");
const database = new JSONdb(path.join(__dirname, "./tmp", "database.json"));

const { connectToMongoDb, db } = require("./lib/database")
const { resetLimit, updateExpiredPremium, expiredPremiumUsers, updateExpiredVIP, expiredVIPUsers } = require("./lib/db");
const { runRecordEndpointsInChangelog } = require("./lib/api");

const config = require("../config")

const api = require("./router/api");
const main = require("./router/main");
const admin = require("./router/admin");
const auth = require("./router/auth");
const users = require("./router/users");

const app = express();
const port = process.env.PORT || config.options.port

app.enable('trust proxy');
app.set("json spaces", 2);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(expressLayouts);

app.use(logger('dev'));
app.use(bodyParser.json());

app.use(express.json({
  limit: '5mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '5mb'
}));
app.use(bodyParser.text({ type: "text/html" }));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 259200000
  },
  store: MongoStore.create({
    mongoUrl: config.mongoURL
  }),
}));
app.use(passport.initialize());
app.use(passport.session());
require('./lib/config')(passport);
app.use(flash());

app.use("/", api);
app.use("/", main);
app.use("/", auth);
app.use("/users", users);
app.use("/admin", admin);

app.use(function (req, res, next) {
  res.status(404).render("message/404", {
  	title: `${config.web.title} | Error 404`,
  	layout: "layouts/main" 
  })
})

app.use(function (req, res, next) {
  res.status(500).render("message/500", {
  	title: `${config.web.title} | Error 505`,
  	layout: "layouts/main"
  })
})

connectToMongoDb()
setInterval(expiredPremiumUsers, 60000);
setInterval(expiredVIPUsers, 60000);

cron.schedule('0 0 * * *', async () => {
  try {
    const updateResult = await db.updateMany(
      { premium: false },
      { $set: { limit: config.options.limit || 25 } }
    );
    const updateResults = await db.updateMany(
      { premium: true },
      { $set: { limit: config.options.premiumLimit || 1000 } }
    );
    const message = await config.message('Reset limit success.', "HTML");
    console.log(`Reset limits for all users.`);
  } catch (error) {
    console.error('Error resetting limits:', error);
  }
}, {
  timezone: 'Asia/Jakarta',
});

app.listen(port, () => {
  console.log(chalk.white(figlet.textSync(`Ronzz API`, {
    horizontalLayout: 'full'
  })));
  console.log(chalk.green(`\nStart Server...`));
  console.log(chalk`{cyanBright  Author:} {bold.rgb(255,69,0) Ronzz YT}`);
  console.log(chalk`{yellowBright  Whatsapp:} {underline https://wa.me/6288200025376}`);
  console.log(chalk`{blueBright  YouTube:} {underline https://youtube.com/c/RonzzYT}`);
  console.log(chalk.blue(` Server Running on ${chalk.bold(`http://localhost:${port}`)}`));
});

module.exports = app
