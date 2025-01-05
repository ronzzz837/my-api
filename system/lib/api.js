const JSONdb = require('simple-json-db');
const path = require('path');
const fs = require("fs");

const db = new JSONdb(path.join(__dirname, '../tmp', 'database.json'));
const apiFilePath = path.join(__dirname, '../router', 'api.js');

const extractEndpointsFromApiFile = () => {
  try {
    const apiContent = fs.readFileSync(apiFilePath, 'utf8');
    const regex = /router\.[a-z]+\(['"]\/([a-zA-Z0-9_/]+)['"]/g;
    const matches = Array.from(apiContent.matchAll(regex), match => '/' + match[1]);
    return matches;
  } catch (error) {
    console.error('Error reading API file:', error.message);
    return [];
  }
};

const recordEndpointsInChangelog = () => {
  try {
    const now = new Date();

    const timestamp = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(now);

    const allEndpoints = extractEndpointsFromApiFile();

    let changelog = [];
    if (db.has('changelog')) {
      changelog = db.get('changelog');
    }

    const newEndpoints = allEndpoints.filter(endpoint => !changelog.some(entry => entry.endpoint === endpoint));

    newEndpoints.forEach(endpoint => {
      changelog.unshift({
        endpoint: endpoint,
        timestamp: timestamp,
      });
    });

    changelog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    db.set('changelog', changelog);
  } catch (error) {
    console.error('Error recording endpoints in changelog:', error.message);
  }
};

const runRecordEndpointsInChangelog = () => {
  recordEndpointsInChangelog();
};

runRecordEndpointsInChangelog();

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Silahkan masuk untuk memulai session.");
  res.redirect("/authentation");
}

const checkPremium = (req, res, next) => {
  if (req.user && req.user.vip || req.user.premium) {
    next();
  } else {
    req.flash('error', 'Forbidden. Premium users only.');
    res.redirect('/dashboard'); 
  }
};

module.exports = {
  runRecordEndpointsInChangelog,
  isAuthenticated,
  checkPremium
}; 