!function($, window, document, undefined) {

  var ResponsiveTable = function (element) {
    /*
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
      

      //  $btn.on('click', function() {
      //    $dropdown.toggleClass('open');
      //  })
    }*/


    var $table = $(element);
      //$rows = $table.find('.collapse');

    $table.find('.t-caret').on('click', function() {
      $(this).parent().toggleClass('t-open');
    });
  }

  // RESPONSIVE TABLE DEFINITION
  // ==========================

  $.fn.responsivetable = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('table')

      if (!data) $this.data('table', (data = new ResponsiveTable(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.responsivetable.Constructor = ResponsiveTable

  $(window).on('load', function () {
    $('#members').each(function () {
      var $menu = $(this)
      $menu.responsivetable($menu.data())
    })
  })

}(jQuery, window, document);