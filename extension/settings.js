var settings = {
  count: 10,
  openMode: "newTab",
  bookmarkBG: "#FFFFFF"
};

function settings_load(callback) {
  chrome.storage.sync.get("settings", function(items) {
    if (items.settings) {
      $.extend(settings, items.settings);
    } else {
      // fallback to local storage just for backward compatibility
      var ls = {};
      ls.openMode = localStorage["openMode"];
      ls.count = localStorage["count"];
      ls.bookmarkBG = localStorage["bookmark.bg"];
      $.extend(settings, ls);
    }
    // normalize count to integer
    var count = parseInt(settings.count);
    if (isNaN(count)) count = 10;
    if (count < 1) count = 1;
    if (count > 50) count = 50;
    settings.count = count;
    // call the callback
    if (callback) {
      callback();
    }
  });
}

function settings_save() {
  var count = parseInt($("#count").val());
  if (isNaN(count)) count = 10;
  if (count < 1) count = 1;
  if (count > 50) count = 50;
  settings.count = count;

  settings.openMode = $("#openMode").val();
  settings.bookmarkBG = $("#itemBG").val();

  chrome.storage.sync.set({ settings: settings }, function() {
    $("#status").text("Options saved").show().hide("slow");
    settings_restore();
  });
}

// Restores select box state to saved value from localStorage.
function settings_restore() {
  settings_load(function() {
    $("#openMode").val(settings.openMode);
    $("#itemBG").val(settings.bookmarkBG);
    $("#count").val(settings.count);
  });

  var openMode = localStorage["openMode"];
  if (openMode) {
    var select = document.getElementById("openMode");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == openMode) {
        child.selected = "true";
        break;
      }
    }
  }
  var count = localStorage["count"];
  if (count) {
    var el = document.getElementById("count");
    el.value = count;
  }
  var color = localStorage["bookmark.bg"];
  if (color) {
    var el = document.getElementById("itemBG");
    el.value = color;
  }
}
