import {Directive, LifecycleEvent} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';
import {Pipes} from 'angular2/src/change_detection/pipes/pipes';
import {Pipe} from 'angular2/src/change_detection/pipes/pipe';
import {Renderer} from 'angular2/src/render/api';
import {KeyValueChanges} from 'angular2/src/change_detection/pipes/keyvalue_changes';
import {IterableChanges} from 'angular2/src/change_detection/pipes/iterable_changes';
import {isPresent, isString, StringWrapper} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper, isListLikeIterable} from 'angular2/src/facade/collection';

/**
 * Adds and removes CSS classes based on an {expression} value.
 *
 * The result of expression is used to add and remove CSS classes using the following logic,
 * based on expression's value type:
 * - {string} - all the CSS classes (space - separated) are added
 * - {Array} - all the CSS classes (Array elements) are added
 * - {Object} - each key corresponds to a CSS class name while values
 * are interpreted as {boolean} expression. If a given expression
 * evaluates to {true} a corresponding CSS class is added - otherwise
 * it is removed.
 *
 * # Example:
 *
 * ```
 * <div class="message" [class]="{error: errorCount > 0}">
 *     Please check errors.
 * </div>
 * ```
 */
@Directive(
    {selector: '[class]', lifecycle: [LifecycleEvent.onCheck], properties: ['rawClass: class']})
export class CSSClass {
  _pipe: Pipe;
  _rawClass;

  constructor(private _pipes: Pipes, private _ngEl: ElementRef, private _renderer: Renderer) {}

  set rawClass(v) {
    this._cleanupClasses(this._rawClass);

    if (isString(v)) {
      v = v.split(' ');
    }

    this._rawClass = v;
    this._pipe = this._pipes.get(isListLikeIterable(v) ? 'iterableDiff' : 'keyValDiff', v);
  }

  onCheck(): void {
    var diff = this._pipe.transform(this._rawClass, null);
    if (isPresent(diff) && isPresent(diff.wrapped)) {
      if (diff.wrapped instanceof IterableChanges) {
        this._applyArrayChanges(diff.wrapped);
      } else {
        this._applyObjectChanges(diff.wrapped);
      }
    }
  }

  private _cleanupClasses(rawClassVal): void {
    if (isPresent(rawClassVal)) {
      if (isListLikeIterable(rawClassVal)) {
        ListWrapper.forEach(rawClassVal, (className) => { this._toggleClass(className, false); });
      } else {
        StringMapWrapper.forEach(rawClassVal, (expVal, className) => {
          if (expVal) this._toggleClass(className, false);
        });
      }
    }
  }

  private _applyObjectChanges(diff: KeyValueChanges): void {
    diff.forEachAddedItem((record) => { this._toggleClass(record.key, record.currentValue); });
    diff.forEachChangedItem((record) => { this._toggleClass(record.key, record.currentValue); });
    diff.forEachRemovedItem((record) => {
      if (record.previousValue) {
        this._toggleClass(record.key, false);
      }
    });
  }

  private _applyArrayChanges(diff: IterableChanges): void {
    diff.forEachAddedItem((record) => { this._toggleClass(record.item, true); });
    diff.forEachRemovedItem((record) => { this._toggleClass(record.item, false); });
  }

  private _toggleClass(className: string, enabled): void {
    this._renderer.setElementClass(this._ngEl, className, enabled);
  }
}
