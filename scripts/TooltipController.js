angular.module('testApp')

.controller('TooltipController', function() {
  this.bar = 'mars';
  
  this.stringFunction = function() {
    return 'I am a string from a function call';
  }
  this.testing = function() {
    alert('just testing');
  }
});