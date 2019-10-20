

var TM={};
TM.reserved=['front','back','style'];

TM.Fbs=function(getStyl){
	this.front	= 0;
	this.back	= 0;
	this.style	= [];
	this.getStyl	= getStyl.bind(this);
};

TM.Tracker=function(getStyl,refs){
	this.getStyl	= getStyl;
	this.refs	= {};
	this.data	= {};
	this.subs	= {};
	this.fbs	= new TM.Fbs(getStyl);
	if(refs)for(var k in refs){this.refs[k]=refs[k]};
};
TM.Tracker.prototype.setData=function(data){
	this.data	= data;
	this.setAliases();
	this.setReserveds();
	this.setSubs();
	return this;
};
TM.Tracker.prototype.setAliases=function(){
	let kz=Object.keys(this.data)
	.filter(k=>k.charAt(0)==='$')
	.forEach((k,i)=>{
		this.refs[k.substr(1)]=this.data[k];
	});
	return this;
};
TM.Tracker.prototype.setReserveds=function(){
	let kz=Object.keys(this.data)
	.filter(k=>TM.reserved.indexOf(k)>-1)
	.forEach((k,i)=>{
		let dat = this.data[k] in this.refs?this.refs[this.data[k]]:this.data[k];
		// if(k==='front'||k==='back'){
		// }else {
		// }
		this.fbs[k]=dat;

	});
	return this;
};
TM.Tracker.prototype.setSubs=function(){
	let kz=Object.keys(this.data)
	.filter(k=>k.charAt(0)!=='$'&&TM.reserved.indexOf(k)===-1)
	.forEach((k,i)=>{
		if(typeof(this.data[k])==='object'&&!(this.data[k] instanceof Array)){
			this.subs[k]=new TM.Tracker(this.getStyl,this.refs).setData(this.data[k]);
		}else if (this.refs[this.data[k]]==='object') {
			this.subs[k]=new TM.Tracker(this.getStyl,this.refs).setData(this.refs[this.data[k]]);
		}
	});
	return this;
};
TM.Tracker.prototype.getMethod=function(){
	var funk=(txt)=>this.fbs.getStyl().text(txt);
	for(let k in this.subs){
		funk[k]=this.subs[k].getMethod();
	}
	return funk;
};

const fs=require('fs');

var Theme=function(getStyl){
	this.data=0;
	this.get=function(data){
		return new TM.Tracker(getStyl).setData(data).getMethod();
	};
	this.load=function(src){
		let data,txt;
		if(fs.existsSync(src)){
			txt=fs.readFileSync(src);
			try {
				data=JSON.parse(txt);
			} catch (e) {
				throw('Theme.load Error:\nsrc="'+src+'"\n'+e);
			}
		}else {
			throw('Theme.load Error:\nsrc="'+src+'"\nfile not found');
		}
		return this.get(data);
	};
};


module.exports = Theme;
