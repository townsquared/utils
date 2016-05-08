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
 *        ts-tooltip-class="someClass"                          // Adds class to tooltip container
 *        ts-tooltip-content-hover="someModel.someBoolean"      // A boolean if set will allow users to
 *                                                              // hover over the tooltip content without closing it
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
        tsTooltipClass: '@',
        tsTooltipContentHover: '@'
      },
      controller: function($scope){
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

        var tooltipContainer = $compile(template)($scope);

        var newTooltip = tooltipContainer.children()[0];

        // Fix the position of the tooltip if the height of the tooltip itself changes.  This is necessary for dynamic
        // content when absolutely positioning the tooltips.  Tooltips must be absolutely positioned in order to be
        // separated from having their width restricted by their parent element or having a static width and since the
        // total size of the tooltip is needed to compute the offset for it's top left corner we must watch the height.
        $scope.$watch(function(){return newTooltip.clientHeight}, positionTooltip);

        $scope.tooltipMain = tooltipContainer.find("#tooltipMain");
        $scope.tooltipMain.addClass(direction);

        document.body.insertBefore(tooltipContainer[0],document.body.childNodes[0]);

        if($scope.transcludedContentFn){
          $scope.transcludedContentFn(function(clone, scope) {
            $scope.tooltipMain.append(clone);
            $scope.tooltipScope = scope;
          });
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
              left: rect.left + win.pageXOffset - docElem.clientLeft
            };
          }
        }


        tooltipContainer.remove();

        function positionTooltip(){
          if(!origOffset)
            origOffset = offset(newTooltip);

          let elementOffset = offset($element[0]);
          if(elementOffset === undefined || origOffset == undefined) {
            return;
          }
          let leftCommon = elementOffset.left-origOffset.left,
            topCommon = elementOffset.top-origOffset.top;

          //Sets the common top for left and right, or common left for top and bottom
          switch(direction){
            case 'right':
            case 'left':
              newTooltip.style.top = (topCommon + $element[0].offsetHeight - $scope.tooltipMain[0].offsetHeight/2 - ARROW_SIZE) + 'px';
              break;
            case 'top':
            case 'bottom':
              newTooltip.style.left = leftCommon + $element[0].offsetWidth/2 - $scope.tooltipMain[0].offsetWidth/2 + 'px';
              break;
          }

          //Sets the specific left or top values for each direction
          switch(direction) {
            case 'right':
              newTooltip.style.left = leftCommon + $element[0].offsetWidth+ARROW_SIZE + 'px';
              break;
            case 'left':
              newTooltip.style.left = (leftCommon-$scope.tooltipMain[0].offsetWidth - ARROW_SIZE ) + 'px';
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
            if($scope.tsTooltipContentHover) {
              angular.element(tooltipContainer).bind('mouseleave', function(){
                $scope.isHoveringContent = false;
                removeTooltip();
              });
              angular.element(tooltipContainer).bind('mouseenter', function(){
                $scope.isHoveringContent = true;
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
          }
        }
        else{
          $scope.$watch('tsTooltipShow',function(newVal, oldVal) {
            if(newVal) {
              makeVisible();
            }
            else {
              makeInvisible();
            }
          })
        }

        //Clean up the tooltip and destroy the scope for the transcluded element
        $scope.$on('$destroy',function() {
          if($scope.tooltipScope)
            $scope.tooltipScope.$destroy();
          newTooltip.remove();
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
