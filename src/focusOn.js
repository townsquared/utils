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
 angular.module('ts.utils').directive('focusOn', function(){
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
