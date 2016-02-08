'use strict';

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
'use strict';

angular.module('ts.utils').directive('uiEvent', function ($parse) {
    return {
        priority: 100,
        link: function link($scope, $elm, $attrs) {
            var events = $scope.$eval($attrs.uiEvent);
            angular.forEach(events, function (uiEvent, eventName) {
                var fn = $parse(uiEvent);
                $elm.bind(eventName, function (evt) {
                    var params = Array.prototype.slice.call(arguments);
                    //Take out first paramater (event object);
                    params = params.splice(1);
                    fn($scope, { $event: evt, $params: params });
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            });
        }
    };
});
/**
 * truncate - Truncates a string by a specified number of words
 *
 * @example
 * 	<p>
 * 		{{::post.body | truncate : 35}}
 * 		<a ng-if="::post.body.split(' ').length>35">Read More</a>
 * 	</p>
 *
 * @param {string} value  The string to be truncated
 * @param {int} [wordLimit] The number of words to truncate at. If falsey, doesn't truncate.
 * @param {string} [ellipses] The string to use as an ellipses. Default: '…' (&hellip;)
 */
'use strict';

angular.module('ts.utils').filter('tsTruncate', function () {
  return function (value, wordLimit) {
    var ellipses = arguments.length <= 2 || arguments[2] === undefined ? '…' : arguments[2];

    if (!value || !angular.isNumber(wordLimit)) return value;

    var words = value.split(' ');

    if (words.length > wordLimit) {
      value = words.slice(0, wordLimit).join(' ');

      if (ellipses) value += ellipses;
    }

    return value;
  };
});
/**
 * ts-tooltip - Shows a tooltip with an arrow pointing to the element the directive is applied to.
 *
 * @note depends on jQuery
 *
 * @example
 *   <input ts-tooltip="Some message here will be compiled and linked against elements scope" />
 *
 */

'use strict';

angular.module('ts.utils').directive('tsTooltip', function ($templateCache, $compile) {

  return {
    restrict: 'A',
    scope: {
      tsTooltip: '@',
      tsTooltipDirection: '@',
      tsTooltipEvent: '@',
      tsTooltipShow: '='
    },
    link: function link($scope, $element, $attrs) {
      var ARROW_SIZE = 10;
      var template = $templateCache.get('templates/tsTooltip.html');
      var direction = $scope.tsTooltipDirection || 'right';
      var eventType = $scope.tsTooltipEvent || 'mouseenter';
      var isVisible = false;

      var newTooltip = $compile(template)($scope);
      newTooltip[0].style.visibility = 'hidden';

      var tooltipMain = newTooltip.find("#tooltipMain");
      tooltipMain.addClass(direction);

      console.log(tooltipMain);

      $element.after(newTooltip);

      function makeVisible() {
        if (!isVisible) {

          isVisible = true;

          newTooltip[0].style.visibility = 'visible';

          switch (direction) {
            case 'right':
              newTooltip[0].style.left = ARROW_SIZE + 'px';
              newTooltip[0].style.top = -tooltipMain[0].offsetHeight / 2 + 'px';
              break;
            case 'left':
              newTooltip[0].style.left = -$element[0].offsetWidth - tooltipMain[0].offsetWidth - ARROW_SIZE + 'px';
              newTooltip[0].style.top = -tooltipMain[0].offsetHeight / 2 + 'px';
              break;
            case 'top':
              newTooltip[0].style.left = -$element[0].offsetWidth / 2 - tooltipMain[0].offsetWidth / 2 + 'px';
              newTooltip[0].style.top = -$element[0].offsetHeight / 2 - tooltipMain[0].offsetHeight - ARROW_SIZE + 'px';
              break;
            case 'bottom':
              newTooltip[0].style.left = -$element[0].offsetWidth / 2 - tooltipMain[0].offsetWidth / 2 + 'px';
              newTooltip[0].style.top = $element[0].offsetHeight / 2 + 'px';
              break;
          }
        }
      }

      function makeInvisible() {
        if (isVisible) {
          isVisible = false;
          newTooltip[0].style.visibility = 'hidden';
        }
      }

      function toggleVisibility() {
        if (isVisible) {
          makeInvisible();
        } else {
          makeVisible();
        }
      }

      if ($attrs.tsTooltipShow === undefined) {
        switch (eventType) {
          case 'mouseenter':
            $element.on('mouseenter', makeVisible);
            $element.on('mouseleave', makeInvisible);
            break;
          case 'click':
            $element.on('click', toggleVisibility);
            break;
        }
      } else {
        $scope.$watch('tsTooltipShow', function (newVal, oldVal) {
          if (newVal) {
            makeVisible();
          } else {
            makeInvisible();
          }
        });
      }
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
'use strict';

angular.module('ts.utils').directive('scrollOn', function ($timeout) {
  return {
    link: {
      pre: function pre($scope, $element, $attrs) {
        $scope.$on($attrs.scrollOn, function (event, location) {
          // let updates render
          $timeout(function () {
            if (location === 'bottom') {
              $element[0].scrollTop = $element[0].scrollHeight;
            } else if (location === 'top') {
              $element[0].scrollTop = 0;
            } else {
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
 *   focusOnConfigProvider - can be injected into a .config(function(focusOnConfigProvider){}) block to configure the
 *   app wide settings for the focusOn directive
 *
 *   Settings include:
 *      offset - number of pixels to offset the scroll to for a header or other info that appears above the element you
 *      want to scroll to the top of the screen.  The offset is subtracted from the computed scroll position
 *
 *      autoCenter - boolean if true will use the element height and document body height to scroll the element to the
 *      center of the screen instead of the top
 *
 *   App wide settings can be overridden using attributes along with the focus-on directive.  The attributes for the
 *   offset and autoCenter are focus-on-offset and focus-on-auto-center respectively.
 *
 */
'use strict';

angular.module('ts.utils').directive('focusOn', function ($window, focusOnConfig) {
  return {
    link: function link($scope, $element, $attrs) {
      var listener = angular.noop;
      $attrs.$observe('focusOn', function (newVal) {
        // Stop listening to old event name
        listener();
        // Listen to new event name
        listener = $scope.$on(newVal, function (speed) {
          speed = speed || 1000;
          // Center element on screen
          if ($element.parents('.reveal-modal').length) {
            var targetWindow = $element.parents('.reveal-modal .content');
            targetWindow.animate({
              scrollTop: $element.offset().top - targetWindow.offset().top + targetWindow.scrollTop()
            }, {
              speed: speed,
              complete: function complete() {
                // Focus element (if input)
                $element[0].focus();
              }
            });
          } else {
            var offset = $element.offset().top;

            // Use provider configured offset
            var extraOffset = focusOnConfig.offset;

            // If attribute is set override provider configured offset
            if ($attrs.focusOnOffset !== undefined) {
              extraOffset = parseInt($attrs.focusOnOffset);
            }

            // Check if provider or attribute set autoCenter/auto-center to true if so use offset/2 ignores the extra
            // offset in this case
            if (focusOnConfig.autoCenter && $attrs.focusOnAutoCenter === undefined || $attrs.focusOnAutoCenter && $attrs.focusOnAutoCenter == 'true') {
              offset = offset - window.innerHeight / 2 - $element[0].clientHeight / 2;
            } else {
              offset = offset - extraOffset;
            }

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
}).provider('focusOnConfig', function () {
  var _offset = 0;
  var _autoCenter = false;

  this.autoCenter = function (value) {
    _autoCenter = value;
  };

  this.offset = function (value) {
    _offset = value;
  };

  this.$get = function () {
    return {
      offset: _offset,
      autoCenter: _autoCenter
    };
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
'use strict';

angular.module('ts.utils').directive('autoGrow', function ($timeout) {
  return {
    restrict: 'A',
    link: function link($scope, $element, $attrs) {
      function grow() {
        $element[0].style.height = 0; // autoshrink - need accurate scrollHeight
        $element[0].style.height = $element[0].scrollHeight + 'px';
      }
      $element.on('input', grow);
      $timeout(grow, true);
    }
  };
});
//# sourceMappingURL=utils.js.map
