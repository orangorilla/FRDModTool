/* The reddit extension for jquery.  This file is intended to store
 * "utils" type function declarations and to add functionality to "$"
 * or "jquery" lookups. See 
 *   http://docs.jquery.com/Plugins/Authoring 
 * for the plug-in spec.
*/
var moduser;

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

var MKCache = {};
var overlay;
var subthreads = {};
var topComment;
var topScore = 0;
var niceComment;
var niceScore = 0;


$(function() {
	moduser = $("span.user > a").text();
	if (location.href.search(/FeMRADebates/) != -1) {
		subthreads.defs = {thing:"t3_1k3v0b", url:"/r/FeMRADebates/comments/1k3v0b/glossary_of_default_definitions/"};
		if(moduser == "_FeMRA_") {
			subthreads.dels = {thing:"t3_1k81lo", url:"/r/FeMRADebates/comments/1k81lo/public_posting_of_deleted_comments/"};
			subthreads.bans = {thing:"t3_1kxkge", url:"/r/FeMRADebates/comments/1kxkge/public_posting_of_banned_users/"};
		} else if (moduser == "ta1901") {
			subthreads.dels = {thing:"t3_1p0l2k", url:"/r/FeMRADebates/comments/1p0l2k/public_posting_of_deleted_comments_ta1901/"};
			subthreads.bans = {thing:"t3_1p0lav", url:"/r/FeMRADebates/comments/1p0lav/public_posting_of_banned_users_ta1901/"};
		}
		
	} else {
		subthreads.dels = {thing:"t3_1kzsbb", url:"/r/FeMRADebs/comments/1kzsbb/public_posting_of_deleted_comments/"};
		subthreads.defs = {thing:"t3_1kvlem", url:"/r/FeMRADebs/comments/1kvlem/glossary_of_default_definitions/"};
		subthreads.bans = {thing:"t3_1laf5j", url:"/r/FeMRADebs/comments/1laf5j/public_posting_of_banned_users/"};
	}
	addToSide('<button class="mkbutton" id="mkchecknew">Check New</button>');
	addToSide('<button class="mkbutton" id="mkupdowns">UpDowns</button>');
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
	
	$("#mkupdowns").click(function(){
		getAllTextPosts("/r/FeMRADebates/new/",function(tps) {
			log("---");
			for (i = 0; i < tps.length; i++) {
			//for (i = 0; i < 2; i++) {
				(function(tp){
					getTextPostComments(tp.permalink,function(cmts) {
						log("---");
						//log(tp.ups + "|" + tp.downs + ": " + tp.permalink);
						spitUpDowns(cmts);
						log(JSON.stringify([topComment, niceComment]));
					});
				})(tps[i].data);
			}
		});
	});
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

function spitUpDowns(cmts) {
	var i = 0;
	for (i = 0; i < cmts.length; i++) {
		cmt = cmts[i];
		if (cmt.data.replies != "" && typeof cmt.data.replies != "undefined") {
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

function getAllTextPosts(url, callback) {
	$.get(url + ".json?limit=200",function(data) {
		posts = data.data.children;
		callback(posts);
	});
}

function getTextPostComments(url, callback) {
	$.get(url + ".json",function(data) {
		cmts = data[1].data.children;
		callback(cmts);
	});
}


function fancyDel() {

	entry = $(this).parent().parent().parent().parent();
	ulbuttons = $(this).parent().parent();
	permalink = ulbuttons.find("li a.bylink");
	replylink = ulbuttons.find("li a:contains('reply')");
	//permalink.click();
	thingid = permalinkToThingID(permalink.attr("href"));
	reply(replylink[0]);
	form = comment_reply_for_elem(replylink[0]);
	getComment(permalink.attr("href"), function(cmt) {
		overlay.open('<div class="mktile"><textarea id="mkdelstxt">' + "Comment deleted. The specific phrase:\n\n>\n\nWas considered an Ad Hominem attack on another user, and an insult that did not add substance to the discussion.\n\n---\n\nFull Text\n\n---\n\n" + cmt.body + '</textarea><button id="mkdelsbtn">Post to PPoDCs thread</button></div>', function() {
			$("#mkdelsbtn").click(function() {
				comment(subthreads.dels.thing,$("#mkdelstxt").val(), function(data) {
					delcmtid = data.id;
					delcmtplink = commentIDToPermalink(subthreads.dels.url,delcmtid);
					$("#mkdelsbtn").parent().remove();
					getTextPost(subthreads.bans.url, function(bans) {
						ufind3 = new RegExp("(\/u\/" + cmt.author + " .1...*?[)], .2...*?[)], .3...*?[)])");
						ufind2 = new RegExp("(\/u\/" + cmt.author + " .1...*?[)], .2...*?[)])");
						ufind1 = new RegExp("(\/u\/" + cmt.author + " .1...*?[)])");
						if (bans.selftext.search(ufind3) != -1) {
							btext = bans.selftext.replace(ufind3,"$1, [4](" + delcmtplink +  ')');
							ctext = "This is the user's fourth offence, as such they are banned permanently.";
						} else if (bans.selftext.search(ufind2) != -1) {
							btext = bans.selftext.replace(ufind2,"$1, [3](" + delcmtplink +  ')');
							ctext = "This is the user's third offence, as such they are banned for 7 days.";
						} else if (bans.selftext.search(ufind1) != -1) {
							btext = bans.selftext.replace(ufind1,"$1, [2](" + delcmtplink +  ')');
							ctext = "This is the user's second offence, as such they will be banned for 24h.";
						} else {
							btext = bans.selftext + "\n* /u/" + cmt.author + " [1](" + delcmtplink +  ')';
							ctext = "This is the user's first offence, as such they should simply consider themselves Warned";
						}
						form.find("textarea").val("Comment Deleted, Full Text can be found [here](" + delcmtplink + ").\n\n" + ctext);
						overlay.append('<div class="mktile"><textarea id="mkbanstxt">' + btext + '</textarea><button id="mkbansbtn">Edit Bans thread</button></div>');
						$("#mkbansbtn").click(function() {
							edit(subthreads.bans.thing,$("#mkbanstxt").val(), function(data) {
								removeThing(thingid, function(data) {
									overlay.close();
								});
							});
						});
					});
				});
				$(this).parent().remove();
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
	reply(replylink[0]);
	form = comment_reply_for_elem(replylink[0]);
	form.find("textarea").val("This comment was reported, but shall not be deleted. It did not contain an Ad Hominem or insult that did not add substance to the discussion. It did not use a Glossary defined term outside the Glossary definition without providing an alternate definition, and it did not include a non-np link to another sub. The user is encouraged, but not required to:\n\nIf other users disagree with this ruling, they are welcome to contest it by replying to this comment.");
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
	if (localStorage["mostrecent"] == undefined) {
		url = "/r/FeMRADebates/new/.json";
	} else {
		url = "/r/FeMRADebates/new/.json?before=" + localStorage["mostrecent"];
	}
	$.get(url,function(sub) {
		posts = sub.data.children;
		getDefinitions(function(defs) {
			log("---");
			for (i = 0; i < posts.length; i++) {
				post = posts[i].data;
				used = [];
				log("---");
				log("### " + post.title + " ###", "title");
				fixed = fixText(" " + post.title + " " + post.selftext + " ");
				for(word in defs.defined) {
					src = new RegExp("[^a-z]" + word, "i");
					pos = fixed.search(src);
					if (pos != -1) {
						used[defs.defined[word]] = defs.lines[defs.defined[word]];
						//log(fixed.substring(pos,pos+20));
					}
				}
				log("Sub default definitions used in this text post:<br /><br />");
				for(onedef in used) {
					log("* " + used[onedef] + "<br /><br />");
				}
				log("The Default Definition Glossary can be found [here](http://www.reddit.com/r/FeMRADebates/comments/1k3v0b/glossary_of_default_definitions/).");
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
	getTextPost(subthreads.defs.url, function(post) {
		lines = post.selftext.split("\n\n*");
		defined = {};
		for (i = 1; i < lines.length; i++) {
			line = lines[i];
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

function removeThing(thing, callback) {
	$.get("/api/me.json",function(me) {
		$.post("/api/remove",{"id":thing,"uh":me.data.modhash},function(data) {
			if(callback != undefined) {
				callback(data);
			}
		});
	});
	
}

function log(msg, classes) {
	if (classes != undefined) {
		if (typeof classes === 'string') {
			classes = [classes];
		}
		classes = classes.join(" ");
	} else {
		classes = "";
	}
	if (classes == "") {
		$(".console").append('<p>' + msg + '</p>');
	} else {
		$(".console").append('<p class="' + classes + '">' + msg + '</p>');
	}
}
function addToSide(html) {
	$(".side").prepend('<div class="spacer">' + html + '</div>');
}
function store(key, data) {
	localStorage["DB." + key] = data;
}

function recall(key) {
	return localStorage["DB." + key];
}
