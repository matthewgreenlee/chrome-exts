chrome.tabs.getSelected(null, function(tab) {
  doPopup(tab.url);
});

function doPopup(url) {
  chrome.history.getVisits({'url': url}, function(visits) {
    var timespanVisits = filterWithVisitTime(localStorage["timespan"], visits);
    document.writeln("<div>Within last " + localStorage["timespan"] + " days total " + timespanVisits.length + " visits to " + url + "</div>");
	var transitionTypes = ["link", "typed", "auto_bookmark", "auto_subframe", "manual_subframe", "generated", "start_page", "form_submit", "reload", "keyword", "keyword_generated"];
	for(var i = 0; i < transitionTypes.length; i++) {
	  if (localStorage[transitionTypes[i]] === "true")
	    document.writeln("<div>" + filterWithTransition(transitionTypes[i], timespanVisits).length + " " + transitionTypes[i] + " visits</div>");
	}
  });
}

function filterWithTransition(transitionType, visitItems) {
  var filteredItems = visitItems.filter(function(item, index, array) {
    return item.transition === transitionType;
  });
  return filteredItems;
}

function filterWithVisitTime(timespan, visitItems) {
  var filteredItems = visitItems.filter(function(item, index, array) {
    return (new Date().getTime() - item.visitTime) < timespan * 24 * 60 * 60 * 1000;
  });
  return filteredItems;
}