import {List, ListWrapper} from 'facade/collection';
import {DOM} from 'facade/dom';
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
  _current:CompileElement;
  _results;
  constructor(steps) {
    this._steps = steps;
    this._currentStepIndex = 0;
    this._parent = null;
    this._current = null;
    this._results = null;
  }

  // only public so that it can be used by compile_pipeline
  internalProcess(results, startStepIndex, parent:CompileElement, current:CompileElement) {
    this._results = results;
    var previousStepIndex = this._currentStepIndex;
    var previousParent = this._parent;

    for (var i=startStepIndex; i<this._steps.length; i++) {
      var step = this._steps[i];
      this._parent = parent;
      this._current = current;
      this._currentStepIndex = i;
      step.process(parent, current, this);
      parent = this._parent;
    }
    ListWrapper.push(results, current);

    this._currentStepIndex = previousStepIndex;
    this._parent = previousParent;
  }

  addParent(newElement:CompileElement) {
    var currEl = this._current.element;
    var newEl = newElement.element;
    DOM.parentElement(currEl).insertBefore(newEl, currEl);
    DOM.appendChild(newEl, currEl);

    this.internalProcess(this._results, this._currentStepIndex+1, this._parent, newElement);
    this._parent = newElement;
  }
}
