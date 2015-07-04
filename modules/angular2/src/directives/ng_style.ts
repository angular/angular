import {Directive, LifecycleEvent} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';
import {Pipe} from 'angular2/src/change_detection/pipes/pipe';
import {Pipes} from 'angular2/src/change_detection/pipes/pipes';
import {KeyValueChanges} from 'angular2/src/change_detection/pipes/keyvalue_changes';
import {isPresent, print} from 'angular2/src/facade/lang';
import {Renderer} from 'angular2/src/render/api';

/**
 * Adds or removes styles based on an {expression}.
 *
 * When the expression assigned to `ng-style` evaluates to an object, the corresponding element
 * styles are updated. Style names to update are taken from the object keys and values - from the
 * corresponding object values.
 *
 * # Example:
 *
 * ```
 * <div ng-style="{'text-align': alignEpr}"></div>
 * ```
 *
 * In the above example the `text-align` style will be updated based on the `alignEpr` value
 * changes.
 *
 * # Syntax
 *
 * - `<div ng-style="{'text-align': alignEpr}"></div>`
 * - `<div ng-style="styleExp"></div>`
 */
@Directive({
  selector: '[ng-style]',
  lifecycle: [LifecycleEvent.onCheck],
  properties: ['rawStyle: ng-style']
})
export class NgStyle {
  _pipe: Pipe;
  _rawStyle;

  constructor(private _pipes: Pipes, private _ngEl: ElementRef, private _renderer: Renderer) {}

  set rawStyle(v) {
    this._rawStyle = v;
    this._pipe = this._pipes.get('keyValDiff', this._rawStyle);
  }

  onCheck() {
    var diff = this._pipe.transform(this._rawStyle, null);
    if (isPresent(diff) && isPresent(diff.wrapped)) {
      this._applyChanges(diff.wrapped);
    }
  }

  private _applyChanges(diff: KeyValueChanges): void {
    diff.forEachAddedItem((record) => { this._setStyle(record.key, record.currentValue); });
    diff.forEachChangedItem((record) => { this._setStyle(record.key, record.currentValue); });
    diff.forEachRemovedItem((record) => { this._setStyle(record.key, null); });
  }

  private _setStyle(name: string, val: string): void {
    this._renderer.setElementStyle(this._ngEl, name, val);
  }
}
