!function($, window, document, undefined) {
  var $window = $(window);

  window.app = {};
  window.app.positionBody =  function(){
    $('body').css({'padding-top': $('.navbar').height()+26});
  }

  $window.bind('resize', function () {
    window.app.positionBody();
  });

  window.app.positionBody();


}(jQuery, window, document);
