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
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';

import {UrlResolver} from 'angular2/src/services/url_resolver';

import {resolveInternalDomProtoView} from 'angular2/src/render/dom/view/proto_view';

export function runCompilerCommonTests() {
  describe('DomCompiler', function() {
    var mockStepFactory;

    function createCompiler(processClosure, urlData = null) {
      if (isBlank(urlData)) {
        urlData = MapWrapper.create();
      }
      var tplLoader = new FakeTemplateLoader(urlData);
      mockStepFactory = new MockStepFactory([new MockStep(processClosure)]);
      return new DomCompiler(mockStepFactory, tplLoader);
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
                 expect(DOM.tagName(resolveInternalDomProtoView(protoView.render).element))
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
                 expect(DOM.getInnerHTML(resolveInternalDomProtoView(protoView.render).element))
                     .toEqual('inline component');
                 async.done();
               });
         }));

      it('should load url templates', inject([AsyncTestCompleter], (async) => {
           var urlData = MapWrapper.createFromStringMap({'someUrl': 'url component'});
           var compiler = createCompiler(EMPTY_STEP, urlData);
           compiler.compile(new ViewDefinition({componentId: 'someId', templateAbsUrl: 'someUrl'}))
               .then((protoView) => {
                 expect(DOM.getInnerHTML(resolveInternalDomProtoView(protoView.render).element))
                     .toEqual('url component');
                 async.done();
               });
         }));

      it('should report loading errors', inject([AsyncTestCompleter], (async) => {
           var compiler = createCompiler(EMPTY_STEP, MapWrapper.create());
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

      it('should wait for async subtasks to be resolved', inject([AsyncTestCompleter], (async) => {
           var subTasksCompleted = false;

           var completer = PromiseWrapper.completer();

           var compiler = createCompiler((parent, current, control) => {
             ListWrapper.push(mockStepFactory.subTaskPromises,
                              completer.promise.then((_) => { subTasksCompleted = true; }));
           });

           // It should always return a Promise because the subtask is async
           var pvPromise = compiler.compile(
               new ViewDefinition({componentId: 'someId', template: 'some component'}));
           expect(pvPromise).toBePromise();
           expect(subTasksCompleted).toEqual(false);

           // The Promise should resolve after the subtask is ready
           completer.resolve(null);
           pvPromise.then((protoView) => {
             expect(subTasksCompleted).toEqual(true);
             async.done();
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
  createSteps(viewDef, subTaskPromises) {
    this.viewDef = viewDef;
    this.subTaskPromises = subTaskPromises;
    ListWrapper.forEach(this.subTaskPromises, (p) => ListWrapper.push(subTaskPromises, p));
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

class FakeTemplateLoader extends TemplateLoader {
  _urlData: Map<string, string>;
  constructor(urlData) {
    super(null, new UrlResolver());
    this._urlData = urlData;
  }

  load(template: ViewDefinition) {
    if (isPresent(template.template)) {
      return PromiseWrapper.resolve(DOM.createTemplate(template.template));
    }

    if (isPresent(template.templateAbsUrl)) {
      var content = MapWrapper.get(this._urlData, template.templateAbsUrl);
      return isPresent(content) ?
                 PromiseWrapper.resolve(DOM.createTemplate(content)) :
                 PromiseWrapper.reject(`Failed to fetch url "${template.templateAbsUrl}"`, null);
    }

    throw new BaseException('View should have either the templateUrl or template property set');
  }
}

var someComponent = DirectiveMetadata.create(
    {selector: 'some-comp', id: 'someComponent', type: DirectiveMetadata.COMPONENT_TYPE});
