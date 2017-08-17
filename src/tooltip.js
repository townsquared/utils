/**
 * ts-tooltip - Shows a tooltip with an arrow pointing to the element the directive is applied to.
 *
 * @note depends on jQuery
 *
 * @example
 *
 *<button
 *        ts-tooltip="Something that shows up in there"         // The text to show in the tooltip
 *        ts-tooltip-direction="bottom"                         // The direction the tooltip pops up
 *        ts-tooltip-event="click"                              // Options are click or mouseover
 *        ts-tooltip-show="someModel.someBoolean"               // A boolean if set will use this instead of events
 *        ts-tooltip-id="String"                                // A string used to identify the tooltip
 *        ts-tooltip-class="someClass"                          // Adds class to tooltip container
 *        ts-tooltip-content-hover="someModel.someBoolean"      // A boolean if set will allow users to
 *        ts-tooltip-show-close="someModel.someBoolean"         // A boolean to show close button
 *        ts-tooltip-close-callback="someFunction"              // Event Handler when closed is clicked
 *        ts-tooltip-track="someClass"                          // Tracks height and update if changed
 *        ts-tooltip-margin="Integer"                           // Integer value to provide margin between tooltip and element
 *        ts-tooltip-button="Text"                              // Text for a button
 *        ts-tooltip-button-clicked-callback="someFunction"     // Event Handler when button is clicked
 *        >
 *   Bottom Click Me
 * </button>
 *
 */

'use strict';

angular.module('ts.utils')

  .directive('tsTooltip', function($templateCache, $timeout, $compile, $window){

    return {
      restrict:'A',
      scope:{
        tsTooltip:'@',
        tsTooltipDirection:'@',
        tsTooltipEvent:'@',
        tsTooltipShow:'=',
        tsTooltipId: '@',
        tsTooltipClass: '@',
        tsTooltipContentHover: '@',
        tsTooltipShowClose: '@',
        tsTooltipCloseCallback: '&',
        tsTooltipTrack: '@',
        tsTooltipMargin: '@',
        tsTooltipButton: '@',
        tsTooltipButtonClickedCallback: '&',
      },
      controller: function($scope){
        $scope.tsTooltipMargin = $scope.tsTooltipMargin ? $scope.tsTooltipMargin : 0;
        this.setTranscluded = function(transclude){
          $scope.transcludedContentFn = transclude;
        }
      },
      link: function($scope, $element, $attr) {
        var origOffset;
        var ARROW_SIZE = 10;
        var template = $templateCache.get('templates/tsTooltip.html');
        var direction = $scope.tsTooltipDirection || 'right';
        var eventType = $scope.tsTooltipEvent || 'mouseenter';
        var isVisible = false;

        //Compile the container for the bindings on the CSS and text tooltip contents
        var tooltipContainer = $compile(template)($scope);

        //First DOM element child of the container, this is used for the position computations
        var arrowBoxContainer = tooltipContainer.children()[0];

        // Fix the position of the tooltip if the height of the tooltip itself changes.  This is necessary for dynamic
        // content when absolutely positioning the tooltips.  Tooltips must be absolutely positioned in order to be
        // separated from having their width restricted by their parent element or having a static width and since the
        // total size of the tooltip is needed to compute the offset for it's top left corner we must watch the height.
        $scope.$watch(function(){return arrowBoxContainer.clientHeight}, positionTooltip);

        //We need a good workaround for if the contents width changes to adjust to fix the position, less $watchers is ideal
        // $scope.$watch(function(){return arrowBoxContainer.clientWidth}, positionTooltip);

        // This is where we add the transcluded content will get placed it is one of the children of the container
        $scope.tooltipMain = tooltipContainer.find('#tooltipMain');
        $scope.tooltipMain.addClass(direction);

        function addTranscludedContent(){
          if($scope.transcludedContentFn){
            $scope.transcludedContentFn(function(clone, scope) {
              $scope.tooltipMain.empty();
              $scope.tooltipMain.append(clone);
              $scope.tooltipScope = scope;
            });
          }
        }

        // Taken from jQuery so we don't have to directly depend on it for this
        // calculates the top left offsets for a given element.
        function offset( elem ) {
          var docElem, win, rect, doc;

          if ( !elem ) {
            return;
          }

          rect = elem.getBoundingClientRect();

          // Make sure element is not hidden (display: none) or disconnected
          if ( rect.width || rect.height || elem.getClientRects().length ) {
            doc = elem.ownerDocument;
            win = $window;
            docElem = doc.documentElement;

            return {
              top: rect.top + win.pageYOffset - docElem.clientTop,
              left: rect.left + win.pageXOffset - docElem.clientLeft,
              right: docElem.clientWidth - rect.left
            };
          }
        }

        function positionTooltip(){
          if(!origOffset)
            origOffset = offset(arrowBoxContainer);
          var element = $element.children().length == 1 ? $element.children() : $element;
          let elementOffset = offset(element[0]);

          if(elementOffset === undefined || origOffset == undefined) {
            return;
          }
          let leftCommon = elementOffset.left-origOffset.left,
            topCommon = elementOffset.top-origOffset.top;

          //Sets the common top for left and right, or common left for top and bottom
          switch(direction){
            case 'right':
            case 'left':
              arrowBoxContainer.style.top = topCommon + element[0].offsetHeight - $scope.tooltipMain[0].offsetHeight / 2 - element.outerHeight() / 2 + 'px';
              break;
            case 'top':
            case 'bottom':
              arrowBoxContainer.style.left = leftCommon + element[0].offsetWidth / 2 - $scope.tooltipMain[0].offsetWidth / 2 + 'px';
              break;
          }

          //Sets the specific left or top values for each direction
          switch(direction) {
            case 'right':
              arrowBoxContainer.style.left = (leftCommon + element[0].offsetWidth + ARROW_SIZE + parseInt($scope.tsTooltipMargin)) + 'px';
              break;
            case 'left':
              arrowBoxContainer.style.right = (elementOffset.right + ARROW_SIZE + parseInt($scope.tsTooltipMargin)) + 'px';
              break;
            case 'top':
              arrowBoxContainer.style.top = (topCommon - $scope.tooltipMain[0].offsetHeight - ARROW_SIZE - parseInt($scope.tsTooltipMargin)) + 'px';
              break;
            case 'bottom':
              arrowBoxContainer.style.top = (topCommon + element[0].offsetHeight + ARROW_SIZE + parseInt($scope.tsTooltipMargin)) + 'px';
              break;
          }
        }

        function makeVisible() {
          if (!isVisible) {
            document.body.insertBefore(tooltipContainer[0], document.body.childNodes[0]);
            addTranscludedContent();
            positionTooltip();
            isVisible = true;
            if($scope.tsTooltipContentHover) {
              angular.element(tooltipContainer).on('mouseleave', function(){
                $scope.isHoveringContent = false;
                removeTooltip();
              });
              angular.element(tooltipContainer).on('mouseenter', function(){
                $scope.isHoveringContent = true;
              });
            } else {
              angular.element(tooltipContainer.find('.close')).on('click', function(){
                removeTooltip();
                if ($scope.tsTooltipCloseCallback) $scope.tsTooltipCloseCallback({id: $scope.tsTooltipId});
              });
            }
          }
        }

        function makeInvisible() {
          if (isVisible) {
            if($scope.tsTooltipContentHover) {
              $timeout( () => {
                if($scope.isHoveringContent)
                  return;
                else {
                  removeTooltip();
                }
              }, 250)
            } else {
              removeTooltip();
            }
          }
        }

        function removeTooltip() {
          isVisible = false;
          tooltipContainer.remove();
        }

        function toggleVisibility() {
          isVisible ? makeInvisible() : makeVisible();
        }

        if($attr.tsTooltipShow === undefined) {
          switch(eventType) {
            case 'mouseenter':
              $element.on('mouseenter', makeVisible);
              $element.on('mouseleave', makeInvisible);
              break;
            case 'click':
              $element.on('click', toggleVisibility);
              break;
            case 'hybrid':
              $element.on('mouseenter', makeVisible);
              $element.on('mouseleave', makeInvisible);
              $element.on('click', toggleVisibility);
              break;
          }
        }
        else{
          angular.element($window).on('resize', positionTooltip);

          if ($scope.tsTooltipTrack) {
            $scope.$watch(() => $($scope.tsTooltipTrack).height(),
              function (newValue, oldValue) {
                if (newValue != oldValue) positionTooltip();
              }
            );
          }

          $scope.$watch('tsTooltipShow',function(newVal, oldVal) {
            if(newVal) {
              // 250ms is an estimate to wait for the render of elements using ng-ifs
              $timeout(() => makeVisible(), 250);
            }
            else {
              makeInvisible();
            }
          })
        }

        $scope.onButtonClick = () => {
          if ($scope.tsTooltipButtonClickedCallback) {
            $scope.tsTooltipButtonClickedCallback();
            removeTooltip();
            if ($scope.tsTooltipCloseCallback) $scope.tsTooltipCloseCallback({id: $scope.tsTooltipId});
          }
        };

        //Clean up the tooltip and destroy the scope for the transcluded element
        $scope.$on('$destroy',function() {
          if($scope.tooltipScope)
            $scope.tooltipScope.$destroy();
          angular.element(arrowBoxContainer).remove();
          angular.element($window).off('resize', positionTooltip);
        });
      }
    };
  })
  .directive('tsTooltipContent', function(){
    return {
      restrict:'E',
      require: '^tsTooltip',
      transclude: 'element',
      link: function(scope, iElem, iAttr, tooltipController, transclude){
        tooltipController.setTranscluded(transclude);
      }
    }
  })
;
