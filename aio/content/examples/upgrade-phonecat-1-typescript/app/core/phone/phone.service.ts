// #docregion
angular.
  module('core.phone').
  factory('Phone', ['$resource',
    ($resource: angular.resource.IResourceService) =>
      $resource('phones/:phoneId.json', {}, {
        query: {
          method: 'GET',
          params: {phoneId: 'phones'},
          isArray: true
        }
      })
  ]);
