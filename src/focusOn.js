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
angular.module('ts.utils')
  .directive('focusOn', function($window, focusOnConfig){
    return {
      link: function($scope, $element, $attrs) {
        var listener = angular.noop;
        var complete = function() {
          $element[0].focus();
        }

        $attrs.$observe('focusOn', function(newVal){
          // Stop listening to old event name
          listener();
          // Listen to new event name
          listener = $scope.$on(newVal, function(speed){

            // Let users disable the scrolling effect by setting the auto-center attribute to "false"
            if ($attrs.focusOnAutoCenter === 'false') return complete();

            speed = speed || 1000;
            // Center element on screen
            if($element.parents('.reveal-modal').length) {
              var targetWindow = $element.parents('.reveal-modal .content');
              targetWindow.animate({
                scrollTop: $element.offset().top - targetWindow.offset().top + targetWindow.scrollTop()
              }, {
                speed: speed,
                complete: complete
              });
            }
            else {
              var offset = $element.offset().top;

              // Use provider configured offset
              var extraOffset = focusOnConfig.offset;

              // If attribute is set override provider configured offset
              if($attrs.focusOnOffset !== undefined){
                extraOffset = parseInt($attrs.focusOnOffset);
              }

              // Check if provider or attribute set autoCenter/auto-center to true if so use offset/2 ignores the extra
              // offset in this case
              if(
                (
                (
                  focusOnConfig.autoCenter ||
                  focusOnConfig.autoCenterInputs && $element[0].tagName.toUpperCase()=='INPUT' ||
                  focusOnConfig.autoCenterInputs && $element[0].tagName.toUpperCase()=='TEXTAREA'
                )
                && $attrs.focusOnAutoCenter===undefined ) ||
                ($attrs.focusOnAutoCenter && $attrs.focusOnAutoCenter=='true') ) {
                offset = offset - window.innerHeight/2 - $element[0].clientHeight/2;
              }
              else{
                offset = offset - extraOffset;
              }

              $('body').animate({ scrollTop: offset }, {
                speed: speed,
                complete: complete
              });
            }
          });
        });
      }
    };
  })

  .provider('focusOnConfig', function(){
    var focusConfig = {
      offset: 0,
      autoCenter:false,
      autoCenterInputs:false
    };

    this.autoCenter = function(value){
      focusConfig.autoCenter = value;
    };

    this.autoCenterInputs = function(value){
      focusConfig.autoCenterInputs = value;
    };

    this.offset = function(value){
      focusConfig.offset = value;
    };

    this.$get = function(){
      return focusConfig;
    };

  });
