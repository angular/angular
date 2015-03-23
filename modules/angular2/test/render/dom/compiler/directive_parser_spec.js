import {describe, beforeEach, it, xit, expect, iit, ddescribe, el} from 'angular2/test_lib';
import {isPresent, assertionsEnabled} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {DirectiveParser} from 'angular2/src/render/dom/compiler/directive_parser';
import {CompilePipeline} from 'angular2/src/render/dom/compiler/compile_pipeline';
import {CompileStep} from 'angular2/src/render/dom/compiler/compile_step';
import {CompileElement} from 'angular2/src/render/dom/compiler/compile_element';
import {CompileControl} from 'angular2/src/render/dom/compiler/compile_control';
import {Template, DirectiveMetadata} from 'angular2/src/render/api';
import {Lexer, Parser} from 'angular2/change_detection';

export function main() {
  describe('DirectiveParser', () => {
    var parser, annotatedDirectives;

    beforeEach( () => {
      annotatedDirectives = [
        someComponent,
        someComponent2,
        someViewport,
        someViewport2,
        someDecorator,
        someDecoratorIgnoringChildren,
        someDecoratorWithProps,
        someDecoratorWithEvents
      ];
      parser = new Parser(new Lexer());
    });

    function createPipeline(propertyBindings = null) {
      return new CompilePipeline([
        new MockStep( (parent, current, control) => {
          if (isPresent(propertyBindings)) {
            StringMapWrapper.forEach(propertyBindings, (ast, name) => {
              current.bindElement().bindProperty(name, ast);
            });
          }
        }),
        new DirectiveParser(parser, annotatedDirectives)
      ]);
    }

    function process(el, propertyBindings = null) {
      var pipeline = createPipeline(propertyBindings);
      return ListWrapper.map(pipeline.process(el), (ce) => ce.inheritedElementBinder );
    }

    it('should not add directives if they are not used', () => {
      var results = process(el('<div></div>'));
      expect(results[0]).toBe(null);
    });

    it('should detect directives in attributes', () => {
      var results = process(el('<div some-decor></div>'));
      expect(results[0].directives[0].directiveIndex).toBe(
        annotatedDirectives.indexOf(someDecorator)
      );
    });

    it('should compile children by default', () => {
      var results = createPipeline().process(el('<div some-decor></div>'));
      expect(results[0].compileChildren).toEqual(true);
    });

    it('should stop compiling children when specified in the directive config', () => {
      var results = createPipeline().process(el('<div some-decor-ignoring-children></div>'));
      expect(results[0].compileChildren).toEqual(false);
    });

    it('should bind directive properties from bound properties', () => {
      var results = process(
        el('<div some-decor-props></div>'),
        {
          'elProp': parser.parseBinding('someExpr', '')
        }
      );
      var directiveBinding = results[0].directives[0];
      expect(MapWrapper.get(directiveBinding.propertyBindings, 'dirProp').source)
        .toEqual('someExpr');
    });

    it('should bind directive properties with pipes', () => {
      var results = process(
        el('<div some-decor-props></div>'),
        {
          'elProp': parser.parseBinding('someExpr', '')
        }
      );
      var directiveBinding = results[0].directives[0];
      var pipedProp = MapWrapper.get(directiveBinding.propertyBindings, 'doubleProp');
      var simpleProp = MapWrapper.get(directiveBinding.propertyBindings, 'dirProp');
      expect(pipedProp.ast.name).toEqual('double');
      expect(pipedProp.ast.exp).toEqual(simpleProp.ast);
      expect(simpleProp.source).toEqual('someExpr');
    });

    it('should bind directive properties from attribute values', () => {
      var results = process(
        el('<div some-decor-props el-prop="someValue"></div>')
      );
      var directiveBinding = results[0].directives[0];
      var simpleProp = MapWrapper.get(directiveBinding.propertyBindings, 'dirProp');
      expect(simpleProp.source).toEqual('someValue');
    });

    it('should store working property setters', () => {
      var element = el('<input some-decor-props>');
      var results = process(element);
      var directiveBinding = results[0].directives[0];
      var setter = MapWrapper.get(directiveBinding.propertySetters, 'value');
      setter(element, 'abc');
      expect(element.value).toEqual('abc');
    });

    it('should bind directive events', () => {
      var results = process(
        el('<div some-decor-events></div>')
      );
      var directiveBinding = results[0].directives[0];
      expect(MapWrapper.get(directiveBinding.eventBindings, 'click').source)
        .toEqual('doIt()');
    });

    describe('viewport directives', () => {
      it('should not allow multiple viewport directives on the same element', () => {
        expect( () => {
          process(
            el('<template some-vp some-vp2></template>')
          );
        }).toThrowError('Only one viewport directive is allowed per element - check <template some-vp some-vp2>');
      });

      it('should not allow viewport directives on non <template> elements', () => {
        expect( () => {
          process(
            el('<div some-vp></div>')
          );
        }).toThrowError('Viewport directives need to be placed on <template> elements or elements with template attribute - check <div some-vp>');
      });
    });

    describe('component directives', () => {
      it('should save the component id', () => {
        var results = process(
          el('<div some-comp></div>')
        );
        expect(results[0].componentId).toEqual('someComponent');
      });

      it('should not allow multiple component directives on the same element', () => {
         expect( () => {
           process(
             el('<div some-comp some-comp2></div>')
           );
         }).toThrowError('Only one component directive is allowed per element - check <div some-comp some-comp2>');
      });

      it('should not allow component directives on <template> elements', () => {
         expect( () => {
           process(
             el('<template some-comp></template>')
           );
         }).toThrowError('Only template directives are allowed on template elements - check <template some-comp>');
       });
    });

  });
}

class MockStep extends CompileStep {
  processClosure:Function;
  constructor(process) {
    super();
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}

var someComponent = new DirectiveMetadata({
  selector: '[some-comp]',
  id: 'someComponent',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var someComponent2 = new DirectiveMetadata({
  selector: '[some-comp2]',
  id: 'someComponent2',
  type: DirectiveMetadata.COMPONENT_TYPE
});

var someViewport = new DirectiveMetadata({
  selector: '[some-vp]',
  id: 'someViewport',
  type: DirectiveMetadata.VIEWPORT_TYPE
});

var someViewport2 = new DirectiveMetadata({
  selector: '[some-vp2]',
  id: 'someViewport2',
  type: DirectiveMetadata.VIEWPORT_TYPE
});

var someDecorator = new DirectiveMetadata({
  selector: '[some-decor]'
});

var someDecoratorIgnoringChildren = new DirectiveMetadata({
  selector: '[some-decor-ignoring-children]',
  compileChildren: false
});

var someDecoratorWithProps = new DirectiveMetadata({
  selector: '[some-decor-props]',
  bind: MapWrapper.createFromStringMap({
    'dirProp': 'elProp',
    'doubleProp': 'elProp | double'
  }),
  setters: ['value']
});

var someDecoratorWithEvents = new DirectiveMetadata({
  selector: '[some-decor-events]',
  events: MapWrapper.createFromStringMap({
    'click': 'doIt()'
  })
});
