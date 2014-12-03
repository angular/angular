angular.module('app', ['ngMaterial', 'navigation-data'])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})

.controller('NavController', ['$scope', '$location', 'NAVIGATION', function($scope, $location, NAVIGATION) {
  var that = this;

  this.sections = NAVIGATION.sections;

  this.updateCurrentPage = function(path) {
    path = path.replace(/^\//, '');
    console.log('path', path);
    this.currentPage = null;
    this.sections.forEach(function(section) {

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
  };

  $scope.$watch(
    function getLocationPath() { return $location.path(); },
    function handleLocationPathChange(path) { that.updateCurrentPage(path); }
  );
}]);
