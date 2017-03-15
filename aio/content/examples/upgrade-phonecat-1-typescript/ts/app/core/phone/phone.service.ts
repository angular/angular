// #docregion
angular.
  module('core.phone').
  factory('Phone', ['$resource',
    function($resource: angular.resource.IResourceService) {
      return $resource('phones/:phoneId.json', {}, {
        query: {
          method: 'GET',
          params: {phoneId: 'phones'},
          isArray: true
        }
      });
    }
  ]);
