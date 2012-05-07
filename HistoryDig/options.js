function show_message(elementId, message) {
  var msgdiv = document.getElementById(elementId);
  var msgtext = document.createTextNode(message);
  msgdiv.appendChild(msgtext);
//  setTimeout(clear_message(elementId), 10000);
}

function clear_message(elementId) {
  var msgdiv = document.getElementById(elementId);
  msgdiv.removeChild(msgdiv.childNodes[0]);
}
function save_options() {
  localStorage["transitionLink"] = document.getElementById("transitionLink").checked;
  localStorage["transitionTyped"] = document.getElementById("transitionTyped").checked;
  localStorage["transitionAutoBookmark"] = document.getElementById("transitionAutoBookmark").checked;
  localStorage["transitionReload"] = document.getElementById("transitionReload").checked;
  var nodes = document.getElementById("timespan").childNodes;
  for (var i in nodes) {
    if (nodes[i].checked === true) {
      localStorage["timespan"] = nodes[i].value;
	}
  }
  show_message("save_options_msg", "options saved");
}

function restore_options() {
  document.getElementById("transitionLink").checked = (localStorage["transitionLink"] === "true"? true: false);
  document.getElementById("transitionTyped").checked = (localStorage["transitionTyped"] === "true"? true: false);
  document.getElementById("transitionAutoBookmark").checked = (localStorage["transitionAutoBookmark"] === "true"? true: false);
  document.getElementById("transitionReload").checked = (localStorage["transitionReload"] === "true"? true: false);

  var nodes = document.getElementById("timespan").childNodes;
  for(var i in nodes) {
    if (nodes[i].value == localStorage["timespan"]) {
      nodes[i].checked = true;
    }
  }
}

function generate_report() {
  chrome.bookmarks.getTree(create_bookmarks_report);
}

// generate report base on bookmarks tree
function create_bookmarks_report(bookmarks) {
  for(var i in bookmarks) {
    if(bookmarks[i].url == undefined) {
	  // in case of folder
	  create_bookmarks_report(bookmarks[i].children);
	} else if(bookmarks[i].url.indexOf("http://")!=0 && bookmarks[i].url.indexOf("https://")!=0) {
	  // ignore if the bookmark is not url
	} else {
      var newdiv = document.createElement("div");
	  var newid = document.createAttribute("id");
	  newid.nodeValue = "bookmark"+bookmarks[i].id;
	  newdiv.setAttributeNode(newid);
      document.getElementById("visitsReport").appendChild(newdiv);
	  report_visits(bookmarks[i]);
	}
  }
}

function report_visits(bm) {
  chrome.history.getVisits({'url': bm.url}, 
    function(visits) {
	  if(visits.length === 0) {
	    document.getElementById("bookmark"+bm.id).style.color = "red";
	  }
      var newtext = document.createTextNode(bm.title + "\t" + bm.url + "\t" + visits.length + " visits");;
	  document.getElementById("bookmark"+bm.id).appendChild(newtext);
    });
}
