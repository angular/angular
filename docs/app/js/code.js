angular.module('code', [])

.directive('code', function() {
  return {
    restrict: 'E',
    terminal: true,
    compile: function(element) {
      var linenums = element.hasClass('linenum');
      var match = /lang-(\S+)/.exec(element[0].className);
      var lang = match && match[1];
      var html = element.html();
      element.html(window.prettyPrintOne(html, lang, linenums));
    }
  };
});
