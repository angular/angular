import {describe, beforeEach, it, expect, iit, ddescribe, el} from 'angular2/test_lib';
import {ListWrapper, List, MapWrapper} from 'angular2/src/core/facade/collection';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {isPresent, NumberWrapper, StringWrapper, IMPLEMENTS} from 'angular2/src/core/facade/lang';

import {CompilePipeline} from 'angular2/src/core/render/dom/compiler/compile_pipeline';
import {CompileElement} from 'angular2/src/core/render/dom/compiler/compile_element';
import {CompileStep} from 'angular2/src/core/render/dom/compiler/compile_step';
import {CompileControl} from 'angular2/src/core/render/dom/compiler/compile_control';

import {ProtoViewBuilder} from 'angular2/src/core/render/dom/view/proto_view_builder';
import {
  ProtoViewDto,
  ViewType,
  ViewEncapsulation,
  ViewDefinition
} from 'angular2/src/core/render/api';

export function main() {
  describe('compile_pipeline', () => {
    function createViewDefinition(): ViewDefinition {
      return new ViewDefinition({componentId: 'someComponent'});
    }

    describe('children compilation', () => {
      it('should walk the tree in depth first order including template contents', () => {
        var element = el('<div id="1"><template id="2"><span id="3"></span></template></div>');

        var step0Log = [];
        var results = new CompilePipeline([createLoggerStep(step0Log)])
                          .processElements(element, ViewType.COMPONENT, createViewDefinition());

        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(resultIdLog(results)).toEqual(['1', '2', '3']);
      });

      it('should stop walking the tree when compileChildren is false', () => {
        var element = el(
            '<div id="1"><template id="2" ignore-children><span id="3"></span></template></div>');

        var step0Log = [];
        var pipeline = new CompilePipeline([new IgnoreChildrenStep(), createLoggerStep(step0Log)]);
        var results = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());

        expect(step0Log).toEqual(['1', '1<2']);
        expect(resultIdLog(results)).toEqual(['1', '2']);
      });
    });

    it('should inherit protoViewBuilders to children', () => {
      var element = el('<div><div><span viewroot><span></span></span></div></div>');
      var pipeline = new CompilePipeline([
        new MockStep((parent, current, control) => {
          if (isPresent(DOM.getAttribute(current.element, 'viewroot'))) {
            current.inheritedProtoView =
                new ProtoViewBuilder(current.element, ViewType.EMBEDDED, ViewEncapsulation.NONE);
          }
        })
      ]);
      var results = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
      expect(results[0].inheritedProtoView).toBe(results[1].inheritedProtoView);
      expect(results[2].inheritedProtoView).toBe(results[3].inheritedProtoView);
    });

    it('should inherit elementBinderBuilders to children', () => {
      var element = el('<div bind><div><span bind><span></span></span></div></div>');
      var pipeline = new CompilePipeline([
        new MockStep((parent, current, control) => {
          if (isPresent(DOM.getAttribute(current.element, 'bind'))) {
            current.bindElement();
          }
        })
      ]);
      var results = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
      expect(results[0].inheritedElementBinder).toBe(results[1].inheritedElementBinder);
      expect(results[2].inheritedElementBinder).toBe(results[3].inheritedElementBinder);
    });

    it('should mark root elements as viewRoot', () => {
      var rootElement = el('<div></div>');
      var results = new CompilePipeline([])
                        .processElements(rootElement, ViewType.COMPONENT, createViewDefinition());
      expect(results[0].isViewRoot).toBe(true);
    });

    it('should calculate distanceToParent / parent correctly', () => {
      var element = el('<div bind><div bind></div><div><div bind></div></div></div>');
      var pipeline = new CompilePipeline([
        new MockStep((parent, current, control) => {
          if (isPresent(DOM.getAttribute(current.element, 'bind'))) {
            current.bindElement();
          }
        })
      ]);
      var results = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
      expect(results[0].inheritedElementBinder.distanceToParent).toBe(0);
      expect(results[1].inheritedElementBinder.distanceToParent).toBe(1);
      expect(results[3].inheritedElementBinder.distanceToParent).toBe(2);
      expect(results[1].inheritedElementBinder.parent).toBe(results[0].inheritedElementBinder);
      expect(results[3].inheritedElementBinder.parent).toBe(results[0].inheritedElementBinder);
    });

    it('should not execute further steps when ignoreCurrentElement has been called', () => {
      var element = el('<div id="1"><span id="2" ignore-current></span><span id="3"></span></div>');
      var logs = [];
      var pipeline = new CompilePipeline([
        new IgnoreCurrentElementStep(),
        createLoggerStep(logs),
      ]);
      var results = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());

      expect(results.length).toBe(2);
      expect(logs).toEqual(['1', '1<3'])
    });

    describe('control.addParent', () => {
      it('should report the new parent to the following processor and the result', () => {
        var element = el('<div id="1"><span wrap0="1" id="2"><b id="3"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var pipeline =
            new CompilePipeline([createWrapperStep('wrap0', step0Log), createLoggerStep(step1Log)]);
        var result = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', '2', '3']);
      });

      it('should allow to add a parent by multiple processors to the same element', () => {
        var element =
            el('<div id="1"><span wrap0="1" wrap1="1" id="2"><b id="3"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var step2Log = [];
        var pipeline = new CompilePipeline([
          createWrapperStep('wrap0', step0Log),
          createWrapperStep('wrap1', step1Log),
          createLoggerStep(step2Log)
        ]);
        var result = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<3']);
        expect(step2Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<wrap1#0', 'wrap1#0<2', '2<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', 'wrap1#0', '2', '3']);
      });

      it('should allow to add a parent by multiple processors to different elements', () => {
        var element =
            el('<div id="1"><span wrap0="1" id="2"><b id="3" wrap1="1"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var step2Log = [];
        var pipeline = new CompilePipeline([
          createWrapperStep('wrap0', step0Log),
          createWrapperStep('wrap1', step1Log),
          createLoggerStep(step2Log)
        ]);
        var result = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<3']);
        expect(step2Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<wrap1#0', 'wrap1#0<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', '2', 'wrap1#0', '3']);
      });

      it('should allow to add multiple parents by the same processor', () => {
        var element = el('<div id="1"><span wrap0="2" id="2"><b id="3"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var pipeline =
            new CompilePipeline([createWrapperStep('wrap0', step0Log), createLoggerStep(step1Log)]);
        var result = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<wrap0#1', 'wrap0#1<2', '2<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', 'wrap0#1', '2', '3']);
      });

    });

    describe('control.addChild', () => {
      it('should report the new child to all processors and the result', () => {
        var element = el('<div id="1"><div id="2"></div></div>');
        var resultLog = [];
        var newChild = new CompileElement(el('<div id="3"></div>'));
        var pipeline = new CompilePipeline([
          new MockStep((parent, current, control) => {
            if (StringWrapper.equals(DOM.getAttribute(current.element, 'id'), '1')) {
              control.addChild(newChild);
            }
          }),
          createLoggerStep(resultLog)
        ]);
        var result = pipeline.processElements(element, ViewType.COMPONENT, createViewDefinition());
        expect(result[2]).toBe(newChild);
        expect(resultLog).toEqual(['1', '1<2', '1<3']);
        expect(resultIdLog(result)).toEqual(['1', '2', '3']);
      });
    });

    describe('processStyles', () => {
      it('should call the steps for every style', () => {
        var stepCalls = [];
        var pipeline = new CompilePipeline([
          new MockStep(null,
                       (style) => {
                         stepCalls.push(style);
                         return style;
                       })
        ]);
        var result = pipeline.processStyles(['a', 'b']);
        expect(result[0]).toEqual('a');
        expect(result[1]).toEqual('b');
        expect(result).toEqual(stepCalls);
      });
    });

  });
}

export class MockStep implements CompileStep {
  constructor(private processElementClosure: Function,
              private processStyleClosure: Function = null) {}
  processElement(parent: CompileElement, current: CompileElement, control: CompileControl) {
    if (isPresent(this.processElementClosure)) {
      this.processElementClosure(parent, current, control);
    }
  }
  processStyle(style: string): string {
    if (isPresent(this.processStyleClosure)) {
      return this.processStyleClosure(style);
    } else {
      return style;
    }
  }
}

export class IgnoreChildrenStep implements CompileStep {
  processElement(parent: CompileElement, current: CompileElement, control: CompileControl) {
    var attributeMap = DOM.attributeMap(current.element);
    if (attributeMap.has('ignore-children')) {
      current.compileChildren = false;
    }
  }
  processStyle(style: string): string { return style; }
}

class IgnoreCurrentElementStep implements CompileStep {
  processElement(parent: CompileElement, current: CompileElement, control: CompileControl) {
    var attributeMap = DOM.attributeMap(current.element);
    if (attributeMap.has('ignore-current')) {
      control.ignoreCurrentElement();
    }
  }
  processStyle(style: string): string { return style; }
}

function logEntry(log: string[], parent, current) {
  var parentId = '';
  if (isPresent(parent)) {
    parentId = DOM.getAttribute(parent.element, 'id') + '<';
  }
  log.push(parentId + DOM.getAttribute(current.element, 'id'));
}

function createLoggerStep(log: string[]) {
  return new MockStep((parent, current, control) => { logEntry(log, parent, current); });
}

function createWrapperStep(wrapperId, log) {
  var nextElementId = 0;
  return new MockStep((parent, current, control) => {
    var parentCountStr = DOM.getAttribute(current.element, wrapperId);
    if (isPresent(parentCountStr)) {
      var parentCount = NumberWrapper.parseInt(parentCountStr, 10);
      while (parentCount > 0) {
        control.addParent(new CompileElement(el(`<a id="${wrapperId}#${nextElementId++}"></a>`)));
        parentCount--;
      }
    }
    logEntry(log, parent, current);
  });
}

function resultIdLog(result) {
  var idLog = [];
  ListWrapper.forEach(result, (current) => { logEntry(idLog, null, current); });
  return idLog;
}
