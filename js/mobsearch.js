!function($, window, document, undefined) {
  //TODO: restrict width, only apply on phone portrait-mode
  $("#btnOpenMobSearch, #btnCloseMobSearch").click(function(){
    $(".mobile-search-container").toggleClass("act");
  });

}(jQuery, window, document);
