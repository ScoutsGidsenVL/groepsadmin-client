(function () {
  'use strict';

  angular
    .module('ga.feedbackcontroller', ['ui.bootstrap'])
    .controller('FeedbackController', FeedbackController);

  FeedbackController.$inject = [];

  function FeedbackController() {

    $(function() {
      window.app.positionBody();
    });
  };
})();
