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
 *
 *<button
 *        ts-tooltip-event="click"                              // Options are click or mouseover
 *        ts-tooltip="Something that shows up in there"         // The text to show in the tooltip
 *        ts-tooltip-direction="bottom"                         // The direction the tooltip pops up
 *        ts-tooltip-show="someModel.someBoolean"               // A boolean if set will use this instead of events
 *        >
 *   Bottom Click Me
 * </button>
 *
 */

'use strict';

angular.module('ts.utils').directive('tsTooltip', function ($templateCache, $compile, $window) {

  return {
    restrict: 'A',
    scope: {
      tsTooltip: '@',
      tsTooltipDirection: '@',
      tsTooltipEvent: '@',
      tsTooltipShow: '='
    },
    transclude: { content: '?tooltipContent' },
    link: function link($scope, $element, $attr, $ctrl, $transclude) {
      var ARROW_SIZE = 10;
      var template = $templateCache.get('templates/tsTooltip.html');
      var direction = $scope.tsTooltipDirection || 'right';
      var eventType = $scope.tsTooltipEvent || 'mouseenter';
      var isVisible = false;

      var newTooltip = $compile(template)($scope);
      newTooltip[0].style.visibility = 'hidden';

      var tooltipMain = newTooltip.find("#tooltipMain");
      tooltipMain.addClass(direction);

      // $element.after(newTooltip);
      document.body.insertBefore(newTooltip[0], document.body.childNodes[0]);

      // Puts back the original contents, we need to transclude to get compiled clones of the
      // child called tooltip-content if its present below.
      $transclude(function (clone, scope) {
        $element.append(clone);
      });

      // Allows for <tooltip-content></tooltip-content> to be specified inside the element a
      // tooltip applies to
      $transclude(function (clone, scope) {
        tooltipMain.append(clone);
      }, null, 'content');

      // Taken from jQuery so we don't have to directly depend on it for this
      // calculates the top left offsets for a given element.
      function offset(elem) {
        var docElem, win, rect, doc;

        if (!elem) {
          return;
        }

        rect = elem.getBoundingClientRect();

        // Make sure element is not hidden (display: none) or disconnected
        if (rect.width || rect.height || elem.getClientRects().length) {
          doc = elem.ownerDocument;
          win = $window;
          docElem = doc.documentElement;

          return {
            top: rect.top + win.pageYOffset - docElem.clientTop,
            left: rect.left + win.pageXOffset - docElem.clientLeft
          };
        }
      }

      var origOffset = offset(newTooltip[0]);

      function makeVisible() {
        if (!isVisible) {

          isVisible = true;

          newTooltip[0].style.visibility = 'visible';

          var elementOffset = offset($element[0]);

          //Sets the common top for left and right, or common left for top and bottom
          switch (direction) {
            case 'right':
            case 'left':
              newTooltip[0].style.top = elementOffset.top - origOffset.top + $element[0].offsetHeight - tooltipMain[0].offsetHeight / 2 - ARROW_SIZE + 'px';
              break;
            case 'top':
            case 'bottom':
              newTooltip[0].style.left = elementOffset.left - origOffset.left + $element[0].offsetWidth / 2 - tooltipMain[0].offsetWidth / 2 + 'px';
              break;
          }

          //Sets the specific left or top values for each direction
          switch (direction) {
            case 'right':
              newTooltip[0].style.left = elementOffset.left - origOffset.left + $element[0].offsetWidth + ARROW_SIZE + 'px';
              break;
            case 'left':
              newTooltip[0].style.left = elementOffset.left - origOffset.left - tooltipMain[0].offsetWidth - ARROW_SIZE + 'px';
              break;
            case 'top':
              newTooltip[0].style.top = elementOffset.top - origOffset.top - tooltipMain[0].offsetHeight - ARROW_SIZE + 'px';
              break;
            case 'bottom':
              newTooltip[0].style.top = elementOffset.top - origOffset.top + $element[0].offsetHeight + ARROW_SIZE + 'px';
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

      if ($attr.tsTooltipShow === undefined) {
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

// .directive('tooltipContent',function() {
//   return {
//     restrict:'E',
//     compile:function(tElement,tAttrs) {

//     }
//   }
// })

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
            if ((focusOnConfig.autoCenter || focusOnConfig.autoCenterInputs && $element[0].tagName.toUpperCase() == 'INPUT' || focusOnConfig.autoCenterInputs && $element[0].tagName.toUpperCase() == 'TEXTAREA') && $attrs.focusOnAutoCenter === undefined || $attrs.focusOnAutoCenter && $attrs.focusOnAutoCenter == 'true') {
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
  var focusConfig = {
    offset: 0,
    autoCenter: false,
    autoCenterInputs: false
  };

  this.autoCenter = function (value) {
    focusConfig.autoCenter = value;
  };

  this.autoCenterInputs = function (value) {
    focusConfig.autoCenterInputs = value;
  };

  this.offset = function (value) {
    focusConfig.offset = value;
  };

  this.$get = function () {
    return focusConfig;
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
'use strict';

(function (module) {
  try {
    module = angular.module('ts.utils');
  } catch (e) {
    module = angular.module('ts.utils', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('templates/tsTooltip.html', '<div class="ts-tooltip-container">\n' + '  <div class="arrow-box-container">\n' + '    <div id="tooltipMain" class="ts-tooltip-main">\n' + '      {{tsTooltip}}\n' + '    </div>\n' + '  </div>\n' + '</div>');
  }]);
})();
//# sourceMappingURL=utils.js.map
