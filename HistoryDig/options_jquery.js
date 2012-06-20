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
        var bookmarkTreeNodes = chrome.bookmarks.getTree(HD.dumpTreeNodes);
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

HD.dumpTreeNodes = function(bookmarkTreeNodes) {
    for (var i in bookmarkTreeNodes) {
        if (HD.nodeIsFolder(bookmarkTreeNodes[i])) {
            HD.bookmarkFolders[bookmarkTreeNodes[i].id] = bookmarkTreeNodes[i].title;
            HD.dumpTreeNodes(bookmarkTreeNodes[i].children);
        } else {
            var row = HD.dumpNode(bookmarkTreeNodes[i]);
            $("#visitsReport").append(row);
            HD.getVisits(bookmarkTreeNodes[i]);
        }
    }
};

HD.nodeIsFolder = function(bookmarkTreeNode) {
    return bookmarkTreeNode.url === undefined ? true : false;
};

HD.dumpNode = function(bookmarkTreeNode) {
    var row = $("<tr>").attr("id", bookmarkTreeNode.id);
    row.append(HD.newTd(bookmarkTreeNode.title));
    row.append(HD.newTd(HD.bookmarkFolders[bookmarkTreeNode.parentId]));
    row.append(HD.newTd(bookmarkTreeNode.url));
    // put an empty string as place holder before get real data
    row.append(HD.newTd(""));
    row.append($("<td>").append($("<a href='about:blank'>").text("Edit"), $("<a href='about:blank'>").text("Delete")));
    return row;
};

HD.getVisits = function(bookmarkTreeNode) {
    chrome.history.getVisits({
        'url': bookmarkTreeNode.url
    }, function(visitItems) {
        // locate visits cell based on bookmarkTreeNode.id
        $("tr[id=" + bookmarkTreeNode.id + "] td:nth-child(4)").text(visitItems.length);
        $("tr[id=" + bookmarkTreeNode.id + "] td:last-child a:first-child").toggle(HD.editBookmark, HD.saveBookmark);
        $("tr[id=" + bookmarkTreeNode.id + "] td:last-child a:last-child").click(HD.deleteBookmark);
    });
};

HD.editBookmark = function(event) {
    event.preventDefault();
    $(this).text("Save");
    var id = $(this).parents("tr").attr("id");
    var text = $(this).parents("tr").children(":nth-child(3)").text();
    $(this).parents("tr").children(":nth-child(3)").contents().replaceWith("<input type='text' value='" + text + "' />");
};

HD.saveBookmark = function(event) {
    event.preventDefault();
    var id = $(this).parents("tr").attr("id");
    var url = $("tr[id=" + id + "] :input").filter(":last").val()
    $(this).text("Edit");
    chrome.bookmarks.update(id, {
        'url': url
    }, function() {
        $("tr[id=" + id + "] :input").filter(":last").replaceWith("<div>" + url + "</div>");
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

HD.newTd = function(text) {
    return $("<td>").text(text);
};
