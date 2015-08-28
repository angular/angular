import {isBlank} from 'angular2/src/core/facade/lang';
import {CompileElement} from './compile_element';
import {CompileStep} from './compile_step';

/**
 * Controls the processing order of elements.
 * Right now it only allows to add a parent element.
 */
export class CompileControl {
  _currentStepIndex: number = 0;
  _parent: CompileElement = null;
  _results: any[] = null;
  _additionalChildren: CompileElement[] = null;
  _ignoreCurrentElement: boolean;

  constructor(public _steps: CompileStep[]) {}

  // only public so that it can be used by compile_pipeline
  internalProcess(results: any[], startStepIndex: number, parent: CompileElement,
                  current: CompileElement): CompileElement[] {
    this._results = results;
    var previousStepIndex = this._currentStepIndex;
    var previousParent = this._parent;

    this._ignoreCurrentElement = false;

    for (var i = startStepIndex; i < this._steps.length && !this._ignoreCurrentElement; i++) {
      var step = this._steps[i];
      this._parent = parent;
      this._currentStepIndex = i;
      step.processElement(parent, current, this);
      parent = this._parent;
    }

    if (!this._ignoreCurrentElement) {
      results.push(current);
    }

    this._currentStepIndex = previousStepIndex;
    this._parent = previousParent;

    var localAdditionalChildren = this._additionalChildren;
    this._additionalChildren = null;
    return localAdditionalChildren;
  }

  addParent(newElement: CompileElement) {
    this.internalProcess(this._results, this._currentStepIndex + 1, this._parent, newElement);
    this._parent = newElement;
  }

  addChild(element: CompileElement) {
    if (isBlank(this._additionalChildren)) {
      this._additionalChildren = [];
    }
    this._additionalChildren.push(element);
  }

  /**
   * Ignores the current element.
   *
   * When a step calls `ignoreCurrentElement`, no further steps are executed on the current
   * element and no `CompileElement` is added to the result list.
   */
  ignoreCurrentElement() { this._ignoreCurrentElement = true; }
}
