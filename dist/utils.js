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
      tsTooltipShow: '=',
      tsTooltipClass: '@'
    },
    controller: function controller($scope) {
      this.setTranscluded = function (transclude) {
        $scope.transcludedContentFn = transclude;
      };
    },
    link: function link($scope, $element, $attr) {
      var origOffset;
      var ARROW_SIZE = 10;
      var template = $templateCache.get('templates/tsTooltip.html');
      var direction = $scope.tsTooltipDirection || 'right';
      var eventType = $scope.tsTooltipEvent || 'mouseenter';
      var isVisible = false;

      var tooltipContainer = $compile(template)($scope);

      var newTooltip = tooltipContainer.children()[0];

      // Fix the position of the tooltip if the height of the tooltip itself changes.  This is necessary for dynamic
      // content when absolutely positioning the tooltips.  Tooltips must be absolutely positioned in order to be
      // separated from having their width restricted by their parent element or having a static width and since the
      // total size of the tooltip is needed to compute the offset for it's top left corner we must watch the height.
      $scope.$watch(function () {
        return newTooltip.clientHeight;
      }, positionTooltip);

      $scope.tooltipMain = tooltipContainer.find("#tooltipMain");
      $scope.tooltipMain.addClass(direction);

      document.body.insertBefore(tooltipContainer[0], document.body.childNodes[0]);

      if ($scope.transcludedContentFn) {
        $scope.transcludedContentFn(function (clone, scope) {
          $scope.tooltipMain.append(clone);
          $scope.tooltipScope = scope;
        });
      }

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

      tooltipContainer.remove();

      function positionTooltip() {
        if (!origOffset) origOffset = offset(newTooltip);

        var elementOffset = offset($element[0]);
        if (elementOffset === undefined || origOffset == undefined) {
          return;
        }
        var leftCommon = elementOffset.left - origOffset.left,
            topCommon = elementOffset.top - origOffset.top;

        //Sets the common top for left and right, or common left for top and bottom
        switch (direction) {
          case 'right':
          case 'left':
            newTooltip.style.top = topCommon + $element[0].offsetHeight - $scope.tooltipMain[0].offsetHeight / 2 - ARROW_SIZE + 'px';
            break;
          case 'top':
          case 'bottom':
            newTooltip.style.left = leftCommon + $element[0].offsetWidth / 2 - $scope.tooltipMain[0].offsetWidth / 2 + 'px';
            break;
        }

        //Sets the specific left or top values for each direction
        switch (direction) {
          case 'right':
            newTooltip.style.left = leftCommon + $element[0].offsetWidth + ARROW_SIZE + 'px';
            break;
          case 'left':
            newTooltip.style.left = leftCommon - $scope.tooltipMain[0].offsetWidth - ARROW_SIZE + 'px';
            break;
          case 'top':
            newTooltip.style.top = topCommon - $scope.tooltipMain[0].offsetHeight - ARROW_SIZE + 'px';
            break;
          case 'bottom':
            newTooltip.style.top = topCommon + $element[0].offsetHeight + ARROW_SIZE + 'px';
            break;
        }
      }

      function makeVisible() {
        if (!isVisible) {
          document.body.insertBefore(tooltipContainer[0], document.body.childNodes[0]);
          positionTooltip();
          isVisible = true;
        }
      }

      function makeInvisible() {
        if (isVisible) {
          isVisible = false;
          tooltipContainer.remove();
        }
      }

      function toggleVisibility() {
        isVisible ? makeInvisible() : makeVisible();
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

      //Clean up the tooltip and destroy the scope for the transcluded element
      $scope.$on('$destroy', function () {
        if ($scope.tooltipScope) $scope.tooltipScope.$destroy();
        newTooltip.remove();
      });
    }
  };
}).directive('tsTooltipContent', function () {
  return {
    restrict: 'E',
    require: '^tsTooltip',
    transclude: 'element',
    link: function link(scope, iElem, iAttr, tooltipController, transclude) {
      tooltipController.setTranscluded(transclude);
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
 * ts-dropwdown - Shows a drop down list of items that can be selected from.
 *
 * @note depends on jQuery
 *
 * @example
 *
 *
 */

'use strict';
angular.module('ts.utils').directive('tsDropDown', function ($templateCache, $compile) {

  return {
    restrict: 'A',
    require: 'ngModel',
    //transclude: {
    //  'listItem':'tsListItem',
    //  'placeholder':'tsPlaceholder'
    //},
    scope: {
      tsDropDownTemplate: '@',
      tsDropDown: '=',
      tsDropDownWidth: '=',
      tsItemClick: '&'
    },
    controller: function controller($scope) {
      this.setPlaceholder = function (transclude) {
        $scope.placeholderTransclude = transclude;
      };
      this.setListItem = function (transclude) {
        $scope.listItemTransclude = transclude;
      };
    },

    link: function link($scope, $element, $attr, ngModelCtrl) {
      var selectedIndex = 0,
          ae = angular.element,
          //shorthand
      placeholderElement = undefined,
          placeholderScope = undefined,
          selectedItem = undefined;

      //Makes the element focusable with the keyboard
      $element.attr('tabindex', '0');

      $scope.direction = 'down';
      $scope.dropDownOpen = false;

      var template = $templateCache.get('templates/tsDropDown.html');
      var container = $compile(template)($scope); //Container for all the drop down related parts
      $element.append(container);

      var textDisplayElement = ae(container.children()[0]),
          //First child of the container is the place to put the placeholder or selected item
      dropDownArrow = ae(container.children()[1]),
          //Second child is the drop down arrow/button
      dropDownListContainer = ae(container.children()[2]),
          //Third child is the list container
      dropDownUnorderedList = ae($element[0].querySelector('ul'));

      $element.on('keydown', function (event) {
        switch (event.keyCode) {
          case 13:
            //enter
            updateSelected($scope.highlightedItem);
            toggleDropDown();
            event.preventDefault();
            break;

          case 38:
            //up

            // If list isn't open, open it
            if (!$scope.dropDownOpen) {
              toggleDropDown();
            } else {
              // otherwise if the list is open move up in the highlights.
              $scope.$apply(moveHighlightUp);
            }
            event.preventDefault();
            break;

          case 40:
            //down

            //If list isn't open, open it
            if (!$scope.dropDownOpen) {
              toggleDropDown();
            } else {
              $scope.$apply(moveHighlightDown);
            }
            event.preventDefault();
            break;
        }
      });

      function moveHighlightDown() {
        while ($scope.tsDropDown.length - 1 > selectedIndex) {
          selectedIndex++;
          if (!$scope.tsDropDown[selectedIndex].hasOwnProperty('interactive') || $scope.tsDropDown[selectedIndex].interactive === true) break;
        }
        $scope.highlightedItem = $scope.tsDropDown[selectedIndex];
      }

      function moveHighlightUp() {
        while (0 < selectedIndex) {
          selectedIndex--;
          if (!$scope.tsDropDown[selectedIndex].hasOwnProperty('interactive') || $scope.tsDropDown[selectedIndex].interactive === true) break;
        }
        $scope.highlightedItem = $scope.tsDropDown[selectedIndex];
      }

      $scope.$watch('tsDropDown', function () {
        if (angular.isArray($scope.tsDropDown)) {
          $scope.tsDropDown.forEach(function (dropDownItem) {

            if ($scope.listItemTransclude) {
              $scope.listItemTransclude($scope.$new(), function (clone, scope) {
                scope.item = dropDownItem;

                var listItem = ae(document.createElement('li'));
                listItem.attr('ng-class', '{"highlighted":highlightedItem==item}');
                var compiledListItem = $compile(listItem)(scope);
                compiledListItem.append(clone[0]);

                //Adds event handlers if the item isn't explicitly marked non interactive
                if (!dropDownItem.hasOwnProperty('interactive') || dropDownItem.interactive === true) {
                  compiledListItem.on('click', function () {
                    updateSelected(dropDownItem);
                    if ($scope.tsItemClick) $scope.tsItemClick({ item: dropDownItem });
                    $scope.$apply(toggleDropDown);
                  });
                  compiledListItem.on('mouseenter', function () {
                    $scope.highlightedItem = scope.item;
                    selectedIndex = $scope.tsDropDown.indexOf(scope.item);
                    $scope.$apply();
                  });
                }

                compiledListItem[0].style.width = (scope.tsDropDownWidth || textDisplayElement[0].offsetWidth) + 'px';

                dropDownUnorderedList.append(compiledListItem);
              });
            }
          });
        }
      });

      $scope.$watch('tsDropDownWidth', function (newVal) {
        if (newVal) {
          for (var i = 0; i < dropDownUnorderedList.children().length; i++) {
            var child = dropDownUnorderedList.children()[i];
            child.style.width = newVal + 'px';
          }
        }
      });

      //Initialize to first item is highlighted
      $scope.highlightedItem = $scope.tsDropDown[selectedIndex];

      if ($scope.placeholderTransclude) {
        $scope.placeholderTransclude($scope.$new(), function (clone, scope) {
          placeholderScope = scope;
          placeholderElement = clone[0];

          textDisplayElement.append(clone[0]);
        });
      }

      // Take the height of the window divided by 2 to get the middle of the window
      // if the element's middle is lower than the middle of the window then open upward
      // otherwise open downward
      function toggleDropDown() {
        var rect = $element[0].getBoundingClientRect();
        var middleOfWindow = window.innerHeight / 2;
        var middleOfElement = rect.top + rect.height / 2;

        if (middleOfElement > middleOfWindow) {
          $scope.direction = 'up';

          dropDownListContainer[0].style.bottom = rect.height + 'px';
          dropDownListContainer[0].style.top = 'auto';
        } else {
          dropDownListContainer[0].style.top = rect.height + 'px';
          dropDownListContainer[0].style.bottom = 'auto';
          $scope.direction = 'down';
        }

        $scope.dropDownOpen = !$scope.dropDownOpen;
      }

      textDisplayElement.on('click', function () {
        $scope.$apply(toggleDropDown);
      });
      dropDownArrow.on('click', function () {
        $scope.$apply(toggleDropDown);
      });

      if (!ngModelCtrl) return; // do nothing if no ng-model

      function updateSelected(selectedValue) {
        placeholderScope.selectedItem = selectedItem = selectedValue;
        $scope.$evalAsync(read);
      }

      $element.on('blur', function () {
        $scope.$apply(function () {
          $scope.dropDownOpen = false;
        });
      });

      // Specify how UI should be updated when the model changes from outside
      ngModelCtrl.$render = function () {
        //update selected element text
        updateSelected(ngModelCtrl.$viewValue || '');
      };

      // Write data to the model
      function read() {
        ngModelCtrl.$setViewValue(selectedItem);
      }
    }

  };
}).directive('tsPlaceholder', function () {
  return {
    restrict: 'E',
    require: '^tsDropDown',
    transclude: 'element',
    link: function link(scope, iElem, iAttr, dropDownController, transclude) {
      dropDownController.setPlaceholder(transclude);
    }
  };
}).directive('tsListItem', function () {
  return {
    restrict: 'E',
    require: '^tsDropDown',
    transclude: 'element',
    link: function link(scope, iElem, iAttr, dropDownController, transclude) {
      dropDownController.setListItem(transclude);
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
    $templateCache.put('templates/tsTooltip.html', '<div class="ts-tooltip-container {{::tsTooltipClass}}">\n' + '  <div class="arrow-box-container">\n' + '    <div id="tooltipMain" class="ts-tooltip-main">\n' + '      {{tsTooltip}}\n' + '    </div>\n' + '  </div>\n' + '</div>\n' + '');
  }]);
})();
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
    $templateCache.put('templates/tsDropDown.html', '<div class="drop-down-container">\n' + '  <div class="selected-item-container">\n' + '  </div><div class="arrow-container" ng-class="{\'arrow-default\':!dropDownOpen, \'arrow-open\':dropDownOpen}">\n' + '  </div>\n' + '  <div ng-show="dropDownOpen"\n' + '       class="drop-down-list-container">\n' + '    <ul>\n' + '    </ul>\n' + '  </div>\n' + '</div>');
  }]);
})();
//# sourceMappingURL=utils.js.map
