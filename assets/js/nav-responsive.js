!function($, window, document, undefined) {
//TODO: restrict width, only apply on phone portrait-mode
    var $window = $(window),
        $container = $(".navbar").find(".container"),
        $nav = $container.find(".nav"),
        $input = $container.find("input.search-query"),
        $dropdown = $container.find(".nav.pull-right"),
        $clrInput = $container.find("#clear-search"),

        initWidth = $input.width(),
        squeezeWidth, stretched;

    $.fx.speeds._default = 200;

    $window.on("resize", resizeWindow);
    $clrInput.on("click", focusOut);

    function resizeWindow() {
        // bugfix: avoid a  resizing when squeezed
        if(stretched) {
            $container.css({"margin-left": "", "width": ""});
            $input.css({"width": squeezeWidth});
            // unfocus inputfield
            $input.blur();
            stretched = false;
        }

        // calculate available space (squeezeWidth)
        var restWidth = $input.outerWidth(true) - $input.width();
        $container.children().not(".navbar-search").each(function() {
            restWidth += $(this).outerWidth(true);
        });
        squeezeWidth = $container.width() - restWidth - 1;  // -1 for render engine rounding error

        // squeeze the input field (when necessary)
        if (squeezeWidth < initWidth) {
            $input.width(squeezeWidth);
            $input.off("focus", inputFocus).on("focus", inputFocus);
        } else {
            $input.css("width", "");
            $input.off("focus", inputFocus);
        }
    }

    function inputFocus() {
        stretched = true;
        $input.on("focusout", focusOut);

        $container.animate({
            "margin-left": -$nav.width(),
            "width": $window.width() + $nav.outerWidth(true) + $dropdown.outerWidth(true)
        });
        $input.animate({"width": initWidth});
        $clrInput.show();
    }

    function focusOut() {
        stretched = false;
        $input.off("focusout", focusOut);

        $container.animate({
            "margin-left": 0,
            "width": $window.width()
        }, function() {
            // clear css properties afterwards
            $container.css({"margin-left": "", "width": ""});
        });
        $input.animate({"width": squeezeWidth});
        $clrInput.hide();
    }

    resizeWindow();





    // temporary! for testing only
    $input.on("focus", function() {
        $("#autocomplete").toggleClass("is-open");
    });
    $input.on("focusout", function() {
        $("#autocomplete").toggleClass("is-open");
    })

}(jQuery, window, document);