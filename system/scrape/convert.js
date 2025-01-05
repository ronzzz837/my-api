const canvafy = require("canvafy")
const fs = require("fs")

async function welcome(pp,name,bg) {
  const canvafy = require('canvafy')
const well = await new canvafy.WelcomeLeave()
. setAvatar(pp)
.setBackground("image", bg)
.setTitle('Hii ' + name)
.setDescription(`Welcome To My group`) 
.setBorder("#fff")
.setAvatarBorder("#fff")
.setOverlayOpacity(0.5)
.build();
return well
}
async function goodbye(pp,name,bg) {
  const canvafy = require('canvafy')
const lea = await new canvafy.WelcomeLeave()
. setAvatar(pp)
.setBackground("image", bg)
.setTitle('Hii ' + name)
.setDescription(`Goodbye To My group`) 
.setBorder("#fff")
.setAvatarBorder("#fff")
.setOverlayOpacity(0.5)
.build();
return lea
}

async function spotify(author,album,pp,title) {
  const canvafy = require('canvafy')
const hehe = await new canvafy.Spotify()
.setAuthor(author)
.setAlbum(album)
.setTimestamp(121000,263400)
.setImage(pp) 
.setTitle(title)
.setBlur(5)
.setOverlayOpacity(0.7)
.build();
return hehe
}


module.exports = {
welcome,
goodbye,
spotify
}