
function Bans(self) {
	this.self = self;
	this.introtext = self.split("---")[0];
	this.bantext = self.split("---")[1];
	this.bantiertexts = this.bantext.split("\nTier");
	this.users = {};
	var usertexts;
	var uname;
	for(var i=1;i<this.bantiertexts.length;i++) {
		usertexts = this.bantiertexts[i].split("\n* ");
		for(var k=1;k<usertexts.length;k++) {
			this.users[Bans.extractUser(usertexts[k])] = {
				tier: i,
				dels: Bans.extractDels(usertexts[k])
			};
		}
	}
	log("goo");
}
Bans.ufind = /\/u\/[^ ]* /;
Bans.delfind = /\[..?\]\(([^\)]*)\)/g;
Bans.extractDels = function(text) {
	var delstext = text.replace(Bans.ufind, "");
	var dels = [];
	delstext = delstext.replace(Bans.ufind, "");
	log(delstext);
	function eachMatch(match,p1) {
		dels.push(p1);
		return '-';
	}
	delstext.replace(Bans.delfind, eachMatch);
	return dels;
};
Bans.extractUser = function(text) {
	return Bans.ufind.exec(text)[0].slice(3,-1);
};