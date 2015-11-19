library angular2.src.common.directives.ng_style;

import "package:angular2/lifecycle_hooks.dart" show DoCheck;
import "package:angular2/src/core/change_detection.dart"
    show KeyValueDiffer, KeyValueDiffers;
import "package:angular2/src/core/linker.dart" show ElementRef;
import "package:angular2/src/core/metadata.dart" show Directive;
import "package:angular2/src/core/render.dart" show Renderer;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank, print;

/**
 * The `NgStyle` directive changes styles based on a result of expression evaluation.
 *
 * An expression assigned to the `ng-style` property must evaluate to an object and the
 * corresponding element styles are updated based on changes to this object. Style names to update
 * are taken from the object's keys, and values - from the corresponding object's values.
 *
 * ### Syntax
 *
 * - `<div [ng-style]="{'font-style': style}"></div>`
 * - `<div [ng-style]="styleExp"></div>` - here the `styleExp` must evaluate to an object
 *
 * ### Example ([live demo](http://plnkr.co/edit/YamGS6GkUh9GqWNQhCyM?p=preview)):
 *
 * ```
 * import {Component, NgStyle} from 'angular2/angular2';
 *
 * @Component({
 *  selector: 'ng-style-example',
 *  template: `
 *    <h1 [ng-style]="{'font-style': style, 'font-size': size, 'font-weight': weight}">
 *      Change style of this text!
 *    </h1>
 *
 *    <hr>
 *
 *    <label>Italic: <input type="checkbox" (change)="changeStyle($event)"></label>
 *    <label>Bold: <input type="checkbox" (change)="changeWeight($event)"></label>
 *    <label>Size: <input type="text" [value]="size" (change)="size = $event.target.value"></label>
 *  `,
 *  directives: [NgStyle]
 * })
 * export class NgStyleExample {
 *    style = 'normal';
 *    weight = 'normal';
 *    size = '20px';
 *
 *    changeStyle($event: any) {
 *      this.style = $event.target.checked ? 'italic' : 'normal';
 *    }
 *
 *    changeWeight($event: any) {
 *      this.weight = $event.target.checked ? 'bold' : 'normal';
 *    }
 * }
 * ```
 *
 * In this example the `font-style`, `font-size` and `font-weight` styles will be updated
 * based on the `style` property's value changes.
 */
@Directive(selector: "[ng-style]", inputs: const ["rawStyle: ng-style"])
class NgStyle implements DoCheck {
  KeyValueDiffers _differs;
  ElementRef _ngEl;
  Renderer _renderer;
  /** @internal */
  var _rawStyle;
  /** @internal */
  KeyValueDiffer _differ;
  NgStyle(this._differs, this._ngEl, this._renderer) {}
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

  void _applyChanges(dynamic changes) {
    changes.forEachAddedItem((record) {
      this._setStyle(record.key, record.currentValue);
    });
    changes.forEachChangedItem((record) {
      this._setStyle(record.key, record.currentValue);
    });
    changes.forEachRemovedItem((record) {
      this._setStyle(record.key, null);
    });
  }

  void _setStyle(String name, String val) {
    this._renderer.setElementStyle(this._ngEl, name, val);
  }
}
