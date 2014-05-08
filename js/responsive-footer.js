!function($, window, document, undefined) {

  var ResponsiveFooter = function (element) {
    var $el = $(element).width('100%');
    var totalWidth = $el.width() - 43, // 43: necessary width for extra button
      w = 0, i = 0, list = [];

    // Check if all the buttons fit in the bar, remove the ones that don't
    $el.children().each(function() {
      w += Math.ceil($(this).width());
      if(w > totalWidth) return false;
      ++i;
    });
    list = $el.children().slice(i).remove();

    // Create the dropdown-menu
    if(list.length) {
      var html = '<li class=\"dropdown dropup pull-right\" title=\"Meer\"><a href=\"\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"caret\"></span></a>';
      html += '<ul class=\"dropdown-menu pull-right\">';
      list.each(function() {
        html += this.outerHTML;
      });
      html += '</ul></li>';

      $el.append(html);
        //$btn.dropdown();
      /*  $btn.on('click', function() {
          $dropdown.toggleClass('open');
        })*/
    }
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