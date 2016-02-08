angular.module('testApp', ['ts.utils'])

  .controller('MainCtrl', function($rootScope) {
    this.foo = {
      bar: 'world',
      someBool:true
    };

    this.jumpDown = function(){
      $rootScope.$broadcast('someElementFocus')
    }

    var temp = [];
    for (var i = 100 - 1; i >= 0; i--) {
      temp.push(i);
    };
    this.things = temp;


  });
