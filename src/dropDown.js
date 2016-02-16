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
angular.module('ts.utils')

  .directive('tsDropDown', function($templateCache, $compile) {

    return {
      restrict:'A',
      require: 'ngModel',
      transclude: {
        'listItem':'tsListItem',
        'placeholder':'tsPlaceholder'
      },
      scope:{
        tsDropDownTemplate:'@',
        tsDropDown: '='
      },

      templateUrl:'templates/tsDropDown.html',

      link: function($scope, $element, $attr, ngModelCtrl, $transclude) {
        let selectedIndex = 0,
            itemsFlipped = false,
            ae = angular.element, //shorthand
            placeholderElement,
            placeholderScope,
            selectedItem,
            container = ae($element.children()[0]), //Container for all the drop down related parts
            textDisplayElement = ae(container.children()[0]), //First child of the container is the place to put the placeholder or selected item
            dropDownArrow = ae(container.children()[1]), //Second child is the drop down arrow/button
            dropDownListContainer = ae(container.children()[2]), //Third child is the list container
            dropDownUnorderedList = ae($element[0].querySelector('ul'));

        //Makes the element focusable with the keyboard
        $element.attr('tabindex','0');

        $scope.direction = 'down';
        $scope.dropDownOpen = false;

        $element.on('keydown', function(event) {
          switch(event.keyCode){
            case 13: //enter
              updateSelected($scope.highlightedItem);
              toggleDropDown();
              event.preventDefault();
              break;

            case 38: //up

              // If list isn't open, open it
              if(!$scope.dropDownOpen) {
                toggleDropDown();
              }
              else { // otherwise if the list is open move up in the highlights.
                $scope.$apply($scope.direction=='down'?moveHighlightUp:moveHighlightDown);
              }
              event.preventDefault();
              break;

            case 40: //down

              //If list isn't open, open it
              if(!$scope.dropDownOpen) {
                toggleDropDown();
              } else {
                $scope.$apply($scope.direction=='down'?moveHighlightDown:moveHighlightUp);
              }
              event.preventDefault();
              break;
          }
        });

        function moveHighlightDown() {
          while($scope.tsDropDown.length-1>selectedIndex) {
            selectedIndex++;
            if( !$scope.tsDropDown[selectedIndex].hasOwnProperty('interactive') ||
                $scope.tsDropDown[selectedIndex].interactive === true)
              break;
          }
          $scope.highlightedItem = $scope.tsDropDown[selectedIndex];
        }

        function moveHighlightUp() {
          while(0<selectedIndex) {
            selectedIndex--;
            if( !$scope.tsDropDown[selectedIndex].hasOwnProperty('interactive') ||
                $scope.tsDropDown[selectedIndex].interactive === true)
              break;
          }
          $scope.highlightedItem = $scope.tsDropDown[selectedIndex];
        }

        $scope.tsDropDown.forEach(function(dropDownItem) {
          $transclude($scope.$new(), function(clone, scope) {
            scope.item = dropDownItem;

            var listItem = ae(document.createElement('li'));
            listItem.attr('ng-class', '{"highlighted":highlightedItem==item}');
            var compiledListItem = $compile(listItem)(scope);
            compiledListItem.append(clone[0]);

            if( !dropDownItem.hasOwnProperty('interactive') ||
                dropDownItem.interactive === true) {
              compiledListItem.on('click', function() {
                updateSelected(dropDownItem);
                $scope.$apply(toggleDropDown);
              });
              compiledListItem.on('mouseenter', function(){
                $scope.highlightedItem = scope.item;
                selectedIndex = $scope.tsDropDown.indexOf(scope.item);
                $scope.$apply();
              });

            }

            compiledListItem[0].style.width=(textDisplayElement[0].offsetWidth-12)+'px';

            dropDownUnorderedList.append(compiledListItem);
          }, null, 'listItem');
        });

        //Initialize to first item is highlighted
        $scope.highlightedItem = $scope.tsDropDown[selectedIndex];

        $transclude($scope.$new(), function(clone, scope){
          placeholderScope = scope;
          placeholderElement = clone[0];

          textDisplayElement.append(clone[0]);
        }, null, 'placeholder');

        function flipItems(){

          //Flips the items in the list when opening upward
          for (var i = 0; i < dropDownUnorderedList.children().length; i++) {
            var childElement = dropDownUnorderedList.children()[i];
            dropDownUnorderedList.prepend(childElement)
          }
        }

        // Take the height of the window divided by 2 to get the middle of the window
        // if the element's middle is lower than the middle of the window then open upward
        // otherwise open downward
        function toggleDropDown(){
          var rect = $element[0].getBoundingClientRect();
          var middleOfWindow = window.innerHeight/2;
          var middleOfElement = rect.top+rect.height/2;

          if(middleOfElement>middleOfWindow){
            $scope.direction = 'up';

            dropDownListContainer[0].style.bottom = rect.height+'px';
            dropDownListContainer[0].style.top = 'auto';
            if(!itemsFlipped){
              flipItems();
              itemsFlipped = true;
            }
          }
          else{
            dropDownListContainer[0].style.top = rect.height+'px';
            dropDownListContainer[0].style.bottom = 'auto';
            $scope.direction = 'down';

            if(itemsFlipped){
              flipItems();
              itemsFlipped = false;
            }
          }

          $scope.dropDownOpen = !$scope.dropDownOpen;
        }

        textDisplayElement.on('click', function(){
          $scope.$apply(toggleDropDown)
        });
        dropDownArrow.on('click', function(){
          $scope.$apply(toggleDropDown)
        });

        if (!ngModelCtrl) return; // do nothing if no ng-model

        function updateSelected(selectedValue){
          placeholderScope.selectedItem = selectedItem = selectedValue;
          $scope.$evalAsync(read);
        }


        $element.on('blur', function(){
          $scope.$apply(function(){
            $scope.dropDownOpen = false;
          });
        });

        // Specify how UI should be updated when the model changes from outside
        ngModelCtrl.$render = function() {
          //update selected element text
          updateSelected(ngModelCtrl.$viewValue || '');
        };

        // Write data to the model
        function read() {
          ngModelCtrl.$setViewValue(selectedItem);
        }
      }

    };
  });
