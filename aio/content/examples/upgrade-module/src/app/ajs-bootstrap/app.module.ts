// #docregion ng1module
angular.module('heroApp', [])
  .controller('MainCtrl', function() {
    this.message = 'Hello world';
  });
// #enddocregion ng1module

document.addEventListener('DOMContentLoaded', () => {
  // #docregion bootstrap
  angular.bootstrap(document.body, ['heroApp'], { strictDi: true });
  // #enddocregion bootstrap
});
