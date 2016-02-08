/**
 * ts-tooltip - Shows a tooltip with an arrow pointing to the element the directive is applied to.
 *
 * @note depends on jQuery
 *
 * @example
 *   <input ts-tooltip="Some message here will be compiled and linked against elements scope" />
 *
 */


angular.module('ts.utils')

  .directive('tsTooltip', function($templateCache, $compile){

    return {
      restrict:'A',
      scope:{
        tsTooltip:'@',
        tsTooltipDirection:'@',
        tsTooltipEvent:'@',
        tsTooltipShow:'='
      },
      link: function($scope, $element, $attrs) {
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

        function makeVisible(){
          if(!isVisible){

            isVisible = true;


            newTooltip[0].style.visibility='visible';

            switch(direction) {
              case 'right':
                newTooltip[0].style.left=ARROW_SIZE+'px';
                newTooltip[0].style.top=-tooltipMain[0].offsetHeight/2+'px';
                break;
              case 'left':
                newTooltip[0].style.left=-$element[0].offsetWidth-tooltipMain[0].offsetWidth-ARROW_SIZE+'px';
                newTooltip[0].style.top=-tooltipMain[0].offsetHeight/2+'px';
                break;
              case 'top':
                newTooltip[0].style.left=-$element[0].offsetWidth/2-tooltipMain[0].offsetWidth/2+'px';
                newTooltip[0].style.top=-$element[0].offsetHeight/2-tooltipMain[0].offsetHeight-ARROW_SIZE+'px';
                break;
              case 'bottom':
                newTooltip[0].style.left=-$element[0].offsetWidth/2-tooltipMain[0].offsetWidth/2+'px';
                newTooltip[0].style.top=$element[0].offsetHeight/2 + 'px';
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

        if($attrs.tsTooltipShow === undefined){
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