!function($, window, document, undefined) {
  var $window = $(window);

  window.app = {};
  window.app.positionBody =  function(){
    $('body').css({'padding-top': $('.navbar').height()+26});
  }

  window.app.setWidthStickyPanel = function(){
    angular.element(".panel-fixed").css({'width': $('.panel-default').outerWidth()});
  }

  $window.bind('resize', function () {
    window.app.positionBody();
    window.app.setWidthStickyPanel();
  });

  window.app.positionBody();


}(jQuery, window, document);
