(function(app) {

var platformBrowserDynamic = ng.platformBrowserDynamic.platformBrowserDynamic;

document.addEventListener('DOMContentLoaded', function() {
  platformBrowserDynamic().bootstrapModule(app.AppModule);
});

})(window.app = window.app || {});
