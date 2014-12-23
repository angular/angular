// compiler benchmark in AngularDart 1.x
library compiler_benchmark_ng10;

import 'package:angular/angular.dart';
import 'package:angular/application_factory.dart';
import 'dart:html';

var COUNT = 30;

main() {

  var m = new Module()
    ..bind(Dir0)
    ..bind(Dir1)
    ..bind(Dir2)
    ..bind(Dir3)
    ..bind(Dir4);

  var templateWithBindings = loadTemplate('templateWithBindings', COUNT);
  var templateNoBindings = loadTemplate('templateWithBindings', COUNT);

  final injector = applicationFactory().addModule(m).run();
  final compiler = injector.get(Compiler);
  final directiveMap = injector.get(DirectiveMap);

  compileWithBindings(_) {
    final cloned = templateWithBindings.clone(true);
    compiler([cloned], directiveMap);
  }

  compileNoBindings(_) {
    final cloned = templateNoBindings.clone(true);
    compiler([cloned], directiveMap);
  }

  document.querySelector('#compileWithBindings').addEventListener('click', compileWithBindings);
  document.querySelector('#compileNoBindings').addEventListener('click', compileNoBindings);

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