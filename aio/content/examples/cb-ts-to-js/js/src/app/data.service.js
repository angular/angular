(function(app) {

  app.DataService = DataService;
  function DataService() { }

  DataService.prototype.getHeroName = function() {
    return 'Windstorm';
  };

})(window.app = window.app || {});
