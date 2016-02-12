angular.module('testApp', ['ts.utils'])

  .config(function(focusOnConfigProvider){
    // focusOnConfigProvider.autoCenterInputs(true);
  })

  .controller('MainCtrl', function($rootScope) {
    this.foo = {
      bar: 'world',
      someBool:true
    };

    this.jumpDown = function(){
      $rootScope.$broadcast('someElementFocus')
    }

    this.jumpToInput = function(){
      $rootScope.$broadcast('someInputFocus')
    }

    this.jumpToSpan = function(){
      $rootScope.$broadcast('somethingElse')
    }

    var temp = [];
    for (var i = 100 - 1; i >= 0; i--) {
      temp.push(i);
    };
    this.things = temp;


  });
