angular.module('testApp')

.controller('DropDownController',function(){
  var temp = [];
  for (var i = 0; i < 20; i++) {
    if(i%5==0) {
      temp.push({ value:i, interactive:false });
    }
    else {
      temp.push(i);
    }
  };

  this.things = temp;          

  this.selectionChanged = function() {
    $log.info('changed '+this.foo.someTestModel);
  };

  this.smallList = [
    { label:'Section 1', interactive: false },
    { label:'item 1' },
    { label:'item 2' },
    { label:'Section 2', interactive: false },
    { label:'item 3' },
    { label:'item 4' },
    { label:'item 5' }
  ];
  
  this.someTestModel = 5;
});