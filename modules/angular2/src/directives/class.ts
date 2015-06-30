import {Directive, onCheck} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';
import {PipeRegistry} from 'angular2/src/change_detection/pipes/pipe_registry';
import {Pipe} from 'angular2/src/change_detection/pipes/pipe';
import {Renderer} from 'angular2/src/render/api';
import {KeyValueChanges} from 'angular2/src/change_detection/pipes/keyvalue_changes';
import {IterableChanges} from 'angular2/src/change_detection/pipes/iterable_changes';
import {isPresent, isString, StringWrapper} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper, isListLikeIterable} from 'angular2/src/facade/collection';

@Directive({selector: '[class]', lifecycle: [onCheck], properties: ['rawClass: class']})
export class CSSClass {
  _pipe: Pipe;
  _rawClass;

  constructor(private _pipeRegistry: PipeRegistry, private _ngEl: ElementRef,
              private _renderer: Renderer) {}

  set rawClass(v) {
    this._cleanupClasses(this._rawClass);

    if (isString(v)) {
      v = v.split(' ');
    }

    this._rawClass = v;
    this._pipe = this._pipeRegistry.get(isListLikeIterable(v) ? 'iterableDiff' : 'keyValDiff', v);
  }

  onCheck(): void {
    var diff = this._pipe.transform(this._rawClass);
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
