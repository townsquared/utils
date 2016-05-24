angular.module('testApp')

.controller('TooltipController', function($timeout) {
  var ctrl = this;
  ctrl.bar = 'mars';
  ctrl.thing = 'something';
  
  ctrl.stringFunction = function() {
    return 'I am a string from a function call';
  }
  ctrl.testing = function() {

    $timeout(function(){
      ctrl.thing = "something else"
    }, 5000)
  }
});