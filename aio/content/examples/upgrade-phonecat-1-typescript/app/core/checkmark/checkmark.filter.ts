// #docregion
angular.
  module('core').
  filter('checkmark', () => {
    return (input: boolean) => input ? '\u2713' : '\u2718';
  });
