import {describe, beforeEach, expect, it, iit, ddescribe} from 'test_lib/test_lib';
import {TextInterpolationParser} from 'core/compiler/pipeline/text_interpolation_parser';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {DOM} from 'facade/dom';
import {MapWrapper} from 'facade/collection';

import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';

export function main() {
  describe('TextInterpolationParser', () => {
    function createPipeline() {
      return new CompilePipeline([new TextInterpolationParser(new Parser(new Lexer()))]);
    }

    it('should find text interpolation in normal elements', () => {
      var results = createPipeline().process(createElement('<div>{{expr1}}<span></span>{{expr2}}</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("(expr1)");
      expect(MapWrapper.get(bindings, 2).source).toEqual("(expr2)");
    });

    it('should find text interpolation in template elements', () => {
      var results = createPipeline().process(createElement('<template>{{expr1}}<span></span>{{expr2}}</template>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("(expr1)");
      expect(MapWrapper.get(bindings, 2).source).toEqual("(expr2)");
    });

    it('should allow multiple expressions', () => {
      var results = createPipeline().process(createElement('<div>{{expr1}}{{expr2}}</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("(expr1)+(expr2)");
    });

    it('should allow fixed text before, in between and after expressions', () => {
      var results = createPipeline().process(createElement('<div>a{{expr1}}b{{expr2}}c</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0).source).toEqual("'a'+(expr1)+'b'+(expr2)+'c'");
    });

    it('should escape quotes in fixed parts', () => {
      var results = createPipeline().process(createElement("<div>'\"a{{expr1}}</div>"));
      expect(MapWrapper.get(results[0].textNodeBindings, 0).source).toEqual("'\\'\"a'+(expr1)");
    });
  });
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
