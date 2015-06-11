
/**
 * scrollOn - $broadcast()/$emit() a $scope event with the location to trigger scrolling
 *
 * @example
 *   <ul scroll-on="someEventName" style="overflow: auto">...</ul>
 *   ...
 *   var location = 'bottom';
 *   $scope.$broadcast('someEventName', location)
 *
 * @param location {'top'|'bottom'|offset} must be passed as event data
 */
angular.module('ts.utils').directive('scrollOn', function($timeout) {
  return {
    link: {
      pre: function($scope, $element, $attrs) {
        $scope.$on($attrs.scrollOn, function(event, location){
          // let updates render
          $timeout(function(){
            if (location === 'bottom') {
              $element[0].scrollTop = $element[0].scrollHeight;
            }
            else if (location === 'top') {
              $element[0].scrollTop = 0;
            }
            else {
              $element[0].scrollTop = location;
            }
          }, true);
        });
      }
    }
  };
});
