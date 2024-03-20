import * as angular from 'angular';
import 'angular-route';

const appModule = angular.module('myApp', [
  'ngRoute'
])
.config(['$routeProvider', '$locationProvider',
  function config($routeProvider: angular.route.IRouteProvider,
                  $locationProvider: angular.ILocationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider.
      when('/users', {
        template: `
          <p>
            Users Page
          </p>
        `
      }).
      otherwise({
        template: ''
      });
  }]
);

export function bootstrap(el: HTMLElement) {
  return angular.bootstrap(el,  [appModule.name]);
}
