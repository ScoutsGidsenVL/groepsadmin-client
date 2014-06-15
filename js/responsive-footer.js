!function($, window, document, undefined) {

  var ResponsiveFooter = function (element) {
    var $el = $(element).width('100%'),
        i = 0;
    
    $el.origin = $el.children().clone();
    
    $el.childWidths = [];
    $el.children().each(function() {
      $el.childWidths[i] = Math.ceil($(this).width());
      ++i;
    });
    
    $el.optimize = function() {
      var totalWidth = this.width() - 43, // 43: necessary width for extra button
        html = '', w = 0, i = 0, list = [];

      // Check if all the buttons fit in the bar, remove the ones that don't
      this.origin.each(function() {
        w += $el.childWidths[i];
        if(w > totalWidth) return false;
        html += this.outerHTML;
        ++i;
      });
      list = this.origin.slice(i);

      // Create the dropdown-menu
      if(list.length) {
        html += '<li class=\"dropdown dropup pull-right\" title=\"Meer\"><a class=\"dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"caret\"></span></a>';
        html += '<ul class=\"dropdown-menu pull-right\">';
        list.each(function() {
          html += this.outerHTML;
        });
        html += '</ul></li>';

        this.html(html);
      } else {
        // Restore the original bar
        this.html(this.origin);
      }
    }
    
    $(window).resize( $.throttle(250, function() {
      $el.optimize();
    }));
    
    $el.optimize();
  }

  // RESPONSIVE FOOTER DEFINITION
  // ==========================

  $.fn.responsivefooter = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('responsive')

      if (!data) $this.data('responsive', (data = new ResponsiveFooter(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.responsivefooter.Constructor = ResponsiveFooter

  $(window).on('load', function () {
    $('.responsivefooter').each(function () {
      var $menu = $(this)
      $menu.responsivefooter($menu.data())
    })
  })

}(jQuery, window, document);