$(function() {
    $("#saveBtn").click(HD.save);
    $("#closeBtn").click(HD.close);
    $("#reportBtn").click(HD.showReport);
    $("#visitsReport").hide();
    HD.checkboxes = $(":input[type='checkbox']");
    HD.radios = $("input:radio");
    HD.restore();
});

var HD = {};

HD.restore = function() {
    HD.checkboxes.attr("checked", function() {
        return localStorage[this.id] === "true" ? true : false;
    });
    
    HD.radios.attr("checked", function() {
        return localStorage[this.name] === this.value ? true : false;
    });
};

HD.save = function() {
    HD.checkboxes.each(function() {
        this.checked === true ? localStorage[this.id] = "true" : localStorage[this.id] = "false";
    });
    
    HD.radios.each(function() {
        if (this.checked === true) {
            localStorage[this.name] = this.value;
        }
    });
    
    HD.showMessage("options saved");
};

HD.showMessage = function(msg) {
    var msgdiv = $("#message");
    msgdiv.html(msg);
    msgdiv.show("fast", function() {
        msgdiv.hide("slow");
    });
};

HD.close = function() {
    window.close();
};

HD.showReport = function() {
    $("#visitsReport").show();
    var theFirstTime = $("#visitsReport").has("td").length ? false : true;
    if (theFirstTime === true) {
        var bookmarkTreeNodes = chrome.bookmarks.getTree(HD.dumpBookmarks);
    }
    $("#reportBtn").val("Hide Report");
    $("#reportBtn").click(HD.hideReport);
};

HD.hideReport = function() {
    $("#visitsReport").hide();
    $("#reportBtn").val("Show Report");
    $("#reportBtn").click(HD.showReport);
};

HD.bookmarkFolders = {};

HD.numberOfBookmarks = 0;

HD.dumpBookmarks = function(bookmarkTreeNodes) {
    for (var i in bookmarkTreeNodes) {
		HD.dumpBookmark(bookmarkTreeNodes[i]);
    }
};

HD.dumpBookmark = function(bookmarkTreeNode) {
	if (!bookmarkTreeNode.parentId) {
		HD.bookmarkRootNode = bookmarkTreeNode;
	}
	if (!bookmarkTreeNode.url) {
		HD.bookmarkFolders[bookmarkTreeNode.id] = bookmarkTreeNode.title;
		HD.dumpBookmarks(bookmarkTreeNode.children);
	} else {
		if (HD.numberOfBookmarks >= 10) {
			return;
		}
		var row = $("<tr>").attr("id", bookmarkTreeNode.id);
		row.append($("<td>").append($("<div class='title' />").html(bookmarkTreeNode.title)));
		row.append($("<td>").append($("<div class='location' />").html(HD.bookmarkFolders[bookmarkTreeNode.parentId])));
		row.append($("<td>").append($("<div class='url' />").html(bookmarkTreeNode.url)));
		row.append($("<td>").append($("<div class='action' />").append($("<a href=''>").text("Edit").toggle(HD.editBookmark, HD.saveBookmark), $("<a href=''>").text("Delete").click(HD.deleteBookmark))));
		$("#visitsReport").append(row);
		HD.numberOfBookmarks += 1;
	}
};

HD.getVisits = function(bookmarkTreeNode) {
    chrome.history.getVisits({
        'url': bookmarkTreeNode.url
    }, function(visitItems) {
        // locate visits cell based on bookmarkTreeNode.id
        $("tr[id=" + bookmarkTreeNode.id + "] td:nth-child(4)").text(visitItems.length);
    });
};

HD.editBookmark = function(event) {
    event.preventDefault();
    var row = $(this).parents("tr");
    row.find(".title, .location, .url").html(function(index, oldhtml) {
        return "<input type='text' value='" + oldhtml + "' />";
    });
    $(this).text("Save");
};

HD.saveBookmark = function(event) {
    event.preventDefault();
    var row = $(this).parents("tr");
    var id = $(row).attr("id");
    var title = $(row).find(".title :input").val();
    var url = $(row).find(".url :input").val();
    chrome.bookmarks.update(id, {
        'title': title,
        'url': url
    }, function() {
        $(row).find(".title, .location, .url").html(function(index, oldhtml) {
            return $(this).children(":input").val();
        });
		$(row).find(".action a:first-child").text("Edit");
        ;
    });
};

HD.deleteBookmark = function(event) {
    event.preventDefault();
    var confirmed = confirm("please confirm your deletion");
    if (!confirmed) {
        return;
    }
    var id = $(this).parents("tr").attr("id");
    chrome.bookmarks.remove(id, function() {
        $("tr[id=" + id + "]").remove();
    });
};
