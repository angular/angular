// #docregion
angular.
  module('core').
  filter('checkmark', () => (input: boolean) => input ? '\u2713' : '\u2718');
