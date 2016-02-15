angular.module('testApp', ['ts.utils'])

  // .config(function(focusOnConfigProvider){
  //   focusOnConfigProvider.autoCenterInputs(true);
  // })

  .controller('MainCtrl', function($rootScope, $log) {
    this.foo = {
      bar: 'world',
      someBool:true,
      someTestModel:1
    };

    this.selectionChanged = function() {
      $log.info('changed '+this.foo.someTestModel);
    }
    this.stringFunction = function(){
      return 'I am a string from a function call';
    }
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
