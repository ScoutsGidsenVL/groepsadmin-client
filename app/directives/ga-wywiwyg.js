(function () {
  'use strict';

  angular
    .module('ga.wysiwyg', [])
    .directive('wysiwyg', wysiwyg);

  function wysiwyg() {
    return {
      restrict: 'E',
      templateUrl: 'partials/wysiwyg.html',
      replace: true,
      scope: {
        menuItems: '=?'
      },
      controller: wysiwygController
    };
  }

  wysiwygController.$inject = ['$scope'];

  function wysiwygController($scope) {
    $scope.menuItems = $scope.menuItems || [];

    $scope.tinymceOptions = {
      plugins: [
        'advlist autolink lists link image charmap print preview hr anchor pagebreak',
        'searchreplace wordcount visualblocks visualchars code fullscreen',
        'insertdatetime media nonbreaking save table contextmenu',
        'template paste textcolor colorpicker textpattern imagetools codesample fullscreen'
      ],
      height: 400,
      menubar: false,
      toolbar: 'undo redo | bold italic underline strikethrough | fontselect |forecolor backcolor | bullist numlist | alignleft aligncenter alignright | table | code | customDrpdwn | media | preview | fullscreen',
      relative_urls : false,
      remove_script_host : true,
      document_base_url : "https://groepsadmin.scoutsengidsenvlaanderen.be",
      setup: function (editor) {
        editor.addButton('customDrpdwn', {
          text: 'Veld invoegen',
          type: 'menubutton',
          icon: false,
          menu: $scope.menuItems,
          onselect: function (e) {
            editor.insertContent('[' + e.target.state.data.text + ']');
          }
        });
      }
    };
  }

})();
