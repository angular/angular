'use strict';

angular.
  module('phonecatApp').
  config(['$locationProvider', '$routeProvider',
    function config($locationProvider: angular.ILocationProvider,
                    $routeProvider: angular.route.IRouteProvider) {
      $locationProvider.hashPrefix('!');
      // #docregion ajs-routes
      $routeProvider
        .when('/phones/:phoneId', {
          template: '<phone-detail></phone-detail>'
        });
      // #enddocregion ajs-routes
    }
  ]);
