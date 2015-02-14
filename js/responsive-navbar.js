!function($, window, document, undefined) {
  //TODO: restrict width, only apply on phone portrait-mode
  var $window = $(window),
  $container = $(".navbar").find(".container-fluid"),
  $nav = $container.find(".nav"),
  $navbarForm = $container.find('.navbar-form'),
  $input = $navbarForm.find("input"),
  $dropdown = $container.find(".navbar-right"),
  $clrInput = $container.find("#clear-search"),

  initWidth = $navbarForm.width(),
  restWidth, squeezeWidth, open;

  $.fx.speeds._default = 200;

  function resizeWindow() {
    // bugfix: avoid a  resizing when squeezed
    if(open) {
      $container.css({"margin-left": "", "width": ""});
      $navbarForm.css({"width": squeezeWidth});
      // unfocus inputfield
      $input.blur();
      open = false;
    }

    // calculate available space (squeezeWidth)
    // restWidth: width of all nav components except searchfield
    restWidth = Math.ceil(parseFloat($navbarForm.css('margin-left'))) * 2;
    $container.children().not(".navbar-form").each(function() {
      restWidth += $(this).outerWidth(true);
    });
    squeezeWidth = $container.width() - restWidth - 1;  // -1 for render engine rounding error

    // squeeze the input field (when necessary)
    if (squeezeWidth < initWidth) {
      $navbarForm.width(squeezeWidth);
      $input.off("focus", inputFocus).on("focus", inputFocus);
    } else {
      $navbarForm.css("width", "");
      $input.off("focus", inputFocus);
    }
  }

  function inputFocus() {
    open = true;
    $input.on("focusout", focusOut);

    $container.animate({
      "margin-left": -$nav.width(),
      "width": $window.width() + $nav.outerWidth(true) + $dropdown.outerWidth(true)
    });
    $navbarForm.animate({"width": initWidth});
    $clrInput.show();
  }

  function focusOut() {
    open = false;
    $input.off("focusout", focusOut);

    $container.animate({
      "margin-left": 0,
      "width": $window.width()
    }, function() {
        // clear css properties afterwards
        $container.css({"margin-left": "", "width": ""});
      });
    $navbarForm.animate({"width": squeezeWidth});
    $clrInput.hide();
  }

  $(window).on('load', function () {
    resizeWindow();
  })

  $window.on("resize", resizeWindow);
  $clrInput.on("click", focusOut);

}(jQuery, window, document);