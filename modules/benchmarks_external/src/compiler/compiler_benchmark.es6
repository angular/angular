// compiler benchmark in AngularJS 1.x
var COUNT = 30;

export function main() {
  var ngEl = document.createElement('div');
  angular.bootstrap(ngEl, ['app']);
}

function loadTemplate(templateId, repeatCount) {
  var template = document.querySelectorAll(`#${templateId}`)[0];
  var content = template.innerHTML;
  var result = '';
  for (var i=0; i<repeatCount; i++) {
    result += content;
  }
  // replace [] binding syntax
  result = result.replace(/[\[\]]/g, '');

  // Use a DIV as container as Angular 1.3 does not know <template> elements...
  var div = document.createElement('div');
  div.innerHTML = result;
  return div;
}

angular.module('app', [])
.directive('dir0', ['$parse', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr0);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
}])
.directive('dir1', ['$parse', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr1);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
}])
.directive('dir2', ['$parse', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr2);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
}])
.directive('dir3', ['$parse', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr3);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
}])
.directive('dir4', ['$parse', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr4);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
}])
.run(['$compile', function($compile) {
  var templateNoBindings = loadTemplate('templateNoBindings', COUNT);
  var templateWithBindings = loadTemplate('templateWithBindings', COUNT);

  document.querySelector('#compileWithBindings').addEventListener('click', compileWithBindings, false);
  document.querySelector('#compileNoBindings').addEventListener('click', compileNoBindings, false);

  function compileNoBindings(_) {
    // Need to clone every time as the compiler might modify the template!
    var cloned = templateNoBindings.cloneNode(true);
    $compile(cloned);
  }

  function compileWithBindings(_) {
    // Need to clone every time as the compiler might modify the template!
    var cloned = templateWithBindings.cloneNode(true);
    $compile(cloned);
  }
}]);

