angular.module('testApp')

.controller('FocusOnController',function($rootScope){
  this.jumpDown = function(){
    $rootScope.$broadcast('someElementFocus');
  }

  this.jumpToInput = function(){
    $rootScope.$broadcast('someInputFocus');
  }

  this.jumpToSpan = function(){
    $rootScope.$broadcast('somethingElse');
  }

  var temp = [];
  for (var i = 0; i < 100; i++) {
    temp.push(i);
  };
  this.things = temp;
});