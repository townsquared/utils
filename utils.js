var app = angular.module('ts.utils', []);

/**
 * focusOn - Focuses an input on scope event
 *
 * @example
 *   <input focus-on="someEventName">
 *   or
 *   <input focus-on="focus-row-{{$index}}">
 *   ...
 *   $scope.$broadcast('someEventName')
 *
 */
app.directive('focusOn', function(){
  return {
    link: function($scope, $element, $attrs) {
      var listener = angular.noop;
      $attrs.$observe('focusOn', function(newVal){
        // Stop listening to old event name
        listener();
        // Listen to new event name
        listener = $scope.$on(newVal, function(){
          $element[0].focus();
        });
      });
    }
  };
});

/**
 * autoGrow - Increases height of textarea while typing
 *
 * @note use with min-height and box-sizing:border-box
 *
 * @example
 * 	<textarea auto-grow></textarea>
 */
app.directive('autoGrow', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      function grow() {
        $element[0].style.height = $element[0].scrollHeight + 'px';
      }
      $element.on('keyup', grow);
      $timeout(grow, true);
    }
  }
});
