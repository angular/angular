import {benchmark, benchmarkStep} from '../benchpress';

import {DOM, document} from 'facade/dom';
import {isBlank} from 'facade/lang';
import {MapWrapper} from 'facade/collection';
import {AnnotatedType} from 'core/compiler/annotated_type';

import {Parser} from 'change_detection/parser/parser';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {Lexer} from 'change_detection/parser/lexer';

import {Compiler} from 'core/compiler/compiler';
import {Reflector} from 'core/compiler/reflector';

import {Component} from 'core/annotations/annotations';
import {Decorator} from 'core/annotations/annotations';
import {TemplateConfig} from 'core/annotations/template_config';

var COUNT = 30;

var compiler;
var annotatedComponent;

function setup() {
  var closureMap = new ClosureMap();
  var reflector = new CachingReflector();
  compiler = new Compiler(null, reflector, new Parser(new Lexer(), closureMap), closureMap);
  annotatedComponent = reflector.annotatedType(BenchmarkComponent);
}

export function main() {
  setup();

  benchmark(`Compiler.compile 5*${COUNT} element no bindings`, function() {
    var template = loadTemplate('templateNoBindings', COUNT);

    benchmarkStep('run', function() {
      // Need to clone every time as the compiler might modify the template!
      var cloned = DOM.clone(template);
      compiler.compileWithCache(null, annotatedComponent, cloned);
    });
  });

  benchmark(`Compiler.compile 5*${COUNT} element with bindings`, function() {
    var template = loadTemplate('templateWithBindings', COUNT);

    benchmarkStep('run', function() {
      // Need to clone every time as the compiler might modify the template!
      var cloned = DOM.clone(template);
      compiler.compileWithCache(null, annotatedComponent, cloned);
    });
  });
}

function loadTemplate(templateId, repeatCount) {
  var template = DOM.querySelectorAll(document, `#${templateId}`)[0];
  var content = DOM.getInnerHTML(template);
  var result = '';
  for (var i=0; i<repeatCount; i++) {
    result += content;
  }
  return DOM.createTemplate(result);
}

// Caching reflector as reflection in Dart using Mirrors
class CachingReflector extends Reflector {
  _cache: Map;
  constructor() {
    this._cache = MapWrapper.create();
  }
  annotatedType(type:Type):AnnotatedType {
    var result = MapWrapper.get(this._cache, type);
    if (isBlank(result)) {
      result = super.annotatedType(type);
      MapWrapper.set(this._cache, type, result);
    }
    return result;
  }
}

@Decorator({
  selector: '[dir0]',
  bind: {
    'attr0': 'prop'
  }
})
class Dir0 {}

@Decorator({
  selector: '[dir1]',
  bind: {
    'attr1': 'prop'
  }
})
class Dir1 {}

@Decorator({
  selector: '[dir2]',
  bind: {
    'attr2': 'prop'
  }
})
class Dir2 {}

@Decorator({
  selector: '[dir3]',
  bind: {
    'attr3': 'prop'
  }
})
class Dir3 {}

@Decorator({
  selector: '[dir4]',
  bind: {
    'attr4': 'prop'
  }
})
class Dir4 {}

@Component({
  template: new TemplateConfig({
    directives: [Dir0, Dir1, Dir2, Dir3, Dir4]
  })
})
class BenchmarkComponent {}

