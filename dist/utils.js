angular.module('ts.utils', []);

/**
 * @TODO remove in liue of ui-utils
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ui-event
 * Allows $event object and $params object to be passed
 *
 * @example <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * @example <input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 *
 * @param ui-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
angular.module('ts.utils').directive('uiEvent', function ($parse) {
    return {
        priority: 100,
        link: function ($scope, $elm, $attrs) {
            var events = $scope.$eval($attrs.uiEvent);
            angular.forEach(events, function (uiEvent, eventName) {
                var fn = $parse(uiEvent);
                $elm.bind(eventName, function (evt) {
                    var params = Array.prototype.slice.call(arguments);
                    //Take out first paramater (event object);
                    params = params.splice(1);
                    fn($scope, {$event: evt, $params: params});
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            });
        }
    };
});


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

/**
 * autoGrow - Increases height of textarea while typing
 *
 * @note use with min-height, max-height and box-sizing:border-box
 *
 * @example
 * 	<textarea auto-grow></textarea>
 */
 angular.module('ts.utils').directive('autoGrow', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      function grow() {
        $element[0].style.height = 0; // autoshrink - need accurate scrollHeight
        $element[0].style.height = $element[0].scrollHeight + 'px';
      }
      $element.on('input', grow);
      $timeout(grow, true);
    }
  }
});
