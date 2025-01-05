const Canvas = require("canvas");
const fontPaths = ["./../asset/font/Creme.ttf", "./../asset/font/Sf-Pro.ttf"];

module.exports = class ktpMaker {

    constructor() {
        this.bg = "";
        this.nik = "";
        this.prov = "";
        this.kabu = "";
        this.name = "";
        this.ttl = "";
        this.jk = "";
        this.jl = "";
        this.gd = "";
        this.rtrw = "";
        this.lurah = "";
        this.camat = "";
        this.agama = "";
        this.nikah = "";
        this.kerja = "";
        this.warga = "";
        this.until = "";
        this.img = "";
        
    }
    setNik(value) {
        this.nik = value;
        return this;
    }
    setProv(value) {
        this.prov = value;
        return this;
    }
    setKabu(value) {
        this.kabu = value;
        return this;
    }
    setName(value) {
        this.name = value;
        return this;
    }
    setTtl(value) {
        this.ttl = value;
        return this;
    }
    setJk(value) {
        this.jk = value;
        return this;
    }
    setJl(value) {
        this.jl = value;
        return this;
    }
    setGd(value) {
        this.gd = value;
        return this;
    }
    setRtrw(value) {
        this.rtrw = value;
        return this;
    }
    setLurah(value) {
        this.lurah = value;
        return this;
    }
    setCamat(value) {
        this.camat = value;
        return this;
    }
    setAgama(value) {
        this.agama = value;
        return this;
    }
    setNikah(value) {
        this.nikah = value;
        return this;
    }
    setKerja(value) {
        this.kerja = value;
        return this;
    }
    setWarga(value) {
        this.warga = value;
        return this;
    }
    setUntil(value) {
        this.until = value;
        return this;
    }
    setBg(value) {
        this.bg = value;
        return this
    }
    setImg(value) {
        this.img = value;
        return this;
    }
    async toAttachment() {
        const canvas = Canvas.createCanvas(1004, 636);
        const ctx = canvas.getContext("2d");
          
        let iyga = await Canvas.loadImage(this.bg);
        ctx.drawImage(iyga, 0, 0, 1004, 636);
        
    ctx.save();
	ctx.beginPath();
	let img = await Canvas.loadImage(this.img);
    ctx.strokeStyle = 'white';  // some color/style
	ctx.lineWidth = 3;  
	ctx.drawImage(img, 730, 140, 260, 350);
	ctx.restore();
        
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    let usrname = this.nik;
    let name = usrname.length > 16 ? usrname.substring(0, 16) + "" : usrname;
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.font = "35px Extended";
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    ctx.fillText(name, 430, 174);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
        
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let uname = this.prov;
    let nama = uname.length > 100 ? uname.substring(0, 100) + "" : uname;
    ctx.font = "35px Extended";
    ctx.textAlign = 'black';
    ctx.fillStyle = "#000000";
    ctx.fillText(nama, 480, 60);
    ctx.lineWidth = 2;
    ctx.fillStyle = "black";

    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let numbur = this.kabu;
    let namaa = numbur.length > 100 ? numbur.substring(0, 100) + "" : numbur;
    ctx.font = "35px Extended";
    ctx.textAlign = 'center';
    ctx.fillStyle = "black";
    ctx.fillText(namaa, 480, 95);
    ctx.lineWidth = 0;
    ctx.fillStyle = "black";

    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let uiname = this.name;
    let nombre = uiname.length > 100 ? uiname.substring(0, 100) + "" : uiname;
    ctx.font = "25px Extended";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(nombre, 307, 218);
    ctx.lineWidth = 1;
    ctx.fillStyle = "black";

    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let upname = this.ttl;
    let nembre = upname.length > 100 ? upname.substring(0, 100) + "" : upname;
    ctx.font = "25px Extended";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(nembre, 370, 250);
    ctx.lineWidth = 1;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let ipname = this.jk;
    let ime = ipname.length > 100 ? ipname.substring(0, 100) + "" : ipname;
    ctx.font = "25px Extended";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(ime, 327, 280);
    ctx.lineWidth = 1;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let epname = this.jl;
    let imo = epname.length > 100 ? epname.substring(0, 100) + "" : epname;
    ctx.font = `25px Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = "black";
    ctx.fillText(imo, 324, 310);
    ctx.lineWidth = 3;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let spname = this.gd;
    let imp = spname.length > 100 ? spname.substring(0, 100) + "" : spname;
    ctx.font = "25px Arial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(imp, 660, 275);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let apname = this.rtrw;
    let omp = apname.length > 100 ? apname.substring(0, 100) + "" : apname;
    ctx.font = "ocr 25px Arial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(omp, 300, 340);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let wpname = this.lurah;
    let wmp = spname.length > 100 ? wpname.substring(0, 100) + "" : wpname;
    ctx.font = "24px Arial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(wmp, 290, 370);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let xpname = this.camat;
    let xmp = spname.length > 100 ? xpname.substring(0, 100) + "" : xpname;
    ctx.font = "25px Arrial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(xmp, 290, 400);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let rpname = this.agama;
    let rmp = rpname.length > 100 ? rpname.substring(0, 100) + "" : rpname;
    ctx.font = "25px Arrial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(rmp, 302, 432);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let opname = this.nikah;
    let ump = opname.length > 100 ? opname.substring(0, 100) + "" : opname;
    ctx.font = "25px Arial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(ump, 349, 460);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let gpname = this.kerja;
    let gmp = gpname.length > 100 ? gpname.substring(0, 100) + "" : gpname;
    ctx.font = "25px Arrial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(gmp, 290, 490);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let hpname = this.warga;
    let pmp = hpname.length > 100 ? hpname.substring(0, 100) + "" : hpname;
    ctx.font = "25px Arrial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(pmp, 378, 525);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
    
    ctx.save();
	ctx.beginPath();
	ctx.rotate(-0 * Math.PI / 180);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "black";
    let fpname = this.until;
    let jkt = fpname.length > 100 ? fpname.substring(0, 100) + "" : fpname;
    ctx.font = "25px Arrial";
    ctx.textAlign = 'lower';
    ctx.fillStyle = "black";
    ctx.fillText(jkt, 360, 555);
    ctx.lineWidth = 10;
    ctx.fillStyle = "black";
	
        return canvas;
    }
}