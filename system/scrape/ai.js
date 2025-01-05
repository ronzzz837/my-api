const axios = require("axios")
const Jimp = require('jimp');
const BodyForm = require('form-data');

async function GPT(query) {
  return new Promise(async (resolve, reject) => {
    axios("https://www.chatgptdownload.org/wp-json/mwai-ui/v1/chats/submit", {
      "headers": {
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
      },
      data: {
        "id": null,
        "botId": "default",
        "session": "y2cog0j45q",
        "clientId": "7tzjniqtrgx",
        "contextId": 443,
        "messages": [{
          "id": "fkzhaikd7vh",
          "role": "assistant",
          "content": "Kamu adalah Ronzz YT, dan kamu memiliki sifat agak toxic, kamu berumur 16 tahun dan bersekolah di sekolah menengah atas,kamu type pria yang disukai banyak cewek cantik,kamu juga Owner dari Ronzz API.",
          "who": "AI: ",
          "timestamp": 1695725910365
        }],
        "newMessage": query,
        "stream": false
      },
      "method": "POST"
    }).then(response => {
      resolve(response.data);
    });
  });
};

async function binjie(query) {
  try {
const BinjieBaseURL = "https://api.binjie.fun/api/generateStream";
    const response = await axios.post(BinjieBaseURL, {
        prompt: query,
        system: "Kamu adalah seorang remaja bernama Ronzz YT dan kamu memiliki sifat agak toxic",
        withoutContext: true,
        stream: false
    }, {
        headers: {
            origin: "https://chat.jinshutuan.com",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36"
        }
    });
    return response.data;
  } catch (err) {
    console.log(err.response.data);
    return err.response.data.message;
  }
}

async function remini(input) {
  const image = await Jimp.read(input);
  const buffer = await new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
      if (err) {
        reject('Terjadi error saat mengambil data.');
      } else {
        resolve(buf);
      }
    });
  });
  const form = new BodyForm();
  form.append('image', buffer, { filename: 'remini.jpg' });
  try {
    const { data } = await axios.post(`https://tools.betabotz.eu.org/ai/remini`, form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
      },
    });
    var res = {
      status: true,
      image_data: data.result,
      image_size: data.size
    };
    return res;
  } catch (error) {
    console.error('Identifikasi Gagal:', error);
    return {
      status: false,
      msg: 'Gagal Mengidentifikasi Gambar'
    }
  }
}

async function removebg(input) {
  const image = await Jimp.read(input);
  const buffer = await new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
      if (err) {
        reject('Terjadi error saat mengambil data.');
      } else {
        resolve(buf);
      }
    });
  });
  const form = new BodyForm();
  form.append('image', buffer, { filename: 'removebg.jpg' });
  try {
    const { data } = await axios.post(`https://tools.betabotz.eu.org/ai/removebg`, form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
      },
    });
    var res = {
      status: true,
      image_data: data.result,
      image_size: data.size
    };
    return res;
  } catch (error) {
    console.error('Identifikasi Gagal:', error);
    return {
      status: false,
      msg: 'Gagal Mengidentifikasi Gambar'
    }
  }
}

async function toanime(input) {
  const image = await Jimp.read(input);
  const buffer = await new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
      if (err) {
        reject('Terjadi error saat mengambil data.');
      } else {
        resolve(buf);
      }
    });
  });
  const form = new BodyForm();
  form.append('image', buffer, { filename: 'toanime.jpg' });
  try {
    const { data } = await axios.post(`https://tools.betabotz.eu.org/ai/toanime`, form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
      },
    });
    var res = {
      status: true,
      image_data: data.result,
      image_size: data.size
    };
    return res;
  } catch (error) {
    console.error('Identifikasi Gagal:', error);
    return {
      status: false,
      msg: 'Gagal Mengidentifikasi Gambar'
    }
  }
}

async function tozombie(input) {
  const image = await Jimp.read(input);
  const buffer = await new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
      if (err) {
        reject('Terjadi error saat mengambil data.');
      } else {
        resolve(buf);
      }
    });
  });
  const form = new BodyForm();
  form.append('image', buffer, { filename: 'tozombie.jpg' });
  try {
    const { data } = await axios.post(`https://tools.betabotz.eu.org/ai/tozombie`, form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
      },
    });
    var res = {
      status: true,
      image_data: data.result,
      image_size: data.size
    };
    return res;
  } catch (error) {
    console.error('Identifikasi Gagal:', error);
    return {
      status: false,
      msg: 'Gagal Mengidentifikasi Gambar'
    }
  }
}

module.exports = { GPT, binjie, remini, removebg, toanime, tozombie };