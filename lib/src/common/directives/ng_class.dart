library angular2.src.common.directives.ng_class;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isString, StringWrapper, isBlank, isArray;
import "package:angular2/core.dart"
    show
        DoCheck,
        OnDestroy,
        Directive,
        ElementRef,
        IterableDiffer,
        IterableDiffers,
        KeyValueDiffer,
        KeyValueDiffers,
        Renderer;
import "package:angular2/src/facade/collection.dart"
    show StringMapWrapper, isListLikeIterable;

/**
 * The `NgClass` directive conditionally adds and removes CSS classes on an HTML element based on
 * an expression's evaluation result.
 *
 * The result of an expression evaluation is interpreted differently depending on type of
 * the expression evaluation result:
 * - `string` - all the CSS classes listed in a string (space delimited) are added
 * - `Array` - all the CSS classes (Array elements) are added
 * - `Object` - each key corresponds to a CSS class name while values are interpreted as expressions
 * evaluating to `Boolean`. If a given expression evaluates to `true` a corresponding CSS class
 * is added - otherwise it is removed.
 *
 * While the `NgClass` directive can interpret expressions evaluating to `string`, `Array`
 * or `Object`, the `Object`-based version is the most often used and has an advantage of keeping
 * all the CSS class names in a template.
 *
 * ### Example ([live demo](http://plnkr.co/edit/a4YdtmWywhJ33uqfpPPn?p=preview)):
 *
 * ```
 * import {Component, NgClass} from 'angular2/angular2';
 *
 * @Component({
 *   selector: 'toggle-button',
 *   inputs: ['isDisabled'],
 *   template: `
 *      <div class="button" [ng-class]="{active: isOn, disabled: isDisabled}"
 *          (click)="toggle(!isOn)">
 *          Click me!
 *      </div>`,
 *   styles: [`
 *     .button {
 *       width: 120px;
 *       border: medium solid black;
 *     }
 *
 *     .active {
 *       background-color: red;
 *    }
 *
 *     .disabled {
 *       color: gray;
 *       border: medium solid gray;
 *     }
 *   `]
 *   directives: [NgClass]
 * })
 * class ToggleButton {
 *   isOn = false;
 *   isDisabled = false;
 *
 *   toggle(newState) {
 *     if (!this.isDisabled) {
 *       this.isOn = newState;
 *     }
 *   }
 * }
 * ```
 */
@Directive(
    selector: "[ng-class]",
    inputs: const ["rawClass: ng-class", "initialClasses: class"])
class NgClass implements DoCheck, OnDestroy {
  IterableDiffers _iterableDiffers;
  KeyValueDiffers _keyValueDiffers;
  ElementRef _ngEl;
  Renderer _renderer;
  dynamic _differ;
  String _mode;
  var _initialClasses = [];
  var _rawClass;
  NgClass(this._iterableDiffers, this._keyValueDiffers, this._ngEl,
      this._renderer) {}
  set initialClasses(v) {
    this._applyInitialClasses(true);
    this._initialClasses = isPresent(v) && isString(v) ? v.split(" ") : [];
    this._applyInitialClasses(false);
    this._applyClasses(this._rawClass, false);
  }

  set rawClass(v) {
    this._cleanupClasses(this._rawClass);
    if (isString(v)) {
      v = v.split(" ");
    }
    this._rawClass = v;
    if (isPresent(v)) {
      if (isListLikeIterable(v)) {
        this._differ = this._iterableDiffers.find(v).create(null);
        this._mode = "iterable";
      } else {
        this._differ = this._keyValueDiffers.find(v).create(null);
        this._mode = "keyValue";
      }
    } else {
      this._differ = null;
    }
  }

  void ngDoCheck() {
    if (isPresent(this._differ)) {
      var changes = this._differ.diff(this._rawClass);
      if (isPresent(changes)) {
        if (this._mode == "iterable") {
          this._applyIterableChanges(changes);
        } else {
          this._applyKeyValueChanges(changes);
        }
      }
    }
  }

  void ngOnDestroy() {
    this._cleanupClasses(this._rawClass);
  }

  void _cleanupClasses(rawClassVal) {
    this._applyClasses(rawClassVal, true);
    this._applyInitialClasses(false);
  }

  void _applyKeyValueChanges(dynamic changes) {
    changes.forEachAddedItem((record) {
      this._toggleClass(record.key, record.currentValue);
    });
    changes.forEachChangedItem((record) {
      this._toggleClass(record.key, record.currentValue);
    });
    changes.forEachRemovedItem((record) {
      if (record.previousValue) {
        this._toggleClass(record.key, false);
      }
    });
  }

  void _applyIterableChanges(dynamic changes) {
    changes.forEachAddedItem((record) {
      this._toggleClass(record.item, true);
    });
    changes.forEachRemovedItem((record) {
      this._toggleClass(record.item, false);
    });
  }

  _applyInitialClasses(bool isCleanup) {
    this
        ._initialClasses
        .forEach((className) => this._toggleClass(className, !isCleanup));
  }

  _applyClasses(
      dynamic /* List < String > | Set < String > | Map < String , String > */ rawClassVal,
      bool isCleanup) {
    if (isPresent(rawClassVal)) {
      if (isArray(rawClassVal)) {
        ((rawClassVal as List<String>))
            .forEach((className) => this._toggleClass(className, !isCleanup));
      } else if (rawClassVal is Set) {
        ((rawClassVal as Set<String>))
            .forEach((className) => this._toggleClass(className, !isCleanup));
      } else {
        StringMapWrapper.forEach((rawClassVal as Map<String, String>),
            (expVal, className) {
          if (expVal) this._toggleClass(className, !isCleanup);
        });
      }
    }
  }

  void _toggleClass(String className, enabled) {
    className = className.trim();
    if (className.length > 0) {
      if (className.indexOf(" ") > -1) {
        var classes = className.split(new RegExp(r'\s+'));
        for (var i = 0, len = classes.length; i < len; i++) {
          this._renderer.setElementClass(this._ngEl, classes[i], enabled);
        }
      } else {
        this._renderer.setElementClass(this._ngEl, className, enabled);
      }
    }
  }
}
