angular.
  module('phonecatApp').
  config(['$locationProvider', '$routeProvider',
    function config($locationProvider: angular.ILocationProvider,
                    $routeProvider: angular.route.IRouteProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/phones', {
          template: '<phone-list></phone-list>'
        }).
        when('/phones/:phoneId', {
          template: '<phone-detail></phone-detail>'
        }).
        otherwise('/phones');
    }
  ]);
