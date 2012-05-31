$(document).ready(function () {
  $("#save").click(HD.save);
  $("#close").click(HD.close);
  HD.checkboxes = $(":input[type='checkbox']");
  HD.radios = $("input:radio");
  HD.restore();
});

var HD = {};

HD.restore = function () {
  HD.checkboxes.attr("checked", function(index, attr) {
    if (localStorage[this.id] === "true") {
      return true;
    } else {
      return false;
    }
  });

  HD.radios.attr("checked", function(index, attr) {
    if (localStorage[this.name] === this.value) {
      return true;
    } else {
      return false;
    }
  });
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
  
  HD.showMessage("options saved");
  
  if ($("#showReport:first").attr("checked") === true) {
    HD.generateReport();
  }
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
  $("body").append("<table id='visitsReport'>"); 
};