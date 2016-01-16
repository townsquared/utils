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
          if($element.parents('.reveal-modal').length) {
            var targetWindow = $element.parents('.reveal-modal .content');
            targetWindow.animate({ scrollTop: $element.offset().top - targetWindow.offset().top + targetWindow.scrollTop() }, {
              speed: speed,
              complete: function complete() {
                // Focus element (if input)
                $element[0].focus();
              }
            });
          }
          else {
            var offset = $element.offset().top;
            $('body').animate({ scrollTop: offset }, {
              speed: speed,
              complete: function complete() {
                // Focus element (if input)
                $element[0].focus();
              }
            });
          }
        });
      });
    }
  };
});
