angular.module('heroApp', [])
  .controller('MainCtrl', function() {
    this.message = 'Hello world';
  });

document.addEventListener('DOMContentLoaded', function() {
  // #docregion bootstrap
  angular.bootstrap(document.body, ['heroApp'], {strictDi: true});
  // #enddocregion bootstrap
});
