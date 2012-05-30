$(document).ready(function () {
  $("#save").click(HD.save);
  $("#close").click(HD.close);
  HD.checkboxes = $(":input[type='checkbox']");
  HD.radios = $("input:radio");
  HD.restore();
});

var HD = {};

HD.restore = function () {
  for (var i in HD.checkboxes) {
    if (localStorage[HD.checkboxes[i].id] === "true") {
      HD.checkboxes[i].checked = true;
    }
  }

  for (var i in HD.radios) {
    if (localStorage[HD.radios[i].name] === HD.radios[i].value) {
      HD.radios[i].checked = true;
    }
  }
};

HD.save = function () {
  for (var i in HD.checkboxes) {
    if (HD.checkboxes[i].checked === true) {
      localStorage[HD.checkboxes[i].id] = "true";
    } else {
      localStorage[HD.checkboxes[i].id] = "false";
    }
  }

  for (var i in HD.radios) {
    if (HD.radios[i].checked === true) {
      localStorage[HD.radios[i].name] = HD.radios[i].value;
    }
  }
};

HD.close = function () {
  window.close();
};