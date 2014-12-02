import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {MapWrapper} from 'facade/collection';

import {ViewSplitter} from 'core/compiler/pipeline/view_splitter';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {DOM, TemplateElement} from 'facade/dom';

import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';

export function main() {
  describe('ViewSplitter', () => {

    function createPipeline() {
      return new CompilePipeline([new ViewSplitter(new Parser(new Lexer()))]);
    }

    it('should mark root elements as viewRoot', () => {
      var rootElement = createElement('<div></div>');
      var results = createPipeline().process(rootElement);
      expect(results[0].isViewRoot).toBe(true);
    });

    describe('<template> elements', () => {

      it('should move the content into a new <template> element and mark that as viewRoot', () => {
        var rootElement = createElement('<div><template if="true">a</template></div>');
        var results = createPipeline().process(rootElement);
        expect(DOM.getOuterHTML(results[1].element)).toEqual('<template if="true"></template>');
        expect(results[1].isViewRoot).toBe(false);
        expect(DOM.getOuterHTML(results[2].element)).toEqual('<template>a</template>');
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should not wrap a root <template> element', () => {
        var rootElement = createElement('<div></div>');
        var results = createPipeline().process(rootElement);
        expect(results.length).toBe(1);
        expect(DOM.getOuterHTML(rootElement)).toEqual('<div></div>');
      });

    });

    describe('elements with template attribute', () => {

      it('should replace the element with an empty <template> element', () => {
        var rootElement = createElement('<div><span template=""></span></div>');
        var originalChild = rootElement.childNodes[0];
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(DOM.getOuterHTML(results[0].element)).toEqual('<div><template></template></div>');
        expect(DOM.getOuterHTML(results[2].element)).toEqual('<span template=""></span>')
        expect(results[2].element).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = createElement('<div><div template></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = createElement('<div><div template="prop:expr"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(MapWrapper.get(results[1].propertyBindings, 'prop').source).toEqual('expr');
      });

      it('should add variable mappings from the template attribute', () => {
        var rootElement = createElement('<div><div template="varName #mapName"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].variableBindings).toEqual(MapWrapper.createFromStringMap({'varName': 'mapName'}));
      });

      it('should add entries without value as attribute to the element', () => {
        var rootElement = createElement('<div><div template="varname"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].attrs()).toEqual(MapWrapper.createFromStringMap({'varname': ''}));
        expect(results[1].propertyBindings).toBe(null);
        expect(results[1].variableBindings).toBe(null);
      });

    });

  });
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
