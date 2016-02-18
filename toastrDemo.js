//original definition
//angular.module('testApp', ['toastr']) 
angular.module('testApp')
  .run(function($location, toastr){
    if($location.search().message) {
      toastr.info($location.search().message, null, {closeButton:true, autoDismiss:false, maxOpened:1, timeOut: 60000});
      $location.search({message:null});
    }
  })