var transitionOptionIds = ["transitionLink", "transitionTyped", "transitionAutoBookmark",
 "transitionAutoSubframe", "transitionManualSubframe", "transitionGenerated", "transitionStartPage", 
 "transitionFormSubmit", "transitionReload", "transitionKeyword", "transitionKeywordGenerated"];

var showMessage = function(elementId, message) {
  clearMessage(elementId);
  var msgdiv = document.getElementById(elementId);
  var msgtext = document.createTextNode(message);
  msgdiv.appendChild(msgtext);
  setTimeout(function() {
    document.getElementById(elementId).innerHTML = "";
  }, 500);
}

var clearMessage = function(elementId) {
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
    showMessage("save_options_msg", "options saved");
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
  newheader.appendChild(createClassicElement("th", "Title"));
  newheader.appendChild(createClassicElement("th", "Location"));
  newheader.appendChild(createClassicElement("th", "URL"));
  newheader.appendChild(createClassicElement("th", "Visits"));
  newheader.appendChild(createClassicElement("th", "Action"));
  newtable.appendChild(newheader);
  document.body.appendChild(newtable);
  // fill the table with visit items
  chrome.bookmarks.getTree(createBookmarkReport);
}

// generate report base on bookmarks tree
var createBookmarkReport = function(bookmarks) {
  for(var i in bookmarks) {
    if(bookmarks[i].url == undefined) {
	  // in case of folder
	  createBookmarkReport(bookmarks[i].children);
	} else if(bookmarks[i].url.indexOf("http://")!=0 && bookmarks[i].url.indexOf("https://")!=0) {
	  // ignore if the bookmark is not url
	} else {
      var newrow = document.createElement("tr");
	  newrow.setAttribute("id", "bookmark"+bookmarks[i].id);
      document.body.lastChild.appendChild(newrow);
	  reportVisits(bookmarks[i]);
	}
  }
}

var reportVisits = function(bm) {
  chrome.history.getVisits({'url': bm.url}, 
    function(visits) {
	  if(visits.length === 0) {
	    document.getElementById("bookmark"+bm.id).style.color = "red";
	  }
	  var rowdiv = document.getElementById("bookmark" + bm.id);
	  rowdiv.appendChild(createClassicElement("td", bm.title));
	  rowdiv.appendChild(createClassicElement("td", getBookmarkLocation(bm.id)));
	  var newcell = createSimpleElement("td");
	  var newanchor = createClassicElement("a", bm.url);
	  newanchor.setAttribute("href", bm.url);
	  newanchor.setAttribute("target", "_blank");
	  newcell.appendChild(newanchor);
	  rowdiv.appendChild(newcell);
	  rowdiv.appendChild(createClassicElement("td", visits.length + " visits"));
	  newcell = createSimpleElement("td");
	  var editbtn = createSimpleElement("input");
	  editbtn.setAttribute("type", "button");
	  editbtn.setAttribute("value", "Edit");
	  editbtn.addEventListener("click", editBookmarkItem);
	  newcell.appendChild(editbtn);
	  var savebtn = createSimpleElement("input");
	  savebtn.setAttribute("type", "hidden");
	  savebtn.setAttribute("value", "Save");
	  savebtn.addEventListener("click", saveBookmarkItem);
	  newcell.appendChild(savebtn);
	  var delbtn = createSimpleElement("input");
	  delbtn.setAttribute("type", "button");
	  delbtn.setAttribute("value", "Delete");
      delbtn.addEventListener("click", deleteBookmarkItem);
	  newcell.appendChild(delbtn);
	  rowdiv.appendChild(newcell);
    });
}

var getBookmarkLocation = function(id) {
  return "to be decided location of bookmark " + id;
}

var saveBookmarkItem = function() {
  var rowelem = this.parentElement.parentElement;
  var bookmarkid = rowelem.getAttribute("id").substring("bookmark".length);
  var titlecell = rowelem.firstChild;
  var bookmarktitle = titlecell.firstChild.value;
  chrome.bookmarks.update(bookmarkid, {
    'title': bookmarktitle
  }, function(bookmark) {
    titlecell.innerHTML = bookmark.title;
    var actioncell = rowelem.lastChild;
    actioncell.children[0].setAttribute("type", "button");
    actioncell.children[1].setAttribute("type", "hidden");
  });
}

var editBookmarkItem = function() {
  var rowelem = this.parentElement.parentElement;
  var titlecell = rowelem.firstChild;
  var newinput = createSimpleElement("input");
  newinput.setAttribute("type", "text");
  newinput.setAttribute("value", titlecell.innerHTML);
  titlecell.innerHTML = "";
  titlecell.appendChild(newinput);
  var actioncell = rowelem.lastChild;
  actioncell.children[1].setAttribute("type", "button");
  this.setAttribute("type", "hidden");
}

var deleteBookmarkItem = function() {
  var tobedel = confirm("Do you really want to delete below URL from bookmarks?\n");
  if(!tobedel) {
    return;
  }
  var rowelem = this.parentElement.parentElement;
  var bookmarkid = rowelem.id.substring("bookmark".length);
  // remove item from local bookmarks
  chrome.bookmarks.remove(bookmarkid, function() {
    // delete table row from report table
    rowelem.parentElement.removeChild(rowelem);
  });
}

var createSimpleElement = function(tag) {
  return document.createElement(tag);
}

var createClassicElement = function(tag, text) {
  var elem = document.createElement(tag);
  var textnode = document.createTextNode(text);
  elem.appendChild(textnode);
  return elem;
}

var Constants = {
  REPORT_TABLE_ID: "visitsReport"
}