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
      link: function($scope, $element, $attr) {
        var ARROW_SIZE = 10;
        var template = $templateCache.get('templates/tsTooltip.html');
        var direction = $scope.tsTooltipDirection || 'right';
        var eventType = $scope.tsTooltipEvent || 'mouseenter';
        var isVisible = false;

        var newTooltip = $compile(template)($scope);
        newTooltip[0].style.visibility = 'hidden';

        var tooltipMain = newTooltip.find("#tooltipMain");
        tooltipMain.addClass(direction);

        //$element.after(newTooltip);
        document.body.insertBefore(newTooltip[0],document.body.childNodes[0]);

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

        var origOffset = offset(newTooltip[0]);

        function makeVisible(){
          if(!isVisible){

            isVisible = true;


            newTooltip[0].style.visibility='visible';

            var elementOffset = offset($element[0]);

            //Sets the common top for left and right, or common left for top and bottom
            switch(direction){
              case 'right':
              case 'left':
                newTooltip[0].style.top=(elementOffset.top-origOffset.top+$element[0].offsetHeight - tooltipMain[0].offsetHeight/2-ARROW_SIZE)+'px';
                break;
              case 'top':
              case 'bottom':
                newTooltip[0].style.left=elementOffset.left-origOffset.left+$element[0].offsetWidth/2-tooltipMain[0].offsetWidth/2+'px';
                break;
            }

            //Sets the specific left or top values for each direction
            switch(direction) {
              case 'right':
                newTooltip[0].style.left=elementOffset.left-origOffset.left+$element[0].offsetWidth+ARROW_SIZE+'px';
                break;
              case 'left':
                newTooltip[0].style.left=(elementOffset.left-origOffset.left-tooltipMain[0].offsetWidth - ARROW_SIZE )+'px';
                break;
              case 'top':
                newTooltip[0].style.top=elementOffset.top-origOffset.top - tooltipMain[0].offsetHeight-ARROW_SIZE+ 'px';
                break;
              case 'bottom':
                newTooltip[0].style.top=elementOffset.top-origOffset.top + $element[0].offsetHeight+ARROW_SIZE+ 'px';
                break;
            }

          }
        }

        function makeInvisible(){
          if(isVisible){
            isVisible = false;
            newTooltip[0].style.visibility = 'hidden';
          }
        }

        function toggleVisibility(){
          if(isVisible){
            makeInvisible();
          }
          else{
            makeVisible();
          }
        }

        if($attr.tsTooltipShow === undefined){
          switch(eventType){
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
          $scope.$watch('tsTooltipShow',function(newVal, oldVal){
            if(newVal){
              makeVisible();
            }
            else{
              makeInvisible();
            }
          })
        }




      }
    };
  });
