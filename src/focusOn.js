/**
 * focusOn - Focuses an input on scope event
 *
 * @note depends on jQuery
 *
 * @example
 *   <input focus-on="someEventName">
 *   or
 *   <input focus-on="focus-row-{{$index}}">
 *   or
 *   <p focus-on="anotherEvent"></p>
 *   ...
 *   $scope.$broadcast('someEventName');
 *   $scope.$broadcast('focus-row-2');
 *   $scope.$broadcast('anotherEvent');
 *
 */
 angular.module('ts.utils').directive('focusOn', function($window){
  return {
    link: function($scope, $element, $attrs) {
      var listener = angular.noop;
      $attrs.$observe('focusOn', function(newVal){
        // Stop listening to old event name
        listener();
        // Listen to new event name
        listener = $scope.$on(newVal, function(speed = 1000){
          // Center element on screen
          var offset = $element.offset().top - ( $window.innerHeight / 2 ) - ( $element.height() / 2 );
          $('body').animate({ scrollTop: offset }, {
            speed: speed,
            complete: function() {
              // Focus element (if input)
              $element[0].focus();
            }
          });
        });
      });
    }
  };
});
