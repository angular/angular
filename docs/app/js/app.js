angular.module('app', ['ngMaterial', 'navigation-modules', 'navigation-guides', 'code'])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})

.controller('NavController', ['$scope', '$location', 'MODULES', 'GUIDES',
                  function($scope, $location, MODULES, GUIDES) {
  var that = this;

  this.areas = [
    { name: 'Guides', sections: [ { pages: GUIDES.pages } ] },
    { name: 'Modules', sections: MODULES.sections }
  ];

  this.updateCurrentPage = function(path) {
    console.log('path', path);
    this.currentPage = null;

    this.areas.forEach(function(area) {
      area.sections.forEach(function(section) {

        // Short-circuit out if the page has been found
        if ( that.currentPage ) {
          return;
        }

        if (section.path === path) {
          console.log('found!');
          that.currentPage = section;
        } else {
          section.pages.forEach(function(page) {
            if (page.path === path) {
              that.currentPage = page;
            }
          });
        }
      });
    });
  };

  $scope.$watch(
    function getLocationPath() { return $location.path(); },
    function handleLocationPathChange(path) { that.updateCurrentPage(path); }
  );
}]);
