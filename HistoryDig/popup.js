chrome.tabs.getSelected(null, function(tab) {
  doPopup(tab.url);
});

function doPopup(url) {
  chrome.history.getVisits({'url': url}, function(visits) {
    document.writeln("Total " + visits.length + " visits to " + url);
	var transitionTypes = ["link", "typed", "auto_bookmark", "auto_subframe", "manual_subframe", "generated", "start_page", "form_submit", "reload", "keyword", "keyword_generated"];
	for(var i in transitionTypes) {
	  document.writeln(filterWithTransition(transitionTypes[i], visits).length + " " + transitionTypes[i] + " visits");
	}
  });
}

function filterWithTransition(transitionType, visitItems) {
  var filteredItems = visitItems.filter(function(item, index, array) {
    return item.transition === transitionType;
  });
  return filteredItems;
}