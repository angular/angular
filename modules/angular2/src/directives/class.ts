import {Directive} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';

import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

@Directive({selector: '[class]', properties: ['iterableChanges: class | keyValDiff']})
export class CSSClass {
  _domEl;
  constructor(ngEl: ElementRef) { this._domEl = ngEl.domElement; }

  _toggleClass(className, enabled): void {
    if (enabled) {
      DOM.addClass(this._domEl, className);
    } else {
      DOM.removeClass(this._domEl, className);
    }
  }

  set iterableChanges(changes) {
    if (isPresent(changes)) {
      changes.forEachAddedItem((record) => { this._toggleClass(record.key, record.currentValue); });
      changes.forEachChangedItem(
          (record) => { this._toggleClass(record.key, record.currentValue); });
      changes.forEachRemovedItem((record) => {
        if (record.previousValue) {
          DOM.removeClass(this._domEl, record.key);
        }
      });
    }
  }
}
