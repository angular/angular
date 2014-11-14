import {DOM} from 'facade/dom';

import {Parser} from 'change_detection/parser/parser';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {Lexer} from 'change_detection/parser/lexer';

import {Compiler} from 'core/compiler/compiler';
import {Reflector} from 'core/compiler/reflector';

import {Component} from 'core/annotations/component';
import {Decorator} from 'core/annotations/decorator';
import {TemplateConfig} from 'core/annotations/template_config';

var compiler;
var annotatedComponent;
var annotatedComponentNoDirectives;

var emptyTemplate;
var templateWith25ElementsNoBindings;
var templateWith25ElementsAndBindings;

export function setup() {
  var closureMap = new ClosureMap();
  var reflector = new Reflector();
  compiler = new Compiler(null, reflector, new Parser(new Lexer(), closureMap), closureMap);
  annotatedComponent = reflector.annotatedType(SomeComponent);
  annotatedComponentNoDirectives = reflector.annotatedType(ComponentWithNoDirectives);

  emptyTemplate = createTemplate('<div></div>');
  templateWith25ElementsNoBindings = buildTemplateWith25ElementsNoBindings();
  templateWith25ElementsAndBindings = buildTemplateWith25ElementsAndBindings();
}

export function compileEmptyTemplate() {
  var template = emptyTemplate;
  return compiler.compileWithCache(null, annotatedComponent, template);
}

export function compile25ElementsWithBindings() {
  var template = templateWith25ElementsAndBindings;
  return compiler.compileWithCache(null, annotatedComponent, template);
}

export function compile25ElementsNoBindings() {
  var template = templateWith25ElementsNoBindings;
  return compiler.compileWithCache(null, annotatedComponentNoDirectives, template);
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
class SomeComponent {}

@Component({
  template: new TemplateConfig({
    directives: []
  })
})
class ComponentWithNoDirectives {}

// creates 25 nested divs without bindings, each looking like this:
// <div class="class0 class1 class2 class3 class4 " dir0="" attr0="value0" dir1="" attr1="value1" dir2="" attr2="value2" dir3="" attr3="value3" dir4="" attr4="value4">
// </div>
function buildTemplateWith25ElementsNoBindings() {
  var result = '';
  for (var i=0; i<5; i++) {
    for (var j=0; j<5; j++) {
      result += '<div class="';
      for (var k=0; k<5; k++) {
        result += `class${k} `;
      }
      result += '"';
      for (var k=0; k<5; k++) {
        result += ` dir${k}`;
        result += ` attr${k}=value${k}`;
      }
      for (var k=0; k<5; k++) {
        result += ` dir${k}`;
        result += ` attr${k}=value${k}`;
      }
      result += '>';
    }
    for (var j=0; j<5; j++) {
      result += '</div>';
    }
  }
  return createTemplate(result);
}

// creates 25 nested divs , each looking like this:
// <div class="class0 class1 class2 class3 class4 " dir0="" [attr0]="value0" dir1="" [attr1]="value1" dir2="" [attr2]="value2" dir3="" [attr3]="value3" dir4="" [attr4]="value4">
//   {{inter0}}{{inter1}}{{inter2}}{{inter3}}{{inter4}}
// </div>
function buildTemplateWith25ElementsAndBindings() {
  var result = '';
  for (var i=0; i<5; i++) {
    for (var j=0; j<5; j++) {
      result += '<div class="';
      for (var k=0; k<5; k++) {
        result += `class${k} `;
      }
      result += '"';
      for (var k=0; k<5; k++) {
        result += ` dir${k}`;
        result += ` [attr${k}]=value${k}`;
      }
      for (var k=0; k<5; k++) {
        result += ` dir${k}`;
        result += ` [attr${k}]=value${k}`;
      }
      result += '>';
      for (var k=0; k<5; k++) {
        result += `{{inter${k}}}`;
      }
    }
    for (var j=0; j<5; j++) {
      result += '</div>';
    }
  }
  return createTemplate(result);
}



function createTemplate(html) {
  return DOM.createTemplate(html);
}
