import {DoCheck} from 'angular2/lifecycle_hooks';
import {
  KeyValueDiffer,
  KeyValueDiffers,
} from 'angular2/src/core/change_detection';
import {ElementRef} from 'angular2/src/core/linker';
import {Directive} from 'angular2/src/core/metadata';
import {Renderer} from 'angular2/src/core/render';
import {isPresent, isBlank, print} from 'angular2/src/core/facade/lang';
import {ElementRef_} from "../linker/element_ref";

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
 * <div [ng-style]="{'text-align': alignExp}"></div>
 * ```
 *
 * In the above example the `text-align` style will be updated based on the `alignExp` value
 * changes.
 *
 * # Syntax
 *
 * - `<div [ng-style]="{'text-align': alignExp}"></div>`
 * - `<div [ng-style]="styleExp"></div>`
 */
@Directive({selector: '[ng-style]', inputs: ['rawStyle: ng-style']})
export class NgStyle implements DoCheck {
  _rawStyle;
  _differ: KeyValueDiffer;

  constructor(private _differs: KeyValueDiffers, private _ngEl: ElementRef_,
              private _renderer: Renderer) {}

  set rawStyle(v) {
    this._rawStyle = v;
    if (isBlank(this._differ) && isPresent(v)) {
      this._differ = this._differs.find(this._rawStyle).create(null);
    }
  }

  doCheck() {
    if (isPresent(this._differ)) {
      var changes = this._differ.diff(this._rawStyle);
      if (isPresent(changes)) {
        this._applyChanges(changes);
      }
    }
  }

  private _applyChanges(changes: any): void {
    changes.forEachAddedItem((record) => { this._setStyle(record.key, record.currentValue); });
    changes.forEachChangedItem((record) => { this._setStyle(record.key, record.currentValue); });
    changes.forEachRemovedItem((record) => { this._setStyle(record.key, null); });
  }

  private _setStyle(name: string, val: string): void {
    this._renderer.setElementStyle(this._ngEl, name, val);
  }
}
