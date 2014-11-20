import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {PropertyBindingParser} from 'core/compiler/pipeline/property_binding_parser';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {DOM} from 'facade/dom';
import {MapWrapper} from 'facade/collection';

import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';

export function main() {
  describe('PropertyBindingParser', () => {
    function createPipeline() {
      return new CompilePipeline([new PropertyBindingParser(new Parser(new Lexer()))]);
    }

    it('should detect [] syntax', () => {
      var results = createPipeline().process(createElement('<div [a]="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('b');
    });

    it('should detect bind- syntax', () => {
      var results = createPipeline().process(createElement('<div bind-a="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('b');
    });

    it('should detect interpolation syntax', () => {
      // Note: we don't test all corner cases of interpolation as we assume shared functionality between text interpolation
      // and attribute interpolation.
      var results = createPipeline().process(createElement('<div a="{{b}}"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('(b)');
    });

    it('should detect let- syntax', () => {
      var results = createPipeline().process(createElement('<template let-a="b"></template>'));
      expect(MapWrapper.get(results[0].variableBindings, 'a')).toEqual('b');
    });

    it('should not allow let- syntax on non template elements', () => {
      expect( () => {
        createPipeline().process(createElement('<div let-a="b"></div>'))
      }).toThrowError('let-* is only allowed on <template> elements!');
    });

    it('should detect () syntax', () => {
      var results = createPipeline().process(createElement('<div (click)="b()"></div>'));
      expect(MapWrapper.get(results[0].eventBindings, 'click').source).toEqual('b()');
    });

    it('should detect on- syntax', () => {
      var results = createPipeline().process(createElement('<div on-click="b()"></div>'));
      expect(MapWrapper.get(results[0].eventBindings, 'click').source).toEqual('b()');
    });
  });
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
