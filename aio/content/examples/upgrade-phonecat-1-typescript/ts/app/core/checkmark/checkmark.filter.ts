// #docregion
angular.
  module('core').
  filter('checkmark', function() {
    return function(input: boolean) {
      return input ? '\u2713' : '\u2718';
    };
  });
