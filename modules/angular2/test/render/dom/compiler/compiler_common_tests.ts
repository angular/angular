import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  IS_DARTIUM,
  it,
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank, stringify, isPresent, BaseException} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {DomCompiler} from 'angular2/src/render/dom/compiler/compiler';
import {ProtoViewDto, ViewDefinition, DirectiveMetadata, ViewType} from 'angular2/src/render/api';
import {CompileElement} from 'angular2/src/render/dom/compiler/compile_element';
import {CompileStep} from 'angular2/src/render/dom/compiler/compile_step';
import {CompileStepFactory} from 'angular2/src/render/dom/compiler/compile_step_factory';
import {CompileControl} from 'angular2/src/render/dom/compiler/compile_control';
import {ViewLoader} from 'angular2/src/render/dom/compiler/view_loader';
import {MockElementSchemaRegistry} from 'angular2/src/mock/element_schema_registry_mock';

import {resolveInternalDomProtoView} from 'angular2/src/render/dom/view/proto_view';

export function runCompilerCommonTests() {
  describe('DomCompiler', function() {
    var mockStepFactory: MockStepFactory;

    function createCompiler(processClosure, urlData = null) {
      if (isBlank(urlData)) {
        urlData = new Map();
      }
      var tplLoader = new FakeViewLoader(urlData);
      mockStepFactory = new MockStepFactory([new MockStep(processClosure)]);
      return new DomCompiler(mockStepFactory, tplLoader, new MockElementSchemaRegistry(), false);
    }

    describe('compile', () => {

      it('should run the steps and build the AppProtoView of the root element',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler((parent, current, control) => {
             current.inheritedProtoView.bindVariable('b', 'a');
           });
           compiler.compile(
                       new ViewDefinition({componentId: 'someComponent', template: '<div></div>'}))
               .then((protoView) => {
                 expect(protoView.variableBindings)
                     .toEqual(MapWrapper.createFromStringMap({'a': 'b'}));
                 async.done();
               });
         }));

      it('should run the steps and build the proto view', inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler((parent, current, control) => {
             current.inheritedProtoView.bindVariable('b', 'a');
           });

           var dirMetadata = DirectiveMetadata.create(
               {id: 'id', selector: 'CUSTOM', type: DirectiveMetadata.COMPONENT_TYPE});
           compiler.compileHost(dirMetadata)
               .then((protoView) => {
                 expect(DOM.tagName(DOM.firstChild(DOM.content(
                            resolveInternalDomProtoView(protoView.render).rootElement))))
                     .toEqual('CUSTOM');
                 expect(mockStepFactory.viewDef.directives).toEqual([dirMetadata]);
                 expect(protoView.variableBindings)
                     .toEqual(MapWrapper.createFromStringMap({'a': 'b'}));
                 async.done();
               });
         }));

      it('should use the inline template and compile in sync',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP);
           compiler.compile(
                       new ViewDefinition({componentId: 'someId', template: 'inline component'}))
               .then((protoView) => {
                 expect(DOM.getInnerHTML(resolveInternalDomProtoView(protoView.render).rootElement))
                     .toEqual('inline component');
                 async.done();
               });
         }));

      it('should load url templates', inject([AsyncTestCompleter], (async) => {
           var urlData = MapWrapper.createFromStringMap({'someUrl': 'url component'});
           var compiler = createCompiler(EMPTY_STEP, urlData);
           compiler.compile(new ViewDefinition({componentId: 'someId', templateAbsUrl: 'someUrl'}))
               .then((protoView) => {
                 expect(DOM.getInnerHTML(resolveInternalDomProtoView(protoView.render).rootElement))
                     .toEqual('url component');
                 async.done();
               });
         }));

      it('should report loading errors', inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP, new Map());
           PromiseWrapper.catchError(
               compiler.compile(
                   new ViewDefinition({componentId: 'someId', templateAbsUrl: 'someUrl'})),
               (e) => {
                 expect(e.message).toEqual(
                     'Failed to load the template for "someId" : Failed to fetch url "someUrl"');
                 async.done();
                 return null;
               });
         }));

      it('should return ProtoViews of type COMPONENT_VIEW_TYPE',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP);
           compiler.compile(
                       new ViewDefinition({componentId: 'someId', template: 'inline component'}))
               .then((protoView) => {
                 expect(protoView.type).toEqual(ViewType.COMPONENT);
                 async.done();
               });
         }));

    });

    describe('compileHost', () => {

      it('should return ProtoViews of type HOST_VIEW_TYPE',
         inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP);
           compiler.compileHost(someComponent)
               .then((protoView) => {
                 expect(protoView.type).toEqual(ViewType.HOST);
                 async.done();
               });
         }));

    });

  });
}

class MockStepFactory extends CompileStepFactory {
  steps: List<CompileStep>;
  subTaskPromises: List<Promise<any>>;
  viewDef: ViewDefinition;

  constructor(steps) {
    super();
    this.steps = steps;
  }
  createSteps(viewDef): List<CompileStep> {
    this.viewDef = viewDef;
    return this.steps;
  }
}

class MockStep implements CompileStep {
  processClosure: Function;
  constructor(process) { this.processClosure = process; }
  process(parent: CompileElement, current: CompileElement, control: CompileControl) {
    this.processClosure(parent, current, control);
  }
}

var EMPTY_STEP = (parent, current, control) => {
  if (isPresent(parent)) {
    current.inheritedProtoView = parent.inheritedProtoView;
  }
};

class FakeViewLoader extends ViewLoader {
  _urlData: Map<string, string>;
  constructor(urlData) {
    super(null, null, null);
    this._urlData = urlData;
  }

  load(view: ViewDefinition): Promise<any> {
    if (isPresent(view.template)) {
      return PromiseWrapper.resolve(DOM.createTemplate(view.template));
    }

    if (isPresent(view.templateAbsUrl)) {
      var content = this._urlData.get(view.templateAbsUrl);
      return isPresent(content) ?
                 PromiseWrapper.resolve(DOM.createTemplate(content)) :
                 PromiseWrapper.reject(`Failed to fetch url "${view.templateAbsUrl}"`, null);
    }

    throw new BaseException('View should have either the templateUrl or template property set');
  }
}

var someComponent = DirectiveMetadata.create(
    {selector: 'some-comp', id: 'someComponent', type: DirectiveMetadata.COMPONENT_TYPE});
