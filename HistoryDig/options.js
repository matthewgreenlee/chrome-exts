var transitionOptionIds = ["transitionLink", "transitionTyped", "transitionAutoBookmark",
 "transitionAutoSubframe", "transitionManualSubframe", "transitionGenerated", "transitionStartPage", 
 "transitionFormSubmit", "transitionReload", "transitionKeyword", "transitionKeywordGenerated"];

var bookmarkFolders = [];

window.onload = function() {
  HistoryDig.restoreOptions();
  document.getElementById("save").addEventListener(Constants.HTML_EVENT_CLICK, HistoryDig.saveOptions);
  document.getElementById("close").addEventListener(Constants.HTML_EVENT_CLICK, HistoryDig.close);
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
    HistoryDig.showMessage("save_options_msg", "options saved");
	// if the option was checked, show report
	if (true === document.getElementById("showReport").checked) {
	  generateReport();
	} else {
      var oldtable = document.getElementById(Constants.REPORT_TABLE_ID);
      if(oldtable !== null) {
        document.body.removeChild(oldtable);
      }
	}
  },
  close: function() {
    window.close();
  },
  restoreOptions: function() {
    for(var i in transitionOptionIds) {
      document.getElementById(transitionOptionIds[i]).checked = (localStorage[transitionOptionIds[i]] === "true"? true: false);
    }

    var nodes = document.getElementById("timespan").childNodes;
    for(var i in nodes) {
      if (nodes[i].value == localStorage["timespan"]) {
        nodes[i].checked = true;
      }
    }
  },
  showMessage: function(elementId, message) {
    HistoryDig.clearMessage(elementId);
    var msgdiv = document.getElementById(elementId);
    var msgtext = document.createTextNode(message);
    msgdiv.appendChild(msgtext);
    setTimeout(function() {
      document.getElementById(elementId).innerHTML = "";
    }, 500);
  },
  clearMessage: function(elementId) {
    document.getElementById(elementId).innerHTML = "";
  }

}

var generateReport = function() {
  // remove the existing report table if exists
  var oldtable = document.getElementById(Constants.REPORT_TABLE_ID);
  if(oldtable !== null) {
    document.body.removeChild(oldtable);
  }
  // construct the new report table
  var newtable = document.createElement("table");
  newtable.setAttribute("id", Constants.REPORT_TABLE_ID);
  newtable.setAttribute("border", "1");
  var newheader = document.createElement("tr");
  newheader.appendChild(createElementWithText(Constants.HTML_TAG_TH, "Title"));
  newheader.appendChild(createElementWithText(Constants.HTML_TAG_TH, "Location"));
  newheader.appendChild(createElementWithText(Constants.HTML_TAG_TH, "URL"));
  newheader.appendChild(createElementWithText(Constants.HTML_TAG_TH, "Visits"));
  newheader.appendChild(createElementWithText(Constants.HTML_TAG_TH, "Action"));
  newtable.appendChild(newheader);
  document.body.appendChild(newtable);
  // fill the table with visit items
  chrome.bookmarks.getTree(buildBookmarkReport);
}

// generate report base on bookmarks tree
var buildBookmarkReport = function(bookmarks) {
  for(var i in bookmarks) {
    if(bookmarks[i].url == undefined) {
	  // in case of folder
	  bookmarkFolders.push({
	    'id': bookmarks[i].id,
		'title': bookmarks[i].title
	  });
	  buildBookmarkReport(bookmarks[i].children);
	} else if(bookmarks[i].url.indexOf(Constants.URL_PREFIX_HTTP)!=0 && bookmarks[i].url.indexOf(Constants.URL_PREFIX_HTTPS)!=0) {
	  // ignore if the bookmark is not a valid url
	} else {
      var newrow = document.createElement("tr");
	  newrow.setAttribute("id", Constants.ID_PREFIX_BOOKMARK+bookmarks[i].id);
      document.body.lastChild.appendChild(newrow);
	  buildBookmarkItem(bookmarks[i]);
	}
  }
}

var buildBookmarkItem = function(bm) {
  chrome.history.getVisits({'url': bm.url}, 
    function(visits) {
	  if(visits.length === 0) {
	    document.getElementById(Constants.ID_PREFIX_BOOKMARK+bm.id).style.color = "red";
	  }
	  var rowElem = document.getElementById(Constants.ID_PREFIX_BOOKMARK + bm.id);
	  rowElem.appendChild(createElementWithText(Constants.HTML_TAG_TD, bm.title));
      buildBookmarkLocation(bm.id);
	  var urlCell = createSimpleElement(Constants.HTML_TAG_TD);
	  urlCell.appendChild(createAnchor(bm.url, bm.url, "_blank"));
	  rowElem.appendChild(urlCell);
	  rowElem.appendChild(createElementWithText(Constants.HTML_TAG_TD, visits.length));
	  var actionCell = createSimpleElement(Constants.HTML_TAG_TD);
	  actionCell.appendChild(createButton("Edit", editBookmarkItem, false));
	  actionCell.appendChild(createButton("Save", saveBookmarkItem, true));
	  actionCell.appendChild(createButton("Delete", deleteBookmarkItem, false));
	  rowElem.appendChild(actionCell);
    });
}

var buildBookmarkLocation = function(id) {
  chrome.bookmarks.get(id, function(results) {
    var rowElem = document.getElementById(Constants.ID_PREFIX_BOOKMARK + id);
	rowElem.insertBefore(createElementWithText(Constants.HTML_TAG_TD, getBookmarkFolderTitle(results[0].parentId)), rowElem.firstChild.nextSibling);
  });
}

var getBookmarkFolderTitle = function(id) {
  for(var i in bookmarkFolders) {
    if(id === bookmarkFolders[i].id) {
	  return bookmarkFolders[i].title;
	}
  }
}

var saveBookmarkItem = function() {
  var rowelem = this.parentElement.parentElement;
  var bookmarkid = rowelem.id.substring(Constants.ID_PREFIX_BOOKMARK.length);
  var titlecell = rowelem.firstChild;
  var bookmarktitle = titlecell.firstChild.value;
  var urlcell = titlecell.nextSibling.nextSibling;
  var bookmarkurl = urlcell.firstChild.value;
  chrome.bookmarks.update(bookmarkid, {
    'title': bookmarktitle,
	'url': bookmarkurl
  }, function(bookmark) {
    titlecell.innerHTML = bookmark.title;
	urlcell.innerHTML = "";
	urlcell.appendChild(createAnchor(bookmark.url, bookmark.url, "_blank"));
	// update action buttons
    var actioncell = rowelem.lastChild;
    actioncell.children[0].disabled = false;
	actioncell.children[1].disabled = true;
  });
}

var editBookmarkItem = function() {
  var rowelem = this.parentElement.parentElement;
  // update title column
  var titlecell = rowelem.firstChild;
  var text = titlecell.innerHTML;
  titlecell.innerHTML = "";
  titlecell.appendChild(createTextbox(text));
  // update url column
  var urlcell = titlecell.nextSibling.nextSibling;
  // url text is wrapped within <a> element
  text = urlcell.firstChild.text;
  urlcell.innerHTML = "";
  urlcell.appendChild(createTextbox(text));
  // update action column
  var actioncell = rowelem.lastChild;
  actioncell.children[1].disabled = false;
  this.disabled = true;
}

var deleteBookmarkItem = function() {
  var rowelem = this.parentElement.parentElement;
  var toBeDel = confirm("Do you really want to delete below URL from bookmarks?\n" + rowelem.children[2].firstChild.text);
  if(!toBeDel) {
    return;
  }
  var bookmarkid = rowelem.id.substring(Constants.ID_PREFIX_BOOKMARK.length);
  // remove item from local bookmarks
  chrome.bookmarks.remove(bookmarkid, function() {
    // delete table row from report table
    rowelem.parentElement.removeChild(rowelem);
  });
}

var createAnchor = function(text, url, target) {
  var a = createElementWithText(Constants.HTML_TAG_A, text);
  a.setAttribute("href", url);
  a.setAttribute("target", target);
  return a;
}

var createButton = function(text, listener, disable) {
  var btn = createSimpleElement(Constants.HTML_TAG_INPUT);
  btn.setAttribute(Constants.HTML_ATTR_TYPE, "button");
  btn.value = text;
  btn.disabled = disable;
  btn.addEventListener(Constants.HTML_EVENT_CLICK, listener);
  return btn;
}

var createTextbox = function(defaultText) {
  var elem = createSimpleElement(Constants.HTML_TAG_INPUT);
  elem.setAttribute(Constants.HTML_ATTR_TYPE, "text");
  elem.setAttribute("size", defaultText.length);
  elem.value = defaultText;
  return elem;
}

var createSimpleElement = function(tag) {
  return document.createElement(tag);
}

var createElementWithText = function(tag, text) {
  var elem = document.createElement(tag);
  var textnode = document.createTextNode(text);
  elem.appendChild(textnode);
  return elem;
}

var Constants = {
  REPORT_TABLE_ID: "visitsReport",
  ID_PREFIX_BOOKMARK: "bookmark",
  URL_PREFIX_HTTP: "http://",
  URL_PREFIX_HTTPS: "https://",
  HTML_TAG_INPUT: "input",
  HTML_TAG_TH: "th",
  HTML_TAG_TD: "td",
  HTML_TAG_A: "a",
  HTML_ATTR_TYPE: "type",
  HTML_EVENT_CLICK: "click"
}