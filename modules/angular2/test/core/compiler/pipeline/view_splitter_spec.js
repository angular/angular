import {describe, beforeEach, it, expect, iit, ddescribe, el} from 'angular2/test_lib';
import {isPresent} from 'angular2/src/facade/lang';
import {MapWrapper} from 'angular2/src/facade/collection';

import {ViewSplitter} from 'angular2/src/core/compiler/pipeline/view_splitter';
import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {DOM, TemplateElement} from 'angular2/src/facade/dom';

import {Lexer, Parser} from 'angular2/change_detection';

export function main() {
  describe('ViewSplitter', () => {

    function createPipeline() {
      return new CompilePipeline([new ViewSplitter(new Parser(new Lexer()), null)]);
    }

    it('should mark root elements as viewRoot', () => {
      var rootElement = el('<div></div>');
      var results = createPipeline().process(rootElement);
      expect(results[0].isViewRoot).toBe(true);
    });

    describe('<template> elements', () => {

      it('should move the content into a new <template> element and mark that as viewRoot', () => {
        var rootElement = el('<div><template if="true">a</template></div>');
        var results = createPipeline().process(rootElement);
        expect(DOM.getOuterHTML(results[1].element)).toEqual('<template if="true"></template>');
        expect(results[1].isViewRoot).toBe(false);
        expect(DOM.getOuterHTML(results[2].element)).toEqual('<template>a</template>');
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should not wrap a root <template> element', () => {
        var rootElement = el('<div></div>');
        var results = createPipeline().process(rootElement);
        expect(results.length).toBe(1);
        expect(DOM.getOuterHTML(rootElement)).toEqual('<div></div>');
      });

    });

    describe('elements with template attribute', () => {

      it('should replace the element with an empty <template> element', () => {
        var rootElement = el('<div><span template=""></span></div>');
        var originalChild = rootElement.childNodes[0];
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(DOM.getOuterHTML(results[0].element)).toEqual('<div><template></template></div>');
        expect(DOM.getOuterHTML(results[2].element)).toEqual('<span template=""></span>')
        expect(results[2].element).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = el('<div><div template></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should work with top-level template node', () => {
        var rootElement = DOM.createTemplate('<div template>x</div>');
        var originalChild = rootElement.content.childNodes[0];
        var results = createPipeline().process(rootElement);

        expect(results[0].element).toBe(rootElement);
        expect(results[0].isViewRoot).toBe(true);
        expect(results[2].isViewRoot).toBe(true);
        expect(DOM.getOuterHTML(results[0].element)).toEqual('<template><template></template></template>');
        expect(results[2].element).toBe(originalChild);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = el('<div><div template="prop:expr"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(MapWrapper.get(results[1].propertyBindings, 'prop').source).toEqual('expr');
      });

      it('should add variable mappings from the template attribute', () => {
        var rootElement = el('<div><div template="var varName=mapName"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].variableBindings).toEqual(MapWrapper.createFromStringMap({'mapName': 'varName'}));
      });

      it('should add entries without value as attribute to the element', () => {
        var rootElement = el('<div><div template="varname"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].attrs()).toEqual(MapWrapper.createFromStringMap({'varname': ''}));
        expect(results[1].propertyBindings).toBe(null);
        expect(results[1].variableBindings).toBe(null);
      });

      it('should iterate properly after a template dom modification', () => {
        var rootElement = el('<div><div template></div><after></after></div>');
        var results = createPipeline().process(rootElement);
        // 1 root + 2 initial + 1 generated template elements
        expect(results.length).toEqual(4);
      });

    });

    describe('elements with !directive_name attribute', () => {

      it('should replace the element with an empty <template> element', () => {
        var rootElement = el('<div><span !if></span></div>');
        var originalChild = rootElement.childNodes[0];
        var results = createPipeline().process(rootElement);
        expect(results[0].element).toBe(rootElement);
        expect(DOM.getOuterHTML(results[0].element)).toEqual('<div><template if=""></template></div>');
        expect(DOM.getOuterHTML(results[2].element)).toEqual('<span !if=""></span>')
        expect(results[2].element).toBe(originalChild);
      });

      it('should mark the element as viewRoot', () => {
        var rootElement = el('<div><div !foo="bar"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[2].isViewRoot).toBe(true);
      });

      it('should work with top-level template node', () => {
        var rootElement = DOM.createTemplate('<div !foo>x</div>');
        var originalChild = rootElement.content.childNodes[0];
        var results = createPipeline().process(rootElement);

        expect(results[0].element).toBe(rootElement);
        expect(results[0].isViewRoot).toBe(true);
        expect(results[2].isViewRoot).toBe(true);
        expect(DOM.getOuterHTML(results[0].element)).toEqual('<template><template foo=""></template></template>');
        expect(results[2].element).toBe(originalChild);
      });

      it('should add property bindings from the template attribute', () => {
        var rootElement = el('<div><div !prop="expr"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(MapWrapper.get(results[1].propertyBindings, 'prop').source).toEqual('expr');
      });

      it('should add variable mappings from the template attribute', () => {
        var rootElement = el('<div><div !foreach="var varName=mapName"></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].variableBindings).toEqual(MapWrapper.createFromStringMap({'mapName': 'varName'}));
      });

      it('should add entries without value as attribute to the element', () => {
        var rootElement = el('<div><div !varname></div></div>');
        var results = createPipeline().process(rootElement);
        expect(results[1].attrs()).toEqual(MapWrapper.createFromStringMap({'varname': ''}));
        expect(results[1].propertyBindings).toBe(null);
        expect(results[1].variableBindings).toBe(null);
      });

      it('should iterate properly after a template dom modification', () => {
        var rootElement = el('<div><div !foo></div><after></after></div>');
        var results = createPipeline().process(rootElement);
        // 1 root + 2 initial + 1 generated template elements
        expect(results.length).toEqual(4);
      });

      it('should not allow multiple template directives on the same element', () => {
        expect( () => {
          var rootElement = el('<div><div !foo !bar="blah"></div></div>');
          createPipeline().process(rootElement);
        }).toThrowError('Only one template directive per element is allowed: foo and bar cannot be used simultaneously!');
      });

      it('should not allow template and bang directives on the same element', () => {
        expect( () => {
          var rootElement = el('<div><div !foo template="blah"></div></div>');
          createPipeline().process(rootElement);
        }).toThrowError('Only one template directive per element is allowed: blah and foo cannot be used simultaneously!');
      });

    });

  });
}
