import {Directive, onCheck} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';
import {PipeRegistry} from 'angular2/src/change_detection/pipes/pipe_registry';
import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

@Directive({selector: '[class]', lifecycle: [onCheck], properties: ['rawClass: class']})
export class CSSClass {
  _domEl;
  _pipe;
  _prevRawClass;
  rawClass;
  constructor(private _pipeRegistry: PipeRegistry, ngEl: ElementRef) {
    this._domEl = ngEl.domElement;
  }

  _toggleClass(className, enabled): void {
    if (enabled) {
      DOM.addClass(this._domEl, className);
    } else {
      DOM.removeClass(this._domEl, className);
    }
  }

  onCheck() {
    if (this.rawClass != this._prevRawClass) {
      this._prevRawClass = this.rawClass;
      this._pipe = isPresent(this.rawClass) ?
                       this._pipeRegistry.get('keyValDiff', this.rawClass, null) :
                       null;
    }

    if (isPresent(this._pipe) && this._pipe.check(this.rawClass)) {
      this._pipe.forEachAddedItem(
          (record) => { this._toggleClass(record.key, record.currentValue); });
      this._pipe.forEachChangedItem(
          (record) => { this._toggleClass(record.key, record.currentValue); });
      this._pipe.forEachRemovedItem((record) => {
        if (record.previousValue) {
          DOM.removeClass(this._domEl, record.key);
        }
      });
    }
  }
}
