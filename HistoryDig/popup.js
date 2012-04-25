chrome.tabs.getSelected(null, function(tab) {
  doPopup(tab.url);
});

function doPopup(url) {
  chrome.history.getVisits({'url': url}, function(visits) {
    document.write(visits.length + " visits to " + url);
  });
}
