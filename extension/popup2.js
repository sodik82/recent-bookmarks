var bookmarks = {
  selected : -1,
  setSelected : function(idx) {
    console.log("setSelected " + idx);
    if (bookmarks.selected == idx) {
      return;
    }
    var $lines = $(".line");
    if (bookmarks.selected >= 0) {
      var el = $lines.get(bookmarks.selected);
      if (el) {
        $(el).removeClass("selected");
      }
    }
    bookmarks.selected = idx;
    if (bookmarks.selected >= 0) {
      var el = $lines.get(bookmarks.selected);
      if (el) {
        $(el).addClass("selected");
        el.scrollIntoView();
      }
    }
  },

  // lastly searched string
  search_text: "",
  // number of bookmarks shown
  count: 0,
  // repopulate bookmarkss
  repopulate : function() {
    if (bookmarks.search_text.length > 0) {
      console.log("searching for " + bookmarks.search_text);
      chrome.bookmarks.search(bookmarks.search_text, bookmarks.populateBookmarks);
    } else {
      chrome.bookmarks.getRecent(settings.count, bookmarks.populateBookmarks);
    }
  },
  populateBookmarks : function(nodes) {
    // reset
    $("#pane").empty();
    bookmarks.count = 0;
    bookmarks.selected = -1;
    if (nodes != null) {
      for (var i=0; i < nodes.length && i < settings.count; i++) {
        bookmarks.addLine(nodes[i]);
      }
    }
    //point on first
    bookmarks.setSelected((bookmarks.count>0)?0:-1);
    bookmarks.workaroundFix();
  },

  // adds new line to pane based on the template
  addLine : function (bNode) {
    var $line = $("#templates .line").clone();
    // add to pane
    $("#pane").append($line);
    bookmarks.count++;
    $line.attr('id', bNode.id);
    // fix position of action element
    $line.find(".action")
      .position({of : $line, my : "right center", at: "right center", offset:"-3px 0px"})
      .click(bookmarks.delBookmark);
    // set background color
    $line.css("background-color", settings.bookmarkBG);
    // update texts
    $line.find(".bookmark a")
      .text(bNode.title)
      .attr("href", bNode.url)
      .attr("title", bNode.title + "\n" + bNode.url)
      .click(bookmarks.forward);
  },
  // move selected bookmark
  move : function(delta) {
    var idx = bookmarks.selected + delta;
    if (idx >= bookmarks.count) {
      idx -= bookmarks.count;
    }
    if (idx < 0) {
      idx += bookmarks.count;
    }
    bookmarks.setSelected(idx);
  },

  // bookmark link forward
  forward : function(e) {
    var href = $(e.target).attr("href");
    if (e.ctrlKey == (settings.openMode != "newTab")) {
      console.log("Opening new tab " + href);
      chrome.tabs.create({ url : href, selected: true});
    } else {
      console.log("Navigate actual tab to " + href);
      chrome.tabs.update({url : href, selected: true});
    }

    return false;
  },
  // delete the bookmark
  delBookmark : function(e) {
    var $line = $(e.target).closest(".line");
    var bid = $line.attr('id');
    chrome.bookmarks.remove(bid, function() {
      console.log("Removed bookmark: " + bid);
      bookmarks.repopulate();
    });

  },
  // key handler
  keypress : function (e) {
    console.log(e);
    if (event.type == "keydown") {
      switch(e.which) {
        case 13:
          // emulate click on selected bookmark
          e.target = $(".selected .bookmark a");
          bookmarks.forward(e);
        return;
        case $.ui.keyCode.UP:
          bookmarks.move(-1);
        return;
        case $.ui.keyCode.DOWN:
          bookmarks.move(+1);
        return;
      }
    }
    // some key might be pressed
    var text = $("#search").val();
    console.log("actual search text" + text);
    if (text === bookmarks.search_text) {
      return;
    }
    bookmarks.search_text = text;
    bookmarks.repopulate();
  },

  workaroundFix: function() {
    // https://bugs.chromium.org/p/chromium/issues/detail?id=307912
    window.setTimeout(function() {
     jQuery('#workaround-307912').show();
    }, 0);
  }

};


/// main method //////////
$( function() {
  settings_load(function() {
    bookmarks.repopulate();
  });
  $(document).keydown(bookmarks.keypress);
  $(document).keyup(bookmarks.keypress);
  $("#search").focus();
});
