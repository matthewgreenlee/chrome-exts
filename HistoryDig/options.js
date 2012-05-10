var transitionOptionIds = ["transitionLink", "transitionTyped", "transitionAutoBookmark",
 "transitionAutoSubframe", "transitionManualSubframe", "transitionGenerated", "transitionStartPage", 
 "transitionFormSubmit", "transitionReload", "transitionKeyword", "transitionKeywordGenerated"];

var show_message = function(elementId, message) {
  clear_message(elementId);
  var msgdiv = document.getElementById(elementId);
  var msgtext = document.createTextNode(message);
  msgdiv.appendChild(msgtext);
  setTimeout(function() {
    document.getElementById(elementId).innerHTML = "";
  }, 500);
}

var clear_message = function(elementId) {
  document.getElementById(elementId).innerHTML = "";
}

var HistoryDig = {
  saveOptions: function() {
    for(var i in transitionOptionIds) {
      localStorage[transitionOptionIds[i]] = document.getElementById(transitionOptionIds[i]).checked;
    }

    var nodes = document.getElementById("timespan").childNodes;
    for (var i in nodes) {
      if (nodes[i].checked === true) {
        localStorage["timespan"] = nodes[i].value;
	  }
    }
    show_message("save_options_msg", "options saved");
  }
}

var restoreOptions = function() {
  for(var i in transitionOptionIds) {
    document.getElementById(transitionOptionIds[i]).checked = (localStorage[transitionOptionIds[i]] === "true"? true: false);
  }

  var nodes = document.getElementById("timespan").childNodes;
  for(var i in nodes) {
    if (nodes[i].value == localStorage["timespan"]) {
      nodes[i].checked = true;
    }
  }
}

var generate_report = function() {
  // remove the existing report table if exists
  var oldtable = document.getElementById(Constants.REPORT_TABLE_ID);
  if(oldtable !== null) {
    document.body.removeChild(oldtable);
  }
  // construct the new report table
  var newtable = document.createElement("table");
  newtable.setAttribute("id", Constants.REPORT_TABLE_ID);
  newtable.setAttribute("border", "1");
  var newcaption = newtable.createCaption();
  newcaption.innerHTML = "Bookmarks Visits Report";
  var newheader = document.createElement("tr");
  newheader.appendChild(create_classic_element("th", "Title"));
  newheader.appendChild(create_classic_element("th", "URL"));
  newheader.appendChild(create_classic_element("th", "Visits"));
  newheader.appendChild(create_classic_element("th", "Action"));
  newtable.appendChild(newheader);
  document.body.appendChild(newtable);
  // fill the table with visit items
  chrome.bookmarks.getTree(create_bookmarks_report);
}

// generate report base on bookmarks tree
var create_bookmarks_report = function(bookmarks) {
  for(var i in bookmarks) {
    if(bookmarks[i].url == undefined) {
	  // in case of folder
	  create_bookmarks_report(bookmarks[i].children);
	} else if(bookmarks[i].url.indexOf("http://")!=0 && bookmarks[i].url.indexOf("https://")!=0) {
	  // ignore if the bookmark is not url
	} else {
      var newrow = document.createElement("tr");
	  newrow.setAttribute("id", "bookmark"+bookmarks[i].id);
      document.body.lastChild.appendChild(newrow);
	  report_visits(bookmarks[i]);
	}
  }
}

var report_visits = function(bm) {
  chrome.history.getVisits({'url': bm.url}, 
    function(visits) {
	  if(visits.length === 0) {
	    document.getElementById("bookmark"+bm.id).style.color = "red";
	  }
	  var rowdiv = document.getElementById("bookmark" + bm.id);
	  rowdiv.appendChild(create_classic_element("td", bm.title));
	  var newcell = create_simple_element("td");
	  var newanchor = create_classic_element("a", bm.url);
	  newanchor.setAttribute("href", bm.url);
	  newanchor.setAttribute("target", "_blank");
	  newcell.appendChild(newanchor);
	  rowdiv.appendChild(newcell);
	  rowdiv.appendChild(create_classic_element("td", visits.length + " visits"));
	  newcell = create_simple_element("td");
	  newcell.appendChild(create_classic_element("button", "Edit"));
	  newcell.appendChild(create_classic_element("button", "Delete"));
	  rowdiv.appendChild(newcell);
    });
}

var create_simple_element = function(tag) {
  return document.createElement(tag);
}

var create_classic_element = function(tag, text) {
  var elem = document.createElement(tag);
  var textnode = document.createTextNode(text);
  elem.appendChild(textnode);
  return elem;
}

var Constants = {
  REPORT_TABLE_ID: "visitsReport"
}