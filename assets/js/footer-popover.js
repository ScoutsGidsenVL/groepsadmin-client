(function($, window, document, undefined) {

    var methods = {
        init : function( options ) {

            return this.each(function(){
                var $this = $(this),
                    totalWidth = $this.width() - 39, // 39: necessary width for extra button
                    w = 0, i = 0, list = [];

                // Check if all the buttons fit in the bar, remove the ones that don't
                $this.children().each(function() {
                    w += this.offsetWidth;
                    if(w > totalWidth) return false;
                    ++i;
                });
                list = $this.children().slice(i).remove();

                // Create the dropdown-menu
                if(list.length) {
                    var $btn = $('<button class=\"btn more\" title=\"Meer\"><i class=\"icn-more\"></i>...</button>'),
                        $dropdown = $('<div class=\"dropup pull-right\"></div>'),
                        html = '<div class=\"dropdown-menu\">';
                    list.each(function() {
                        html += this.outerHTML;
                    });
                    html += '</div>';

                    $dropdown.html(html);
                    $this.append($btn, $dropdown);
                    //$btn.dropdown();
                    $btn.on('click', function() {
                        $dropdown.toggleClass('is-open');
                    });
                }
            });

        },
        update : function( content ) {
            // ...
        }
    };

    $.fn.popover = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on Zepto.popover' );
        }

    };

})(jQuery, window, document);