import {describe, beforeEach, expect, it, iit, ddescribe} from 'test_lib/test_lib';
import {TextInterpolationParser} from 'core/compiler/pipeline/text_interpolation_parser';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {DOM} from 'facade/dom';
import {MapWrapper} from 'facade/collection';

export function main() {
  describe('TextInterpolationParser', () => {
    function createPipeline() {
      return new CompilePipeline([new TextInterpolationParser()]);
    }

    it('should find text interpolation in normal elements', () => {
      var results = createPipeline().process(createElement('<div>{{expr1}}<span></span>{{expr2}}</div>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0)).toEqual("''+expr1+''");
      expect(MapWrapper.get(bindings, 2)).toEqual("''+expr2+''");
    });

    it('should find text interpolation in template elements', () => {
      var results = createPipeline().process(createElement('<template>{{expr1}}<span></span>{{expr2}}</template>'));
      var bindings = results[0].textNodeBindings;
      expect(MapWrapper.get(bindings, 0)).toEqual("''+expr1+''");
      expect(MapWrapper.get(bindings, 2)).toEqual("''+expr2+''");
    });
  });
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
