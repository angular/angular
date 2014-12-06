import 'package:angular/angular.dart';
import 'package:angular/application_factory_static.dart';
import 'package:benchpress/benchpress.dart';
import 'dart:html';

var COUNT = 30;

main() {

  final typeAnnotations = {
      Dir0: const [const Decorator(selector: '[dir0]', map: const {'attr0': '=>prop'})],
      Dir1: const [const Decorator(selector: '[dir1]', map: const {'attr1': '=>prop'})],
      Dir2: const [const Decorator(selector: '[dir2]', map: const {'attr2': '=>prop'})],
      Dir3: const [const Decorator(selector: '[dir3]', map: const {'attr3': '=>prop'})],
      Dir4: const [const Decorator(selector: '[dir4]', map: const {'attr4': '=>prop'})]
  };

  final fieldGetters = {
      "inter0": (a) => a.inter0, "inter1": (a) => a.inter1,
      "inter2": (a) => a.inter2, "inter3": (a) => a.inter3, "inter4": (a) => a.inter4,

      "value0": (a) => a.value0, "value1": (a) => a.value1,
      "value2": (a) => a.value2, "value3": (a) => a.value3, "value4": (a) => a.value4,

      "prop" : (a) => a.prop
  };

  final fieldSetters = {
      "inter0": (a,v) => a.inter0 = v, "inter1": (a,v) => a.inter1 = v,
      "inter2": (a,v) => a.inter2 = v, "inter3": (a,v) => a.inter3 = v, "inter4": (a,v) => a.inter4 = v,

      "value0": (a,v) => a.value0 = v, "value1": (a,v) => a.value1 = v,
      "value2": (a,v) => a.value2 = v, "value3": (a,v) => a.value3 = v, "value4": (a,v) => a.value4 = v,

      "prop": (a,v) => a.prop = v
  };

  final symbols = {
  };

  var m = new Module()
    ..bind(Dir0)
    ..bind(Dir1)
    ..bind(Dir2)
    ..bind(Dir3)
    ..bind(Dir4);

  benchmark("AngularDart 1.0 Compiler.compile 5*${COUNT} element with bindings", () {
    var template = loadTemplate('templateWithBindings', COUNT);

    final injector = staticApplicationFactory(
        typeAnnotations,
        fieldGetters,
        fieldSetters,
        symbols
    ).addModule(m).run();

    final compiler = injector.get(Compiler);
    final directiveMap = injector.get(DirectiveMap);
    final di = injector.get(DirectiveInjector);
    final rootScope = injector.get(Scope);

    benchmarkStep('run', () {
      final cloned = template.clone(true);
      final scope = rootScope.createChild({});
      final viewFactory = compiler([cloned], directiveMap);
      viewFactory(scope, di);
      scope.destroy();
    });
  });

  benchmark("AngularDart 1.0 instantiate 5*${COUNT} element with bindings", () {
    var template = loadTemplate('templateWithBindings', COUNT);

    final injector = staticApplicationFactory(
        typeAnnotations,
        fieldGetters,
        fieldSetters,
        symbols
    ).addModule(m).run();

    final compiler = injector.get(Compiler);
    final directiveMap = injector.get(DirectiveMap);
    final di = injector.get(DirectiveInjector);
    final rootScope = injector.get(Scope);
    final viewFactory = compiler([template], directiveMap);

    benchmarkStep('run', () {
      var scope = rootScope.createChild({});
      viewFactory(scope, di);
      scope.destroy();
    });
  });
}

loadTemplate(templateId, repeatCount) {
  String result = '';
  var content = document.querySelector("#${templateId}").innerHtml;
  for (var i=0; i<repeatCount; i++) {
    result += content;
  }
  return createTemplate(result.replaceAll(new RegExp(r'[\[\]]'), ''));
}

class IdentitySanitizer implements NodeTreeSanitizer {
  void sanitizeTree(Node node) {}
}

createTemplate(String html) {
  var div = document.createElement('div');
  div.setInnerHtml(html, treeSanitizer:new IdentitySanitizer());
  return div;
}

@Decorator(
    selector: '[dir0]',
    map: const {
        'attr0': '=>prop'
    }
)
class Dir0 {
  Object prop;
}

@Decorator(
    selector: '[dir1]',
    map: const {
        'attr1': '=>prop'
    }
)
class Dir1 {
  Object prop;

  constructor(Dir0 dir0) {
  }
}

@Decorator(
    selector: '[dir2]',
    map: const {
        'attr2': '=>prop'
    }
)
class Dir2 {
  Object prop;

  constructor(Dir1 dir1) {
  }
}

@Decorator(
    selector: '[dir3]',
    map: const {
        'attr3': '=>prop'
    }
)
class Dir3 {
  Object prop;

  constructor(Dir2 dir2) {
  }
}

@Decorator(
    selector: '[dir4]',
    map: const {
        'attr4': '=>prop'
    }
)
class Dir4 {
  Object prop;

  constructor(Dir3 dir3) {
  }
}