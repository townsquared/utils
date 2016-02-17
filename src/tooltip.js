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

angular.module('ts.utils')

  .directive('tsTooltip', function($templateCache, $compile, $window){

    return {
      restrict:'A',
      scope:{
        tsTooltip:'@',
        tsTooltipDirection:'@',
        tsTooltipEvent:'@',
        tsTooltipShow:'='
      },
      transclude:{content:'?tooltipContent'},
      link: function($scope, $element, $attr, $ctrl, $transclude) {
        var ARROW_SIZE = 10;
        var template = $templateCache.get('templates/tsTooltip.html');
        var direction = $scope.tsTooltipDirection || 'right';
        var eventType = $scope.tsTooltipEvent || 'mouseenter';
        var isVisible = false;
        var tooltipScope;

        var tooltipContainer = $compile(template)($scope);
        tooltipContainer[0].style.visibility = 'hidden';

        var newTooltip = tooltipContainer.children()[0];


        var tooltipMain = tooltipContainer.find("#tooltipMain");
        tooltipMain.addClass(direction);

        // $element.after(tooltipContainer);
        document.body.insertBefore(tooltipContainer[0],document.body.childNodes[0]);

        // Puts back the original contents, we need to transclude to get compiled clones of the
        // child called tooltip-content if its present below.
        $transclude(function(clone, scope) {
          tooltipScope = scope;
          $element.append(clone);
        });

        // Allows for <tooltip-content></tooltip-content> to be specified inside the element a
        // tooltip applies to
        $transclude(function(clone, scope) {
          tooltipMain.append(clone);
        }, null, 'content');


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

        var origOffset = offset(newTooltip);

        function makeVisible(){
          if(!isVisible){

            isVisible = true;
            tooltipContainer[0].style.visibility='visible';

            let elementOffset = offset($element[0]),
                leftCommon = elementOffset.left-origOffset.left,
                topCommon = elementOffset.top-origOffset.top;

            //Sets the common top for left and right, or common left for top and bottom
            switch(direction){
              case 'right':
              case 'left':
                newTooltip.style.top = (topCommon + $element[0].offsetHeight - tooltipMain[0].offsetHeight/2 - ARROW_SIZE) + 'px';
                break;
              case 'top':
              case 'bottom':
                newTooltip.style.left = leftCommon + $element[0].offsetWidth/2 - tooltipMain[0].offsetWidth/2 + 'px';
                break;
            }

            //Sets the specific left or top values for each direction
            switch(direction) {
              case 'right':
                newTooltip.style.left = leftCommon + $element[0].offsetWidth+ARROW_SIZE + 'px';
                break;
              case 'left':
                newTooltip.style.left = (leftCommon-tooltipMain[0].offsetWidth - ARROW_SIZE ) + 'px';
                break;
              case 'top':
                newTooltip.style.top = topCommon - tooltipMain[0].offsetHeight - ARROW_SIZE + 'px';
                break;
              case 'bottom':
                newTooltip.style.top = topCommon + $element[0].offsetHeight + ARROW_SIZE + 'px';
                break;
            }

          }
        }

        function makeInvisible() {
          if(isVisible){
            isVisible = false;
            tooltipContainer[0].style.visibility = 'hidden';
          }
        }

        function toggleVisibility(){
          if(isVisible) {
            makeInvisible();
          }
          else {
            makeVisible();
          }
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
          tooltipScope.$destroy();
          newTooltip.remove();
        });
      }
    };
  });
