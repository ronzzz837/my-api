const axios = require('axios');
const cheerio = require('cheerio');
const ytc = require("ytdl-core")
const yts = require("yt-search")
const fs = require("fs")

async function TikTok(url) {
  return new Promise((resolve, reject) => {
    axios.get("https://downvideo.quora-wiki.com/tiktok-video-downloader#url=" + url)
    .then(data => {
      var get_token = cheerio.load(data.data);
      var token = get_token("#token").attr("value");
      var params = {
        url: url,
        token: token,
      };
      var options = {
        url: 'https://downvideo.quora-wiki.com/system/action.php',
        method: "post",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
          "referer": "https://downvideo.quora-wiki.com/tiktok-video-downloader",
        },
        data: new URLSearchParams(Object.entries(params)),
      };
      axios.request(options)
      .then(data => {
        resolve({
          title: data.data.title,
          thumbnail: data.data.thumbnail,
          duration: data.data.duration,
          result: data.data.medias
        });
      })
      .catch(error => {
        reject(error);
        console.log(error)
      });
    })
    .catch(error => {
      console.log(error)
      reject(error);
    });
  });
}

async function YtdlMp3(url) {
  return new Promise((resolve, reject) => {
    try {
      const _id = ytc.getVideoID(url)
      const _info = ytc.getInfo(`https://www.youtube.com/watch?v=${_id}`)
      .then((data) => {
        let _formats = data.formats
        let _audio = []
        for (let x = 0; x < _formats.length; x++) {
          if (_formats[x].mimeType == 'audio/webm; codecs=\"opus\"') {
            let _yt = _formats[x]
            _audio.push(_yt.url)
          }
        }
        const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
        const description = data.player_response.microformat.playerMicroformatRenderer.description.simpleText
        const lengthSeconds = data.player_response.microformat.playerMicroformatRenderer.lengthSeconds
        const ownerProfileUrl = data.player_response.microformat.playerMicroformatRenderer.ownerProfileUrl
        const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
        const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
        const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
        const category = data.player_response.microformat.playerMicroformatRenderer.category
        const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
        const externalChannelId = data.player_response.microformat.playerMicroformatRenderer.externalChannelId
        const result = {
            title: title,
            description: description,
            length_econds: lengthSeconds,
            owner_rofile_url: ownerProfileUrl,
            external_channel_id: externalChannelId,
            thumb: thumb,
            channel: channel,
            published: published,
            views: views,
            category: category,
            url: _audio[1]
        }
        return(result)
      })
      resolve(_info)
    } catch (error) {
      reject({
        code: 404,
        coder: 'Ronzz YT',
        error: {
          message: 'An error occurred, make sure the parameters are correct and try again, if there is still an error, please contact the coder!'
        }
      })
    }
    console.log(error)
  })
}

async function YtdlMp4(url) {
  return new Promise((resolve, reject) => {
    try {
      const _id = ytc.getVideoID(url)
      const _info = ytc.getInfo(`https://www.youtube.com/watch?v=${_id}`)
      .then((data) => {
        let _formats = data.formats
        let _video = []
        for (let x = 0; x < _formats.length; x++) {
          if (_formats[x].container == 'mp4' && _formats[x].hasVideo == true && _formats[x].hasAudio == true) {
            let _vid = _formats[x]
            _video.push(_vid.url)
          }
        }
        
        const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
        const description = data.player_response.microformat.playerMicroformatRenderer.description.simpleText
        const lengthSeconds = data.player_response.microformat.playerMicroformatRenderer.lengthSeconds
        const ownerProfileUrl = data.player_response.microformat.playerMicroformatRenderer.ownerProfileUrl
        const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
        const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
        const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
        const category = data.player_response.microformat.playerMicroformatRenderer.category
        const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
        const externalChannelId = data.player_response.microformat.playerMicroformatRenderer.externalChannelId
        
        const result = {
            title: title,
            description: description,
            length_seconds: lengthSeconds,
            owner_rofile_url: ownerProfileUrl,
            external_channel_id: externalChannelId,
            thumb: thumb,
            channel: channel,
            published: published,
            views: views,
            category: category,
            url: _video[0]
        }
        return(result)
      })
      resolve(_info)
    } catch (error) {
      reject({
        code: 404,
        coder: 'Ronzz YT',
        error: {
          message: 'An error occurred, make sure the parameters are correct and try again, if there is still an error, please contact the coder!'
        }
      })
    }
    console.log(error)
  })
}

async function YtPlayMp3(query) {
  return new Promise((resolve, reject) => {
    try {
      const search = yts(query)
      .then((data) => {
        const _url = []
        const _formats = data.all
        for (let x = 0; x < _formats.length; x++) {
          if (_formats[x].type == 'video') {
            let _output = _formats[x]
            _url.push(_output.url)
          }
        }
        const _id = ytc.getVideoID(_url[0])
        const _info = ytc.getInfo(`https://www.youtube.com/watch?v=${_id}`)
        .then((data) => {
          let _formats = data.formats
          let _audio = []
          let _video = []
          for (let x = 0; x < _formats.length; x++) {
            if (_formats[x].mimeType == 'audio/webm; codecs=\"opus\"') {
              let _output = _formats[x]
              _audio.push(_output.url)
            }
          }
          const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
          const description = data.player_response.microformat.playerMicroformatRenderer.description.simpleText
          const lengthSeconds = data.player_response.microformat.playerMicroformatRenderer.lengthSeconds
          const ownerProfileUrl = data.player_response.microformat.playerMicroformatRenderer.ownerProfileUrl
          const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
          const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
          const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
          const category = data.player_response.microformat.playerMicroformatRenderer.category
          const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
          const externalChannelId = data.player_response.microformat.playerMicroformatRenderer.externalChannelId
          const result = {
              title: title,
              description: description,
              length_seconds: lengthSeconds,
              owner_rofile_url: ownerProfileUrl,
              external_channel_id: externalChannelId,
              youtube_url: _url[0],
              thumb: thumb,
              channel: channel,
              published: published,
              views: views,
              category: category,
              url: _audio[0]
          }
          return(result)
        })
        return(_info)
      })
      resolve(search)
    } catch (error) {
      reject({
        code: 404,
        coder: 'Ronzz YT',
        error: {
          message: 'An error occurred, make sure the parameters are correct and try again, if there is still an error, please contact the coder!'
        }
      })
    }
    console.log(error)
  })
}

async function YtPlayMp4(query) {
  return new Promise((resolve, reject) => {
    try {
      const search = yts(query)
      .then((data) => {
        const _url = []
        const _formats = data.all
        for (let x = 0; x < _formats.length; x++) {
          if (_formats[x].type == 'video') {
            let _output = _formats[x]
            _url.push(_output.url)
          }
        }
        const _id = ytc.getVideoID(_url[0])
        const _info = ytc.getInfo(`https://www.youtube.com/watch?v=${_id}`)
        .then((data) => {
          let _formats = data.formats
          let _video = []
          for (let x = 0; x < _formats.length; x++) {
            if (_formats[x].container == 'mp4' && _formats[x].hasVideo == true && _formats[x].hasAudio == true) {
              let _output = _formats[x]
              _video.push(_output.url)
            }
          }
          const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
          const description = data.player_response.microformat.playerMicroformatRenderer.description.simpleText
          const lengthSeconds = data.player_response.microformat.playerMicroformatRenderer.lengthSeconds
          const ownerProfileUrl = data.player_response.microformat.playerMicroformatRenderer.ownerProfileUrl
          const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
          const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
          const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
          const category = data.player_response.microformat.playerMicroformatRenderer.category
          const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
          const externalChannelId = data.player_response.microformat.playerMicroformatRenderer.externalChannelId
          const result = {
              title: title,
              description: description,
              length_seconds: lengthSeconds,
              owner_rofile_url: ownerProfileUrl,
              external_channel_id: externalChannelId,
              youtube_url: _url[0],
              thumb: thumb,
              channel: channel,
              published: published,
              views: views,
              category: category,
              url: _video[0]
          }
          return(result)
        })
        return(_info)
      })
      resolve(search)
    } catch (error) {
      reject({
        code: 404,
        coder: 'Ronzz YT',
        error: {
          message: 'An error occurred, make sure the parameters are correct and try again, if there is still an error, please contact the coder!'
        }
      })
    }
    console.log(error)
  })
}

async function ttstik(text, id) {
  return new Promise(async (resolve, reject) => {
    axios("https://tiktok-tts.weilnet.workers.dev/api/generation", {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
      },
      data: {
        text: text,
        voice: id
      },
      method: "POST"
    }).then(a => {
      resolve(a.data.data);
    }).catch(error => {
      reject(error);
    });
  });
};

function ssWeb (url, device = 'desktop')  {
	return new Promise((resolve, reject) => {
		const base = 'https://www.screenshotmachine.com'
		const param = {
			url: url,
			device: device,
			cacheLimit: 0
		}
		axios({url: base + '/capture.php',
			method: 'POST',
			data: new URLSearchParams(Object.entries(param)),
			headers: {
		        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
		    }
		}).then((data) => {
			const cookies = data.headers['set-cookie']
            if (data.data.status == 'success') {
				axios.get(base + '/' + data.data.link, {
					headers: {
				        'cookie': cookies.join('')
					},
				    responseType: 'arraybuffer'
				}).then(({ data }) => {
				    resolve(data)
			    })
			} else {
		        reject()
		    }
	    }).catch(reject)
    })
}

function pinterest (querry) {
	return new Promise(async (resolve, reject) => {
		axios.get('https://id.pinterest.com/search/pins/?autologin=true&q=' + querry, {
			headers: {
			    "cookie" : "_auth=1; _b=\"AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=\"; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=; _ir=0"
		    }
		}).then(({ data }) => {
		    const $ = cheerio.load(data)
		    const result = [];
		    const hasil = [];
   		    $('div > a').get().map(b => {
                const link = $(b).find('img').attr('src')
                result.push(link)
		    });
   		    result.forEach(v => {
		        if (v == undefined) return
		        hasil.push(v.replace(/236/g,'736'))
		    })
		    hasil.shift()
		    resolve(hasil)
		})
	})
}

module.exports.ttstik = ttstik;
module.exports.tikTok = TikTok;
module.exports.ytMp3 = YtdlMp3;
module.exports.ytMp4 = YtdlMp4;
module.exports.ytPlayMp3 = YtPlayMp3;
module.exports.ytPlayMp4 = YtPlayMp4;
module.exports.ssWeb = ssWeb;
module.exports.pinterest = pinterest