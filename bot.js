/*jshint -W117 */
/*jshint -W098 */

var moduser;
var MKCache = {};
var overlay;
var subthreads = {};
var subreddit = {
	fullname: "t5_2y44v",
	name: "FeMRADebates",
	link: "/r/FeMRADebates"
};
var topComment;
var topScore = 0;
var niceComment;
var niceScore = 0;

function addToSide(html) {
	$(".side").prepend('<div class="spacer">' + html + '</div>');
}

(function($) {

$.fn.open = function (html, loadfn, closefn) {
	$(this).html(html);
	if(loadfn !== undefined) {
		loadfn();
	}
	$(this).show();
	$(this).data("closefn", closefn);
	return $(this);
};
$.fn.close = function () {
	$(this).hide();
	$(this).empty();
	if($(this).data("closefn") !== undefined) {
		$(this).data("closefn")();
		$(this).data("closefn", undefined);
	}
};

})(jQuery);



$(function() {
	/*
	$(document).ajaxError(function(event, request, settings, exception) {
		alert("Error requesting page " + settings.url);
	});
	*/
	moduser = $("span.user > a").text();
	if (location.href.search(/FeMRADebates/) != -1) 
	{
		subthreads.defs = {thing:"t3_1k3v0b", url:"/r/FeMRADebates/comments/1k3v0b/glossary_of_default_definitions/"};
		if(moduser == "_FeMRA_") 
		{
			subthreads.dels = {thing:"t3_1xiyge", url:"/r/FeMRADebates/comments/1xiyge/meta_public_posting_of_deleted_comments_v2/"};
		} 
		else if (moduser == "ta1901") 
		{
			subthreads.dels = {thing:"t3_1p0l2k", url:"/r/FeMRADebates/comments/1p0l2k/public_posting_of_deleted_comments_ta1901/"};
		} 
		else if (moduser == "bromanteau") 
		{
			subthreads.dels = {thing:"t3_3mvzmd", url:"r/FeMRADebates/comments/3mvzmd/public_posting_of_deleted_comments_bromanteau/"};
		} 
		else if (moduser == "1gracie1") 
		{
			subthreads.dels = {thing:"t3_1xrgze", url:"/r/FeMRADebates/comments/1xrgze/meta_public_posting_of_deleted_comments_1gracie1/"};
		}
		else if (moduser == "malt_shop") 
		{
			subthreads.dels = {thing:"t3_21rnjw", url:"/r/FeMRADebates/comments/21rnjw/meta_public_posting_of_deleted_comments_umaltshop/"};
		} 
		else if (moduser == "tbri") 
		{
			subthreads.dels = {thing:"t3_21rndd", url:"/r/FeMRADebates/comments/21rndd/utbris_deleted_comments_thread/"};
	    } 
	    else if (moduser == "Kareem_Jordan") 
	    {
			subthreads.dels = {thing:"t3_2cu24z", url:"/r/FeMRADebates/comments/2cu24z/ukareem_jordans_deleted_comments_thread/"};
		} 
		else if (moduser == "Karmaze") 
		{
			subthreads.dels = {thing:"t3_2cu5h9", url:"/r/FeMRADebates/comments/2cu5h9/ukarmazes_deleted_comments_thread/"};
		} 
	} else {
		subthreads.dels = {thing:"t3_1kzsbb", url:"/r/FeMRADebs/comments/1kzsbb/public_posting_of_deleted_comments/"};
		subthreads.defs = {thing:"t3_1kvlem", url:"/r/FeMRADebs/comments/1kvlem/glossary_of_default_definitions/"};
	}
	addToSide('<button class="mkbutton btn" id="mkstats">Run Statistics</button>');
	$("#mkstats").click(function() {
		runStats();
	});
	addToSide('<button class="mkbutton btn" id="mkchecknew">Prep Definition Bot answers</button>');
	addToSide('<div class="console"></div>');
	$("#mkchecknew").click(function() {
		checkNew();
	});
	//comment("t3_1kvlgf","tango foxtrot");
	//alert(fixText("this is a [markdown](http://google.com) test! Look [here](http://yahoo.ca) for more markdown. Men's Rights are fun. He's a cat."));
	$(".commentarea .entry ul.buttons").append('<li class="fancydel"><a href="javascript:void(0)">fancydel</a></li>');
	$(".commentarea .entry ul.buttons li.fancydel a").click(fancyDel);
	$(".commentarea .entry ul.buttons").append('<li class="nodel"><a href="javascript:void(0)">no del</a></li>');
	$(".commentarea .entry ul.buttons li.nodel a").click(noDel);
	$(".commentarea .entry ul.buttons").append('<li class="context2"><a href="javascript:void(0)">context2</a></li>');

	$.each($(".commentarea .entry ul.buttons li.context2 a"),function(idx, obj) {
		ulbuttons = $(this).parent().parent();
		plink = ulbuttons.find("li a.bylink").attr("href");
		$(this).attr("href", plink + "?context=9");
	});
	
	addToSide('Current Time (UTC): ' + new Date().toUTCString());
});

$(window).load(function() {
	$("body").append('<div class="mkoverlay"></div>');
	$(".side .spacer .titlebox").find("div, input, label").removeAttr("style");
	overlay = $(".mkoverlay");
	overlay.hide();
	overlay.click(function(evt) {
		if (evt.target == evt.currentTarget) {
			overlay.close();
		}
	});
});

function runStats() {
	var stats = [];
	var flair;
	var gotted = 0;
	loopPosts("/r/FeMRADebates/new/", function(posts) {
		for(var i = 0; i<posts.length; i++) {
			getTextPostComments(posts[i].data.permalink, function(cmts) {
				loopCmts(cmts,function(cmt) {
					flair = cmt.data.author_flair_css_class;
					if(typeof flair == "string") {
						if(flair === "") flair = "No Flair";
						flair = flair.replace("gold","");
						flair = flair.replace("mra","MRA");
						flair = flair.replace("feminist","Feminist");
						flair = flair.replace("casual","Casual ");
						flair = flair.replace("neutral","Neutral");
						flair = flair.replace("unidentified","Other");
					} else {
						flair = "No Flair";
					}
					if(typeof stats[flair] == "undefined") {
						stats[flair] = {ups:0,downs:0,count:0,users:[],top:cmt,loved:cmt,hated:cmt,bottom:cmt};
					}
					if(stats[flair].users.indexOf(cmt.data.author) == -1) {
						stats[flair].users.push(cmt.data.author);
					}
					if(stats[flair].loved.data.ups / (stats[flair].loved.data.downs + 1) < cmt.data.ups / (cmt.data.downs + 1)) {
						stats[flair].loved = cmt;
					}
					if(stats[flair].hated.data.downs / (stats[flair].hated.data.ups + 1) < cmt.data.downs / (cmt.data.ups + 1)) {
						stats[flair].hated = cmt;
					}
					if(stats[flair].top.data.ups < cmt.data.ups) {
						stats[flair].top = cmt;
					}
					if(stats[flair].bottom.data.downs < cmt.data.downs) {
						stats[flair].bottom = cmt;
					}
					stats[flair].count++;
					stats[flair].ups += cmt.data.ups;
					stats[flair].downs += cmt.data.downs;
				});
				addToSide('<div>blerp</div>');
				gotted++;
				if(gotted == posts.length) {
					addToSide("all done!");
					var flairs = ["Feminist", "Casual Feminist", "Neutral", "Casual MRA", "MRA", "Other", "No Flair"];
					for(var flairkey in flairs) {
						flair = flairs[flairkey];
						log("### " + flair + " ###", "title");
						log("Ups: " + stats[flair].ups + ", Downs: " + stats[flair].downs);
						log("Count: " + stats[flair].count);
						log('<a href="' + stats[flair].loved.data.permalink + '">[Top](' + stats[flair].loved.data.permalink + ')</a>');
						log('<a href="' + stats[flair].bottom.data.permalink + '">[Bottom](' + stats[flair].bottom.data.permalink + ')</a>');
						log('<a href="' + stats[flair].hated.data.permalink + '">[Hated](' + stats[flair].hated.data.permalink + ')</a>');
						log('<a href="' + stats[flair].top.data.permalink + '">[Loved](' + stats[flair].top.data.permalink + ')</a>');
						$(".id-" + stats[flair].loved.data.name + ".comment>.entry").css("outline","3px solid #F0F");
						$(".id-" + stats[flair].top.data.name + ".comment").css("outline","3px solid gold");
					}
				}
			});
		}
	}, 20);
}
function loopPosts(url, callback, limit) {
	limit = typeof limit == "undefined" ? 10 : limit;
	$.get(url + ".json?limit=" + limit,function(data) {
		posts = data.data.children;
		callback(posts);
	});
}


function getTextPostComments(url, callback) {
	$.get(url + ".json",function(data) {
		cmts = data[1].data.children;
		cmts.postlink = url;
		loopCmts(cmts,function(cmt){
			cmt.data.permalink = commentIDToPermalink(url,cmt.data.name);
		});
		callback(cmts);
	});
}

function getTextPost(url, callback) {
	$.get(url + ".json",function(data) {
		post = data[0].data.children[0].data;
		callback(post);
	});
}

function getComment(url, callback) {
	$.get(url + ".json",function(data) {
		cmt = data[1].data.children[0].data;
		callback(cmt);
	});
}

function loopCmts(comms, callback) {
	var comm;
	for (var i = 0; i < comms.length; i++) {
		comm = comms[i];
		if(comm.kind == "t1") {
			callback(comm);
			if (comm.data.replies !== "" && typeof comm.data.replies !== "undefined") {
				loopCmts(comm.data.replies.data.children, callback);
			}
		}
	}
}
function spitUpDowns(cmts) {
	var i = 0;
	for (i = 0; i < cmts.length; i++) {
		cmt = cmts[i];
		if (cmt.data.replies !== "" && typeof cmt.data.replies !== "undefined") {
			spitUpDowns(cmt.data.replies.data.children);
		}
		if(cmt.data.ups - cmt.data.downs > topScore) {
			topComment = cmt;
			topScore = cmt.data.ups - cmt.data.downs;
		}
		if(cmt.data.downs < 4 && (cmt.data.ups - cmt.data.downs > niceScore)) {
			niceComment = cmt;
			niceScore = cmt.data.ups - cmt.data.downs;
		}
	}
}

function permalinkToThingID(link) {
	return "t1_" + link.replace(/.*\/([^\/]+)/,"$1");
}

function commentIDToPermalink(threadlink,id) {
	id = (id.slice(0,3) == "t1_") ? id.slice(3,id.length) : id;
	return threadlink.charAt(threadlink.length-1) == "/" ? threadlink + id : threadlink + "/" + id;
	
}

function fixText(text) {
	nolinks = text.replace(/\[(.+?)\]\(.+?\)/g,"$1");
	nolinks = nolinks.replace(/'s/g,"s");
	nolinks = nolinks.replace(/s'/g,"s");
	return nolinks;
}

function checkNew() {
	loopPosts("/r/FeMRADebates/new/",function(posts) {
		getDefinitions(function(defs) {
			log("---");
			for (i = 0; i < posts.length; i++) {
				post = posts[i].data;
				used = [];
				log("---");
				log("### " + post.title + " ###", "title");
				fixed = fixText(" " + post.title + " " + post.selftext + " ");
				for(var word in defs.defined) {
					src = new RegExp("[^a-z]" + word + "[^a-z]", "i");
					pos = fixed.search(src);
					if (pos != -1) {
						used[defs.defined[word]] = defs.lines[defs.defined[word]];
					}
				}
				log("Sub default definitions used in this text post:<br /><br />");
				for(var onedef in used) {
					log("* " + used[onedef] + "<br /><br />");
				}
				log("The Default Definition Glossary can be found [here](http://www.femradebates.com/).");
			}
		});
	});
}

function comment(thing, text, callback) {
	$.get("/api/me.json",function(me) {
		$.post("/api/comment",{"api_type":"json","text":text,"thing_id":thing,"uh":me.data.modhash},function(data) {
			log("Commented: " + text);
			log("Errors: " + JSON.stringify(data.json.errors).replace(/,/g,", "), "error");
			callback(data.json.data.things[0].data);
		});
	});
}

function edit(thing, text, callback) {
	$.get("/api/me.json",function(me) {
		$.post("/api/editusertext",{"api_type":"json","text":text,"thing_id":thing,"uh":me.data.modhash},function(data) {
			log("Edited: <br />" + JSON.stringify(data));
			callback(data);
		});
	});
}

function getDefinitions(callback) {
	//getTextPost(subthreads.defs.url, function(post) {
	$.get("http://femradebates.com/defs.txt",function(data){
		lines = data.split("\n\n*");
		defined = {};
		for (i = 1; i < lines.length; i++) {
			line = lines[i];
			lines[i] = fixLinks(line);
			words = line.split("**");
			for (k = 1; k < words.length; k = k + 2) {
				words[k] = fixText(words[k]);
				defined[words[k]] = i;
				//log(i + ": [" + words[k] + "]: " + line);
			}
		}
		callback({"lines": lines, "defined": defined});
	});
}

function fixLinks(def) {
	var fixed = def.replace(/\[[^\]]*?\]$/g, function(match) {
		var word = match.slice(1,match.length-1);
		var ret = "[" + word + "](http://femradebates.com/#" + fixLink(word) + ")";
		return ret;
	});
	fixed = fixed.replace(/\[[^\]]*?\][^\(]/g, function(match) {
		var word = match.slice(1,match.length-2);
		var ret = "[" + word + "](http://femradebates.com/#" + fixLink(word) + ")" + match.charAt(match.length-1);
		return ret;
	});
	return fixed;
}

function fixLink(raw) {
	var lw = raw.toLowerCase();
	var rep = lw.replace(/[^a-z]/g,'');
	return rep;
}

function removeThing(thing, callback) {
	$.get("/api/me.json",function(me) {
		$.post("/api/remove",{"id":thing,"uh":me.data.modhash},function(data) {
			if(callback !== undefined) {
				callback(data);
			}
		});
	});
}

function approveThing(thing, callback) {
	$.get("/api/me.json",function(me) {
		$.post("/api/approve",{"id":thing,"uh":me.data.modhash},function(data) {
			if(callback !== undefined) {
				callback(data);
			}
		});
	});
}

function banUser(username, unban, callback) {
	$.get("/api/me.json",function(me) {
		$.post("/api/friend",{"action":"add","container":subreddit.fullname,"type":"banned","name":username,"note":unban,"id":"#banned","r":subreddit.name,"uh":me.data.modhash},function(data) {
			if(callback !== undefined) {
				callback(data);
			}
		});
	});
}

function log(msg, classes) {
	if (classes !== undefined) {
		if (typeof classes === 'string') {
			classes = [classes];
		}
		classes = classes.join(" ");
	} else {
		classes = "";
	}
	if (classes === "") {
		$(".console").append('<p>' + msg + '</p>');
	} else {
		$(".console").append('<p class="' + classes + '">' + msg + '</p>');
	}
}
function fancyDel() {
	entry = $(this).parent().parent().parent().parent();
	ulbuttons = $(this).parent().parent();
	permalink = ulbuttons.find("li a.bylink");
	replylink = ulbuttons.find("li a:contains('reply')");
	thingid = permalinkToThingID(permalink.attr("href"));
	reply(replylink[0]);
	form = comment_reply_for_elem(replylink[0]);
	getComment(permalink.attr("href"), function(cmt) {
		overlay.open('<div class="mktile"><textarea id="mkdelstxt">' + cmt.author + "'s [comment](" + permalink.attr("href") + ") deleted. The specific phrase:\n\n>\n\nBroke the following Rules:\n\n* No slurs.\n* No insults against other members of the sub\n* No generalizations insulting an identifiable group (feminists, MRAs, men, women, ethnic groups, etc)\n* No insults against another user's argument\n* No insults against another user's ideology\n* No personal attacks \n* No Ad Hominem attacks against the speaker, rather than the argument\n* No using a term in the Glossary of Default Definitions under an alternative definition, without providing the alternate definition\n* Links to threads/comments in other subs must be np-links\n* No blatant vandalism to the Wiki\n* No criticisms of feminism or the MRM on Sundays (UTC)\n\n---\n\nFull Text\n\n---\n\n" + cmt.body + '</textarea><button id="mkdelsbtn">Post to PPoDCs thread</button></div>', function() {
			$("#mkdelsbtn").click(function() {
				comment(subthreads.dels.thing,$("#mkdelstxt").val(), function(data) {
					delcmtid = data.id;
					delcmtplink = commentIDToPermalink(subthreads.dels.url,delcmtid);
					var $tile = $("#mkdelsbtn").parent().empty();
					$tile.html("<p>Comment posted to the Public Posting of Deleted Comments thread.</p><p>Should the user be punished by moving up a Tier in the Ban System? Be lenient if you have deleted another comment by the same user in the past 6 hours.</p>" + '<button id="tierup">Punishment</button> <button id="tiernone">Leniency</button>');
					$.get("http://femradebates.com/bans",{"user":cmt.author, "key": "b1yGNunkmA", "command":"info"}, function (user) {
						for(var i=0;i<user.links.length;i++) {
							$tile.append('<a class="offencelink" href="' + user.links[i] + '">Offence #' + i + ' </a>');
						}
					},"json");
					$("#tierup").click(function(e){
						e.preventDefault();
						$.post("http://femradebates.com/bans",{"user":cmt.author, "key": "b1yGNunkmA", "command":"addlink","link":delcmtplink,"tierup":true}, function (data) {
							var sDelMsg = "Comment Deleted, Full Text and Rules violated can be found [here](" + delcmtplink + ").\n\nUser is at tier " + data.tier + " of the ban systerm. ";
							var d = new Date();
							addToSide(d.toUTCString());
							if (data.tier == 1) {sDelMsg += "User is simply Warned.";}
							if (data.tier == 2) {
								sDelMsg += "User is banned for a minimum of 24 hours."; 
								d.setDate(d.getDate() + 1);
								banUser(cmt.author, "Unban after: " + d.toUTCString(),function(data){
									alert("User has been banned, remember to unban them tomorrow");
								});
							}
							if (data.tier == 3) {
								sDelMsg += "User is banned for a minimum of 7 days."; 
								d.setDate(d.getDate() + 7);
								banUser(cmt.author, "Unban after: " + d.toUTCString(),function(data){
									alert("User has been banned, remember to unban them in a week.");
								});
							}
							if (data.tier == 4) {
								sDelMsg += "User is banned permanently."; 
								banUser(cmt.author, "Banned permanently", function(data){
									alert("User has been banned forever. Good riddance.");
								});
							}
							form.find("textarea").val(sDelMsg);
							overlay.close();
						}, "json");
					});
					$("#tiernone").click(function(e){
						e.preventDefault();
						$.post("http://femradebates.com/bans",{"user":cmt.author, "key": "b1yGNunkmA", "command":"addlink","link":delcmtplink,"tierup":false}, function (data) {
							var sDelMsg = "Comment Deleted, Full Text and Rules violated can be found [here](" + delcmtplink + ").\n\nUser is at tier " + data.tier + " of the ban systerm. User was granted leniency.";
							form.find("textarea").val(sDelMsg);
							overlay.close();
						}, "json");
					});
					form.find("textarea").val("Comment Deleted, Full Text and Rules violated can be found [here](" + delcmtplink + ").\n\n");
					form.find(".save").click(function(e){
						setTimeout(function() {
							removeThing(cmt.name,function(){
								entry.find("form.usertext").css("text-decoration","line-through");
							});
						},1500);
					});
				});
			});
		});
	});
}

function noDel() {
	entry = $(this).parent().parent().parent().parent();
	ulbuttons = $(this).parent().parent();
	permalink = ulbuttons.find("li a.bylink");
	replylink = ulbuttons.find("li a:contains('reply')");
	//permalink.click();
	thingid = permalinkToThingID(permalink.attr("href"));
	approveThing(thingid,function(){
		entry.parent().removeClass("spam reported");
		entry.css({
			"background-color":"#caf0d9",
			"background-image":"linear-gradient(#acfccc,#caf0d9)"
		});
		entry.parent().css({
			"background-color":"#AAFFCC",
			"background-image":"linear-gradient(#acfccc,#caf0d9)"
		});
	});
	reply(replylink[0]);
	form = comment_reply_for_elem(replylink[0]);
	form.find("textarea").val("This comment was reported, but shall not be deleted. It did not contain an Ad Hominem or insult that did not add substance to the discussion. It did not use a Glossary defined term outside the Glossary definition without providing an alternate definition, and it did not include a non-np link to another sub. The user is encouraged, but not required to:\n\n* \n\nIf other users disagree with this ruling, they are welcome to contest it by replying to this comment.");
}

function postsSince(since,callback) {
	$.get("/r/FeMRADebates/new.json?before=" + since,function(data) {
		posts = data.data.children;
		callback(posts);
	});
}

