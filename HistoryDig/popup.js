chrome.tabs.getSelected(null, function(tab) {
  doPopup(tab.url);
});

function doPopup(url) {
  chrome.history.getVisits({'url': url}, function(visits) {
    document.writeln("<div>Total " + visits.length + " visits to " + url + "</div>");
	var transitionTypes = ["link", "typed", "auto_bookmark", "auto_subframe", "manual_subframe", "generated", "start_page", "form_submit", "reload", "keyword", "keyword_generated"];
	for(var i = 0; i < transitionTypes.length; i++) {
	  if (localStorage[transitionTypes[i]] === "true")
	    document.writeln("<div>" + filterWithTransition(transitionTypes[i], visits).length + " " + transitionTypes[i] + " visits</div>");
	}
  });
}

function filterWithTransition(transitionType, visitItems) {
  var filteredItems = visitItems.filter(function(item, index, array) {
    return item.transition === transitionType;
  });
  return filteredItems;
}