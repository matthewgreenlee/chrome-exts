function show_message(elementId, message) {
  clear_message(elementId);
  var msgdiv = document.getElementById(elementId);
  var msgtext = document.createTextNode(message);
  msgdiv.appendChild(msgtext);
//  setTimeout("", 1000);
}

function clear_message(elementId) {
  document.getElementById(elementId).innerHTML = "";
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
  // clear all content of visitsReport
  document.getElementById("visitsReport").innerHTML = "";
  var newtable = document.createElement("table");
  newtable.setAttribute("border", "1");
  /*
  var newheader = document.createElement("tr");
  newheader.appendChild(document.createElement("th").innerHTML = "Title");
  newheader.appendChild(document.createElement("th").innerHTML = "URL");
  newheader.appendChild(document.createElement("th").innerHTML = "Visits");
  newtable.appendChild(newheader);
  */
  document.getElementById("visitsReport").appendChild(newtable);
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
      var newrow = document.createElement("tr");
	  newrow.setAttribute("id", "bookmark"+bookmarks[i].id);
      document.getElementById("visitsReport").firstChild.appendChild(newrow);
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
	  var rowdiv = document.getElementById("bookmark" + bm.id);
	  var newtitle = document.createElement("td");
	  var newtext = document.createTextNode(bm.title);
	  newtitle.appendChild(newtext);
	  var newurl = document.createElement("td");
	  newtext = document.createTextNode(bm.url);
	  newurl.appendChild(newtext);
	  var newvisits = document.createElement("td");
	  newtext = document.createTextNode(visits.length + " visits");
	  newvisits.appendChild(newtext);
	  rowdiv.appendChild(newtitle);
	  rowdiv.appendChild(newurl);
	  rowdiv.appendChild(newvisits);
    });
}
