var app = angular.module('ts.utils', []);

/**
 * focusOn - Focuses an input on scope event
 *
 * @example
 *   <input focus-on="someEventName">
 *   ...
 *   $scope.$broadcast('someEventName')
 *
 */
app.directive('focusOn', function(){
  return {
    link: function($scope, $element, $attrs) {
      $scope.$on($attrs.focusOn, function(){
        $element[0].focus();
      });
    }
  };
});
