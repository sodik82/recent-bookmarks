// options page main method
$(function() {
  $("#count").spinner();
  $("#saveButton").click(settings_save);
  settings_restore();
});
