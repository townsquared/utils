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

  .directive('tsDropDown', function($templateCache, $compile, $timeout) {

    return {
      restrict:'A',
      require: 'ngModel',
      //transclude: {
      //  'listItem':'tsListItem',
      //  'placeholder':'tsPlaceholder'
      //},
      scope:{
        tsDropDownTemplate:'@',
        tsDropDown: '=',
        tsDropDownShow:'=?',
        tsDropDownWidth: '=',
        tsItemClick: '&'
      },
      controller: function($scope){
        this.setPlaceholder = function(transclude){
          $scope.placeholderTransclude = transclude;
        }
        this.setListItem = function(transclude){
          $scope.listItemTransclude = transclude;
        }
      },

      link: function($scope, $element, $attr, ngModelCtrl) {
        let selectedIndex = 0,
            ae = angular.element, //shorthand
            placeholderElement,
            placeholderScope,
            selectedItem,
            setHeight = false;

        //Makes the element focusable with the keyboard
        $element.attr('tabindex','0');

        $scope.direction = 'down';
        $scope.dropDownOpen = false;

        var template = $templateCache.get('templates/tsDropDown.html');
        var container = $compile(template)($scope); //Container for all the drop down related parts
        $element.append(container);

        let textDisplayElement = ae(container.children()[0]), //First child of the container is the place to put the placeholder or selected item
          dropDownArrow = ae(container.children()[1]), //Second child is the drop down arrow/button
          dropDownListContainer = ae(container.children()[2]), //Third child is the list container
          dropDownUnorderedList = ae($element[0].querySelector('ul'))

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
                $scope.$apply(moveHighlightUp);
              }
              event.preventDefault();
              break;

            case 40: //down

              //If list isn't open, open it
              if(!$scope.dropDownOpen) {
                toggleDropDown();
              } else {
                $scope.$apply(moveHighlightDown);
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


        $scope.$watch('tsDropDown', function(){
          if(angular.isArray($scope.tsDropDown)){
            $scope.tsDropDown.forEach(function(dropDownItem) {

              if($scope.listItemTransclude){
                $scope.listItemTransclude($scope.$new(), function(clone, scope) {
                  scope.item = dropDownItem;

                  var listItem = ae(document.createElement('li'));
                  listItem.attr('ng-class', '{"highlighted":highlightedItem==item}');
                  var compiledListItem = $compile(listItem)(scope);
                  compiledListItem.append(clone[0]);

                  //Adds event handlers if the item isn't explicitly marked non interactive
                  if( !dropDownItem.hasOwnProperty('interactive') ||
                    dropDownItem.interactive === true) {
                    compiledListItem.on('click', function() {
                      updateSelected(dropDownItem);
                      if($scope.tsItemClick)
                        $scope.tsItemClick({item:dropDownItem});
                      $scope.$apply(toggleDropDown);
                    });
                    compiledListItem.on('mouseenter', function(){
                      $scope.highlightedItem = scope.item;
                      selectedIndex = $scope.tsDropDown.indexOf(scope.item);
                      $scope.$apply();
                    });

                  }

                  compiledListItem[0].style.width = (scope.tsDropDownWidth || textDisplayElement[0].offsetWidth + dropDownArrow[0].offsetWidth) + 'px';

                  dropDownUnorderedList.append(compiledListItem);
                });
              }
            });
          }


        });


        $scope.$watch('tsDropDownWidth', function(newVal){
          if(newVal){
            for (var i = 0; i < dropDownUnorderedList.children().length; i++) {
              var child = dropDownUnorderedList.children()[i];
              child.style.width = newVal + 'px';
            }
          }
        });

        //Initialize to first item is highlighted
        $scope.highlightedItem = $scope.tsDropDown[selectedIndex];

        if($scope.placeholderTransclude){
          $scope.placeholderTransclude($scope.$new(), function(clone, scope){
            placeholderScope = scope;
            placeholderElement = clone[0];

            textDisplayElement.append(clone[0]);
          });
        }

        // Take the height of the window divided by 2 to get the middle of the window
        // if the element's middle is lower than the middle of the window then open upward
        // otherwise open downward
        function toggleDropDown(forceState){
          var rect = $element[0].getBoundingClientRect();
          var middleOfWindow = window.innerHeight/2;
          var middleOfElement = rect.top+rect.height/2;

          if(middleOfElement>middleOfWindow){
            $scope.direction = 'up';

            dropDownListContainer[0].style.bottom = rect.height+'px';
            dropDownListContainer[0].style.top = 'auto';
          }
          else{
            dropDownListContainer[0].style.top = rect.height+'px';
            dropDownListContainer[0].style.bottom = 'auto';
            $scope.direction = 'down';
          }


          if(forceState === true || forceState === false) {
            $scope.dropDownOpen = forceState;
          }
          else{
            $scope.dropDownOpen = !$scope.dropDownOpen;
            $scope.tsDropDownShow = $scope.dropDownOpen;
          }
          if(setHeight)
            return;

          $timeout( () => {
            setHeight = true;
            var dropdownHeight;
            var listHeight = dropDownUnorderedList.outerHeight() + 2;
            if(listHeight > (window.innerHeight * .33) )
              dropdownHeight = window.innerHeight*.33;
            else
              dropdownHeight = listHeight
            dropDownListContainer[0].style.height = dropdownHeight + 'px';
          }, 0);
        }

        textDisplayElement.on('click', function(){
          $scope.$apply(toggleDropDown)
        });
        dropDownArrow.on('click', function(){
          $scope.$apply(toggleDropDown)
        });


        $scope.$watch('tsDropDownShow',function(newVal, oldVal) {
          if(newVal !== undefined)
            toggleDropDown(newVal);
        })

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
  })

  .directive('tsPlaceholder', function(){
    return {
      restrict:'E',
      require: '^tsDropDown',
      transclude: 'element',
      link: function(scope, iElem, iAttr, dropDownController, transclude){
        dropDownController.setPlaceholder(transclude);
      }
    }
  })

  .directive('tsListItem', function(){
    return {
      restrict:'E',
      require: '^tsDropDown',
      transclude: 'element',
      link: function(scope, iElem, iAttr, dropDownController, transclude){
        dropDownController.setListItem(transclude);
      }
    }
  });
