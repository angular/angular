import {describe, beforeEach, it, xit, expect, iit, ddescribe, el} from 'angular2/test_lib';
import {isPresent, isBlank, assertionsEnabled} from 'angular2/src/core/facade/lang';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {DirectiveParser} from 'angular2/src/core/render/dom/compiler/directive_parser';
import {CompilePipeline} from 'angular2/src/core/render/dom/compiler/compile_pipeline';
import {ViewDefinition, RenderDirectiveMetadata, ViewType} from 'angular2/src/core/render/api';
import {Lexer, Parser} from 'angular2/src/core/change_detection/change_detection';
import {ElementBinderBuilder} from 'angular2/src/core/render/dom/view/proto_view_builder';
import {MockStep} from './pipeline_spec';

export function main() {
  describe('DirectiveParser', () => {
    var parser, annotatedDirectives;

    beforeEach(() => {
      annotatedDirectives = [
        someComponent,
        someComponent2,
        someDirective,
        someDirectiveIgnoringChildren,
        decoratorWithMultipleAttrs,
        someDirectiveWithProps,
        someDirectiveWithHostProperties,
        someDirectiveWithInvalidHostProperties,
        someDirectiveWithHostAttributes,
        someDirectiveWithEvents,
        someDirectiveWithGlobalEvents
      ];
      parser = new Parser(new Lexer());
    });

    function createPipeline(propertyBindings = null, directives = null) {
      if (isBlank(directives)) directives = annotatedDirectives;

      return new CompilePipeline([
        new MockStep((parent, current, control) => {
          if (isPresent(propertyBindings)) {
            StringMapWrapper.forEach(propertyBindings, (ast, name) => {
              current.bindElement().bindProperty(name, ast);
            });
          }
        }),
        new DirectiveParser(parser, directives)
      ]);
    }

    function createViewDefinition(): ViewDefinition {
      return new ViewDefinition({componentId: 'someComponent'});
    }

    function process(el, propertyBindings = null, directives = null): List<ElementBinderBuilder> {
      var pipeline = createPipeline(propertyBindings, directives);
      return ListWrapper.map(
          pipeline.processElements(el, ViewType.COMPONENT, createViewDefinition()),
          (ce) => ce.inheritedElementBinder);
    }

    it('should not add directives if they are not used', () => {
      var results = process(el('<div></div>'));
      expect(results[0]).toBe(null);
    });

    it('should detect directives in attributes', () => {
      var results = process(el('<div some-decor></div>'));
      expect(results[0].directives[0].directiveIndex)
          .toBe(annotatedDirectives.indexOf(someDirective));
    });

    it('should detect directives with multiple attributes', () => {
      var results = process(el('<input type=text control=one></input>'));
      expect(results[0].directives[0].directiveIndex)
          .toBe(annotatedDirectives.indexOf(decoratorWithMultipleAttrs));
    });

    it('should compile children by default', () => {
      var results = createPipeline().processElements(el('<div some-decor></div>'),
                                                     ViewType.COMPONENT, createViewDefinition());
      expect(results[0].compileChildren).toEqual(true);
    });

    it('should stop compiling children when specified in the directive config', () => {
      var results = createPipeline().processElements(el('<div some-decor-ignoring-children></div>'),
                                                     ViewType.COMPONENT, createViewDefinition());
      expect(results[0].compileChildren).toEqual(false);
    });

    it('should bind directive properties from bound properties', () => {
      var results = process(el('<div some-decor-props></div>'),
                            {'elProp': parser.parseBinding('someExpr', '')});
      var directiveBinding = results[0].directives[0];
      expect(directiveBinding.propertyBindings.get('dirProp').source).toEqual('someExpr');
    });

    it('should bind directive properties from attribute values', () => {
      var results = process(el('<div some-decor-props el-prop="someValue"></div>'));
      var directiveBinding = results[0].directives[0];
      var simpleProp = directiveBinding.propertyBindings.get('dirProp');
      expect(simpleProp.source).toEqual('someValue');
    });

    it('should bind host directive properties', () => {
      var element = el('<input some-decor-with-host-props>');
      var results = process(element);

      var directiveBinding = results[0].directives[0];

      var ast = directiveBinding.hostPropertyBindings.get('hostProp');
      expect(ast.source).toEqual('dirProp');
    });

    it('should throw when parsing invalid host properties', () => {
      expect(() => process(el('<input some-decor-with-invalid-host-props>')))
          .toThrowError(
              new RegExp('Simple binding expression can only contain field access and constants'));
    });

    it('should set host element attributes', () => {
      var element = el('<input some-decor-with-host-attrs>');
      var results = process(element);

      expect(DOM.getAttribute(results[0].element, 'attr_name')).toEqual('attr_val');
    });

    it('should not set host element attribute if an attribute already exists', () => {
      var element = el('<input attr_name="initial" some-decor-with-host-attrs>');
      var results = process(element);

      expect(DOM.getAttribute(results[0].element, 'attr_name')).toEqual('initial');

      DOM.removeAttribute(element, 'attr_name');
      results = process(element);
      expect(DOM.getAttribute(results[0].element, 'attr_name')).toEqual('attr_val');
    });

    it('should add CSS classes if "class" specified in host element attributes', () => {
      var element = el('<input class="foo baz" some-decor-with-host-attrs>');
      var results = process(element);

      expect(DOM.hasClass(results[0].element, 'foo')).toBeTruthy();
      expect(DOM.hasClass(results[0].element, 'bar')).toBeTruthy();
      expect(DOM.hasClass(results[0].element, 'baz')).toBeTruthy();
    });

    it('should read attribute values', () => {
      var element = el('<input some-decor-props some-attr="someValue">');
      var results = process(element);
      expect(results[0].readAttributes.get('some-attr')).toEqual('someValue');
    });

    it('should bind directive events', () => {
      var results = process(el('<div some-decor-events></div>'));
      var directiveBinding = results[0].directives[0];
      expect(directiveBinding.eventBindings.length).toEqual(1);
      var eventBinding = directiveBinding.eventBindings[0];
      expect(eventBinding.fullName).toEqual('click');
      expect(eventBinding.source.source).toEqual('doIt()');
    });

    it('should bind directive global events', () => {
      var results = process(el('<div some-decor-globalevents></div>'));
      var directiveBinding = results[0].directives[0];
      expect(directiveBinding.eventBindings.length).toEqual(1);
      var eventBinding = directiveBinding.eventBindings[0];
      expect(eventBinding.fullName).toEqual('window:resize');
      expect(eventBinding.source.source).toEqual('doItGlobal()');
    });

    // TODO: assertions should be enabled when running tests:
    // https://github.com/angular/angular/issues/1340
    describe('component directives', () => {
      it('should save the component id', () => {
        var results = process(el('<some-comp></some-comp>'));
        expect(results[0].componentId).toEqual('someComponent');
      });

      it('should not allow multiple component directives on the same element', () => {
        expect(() => {
          process(el('<some-comp></some-comp>'), null, [someComponent, someComponentDup]);
        }).toThrowError(new RegExp('Only one component directive is allowed per element'));
      });

      it('should sort the directives and store the component as the first directive', () => {
        var results = process(el('<some-comp some-decor></some-comp>'));
        expect(annotatedDirectives[results[0].directives[0].directiveIndex].id)
            .toEqual('someComponent');
        expect(annotatedDirectives[results[0].directives[1].directiveIndex].id)
            .toEqual('someDirective');
      });
    });
  });
}

var someComponent = RenderDirectiveMetadata.create(
    {selector: 'some-comp', id: 'someComponent', type: RenderDirectiveMetadata.COMPONENT_TYPE});

var someComponentDup = RenderDirectiveMetadata.create(
    {selector: 'some-comp', id: 'someComponentDup', type: RenderDirectiveMetadata.COMPONENT_TYPE});

var someComponent2 = RenderDirectiveMetadata.create(
    {selector: 'some-comp2', id: 'someComponent2', type: RenderDirectiveMetadata.COMPONENT_TYPE});

var someDirective = RenderDirectiveMetadata.create(
    {selector: '[some-decor]', id: 'someDirective', type: RenderDirectiveMetadata.DIRECTIVE_TYPE});

var someDirectiveIgnoringChildren = RenderDirectiveMetadata.create({
  selector: '[some-decor-ignoring-children]',
  compileChildren: false,
  type: RenderDirectiveMetadata.DIRECTIVE_TYPE

});

var decoratorWithMultipleAttrs = RenderDirectiveMetadata.create({
  selector: 'input[type=text][control]',
  id: 'decoratorWithMultipleAttrs',
  type: RenderDirectiveMetadata.DIRECTIVE_TYPE
});

var someDirectiveWithProps = RenderDirectiveMetadata.create({
  selector: '[some-decor-props]',
  properties: ['dirProp: elProp'],
  readAttributes: ['some-attr']
});

var someDirectiveWithHostProperties = RenderDirectiveMetadata.create({
  selector: '[some-decor-with-host-props]',
  host: MapWrapper.createFromStringMap<string>({'[hostProp]': 'dirProp'})
});

var someDirectiveWithInvalidHostProperties = RenderDirectiveMetadata.create({
  selector: '[some-decor-with-invalid-host-props]',
  host: MapWrapper.createFromStringMap<string>({'[hostProp]': 'dirProp + dirProp2'})
});

var someDirectiveWithHostAttributes = RenderDirectiveMetadata.create({
  selector: '[some-decor-with-host-attrs]',
  host: MapWrapper.createFromStringMap<string>({'attr_name': 'attr_val', 'class': 'foo bar'})
});

var someDirectiveWithEvents = RenderDirectiveMetadata.create({
  selector: '[some-decor-events]',
  host: MapWrapper.createFromStringMap<string>({'(click)': 'doIt()'})
});

var someDirectiveWithGlobalEvents = RenderDirectiveMetadata.create({
  selector: '[some-decor-globalevents]',
  host: MapWrapper.createFromStringMap<string>({'(window:resize)': 'doItGlobal()'})
});

var componentWithNonElementSelector = RenderDirectiveMetadata.create({
  id: 'componentWithNonElementSelector',
  selector: '[attr]',
  type: RenderDirectiveMetadata.COMPONENT_TYPE
});
