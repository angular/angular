import {Decorator} from 'angular2/src/core/annotations/annotations';
import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {NgElement} from 'angular2/src/core/dom/element';

@Decorator({
  selector: '[class]',
  bind: {
    'iterableChanges': 'class | keyValDiff'
  }
})
export class CSSClass {
  _domEl;
  constructor(ngEl: NgElement) {
    this._domEl = ngEl.domElement;
  }

  _toggleClass(record) {
    if (record.currentValue) {
      DOM.addClass(this._domEl, record.key);
    } else {
      DOM.removeClass(this._domEl, record.key);
    }
  }

  set iterableChanges(changes) {
    if (isPresent(changes)) {
      changes.forEachAddedItem((record) => { this._toggleClass(record); });
      changes.forEachChangedItem((record) => { this._toggleClass(record); });
      changes.forEachRemovedItem((record) => {
        if (record.previousValue) {
          DOM.removeClass(this._domEl, record.key);
        }
      });
    }
  }
}
