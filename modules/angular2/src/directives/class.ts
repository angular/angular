import {Directive, onCheck} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';
import {PipeRegistry} from 'angular2/src/change_detection/pipes/pipe_registry';
import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

@Directive({selector: '[class]', lifecycle: [onCheck], properties: ['rawClass: class']})
export class CSSClass {
  _domEl;
  _pipe;
  _rawClass;

  constructor(private _pipeRegistry: PipeRegistry, ngEl: ElementRef) {
    this._domEl = ngEl.domElement;
  }

  set rawClass(v) {
    this._rawClass = v;
    this._pipe = this._pipeRegistry.get('keyValDiff', this._rawClass);
  }

  _toggleClass(className, enabled): void {
    if (enabled) {
      DOM.addClass(this._domEl, className);
    } else {
      DOM.removeClass(this._domEl, className);
    }
  }

  onCheck() {
    var diff = this._pipe.transform(this._rawClass);
    if (isPresent(diff)) this._applyChanges(diff.wrapped);
  }

  private _applyChanges(diff) {
    if (isPresent(diff)) {
      diff.forEachAddedItem((record) => { this._toggleClass(record.key, record.currentValue); });
      diff.forEachChangedItem((record) => { this._toggleClass(record.key, record.currentValue); });
      diff.forEachRemovedItem((record) => {
        if (record.previousValue) {
          DOM.removeClass(this._domEl, record.key);
        }
      });
    }
  }
}
