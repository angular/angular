import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {ListWrapper} from 'facade/collection';
import {DOM} from 'facade/dom';
import {isPresent, NumberWrapper} from 'facade/lang';

import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';

export function main() {
  describe('compile_pipeline', () => {
    var logs, pipeline, loggingStep;

    beforeEach( () => {
      logs = [];
      loggingStep = new LoggingStep(logs);
    });

    it('should walk the tree in depth first order including template contents', () => {
      var element = createElement('<div id="1"><template id="2"><span id="3"></span></template></div>');

      var step0Log = [];
      var results = new CompilePipeline([createLoggerStep(step0Log)]).process(element);

      expect(step0Log).toEqual(['1', '1<2', '2<3']);
      expect(resultIdLog(results)).toEqual(['1', '2', '3']);
    });

    describe('control.addParent', () => {
      it('should wrap the underlying DOM element', () => {
        var element = createElement('<div id="1"><span wrap0="1" id="2"><b id="3"></b></span></div>');
        var pipeline = new CompilePipeline([
          createWrapperStep('wrap0', [])
        ]);
        pipeline.process(element);

        expect(DOM.getOuterHTML(element)).toEqual('<div id="1"><a id="wrap0#0"><span wrap0="1" id="2"><b id="3"></b></span></a></div>');
      });

      it('should report the new parent to the following processor and the result', () => {
        var element = createElement('<div id="1"><span wrap0="1" id="2"><b id="3"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var pipeline = new CompilePipeline([
          createWrapperStep('wrap0', step0Log),
          createLoggerStep(step1Log)
        ]);
        var result = pipeline.process(element);
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', '2', '3']);
      });

      it('should allow to add a parent by multiple processors to the same element', () => {
        var element = createElement('<div id="1"><span wrap0="1" wrap1="1" id="2"><b id="3"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var step2Log = [];
        var pipeline = new CompilePipeline([
          createWrapperStep('wrap0', step0Log),
          createWrapperStep('wrap1', step1Log),
          createLoggerStep(step2Log)
        ]);
        var result = pipeline.process(element);
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<3']);
        expect(step2Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<wrap1#0', 'wrap1#0<2', '2<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', 'wrap1#0', '2', '3']);
      });

      it('should allow to add a parent by multiple processors to different elements', () => {
        var element = createElement('<div id="1"><span wrap0="1" id="2"><b id="3" wrap1="1"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var step2Log = [];
        var pipeline = new CompilePipeline([
          createWrapperStep('wrap0', step0Log),
          createWrapperStep('wrap1', step1Log),
          createLoggerStep(step2Log)
        ]);
        var result = pipeline.process(element);
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<3']);
        expect(step2Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<2', '2<wrap1#0', 'wrap1#0<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', '2', 'wrap1#0', '3']);
      });

      it('should allow to add multiple parents by the same processor', () => {
        var element = createElement('<div id="1"><span wrap0="2" id="2"><b id="3"></b></span></div>');
        var step0Log = [];
        var step1Log = [];
        var pipeline = new CompilePipeline([
          createWrapperStep('wrap0', step0Log),
          createLoggerStep(step1Log)
        ]);
        var result = pipeline.process(element);
        expect(step0Log).toEqual(['1', '1<2', '2<3']);
        expect(step1Log).toEqual(['1', '1<wrap0#0', 'wrap0#0<wrap0#1', 'wrap0#1<2', '2<3']);
        expect(resultIdLog(result)).toEqual(['1', 'wrap0#0', 'wrap0#1', '2', '3']);
      });

    });

  });
}

class MockStep extends CompileStep {
  constructor(process) {
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}

class LoggingStep extends CompileStep {
  constructor(logs) {
    this.logs = logs;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    ListWrapper.push(this.logs, {'parent':parent, 'current':current});
  }
}

function logEntry(log, parent, current) {
  var parentId = '';
  if (isPresent(parent)) {
    parentId = parent.element.getAttribute('id')+'<';
  }
  ListWrapper.push(log, parentId+current.element.getAttribute('id'));
}

function createLoggerStep(log) {
  return new MockStep((parent, current, control) => {
    logEntry(log, parent, current);
  });
}

function createWrapperStep(wrapperId, log) {
  var nextElementId = 0;
  return new MockStep((parent, current, control) => {
    var parentCountStr = current.element.getAttribute(wrapperId);
    if (isPresent(parentCountStr)) {
      var parentCount = NumberWrapper.parseInt(parentCountStr, 10);
      while (parentCount > 0) {
        control.addParent(new CompileElement(createElement(`<a id="${wrapperId}#${nextElementId++}"></a>`)));
        parentCount--;
      }
    }
    logEntry(log, parent, current);
  });
}

function resultIdLog(result) {
  var idLog = [];
  ListWrapper.forEach(result, (current) => {
    logEntry(idLog, null, current);
  });
  return idLog;
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
