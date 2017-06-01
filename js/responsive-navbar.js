!function($, window, document, undefined) {
  var $window = $(window);

  window.app = {};
  window.app.positionBody =  function(){
    $('body').css({
      'padding-top': $('#global-menu').height() + $('.navbar').height()
    });
  }

  $window.bind('resize', function () {
    window.app.positionBody();
  });

  window.app.positionBody();

}(jQuery, window, document);
