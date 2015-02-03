import {isBlank} from 'facade/src/lang';
import {List, ListWrapper} from 'facade/src/collection';
import {DOM, Element} from 'facade/src/dom';
import {CompileElement} from './compile_element';
import {CompileStep} from './compile_step';

/**
 * Controls the processing order of elements.
 * Right now it only allows to add a parent element.
 */
export class CompileControl {
  _steps:List<CompileStep>;
  _currentStepIndex:number;
  _parent:CompileElement;
  _results;
  _additionalChildren;
  constructor(steps) {
    this._steps = steps;
    this._currentStepIndex = 0;
    this._parent = null;
    this._results = null;
    this._additionalChildren = null;
  }

  // only public so that it can be used by compile_pipeline
  internalProcess(results, startStepIndex, parent:CompileElement, current:CompileElement) {
    this._results = results;
    var previousStepIndex = this._currentStepIndex;
    var previousParent = this._parent;

    for (var i=startStepIndex; i<this._steps.length; i++) {
      var step = this._steps[i];
      this._parent = parent;
      this._currentStepIndex = i;
      step.process(parent, current, this);
      parent = this._parent;
    }
    ListWrapper.push(results, current);

    this._currentStepIndex = previousStepIndex;
    this._parent = previousParent;

    var localAdditionalChildren = this._additionalChildren;
    this._additionalChildren = null;
    return localAdditionalChildren;
  }

  addParent(newElement:CompileElement) {
    this.internalProcess(this._results, this._currentStepIndex+1, this._parent, newElement);
    this._parent = newElement;
  }

  addChild(element:CompileElement) {
    if (isBlank(this._additionalChildren)) {
      this._additionalChildren = ListWrapper.create();
    }
    ListWrapper.push(this._additionalChildren, element);
  }
}
