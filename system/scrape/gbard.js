const axios = require('axios');
const googleIt = require('google-it');
async function gbard(query) {
  try {
    const sender = Date.now();
    const text = query;

    // Melakukan pencarian Google
    const searchResults = await googleIt({ 'query': text, 'limit': 10 });
    const articles = searchResults.map(result => ({
      snippet: result.snippet
    }));

    const payload = {
      app: {
        id: "bpux3900vgz1694525362231",
        time: Date.now(),
        data: {
          sender: {
            id: sender + "akiuari beta"
          },
          message: [
            {
              id: Date.now(),
              time: Date.now(),
              type: "text",
              value: `{
  "Sistem AI": {
    "Pengetahuan AI": "${JSON.stringify(articles, null, 2)}",
    "Cara Menjawab": "Saya akan merespons dengan sikap profesional dan menggunakan pengetahuan saya dengan cermat. Saya akan memberikan penjelasan yang mendalam dan menjawab pertanyaan Anda dengan cara yang sesuai dengan standar formal. Selain itu, saya akan menyajikan jawaban dalam bentuk minimal tiga paragraf yang informatif dan terstruktur."
  },
  "Pertanyaan": "${text}"
}
`
            }
          ]
        }
      }
    };

    const webhookUrl = 'https://webhook.botika.online/webhook/';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer uktz1r-e96l-nq2g0ppgl85qg9f9-h2sb15h6qa-nz61myr5'
    };

    const webhookResponse = await axios.post(webhookUrl, payload, { headers });
    const { data, status } = webhookResponse;

    if (status === 200) {
      const messages = data.app.data.message;

      if (Array.isArray(messages)) {
        const responseMessages = messages.map((message) => message.value);
        let replyMessage = responseMessages.join('\n');

        if (/(<BR>|<br>)/i.test(replyMessage)) {
          let newReplyMessage = replyMessage.replace(/<BR>|<br>/gi, '\n');
          newReplyMessage = newReplyMessage.replace(/```/g, '\n');
          let replyMessages = newReplyMessage.split('\n');
          let combinedResponse = '';

          for (const [index, message] of replyMessages.entries()) {
            combinedResponse += "\n " + message + '\n';
          }
return combinedResponse
          
        } else {
          return replyMessage
          
        }
      } else {
        res.send("iya ada yang bisa rulz bantu");
      }
    } else {
      return "server down"
      
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
}
async function modulPlay(query) {
  try {
    const url = `https://biodegradablearidkernel--rikipurwanto.repl.co/play?text=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const data = response.data;
    // Lakukan sesuatu dengan data yang diperoleh
    return data
  } catch (error) {
    console.error(error);
  }
}
module.exports = { gbard, modulPlay }