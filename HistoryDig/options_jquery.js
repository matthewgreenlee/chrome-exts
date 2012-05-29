$(document).ready(function() {
  HD.restore();
  $("#save").click(HD.save);
  $("#close").click(HD.close);
});

var HD = {
  restore: function() {
    var checkboxes = $(":input[type='checkbox']");
    for (var i in checkboxes) {
      if (localStorage[checkboxes[i].id] === "true") {
        checkboxes[i].checked = true;
      }
    }
	
	var radios = $("input:radio");
	for (var i in radios) {
	  if (localStorage[radios[i].name] === radios[i].value) {
	    radios[i].checked = true;
	  }
	}
  },
  save: function() {
    var checkboxes = $(":input[type='checkbox']");
    for (var i in checkboxes) {
      if (checkboxes[i].checked === true) {
        localStorage[checkboxes[i].id] = "true";
      } else {
        localStorage[checkboxes[i].id] = "false";
	  }
    }
	
	var radios = $("input:radio");
	for (var i in radios) {
	  if (radios[i].checked === true) {
	    localStorage[radios[i].name] = radios[i].value;
	  }
	}
  },
  close: function() {
    window.close();
  }
}