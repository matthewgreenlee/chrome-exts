$(document).ready(function () {
  $("#save").click(HD.save);
  $("#close").click(HD.close);
  $("#showReport").click(HD.generateReport);
  $("#visitsReport").hide();
  HD.checkboxes = $(":input[type='checkbox']");
  HD.radios = $("input:radio");
  HD.restore();
});

var HD = {};

HD.restore = function () {
  HD.checkboxes.attr("checked", function() {
    return localStorage[this.id] === "true" ? true: false;
  });

  HD.radios.attr("checked", function() {
    return localStorage[this.name] === this.value ? true: false;
  });
};

HD.save = function () {
  HD.checkboxes.each(function() {
    this.checked === true ? localStorage[this.id] = "true": localStorage[this.id] = "false";
  });

  HD.radios.each(function() {
    if (this.checked === true) {
      localStorage[this.name] = this.value;
    }
  });
  
  HD.showMessage("options saved"); 
};

HD.showMessage = function (msg) {
  var msgdiv = $("#message");
  msgdiv.html(msg);
  msgdiv.show("fast", function() {
    msgdiv.hide("slow");
  });
};

HD.close = function () {
  window.close();
};

HD.generateReport = function () {
//  $("body").append("<table id='visitsReport'>"); 
};