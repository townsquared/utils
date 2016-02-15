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
        var selectedItem = 'default selected item';

        var dropDownContainer = angular.element($element.children()[0]);
        var textDisplayElement = angular.element(dropDownContainer.children()[0]);
        var dropDownArrow = angular.element(dropDownContainer.children()[1]);
        var dropDownListContainer = angular.element(dropDownContainer.children()[2]);
        var dropDownUnorderedList = angular.element($element[0].querySelector('ul'));

        $scope.direction = 'down';

        $scope.dropDownOpen = false;

        $element.on('keydown', function(event){
          switch(event.keyCode){
            case 37: //left
              break;
            case 38: //up
              event.preventDefault();
              break;
            case 39: //right
              break;
            case 40: //down
              event.preventDefault();
              break;
            case 13: //enter
              toggleDropDown();
              break;
          }
          console.log(event.keyCode)
        });

        $scope.tsDropDown.forEach(function(dropDownItem){
          $transclude($scope.$new(), function(clone, scope) {
            scope.item = dropDownItem;

            var listItem = angular.element(document.createElement('li'));
            listItem.append(clone[0]);

            listItem.on('click', function(){
              updateSelected(dropDownItem);
              $scope.$apply(toggleDropDown);
            })
            listItem[0].style.width=(textDisplayElement[0].offsetWidth-12)+'px';

            dropDownUnorderedList.append(listItem);
          }, null, 'listItem');
        });

        var placeholderElement, placeholderScope;

        $transclude($scope.$new(), function(clone, scope){
          placeholderScope = scope;
          placeholderElement = clone[0];

          textDisplayElement.append(clone[0]);
        }, null, 'placeholder')


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

            //Flips the items in the list when opening upward
            for (var i = 0; i < dropDownUnorderedList.children().length; i++) {
              var childElement = dropDownUnorderedList.children()[i];
              dropDownUnorderedList.prepend(childElement)
            }
          }
          else{
            dropDownListContainer[0].style.top = rect.height+'px';
            dropDownListContainer[0].style.bottom = 'auto';
            $scope.direction = 'down';
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

        // Specify how UI should be updated
        ngModelCtrl.$render = function() {
          //update selected element text
          updateSelected(ngModelCtrl.$viewValue || '');
        };

        function updateSelected(selectedValue){
          placeholderScope.selectedItem = selectedItem = selectedValue;
          $scope.$evalAsync(read);
        }

        // Listen for change events to enable binding
        $element.on('blur keyup', function() {

          $scope.$evalAsync(read);
          ngModelCtrl.$render();
        });
        read(); // initialize

        // Write data to the model
        function read() {
          ngModelCtrl.$setViewValue(selectedItem);
        }
      }

    };
  });
