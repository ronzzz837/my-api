const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const os = require("os");
const fileType = require("file-type");
const axios = require("axios");
const JXR = require("jxr-canvas");
const canvafy = require("canvafy");
const { OpenAIApi, Configuration } = require('openai');
const BitlyClient = require('bitly').BitlyClient;

const router = express.Router();
const config = require("../../config");
const { stalkml } = require("../scrape/stalkml");
const { ttstik, tikTok, ytMp4, ytMp3, ytPlayMp4, ytPlayMp3, ssWeb, pinterest } = require("../scrape/modul");
const Function = require("../lib/function");
const ai = require("../scrape/ai");
const { imageGen } = require('../scrape/bingimg')
const { db } = require("../lib/database");

const ytdl = require("ytdl-core");
const CanvaCord = require("canvacord");
const Func = new Function();

const SpotifyDL = require("spotifydl-core");

const spotifyDL = new SpotifyDL.Spotify({
	clientId: config.api.spotify.clientId,
	clientSecret: config.api.spotify.clientSecret,
}); 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { resSukses, resValid, deleteFile } = Func;

const apiBitly = ['6cfc18e9bfa554714fadc10a1f6aff7555642348','2243940c230ad0d748059aee58ddf126b65fd8e7','c71b6658a1d271ddaf2a5077de3dcb9d67f68025','cddbceccdc2f1c9d11e4cdd0d2b1d1078e447c43','7915c671fbd90eca96310e5c9442d761225a1080','e5dee46eb2d69fc9f4b0057266226a52a3555356','f09ab8db9cf778b37a1cf8bc406eee5063816dec','964080579f959c0cc3226b4b2053cd6520bb60ad','a4f429289bf8bf6291be4b1661df57dde5066525','3d48e2601f25800f375ba388c30266aad54544ae','4854cb9fbad67724a2ef9c27a9d1a4e9ded62faa','d375cf1fafb3dc17e711870524ef4589995c4f69','43f58e789d57247b2cf285d7d24ab755ba383a28','971f6c6c2efe6cb5d278b4164acef11c5f21b637','ae128b3094c96bf5fd1a349e7ac03113e21d82c9','e65f2948f584ffd4c568bf248705eee2714abdd2','08425cf957368db9136484145aa6771e1171e232','dc4bec42a64749b0f23f1a8f525a69184227e301','0f9eb729a7a08ff5e73fe1860c6dc587cc523035','037c5017712c8f5f154ebbe6f91db1f82793c375']

function toCRC16(str) {
  function charCodeAt(str, i) {
    let get = str.substr(i, 1)
    return get.charCodeAt()
  }

  let crc = 0xFFFF;
  let strlen = str.length;
  for (let c = 0; c < strlen; c++) {
    crc ^= charCodeAt(str, c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  hex = crc & 0xFFFF;
  hex = hex.toString(16);
  hex = hex.toUpperCase();
  if (hex.length == 3) {
    hex = "0" + hex;
  }
  return hex;
}

async function qrisDinamis(nominal, qris) {
  nominal = String(nominal)

  let qris2 = qris.slice(0, -4);
  let replaceQris = qris2.replace("010211", "010212");
  let pecahQris = replaceQris.split("5802ID");
  let uang = "54" + ("0" + nominal.length).slice(-2) + nominal + "5802ID";

  let output = pecahQris[0] + uang + pecahQris[1] + toCRC16(pecahQris[0] + uang + pecahQris[1])

  return output
}

const checkApiKey = async (req, res, next) => {
  const apiKey = req.query.apikey;

  if (!apiKey) return res.json(resValid("Masukan Parameter Apikey."));

  try {
    const user = await db.findOne({ apikey: apiKey });

    if (!user) {
      return res.json(resValid(`Invalid API key "${apiKey}"`));
    }

    if (!user.vip) {
      if (user.limit > 0) {
        await db.updateOne({ apikey: apiKey }, { $inc: { limit: -1 } });
      } else {
        return res.json(resValid("Limit kamu sudah habis."));
      }
    }

    next();
  } catch (error) {
    console.log(error);
    return res.json(config.msg.error);
  }
};

const checkPrem = async (req, res, next) => {
  const apiKey = req.query.apikey;

  if (!apiKey) return res.json(resValid("Masukan Parameter Apikey."));

  try {
    const user = await db.findOne({ apikey: apiKey });

    if (!user) return res.json(resValid(`Invalid API key "${apiKey}"`));

    if (!user.premium && !user.vip) return res.json(resValid(`Fitur Ini Khusus Pengguna Premium`))
    
    if (!user.vip) {
      if (user.limit > 0) {
        await db.updateOne({ apikey: apiKey }, { $inc: { limit: -1 } });
      } else {
        return res.json(resValid("Limit kamu sudah habis."));
      }
    }

    next();
  } catch (error) {
    console.log(error);
    return res.json(config.msg.error);
  }
};

const checkVIP = async (req, res, next) => {
  const apiKey = req.query.apikey;

  if (!apiKey) return res.json(resValid("Masukan Parameter Apikey."));

  try {
    const user = await db.findOne({ apikey: apiKey });

    if (!user) return res.json(resValid(`Invalid API key "${apiKey}"`));

    if (!user.vip) return res.json(resValid(`Fitur Ini Khusus Pengguna VIP`))

    next();
  } catch (error) {
    console.log(error);
    return res.json(config.msg.error);
  }
};

function saveFileURL(buffer, folderPath, req) {
  const uniqueFileName = `${uuid.v4()}.jpg`;
  const filePath = path.join(folderPath, uniqueFileName);

  fs.writeFileSync(filePath, buffer);

  setTimeout(
    () => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log(`File deleted successfully: ${filePath}`);
        }
      });
    },
    5 * 60 * 1000,
  );

  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/file/${uniqueFileName}`;
}

function SaveFileURL(buffer, fileName, req) {
  const filePath = path.join(__dirname, "../tmp/", fileName)

  fs.writeFileSync(filePath, buffer);

  setTimeout(
    () => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log(`File deleted successfully: ${filePath}`);
        }
      });
    },
    5 * 60 * 1000,
  );

  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/file/${fileName}`;
}


router.get("/stats", async (req, res) => {
  const findUser = await db.find({});
  const serverInfo = {
    api: {
      users: findUser.length,
    },
    os: {
      CPUs: os.cpus().length,
      model: os.cpus()[0].model,
      uptime: os.uptime(),
      totalMemory: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + " GB",
      freeMemory: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + " GB",
      speed: os.cpus()[0].speed / 1000 + " GHz",
    },
  };

  res.json(serverInfo);
});

router.get("/file/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../tmp", filename);
  
  if (fs.existsSync(filePath)) {	
    res.sendFile(filePath); 
  } else {
    res.status(400).json(resValid("File Not Found"));
  }
});

// hehe

router.get("/maker/welcome", checkApiKey, async (req, res) => {
	const { ppurl, name, bgurl, gcname, gcurl, member } = req.query
	if (!ppurl) return res.json(resValid("Masukkan Parameter Profil URL"))
	if (!ppurl.startsWith("https://") && !ppurl.startsWith("http://")) return res.json(resValid("Invalid Profile URL, Silahkan Masukkan Profile URL Berawalan https:// Atau http://"))
	if (!name) return res.json(resValid("Masukkan Parameter Name"))
	if (!bgurl) return res.json(resValid("Masukkan Parameter Background URL"))
	if (!bgurl.startsWith("https://") && !bgurl.startsWith("http://")) return res.json(resValid("Invalid Background URL, Silahkan Masukkan Background URL Berawalan https:// Atau http://"))
	if (!gcname) return res.json(resValid("Masukkan Parameter Group Name"))
	if (!gcurl) return res.json(resValid("Masukkan Parameter Profile Group URL"))
	if (!gcurl.startsWith("https://") && !gcurl.startsWith("http://")) return res.json(resValid("Invalid Group URL, Silahkan Masukkan Group URL Berawalan https:// Atau http://"))
	if (!member) return res.json(resValid("Masukkan Parameter Member"))
	
	try {
  	    const welcome = await new JXR.Welcome2()
        .setAvatar(ppurl)
        .setUsername(name) 
        .setBg(bgurl) 
        .setGroupname(gcname) 
        .setMember(Number(member)) 
        .toAttachment()
        const buffer = await welcome.toBuffer()
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/goodbye", checkApiKey, async (req, res) => {
	const { ppurl, name, bgurl, member } = req.query
	if (!ppurl) return res.json(resValid("Masukkan Parameter Profil URL"))
	if (!ppurl.startsWith("https://") && !ppurl.startsWith("http://")) return res.json(resValid("Invalid Profile URL, Silahkan Masukkan Profile URL Berawalan https:// Atau http://"))
	if (!name) return res.json(resValid("Masukkan Parameter Name"))
	if (!bgurl) return res.json(resValid("Masukkan Parameter Background URL"))
	if (!bgurl.startsWith("https://") && !bgurl.startsWith("http://")) return res.json(resValid("Invalid Background URL, Silahkan Masukkan Background URL Berawalan https:// Atau http://"))
	if (!member) return res.json(resValid("Masukkan Parameter Member"))
	
	try {
  	    const goodbye = await new JXR.Goodbye2()
        .setAvatar(ppurl)
        .setUsername(name)
        .setBg(bgurl)
        .setMember(Number(member))
        .toAttachment()
        const buffer = await goodbye.toBuffer()
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/attp", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
  	    const buffer = await new JXR.Attp()
        .setTeks(teks)
        .toAttachment()
        res.set({'Content-Type': 'gif'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/ttp", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
  	    const ttp = await new JXR.Ttp()
        .setTeks(teks)
        .toAttachment()
        const buffer = await ttp.toBuffer()
        res.set({'Content-Type': 'image/webp'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/ktp", checkVIP, async (req, res) => {
	const { nik, provinsi, kabupaten, name, ttl, jeniskelamin, alamat, rtrw, lurah, kecamatan, agama, nikah, kerja, warga, berlakuhingga, ppurl } = req.query
	if (!nik) return res.json(resValid("Masukkan Parameter Nik"))
	if (!provinsi) return res.json(resValid("Masukkan Parameter Provinsi"))
	if (!kabupaten) return res.json(resValid("Masukkan Parameter Kabupaten"))
	if (!name) return res.json(resValid("Masukkan Parameter Name"))
	if (!ttl) return res.json(resValid("Masukkan Parameter Tempat, Tanggal Lahir"))
	if (!jeniskelamin) return res.json(resValid("Masukkan Parameter Jenis Kelamin"))
	if (!alamat) return res.json(resValid("Masukkan Parameter Alamat"))
	if (!rtrw) return res.json(resValid("Masukkan Parameter RT/RW"))
	if (!lurah) return res.json(resValid("Masukkan Parameter Lurah"))
	if (!kecamatan) return res.json(resValid("Masukkan Parameter Kecamatan"))
	if (!agama) return res.json(resValid("Masukkan Parameter Agama"))
	if (!nikah) return res.json(resValid("Masukkan Parameter Nikah"))
	if (!kerja) return res.json(resValid("Masukkan Parameter Kerja"))
	if (!warga) return res.json(resValid("Masukkan Parameter Warga"))
	if (!berlakuhingga) return res.json(resValid("Masukkan Parameter Berlaku Hingga"))
	if (!ppurl) return res.json(resValid("Masukkan Parameter PP URL"))
	if (!ppurl.startsWith("https://") && !ppurl.startsWith("http://")) return res.json(resValid("Invalid Profile URL, Silahkan Masukkan Profile URL Berawalan https:// Atau http://"))
	
	try {
  	    const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/ktpmaker?nik=${nik}&prov=${provinsi}&kabu=${kabupaten}&name=${name}&ttl=${ttl}&jk=${jeniskelamin}&jl=${alamat}&rtrw=${rtrw}&lurah=${lurah}&camat=${kecamatan}&agama=${agama}&nikah=${nikah}&kerja=${kerja}&warga=${warga}&until=${berlakuhingga}&img=${ppurl}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/kartunikah", checkPrem, async (req, res) => {
	const { ppsuami, ppistri, qrcode, suami, istri, tanggal, kecamatan, provinsi, akta } = req.query
	if (!ppsuami) return res.json(resValid("Masukkan Parameter Profile Suami"))
	if (!ppistri) return res.json(resValid("Masukkan Parameter Profile Istri"))
	if (!qrcode) return res.json(resValid("Masukkan Parameter QR Code"))
	if (!suami) return res.json(resValid("Masukkan Parameter Nama Suami"))
	if (!istri) return res.json(resValid("Masukkan Parameter Nama Istri"))
	if (!tanggal) return res.json(resValid("Masukkan Parameter Tanggal"))
	if (!kecamatan) return res.json(resValid("Masukkan Parameter Kecamatan"))
	if (!provinsi) return res.json(resValid("Masukkan Parameter Provinsi"))
	if (!akta) return res.json(resValid("Masukkan Parameter Akta"))

	try {
  	    const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/kartunikah?ppsuami=${ppsuami}&ppistri=${ppistri}&qrcode=${qrcode}&suami=${suami}&istri=${istri}&tgl=${tanggal}&kec=${kecamatan}&prov=${provinsi}&akta=${akta}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/spotify", checkPrem, async (req, res) => {
	const { author, album, ppurl, title } = req.query
	if (!author) return res.json(resValid("Masukkan Parameter Author"))
	if (!album) return res.json(resValid("Masukkan Parameter Album"))
	if (!bgurl) return res.json(resValid("Masukkan Parameter Profile URL"))
	if (!bgurl.startsWith("https://") && !bgurl.startsWith("http://")) return res.json(resValid("Invalid Background URL, Silahkan Masukkan Background URL Berawalan https:// Atau http://"))
	if (!title) return res.json(resValid("Masukkan Parameter Title"))

	try {
  	    const spotify = await new canvafy.Spotify()
            .setAuthor(author)
            .setAlbum(album)
            .setTimestamp(121000, 263400)
            .setImage(ppurl) 
            .setTitle(title)
            .setBlur(5)
            .setOverlayOpacity(0.7)
            .build();
        const buffer = await Buffer.from(spotify, "base64")
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/rank", checkApiKey, async (req, res) => {
	const { ppurl, name, level, rankurl, cexp, rexp, bgurl } = req.query
	if (!ppurl) return res.json(resValid("Masukkan Parameter Profile URL"))
	if (!ppurl.startsWith("https://") && !ppurl.startsWith("http://")) return res.json(resValid("Invalid Profile URL, Silahkan Masukkan Profile URL Berawalan https:// Atau http://"))
	if (!name) return res.json(resValid("Masukkan Parameter Name"))
	if (!level) return res.json(resValid("Masukkan Parameter Level"))
	if (!rankurl) return res.json(resValid("Masukkan Parameter Rank URL"))
	if (!rankurl.startsWith("https://") && !rankurl.startsWith("http://")) return res.json(resValid("Invalid Rank URL, Silahkan Masukkan Rank URL Berawalan https:// Atau http://"))
	if (!cexp) return res.json(resValid("Masukkan Parameter Current Exp"))
	if (!rexp) return res.json(resValid("Masukkan Parameter Required Exp"))
	if (!bgurl) return res.json(resValid("Masukkan Parameter Background URL"))
	if (!bgurl.startsWith("https://") && !bgurl.startsWith("http://")) return res.json(resValid("Invalid Background URL, Silahkan Masukkan Background URL Berawalan https:// Atau http://"))

	try {
  	    const rank = await new JXR.Rank()
            .setAvatar(ppurl) 
            .setUsername(name) 
            .setBg(bgurl)
            .setNeedxp(Number(rexp))
            .setCurrxp(Number(cexp))
            .setLevel(Number(level))
            .setRank(rankurl)
            .toAttachment();
        const buffer = await rank.toBuffer()
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/levelup", checkApiKey, async (req, res) => {
	const { ppurl } = req.query
	if (!ppurl) return res.json(resValid("Masukkan Parameter Profile URL"))
	if (!ppurl.startsWith("https://") && !ppurl.startsWith("http://")) return res.json(resValid("Invalid Profile URL, Silahkan Masukkan Profile URL Berawalan https:// Atau http://"))

	try {
  	    const levelup = await new JXR.Up()
            .setAvatar(ppurl) 
            .toAttachment();
        const buffer = await levelup.toBuffer()
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/captcha", checkApiKey, async (req, res) => {
	const { captchakey, bgurl } = req.query
	if (!captchakey) return res.json(resValid("Masukkan Parameter Captcha Key"))
	if (!bgurl) return res.json(resValid("Masukkan Parameter Background URL"))
	if (!bgurl.startsWith("https://") && !bgurl.startsWith("http://")) return res.json(resValid("Invalid Background URL, Silahkan Masukkan Background URL Berawalan https:// Atau http://"))
	
	try {
  	    const captcha = await new canvafy.Captcha()
            .setBackground("image", bgurl)
            .setCaptchaKey(captchakey)
            .setBorder("#f0f0f0")
            .setOverlayOpacity(0.7)
            .build();
        const buffer = await Buffer.from(captcha, "base64")
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/amongus", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/amongus?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/nulis", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/nulis?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/carbon", checkApiKey, async (req, res) => {
	const { code, language } = req.query
	if (!code) return res.json(resValid("Masukkan Parameter Code"))
	if (!language) return res.json(resValid("Masukkan Parameter Language"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/carbon?code=${code}&language=${language}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/tweettrump", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/tweettrump?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/gsuggest", checkApiKey, async (req, res) => {
	const { teks1, teks2, teks3 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	if (!teks3) return res.json(resValid("Masukkan Parameter Teks 3"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/gsuggest?apikey=text1=${teks1}&text2=${teks2}&text3=${teks3}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/idulfitri", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/idulfitri?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/invoice", checkApiKey, async (req, res) => {
	const { produk, id, jumlah, username, reffid, waktu } = req.query
	if (!produk) return res.json(resValid("Masukkan Parameter Produk"))
	if (!id) return res.json(resValid("Masukkan Parameter ID"))
	if (!jumlah) return res.json(resValid("Masukkan Parameter Jumlah"))
	if (!username) return res.json(resValid("Masukkan Parameter Username"))
	if (!reffid) return res.json(resValid("Masukkan Parameter Reff ID"))
	if (!waktu) return res.json(resValid("Masukkan Parameter Waktu"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/creator/invoice?produk=${produk}&id=${id}&jumlah=${jumlah}&username=${username}&refid=${reffid}&waktu=${waktu}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/qrcode", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/qrcode?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})  

router.get("/maker/quotes", checkApiKey, async (req, res) => {
	const { teks, author } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	if (!author) return res.json(resValid("Masukkan Parameter Author"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/quotemaker2?text=${teks}&author=${author}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/ramadhan", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/ramadhan?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/readqrcode", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/read-qr?img=${url}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/ipaddress", checkApiKey, async (req, res) => {
	const { ip } = req.query
	if (!ip) return res.json(resValid("Masukkan Parameter IP"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/ipaddress/${ip}?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/github", checkApiKey, async (req, res) => {
	const { username } = req.query
	if (!username) return res.json(resValid("Masukkan Parameter Username"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/github/${username}?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/instagram", checkApiKey, async (req, res) => {
	const { username } = req.query
	if (!username) return res.json(resValid("Masukkan Parameter Username"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/stalkig/${username}?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/youtube", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/ytchannel?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/mobilelegends", checkApiKey, async (req, res) => {
	const { id, zone } = req.query
	if (!id) return res.json(resValid("Masukkan Parameter ID"))
	if (!zone) return res.json(resValid("Masukkan Parameter Zone ID"))
	
	try {
        const result = await stalkml(Number(id), Number(zone))
        res.json(resSukses({
            id: result.id,
            zone: result.zoneId,
            nickname: result.nickname
        }));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/freefire", checkApiKey, async (req, res) => {
	const { id } = req.query
	if (!id) return res.json(resValid("Masukkan Parameter ID"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/freefire/${id}?apikey=${config.api.lolhuman}`)
        res.json(resSukses({
            id: id,
            nickname: result.result
        }));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/codm", checkApiKey, async (req, res) => {
	const { id } = req.query
	if (!id) return res.json(resValid("Masukkan Parameter ID"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/codm/${id}?apikey=${config.api.lolhuman}`)
        res.json(resSukses({
            id: id,
            nickname: result.result
        }));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/genshin", checkApiKey, async (req, res) => {
	const { id } = req.query
	if (!id) return res.json(resValid("Masukkan Parameter ID"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/genshin/username/${id}?apikey=${config.api.lolhuman}`)
        res.json(resSukses({
            id: id,
            nickname: result.result
        }));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/higgsdomino", checkApiKey, async (req, res) => {
	const { id } = req.query
	if (!id) return res.json(resValid("Masukkan Parameter ID"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/higghdomino/${id}?apikey=${config.api.lolhuman}`)
        res.json(resSukses({
            id: id,
            nickname: result.result
        }));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/osu", checkApiKey, async (req, res) => {
	const { username } = req.query
	if (!username) return res.json(resValid("Masukkan Parameter Username"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/osuname/${username}?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/stalker/sausageman", checkApiKey, async (req, res) => {
	const { id } = req.query
	if (!id) return res.json(resValid("Masukkan Parameter ID"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/sausageman/${id}?apikey=${config.api.lolhuman}`)
        res.json(resSukses({
            id: id,
            nickname: result.result
        }));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/maker/readqrcode", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/read-qr?img=${url}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/ai/chatgpt", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const result = await ai.GPT(teks)
        res.json(resSukses({
            success: result.success,
            msg: result.reply
        }));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/ai/binjie", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const result = await ai.binjie(teks)
        res.json(resSukses(result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/ai/remini", checkPrem, async (req, res) => {
	const { img } = req.query
	if (!img) return res.json(resValid("Masukkan Parameter Image URL"))
	if (!img.startsWith("https://") && !img.startsWith("http://")) return res.json(resValid("Invalid Image URL, Silahkan Masukkan Image URL Berawalan https:// Atau http://"))
	
	try {
        const result = await ai.remini(img)
        if (!result.image_data) return res.json(resValid("Gagal Mengidentifikasi Gambar"))
        const buffer = await Func.getBuffer(result.image_data)
        res.set('Content-Type', "image/jpeg");
		res.send(buffer);
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/ai/removebg", checkPrem, async (req, res) => {
	const { img } = req.query
	if (!img) return res.json(resValid("Masukkan Parameter Image URL"))
	if (!img.startsWith("https://") && !img.startsWith("http://")) return res.json(resValid("Invalid Image URL, Silahkan Masukkan Image URL Berawalan https:// Atau http://"))
	
	try {
        const result = await ai.removebg(img)
        if (!result.image_data) return res.json(resValid("Gagal Mengidentifikasi Gambar"))
        const buffer = await Func.getBuffer(result.image_data)
        res.set('Content-Type', "image/png");
		res.send(buffer);
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/ai/toanime", checkPrem, async (req, res) => {
	const { img } = req.query
	if (!img) return res.json(resValid("Masukkan Parameter Image URL"))
	if (!img.startsWith("https://") && !img.startsWith("http://")) return res.json(resValid("Invalid Image URL, Silahkan Masukkan Image URL Berawalan https:// Atau http://"))
	
	try {
        const result = await ai.toanime(img)
        if (!result.image_data) return res.json(resValid("Gagal Mengidentifikasi Gambar"))
        const buffer = await Func.getBuffer(result.image_data)
        res.set('Content-Type', "image/jpeg");
		res.send(buffer);
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/ai/tozombie", checkPrem, async (req, res) => {
	const { img } = req.query
	if (!img) return res.json(resValid("Masukkan Parameter Image URL"))
	if (!img.startsWith("https://") && !img.startsWith("http://")) return res.json(resValid("Invalid Image URL, Silahkan Masukkan Image URL Berawalan https:// Atau http://"))
	
	try {
        const result = await ai.tozombie(img)
        if (!result.image_data) return res.json(resValid("Gagal Mengidentifikasi Gambar"))
        const buffer = await Func.getBuffer(result.image_data)
        res.set('Content-Type', "image/jpeg");
		res.send(buffer);
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/ai/openai", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const result = await Func.fetchJson(`https://tools.betabotz.eu.org/tools/openai?q=${teks}`)
        res.json(resSukses(result.result.replace('BetaBotz-Ai', 'Ronzz AI').replace('BetaBotz', 'saya').replace('Lann', 'Ronzz YT').replace('https://github.com/ERLANRAHMAT', 'https://youtube.com/c/RonzzYT')));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/random/sfw/:action", checkApiKey, async (req, res) => {
	const value = req.params.action
	if (!value) return res.json(resValid("Invalid action, silahkan cek lagi"))
	
	try {
		const data = await Func.fetchJson(`https://raw.githubusercontent.com/ArifzynXD/database/master/anime/${value}.json`)
		const url = Func.pickRandom(data)
		const bufferr = await Func.getBuffer(url)
		res.set('Content-Type', "image/jpeg");
		res.send(bufferr);
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/random/asupan/:action", checkApiKey, async (req, res) => {
	const value = req.params.action 
	if (!value) return res.json(resValid("Invalid action, silahkan cek lagi"))
	
	try {
		const data = await Func.fetchJson(`https://raw.githubusercontent.com/ArifzynXD/database/master/asupan/${value}.json`)
		const url = Func.pickRandom(data)
		res.json(resSukses(url));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/random/cecan/:action", checkApiKey, async (req, res) => {
	const value = req.params.action 
	if (!value) return res.json(resValid("Invalid action, silahkan cek lagi"))
	
	try {
		const data = await Func.fetchJson(`https://raw.githubusercontent.com/ArifzynXD/database/master/cecan/${value}.json`)
		const url = Func.pickRandom(data)
		res.json(resSukses(url));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/islami/asmaulhusna", checkApiKey, async (req, res) => {
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/asmaulhusna?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/islami/audioayat", checkApiKey, async (req, res) => {
	const { surah, ayat } = req.query
	if (!surah) return res.json(resValid("Masukkan Parameter Surah Menurut Nomor, Contoh Surah Al-Fatihah Yaitu Surah Ke 1"))
	if (!ayat) return res.json(resValid("Masukkan Parameter Ayat"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/quran/audio/${Number(surah)}/${Number(ayat)}?apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'audio/mpeg'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/islami/audiosurah", checkApiKey, async (req, res) => {
	const { surah } = req.query
	if (!surah) return res.json(resValid("Masukkan Parameter Surah Menurut Nomor, Contoh Surah Al-Fatihah Yaitu Surah Ke 1"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/quran/audio/${Number(surah)}?apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'audio/mpeg'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/islami/kisahnabi", checkApiKey, async (req, res) => {
	const { nabi } = req.query
	if (!nabi) return res.json(resValid("Masukkan Parameter Nabi"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/kisahnabi/${nabi}?apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/islami/surah", checkApiKey, async (req, res) => {
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/quran?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/islami/niatsholat", checkApiKey, async (req, res) => {
	const { sholat } = req.query
	if (!sholat) return res.json(resValid("Masukkan Parameter Sholat"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/niatsholat/${sholat}?apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/apk", checkApiKey, async (req, res) => {
	const { package } = req.query
	if (!package) return res.json(resValid("Masukkan Parameter Package"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/apkdownloader?package=${package}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid("Package tidak ditemukan"))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/cocofun", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/cocofun?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/facebook", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/facebook?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/spotify", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://tools.betabotz.eu.org/tools/spotifydl?url=${url}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/instagram", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/instagram2?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/igstory", checkApiKey, async (req, res) => {
	const { username } = req.query
	if (!username) return res.json(resValid("Masukkan Parameter Username"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/igstory/${username}?apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/mediafire", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/mediafire?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/pinterest", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/pinterestdl?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/pornhub", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/pornhub?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/snackvideo", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/snackvideo?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/tiktokmp3", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/tiktokmusic?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/tiktok", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/tiktok?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/tiktokphoto", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/tiktokslide?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/xnxx", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/xnxx?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/youtube", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/ytvideo2?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/youtubemp3", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/ytaudio2?url=${url}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/downloader/ytplay", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/ytplay2?query=${query}&apikey=${config.api.lolhuman}`)
        if (result.status == 404) return res.json(resValid(result.message))
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/stikermeme", checkApiKey, async (req, res) => {
	const { teks1, teks2, img } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	if (!img) return res.json(resValid("Masukkan Parameter Image URL"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/stickermeme?texttop=${teks1}&textbottom=${teks2}&img=${img}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/webp'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/ohno", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/creator/ohno?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memeindo", checkApiKey, async (req, res) => {
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme/memeindo?apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memecreator1", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme8?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memecreator2", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme7?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memecreator3", checkApiKey, async (req, res) => {
	const { teks1, teks2, teks3 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	if (!teks3) return res.json(resValid("Masukkan Parameter Teks 3"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme6?text1=${teks1}&text2=${teks2}&text3=${teks3}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memecreator4", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme5?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memecreator5", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme4?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memecreator6", checkApiKey, async (req, res) => {
	const { teks1, teks2, teks3 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	if (!teks3) return res.json(resValid("Masukkan Parameter Teks 3"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme3?text1=${teks1}&text2=${teks2}&text3=${teks3}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/memecreator7", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme2?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/kanna", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/creator/kannagen?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/darkjokes", checkApiKey, async (req, res) => {
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/meme/darkjoke?apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/meme/changemymind", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/creator/changemymind?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/ssweb", checkApiKey, async (req, res) => {
	const { url, device } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan masukkan URL berawalan https:// atau http://"))
    if (!device) return res.json(resValid("Masukkan Parameter Device"))
	
	try {
        const buffer = await ssWeb(url, device)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/tinyurl", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan masukkan URL berawalan https:// atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/shortlink?url=${url}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/cuttly", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan masukkan URL berawalan https:// atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/shortlink3?url=${url}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/bitly", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan masukkan URL berawalan https:// atau http://"))
	
	try {
	    const apibitly = apiBitly[Math.floor(Math.random() * apiBitly.length)]
	    const bitly = await new BitlyClient(apibitly)
    	const result = await bitly
        	.shorten(url)
        res.json(resSukses(result.link));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/ebase64", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	if (teks > 2048) return res.json(resValid("Maximal Teks 2048 String"))
	
	try {
        res.json(resSukses(Buffer.from(teks).toString('base64')));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/debase64", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	if (teks > 2048) return res.json(resValid("Maximal Teks 2048 String"))
	
	try {
        res.json(resSukses(Buffer.from(teks, 'base64').toString('ascii')));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/ebinary", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	if (teks > 2048) return res.json(resValid("Maximal Teks 2048 String"))
	
	try {
	    function encodeBinary(char) {
		    return char.split("").map(str => {
			    const converted = str.charCodeAt(0).toString(2);
			    return converted.padStart(8, "0");
		    }).join(" ")
	    }
        res.json(resSukses(encodeBinary(teks)));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/debinary", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	if (teks > 2048) return res.json(resValid("Maximal Teks 2048 String"))
	
	try {
	    function decodeBinary(char) {
		    return char.split(" ").map(str => String.fromCharCode(Number.parseInt(str, 2))).join("");
	    }
        res.json(resSukses(decodeBinary(teks)));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/tools/vcc", checkPrem, async (req, res) => {
	const { bin } = req.query
	if (!bin) return res.json(resValid("Masukkan Parameter Bin"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/vccgenerator?bin=${bin}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/primbon/artimimpi", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/primbon/artimimpi?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/primbon/artinama", checkApiKey, async (req, res) => {
	const { nama } = req.query
	if (!nama) return res.json(resValid("Masukkan Parameter Nama"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/artinama?nama=${nama}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/primbon/jodoh", checkApiKey, async (req, res) => {
	const { nama1, nama2 } = req.query
	if (!nama1) return res.json(resValid("Masukkan Parameter Nama 1"))
	if (!nama2) return res.json(resValid("Masukkan Parameter Nama 2"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/jodoh/${nama1}/${nama2}?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/primbon/tebakgender", checkApiKey, async (req, res) => {
	const { nama } = req.query
	if (!nama) return res.json(resValid("Masukkan Parameter Nama"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/tebakgender?name=${nama}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/primbon/tebakumur", checkApiKey, async (req, res) => {
	const { nama } = req.query
	if (!nama) return res.json(resValid("Masukkan Parameter Nama"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/tebakumur?name=${nama}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/primbon/zodiak", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))

	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/zodiak/${query}?apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/gimage", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/gimage?query=${query}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/spotify", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://tools.betabotz.eu.org/tools/spotify-search?q=${query}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/gimage2", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/gimage2?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/danbooru", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/danbooru?query=${query}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/google", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/gsearch?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/konachan", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/konachan?query=${query}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/lirik", checkApiKey, async (req, res) => {
	const { judul } = req.query
	if (!judul) return res.json(resValid("Masukkan Parameter Judul"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/lirik?query=${judul}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/pinterest", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await pinterest(query)
        res.json(resSukses(result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/katabijak", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/searchbijak?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/place", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/searchplace?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/stikerwa", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/stickerwa?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/unsplash", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/unsplash?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/wallpaper", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/wallpaper?query=${query}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/anime", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/anime?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/character", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/character?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/kusonime", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/kusonimesearch?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/manga", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/manga?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/search/neko", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(resValid("Masukkan Parameter Query"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/nekopoisearch?query=${query}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/anime/kusonime", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/kusonime?url=${url}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/anime/neko", checkApiKey, async (req, res) => {
	const { url } = req.query
	if (!url) return res.json(resValid("Masukkan Parameter URL"))
	if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json(resValid("Invalid URL, Silahkan Masukkan URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/nekopoi?url=${url}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/anime/whatisanime", checkApiKey, async (req, res) => {
	const { img } = req.query
	if (!img) return res.json(resValid("Masukkan Parameter Image URL"))
	if (!img.startsWith("https://") && !img.startsWith("http://")) return res.json(resValid("Invalid Image URL, Silahkan Masukkan Image URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/wait?img=${img}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/anime/whatismanga", checkApiKey, async (req, res) => {
	const { img } = req.query
	if (!img) return res.json(resValid("Masukkan Parameter Image URL"))
	if (!img.startsWith("https://") && !img.startsWith("http://")) return res.json(resValid("Invalid Image URL, Silahkan Masukkan Image URL Berawalan https:// Atau http://"))
	
	try {
        const result = await Func.fetchJson(`https://api.lolhuman.xyz/api/wmit?img=${img}&apikey=${config.api.lolhuman}`)
        res.json(resSukses(result.result));
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/avengers", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome2/avenger?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/blackpink", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/blackpink?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/bloodfrosted", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/bloodfrosted?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/bokeh", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/bokeh?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/box3d", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/box3d?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/breakwall", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/breakwall?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/cloud", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/cloud?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/coolgravity", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome2/coolgravity?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/deluxesilver", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/deluxesilver?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/fireworksparkle", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/fireworksparkle?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/futureneon", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/futureneon?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/glitch", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome2/glitch?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/greenneon", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/greenneon?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/halloween", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/halloween?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/holographic", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/holographic?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/horrorblood", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/horrorblood?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/icecold", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/icecold?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/impressiveglitch", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/impressiveglitch?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/jokerlogo", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/jokerlogo?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/lightglowsliced", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))

	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/sliced?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/lionlogo", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome2/lionlogo?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/luxury", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/luxury?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/magma", checkApiKey, async (req, res) => {
	const { teks } = req.query
	if (!teks) return res.json(resValid("Masukkan Parameter Teks"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome/magma?text=${teks}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/textpro/marvelstudio", checkApiKey, async (req, res) => {
	const { teks1, teks2 } = req.query
	if (!teks1) return res.json(resValid("Masukkan Parameter Teks 1"))
	if (!teks2) return res.json(resValid("Masukkan Parameter Teks 2"))
	
	try {
        const buffer = await Func.getBuffer(`https://api.lolhuman.xyz/api/textprome2/marvelstudio?text1=${teks1}&text2=${teks2}&apikey=${config.api.lolhuman}`)
        res.set({'Content-Type': 'image/png'})
        res.send(buffer)
	} catch (e) {
      console.error(e);
      res.json(config.msg.error);
    }
})

router.get("/api/qris-statis-to-dinamis", async (req, res) => {
  const { amount, codeqr } = req.query
  if (!amount) return
  if (!codeqr) return 
  
  let qr_string = await qrisDinamis(amount, codeqr)
  res.json({
    status: true,
    creator: "Ronzz YT",
    qr_string: qr_string
  });
});

module.exports = router;
