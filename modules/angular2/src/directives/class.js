import {Decorator} from 'angular2/src/core/annotations/annotations';
import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {NgElement} from 'angular2/src/core/compiler/ng_element';

@Decorator({
  selector: '[class]',
  properties: {
    'iterableChanges': 'class | keyValDiff'
  }
})
export class CSSClass {
  _domEl;
  constructor(ngEl: NgElement) {
    this._domEl = ngEl.domElement;
  }

  _toggleClass(className, enabled):void {
    if (enabled) {
      DOM.addClass(this._domEl, className);
    } else {
      DOM.removeClass(this._domEl, className);
    }
  }

  set iterableChanges(changes) {
    if (isPresent(changes)) {
      changes.forEachAddedItem((record) => { this._toggleClass(record.key, record.currentValue); });
      changes.forEachChangedItem((record) => { this._toggleClass(record.key, record.currentValue); });
      changes.forEachRemovedItem((record) => {
        if (record.previousValue) {
          DOM.removeClass(this._domEl, record.key);
        }
      });
    }
  }
}
