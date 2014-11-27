import {benchmark, benchmarkStep} from '../benchpress';

var COUNT = 30;
var $compile;
var $rootScope;

export function main() {

  benchmark(`Ng 1.3 Compiler.compile 5*${COUNT} element no bindings`, function() {
    var template = loadTemplate('templateNoBindings', COUNT);

    benchmarkStep('run', function() {
      // Need to clone every time as the compiler might modify the template!
      var cloned = template.cloneNode(true);
      $compile(cloned);
    });
  });

  benchmark(`Ng 1.3 Compiler.compile 5*${COUNT} element with bindings`, function() {
    var template = loadTemplate('templateWithBindings', COUNT);

    benchmarkStep('run', function() {
      // Need to clone every time as the compiler might modify the template!
      var cloned = template.cloneNode(true);
      $compile(cloned);
    });
  });

  benchmark(`Ng 1.3 instantiate 5*${COUNT} element with bindings`, function() {
    var linkFn;

    setTimeout(function() {
      var template = loadTemplate('templateWithBindings', COUNT);
      linkFn = $compile(template);
    });

    benchmarkStep('run', function() {
      var scope = $rootScope.$new();
      linkFn(scope);
      scope.$destroy();
    });
  });

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
.directive('dir0', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr0);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
})
.directive('dir1', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr1);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
})
.directive('dir2', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr2);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
})
.directive('dir3', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr3);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
})
.directive('dir4', function($parse) {
  return {
    compile: function($element, $attrs) {
      var expr = $parse($attrs.attr4);
      return function($scope) {
        $scope.$watch(expr, angular.noop);
      }
    }
  };
})
.run(function(_$compile_, _$rootScope_) {
  $compile = _$compile_;
  $rootScope = _$rootScope_;
});

