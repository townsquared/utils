/**
 * ts-dropwdown - Shows a drop down list of items that can be selected from.
 *
 * @note depends on jQuery
 *
 * @example
 *
 *
 */


angular.module('ts.utils')

  .directive('tsDropDown', function($templateCache, $compile, $log){

    return {
      restrict:'A',
      require: 'ngModel',
      transclude:true,
      scope:{
        tsDropDownTemplate:'@',
        tsDropDown: '='
      },
      templateUrl:'templates/tsDropDown.html',
      link: function($scope, $element, $attr, ngModelCtrl) {

      }

    };
  });
