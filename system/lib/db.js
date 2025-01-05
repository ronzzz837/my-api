const { db } = require("./database");
const { email } = require("./email")

const resetLimit = async () => {
  const users = await db.find({})
  users.forEach(async (data) => {
    const { username } = data
    if (!username == null) {
      return db.updateOne({
        username: username
      }, {
        limit: 25
      }, function (err, res) {
        if (err) throw err
      })
    }
  })
}

const updateExpiredPremium = async (user) => {
  if (user.premium && user.premiumTime <= Date.now()) {
    user.premium = false;
    user.premiumTime = 0;
    user.apikey = user.defaultKey
    await user.save();
    const html = await email.htmlNotif(user.username, "Premium")
    await email.send(user.email, "Ronzz API Notifications", html)
    console.log(`Premium expired for user: ${user.username}`);
  }
};

const expiredPremiumUsers = async () => {
  try {
    const users = await db.find({ premium: true });

    for (const user of users) {
      await updateExpiredPremium(user);
    }
  } catch (error) {
    console.error(`Error updating expired premium users: ${error}`);
  }
};

const updateExpiredVIP = async (user) => {
  if (user.vip && user.vipTime <= Date.now()) {
    user.vip = false;
    user.vipTime = 0;
    user.apikey = user.defaultKey
    await user.save();
    const html = await email.htmlNotif(user.username, "VIP")
    await email.send(user.email, "Ronzz API Notifications", html)
    console.log(`VIP expired for user: ${user.username}`);
  }
};

const expiredVIPUsers = async () => {
  try {
    const users = await db.find({ vip: true });

    for (const user of users) {
      await updateExpiredVIP(user);
    }
  } catch (error) {
    console.error(`Error updating expired vip users: ${error}`);
  }
};

module.exports = {
	resetLimit,
	updateExpiredPremium,
	expiredPremiumUsers,
	updateExpiredVIP,
	expiredVIPUsers
}