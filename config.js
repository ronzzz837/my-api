const axios = require('axios');
// semua settings di sini 
// hallo
const options = {
  creator: "Ronzz YT",
  port: 3000,
  limit: 25,
  premiumLimit: 1000,
  
  token: "6140690266:AAHU6EjMtoDdKbZY9p6RDhczFjuaIwqOuZ8",
  chatId: "5747750424",
  webhook: ""
} 
  
module.exports = {
  options, 
 
  api: {
    prodia: "",
    openai: "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", 
    gemini: "AIzaSyBvlcHrV7m1YjozxqgPQiOzL5_ciOIRPyo",
    bard:  "",
    google: {
    	clientId: "170073054644-6bcnrl7p6p4rdo61p7hgs98mqn1em8kg.apps.googleusercontent.com",
    	clientSecret: "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",
    	callbackURL: "https://api.ronzzyt.tech/auth/google/callback"
    }, 
    spotify: {
    	clientId: "",
    	clientSecret: ""
    },
    bing: []
  },
  
  smtp: {
  	email: "zikxzz4@gmail.com",
  	pass: "fzmvnnnkdympwhwt"
  },
  
  mongoURL: "mongodb+srv://RonzzYT:RonzzYT22@cluster0.rfa7p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  message: async (text, mode) => {
  	try {
  		const { data } = await axios.post(`https://api.telegram.org/bot${options.token}/sendMessage`, {
  			chat_id: options.chatId,
  			text: text,
  			parse_mode: mode
          })
          
          console.log(data.ok)
      } catch (e) {
      	console.error(e)
      }
  },
  
  web: {
    title: "Ronzz API", 
    footer: "© 2024 Ronzz YT.",
    tags: {
      "anime": "fas fa-ghost", 	
      "download": "fas fa-download",
      "ai": "fas fa-robot",
      "stalker": "fas fa-eye",
    },
  },
  
  msg: {
    query: {
      status: 403,
      creator: options.creator,
      message: "Masukan parameter query."
    },
    text: {
      status: 403,
      creator: options.creator,
      message: "Masukan parameter text."
    },
    param: {
      status: 403,
      creator: options.creator,
      message: "Parameter invalid, silahkan cek lagi."
    },
    url: {
      status: 403,
      creator: options.creator,
      message: "Masukan parameter url."
    },
    user: {
      status: 403,
      creator: options.creator,
      message: "Masukan parameter username."
    },
    id: {
      status: 403,
      creator: options.creator,
      message: "Masukan parameter id."
    },
    error: {
      status: 403,
      creator: options.creator,
      message: "Terjadi kesalahan saat mengambil data."
    }
  }
}
