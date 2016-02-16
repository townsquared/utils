angular.module('testApp', ['ts.utils', 'hljs', 'ui.router'])

  // .config(function(focusOnConfigProvider){
  //   focusOnConfigProvider.autoCenterInputs(true);
  // })

  .config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /focusOnDemo
    $urlRouterProvider.otherwise("/focusOnDemo");
    //
    // Now set up the states
    $stateProvider
      .state('focusOnDemo', {
        url: "/focusOnDemo",
        templateUrl: "partials/focusOnDemo.html",
        controller: 'FocusOnController',
        controllerAs:'focusOnCtrl'
      })
      .state('dropDownDemo', {
        url: "/dropDownDemo",
        templateUrl: "partials/dropDownDemo.html",
        controller: 'DropDownController',
        controllerAs: 'dropDownCtrl'
      })
      .state('tooltipDemo', {
        url: "/tooltipDemo",
        templateUrl: "partials/tooltipDemo.html",
        controller:'TooltipController',
        controllerAs: 'tooltipCtrl'
      });
  })
