import {Directive, onCheck} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';
import {Pipe} from 'angular2/src/change_detection/pipes/pipe';
import {PipeRegistry} from 'angular2/src/change_detection/pipes/pipe_registry';
import {KeyValueChanges} from 'angular2/src/change_detection/pipes/keyvalue_changes';
import {isPresent, print} from 'angular2/src/facade/lang';
import {Renderer} from 'angular2/src/render/api';

@Directive({selector: '[ng-style]', lifecycle: [onCheck], properties: ['rawStyle: ng-style']})
export class NgStyle {
  _pipe: Pipe;
  _rawStyle;

  constructor(private _pipeRegistry: PipeRegistry, private _ngEl: ElementRef,
              private _renderer: Renderer) {}

  set rawStyle(v) {
    this._rawStyle = v;
    this._pipe = this._pipeRegistry.get('keyValDiff', this._rawStyle);
  }

  onCheck() {
    var diff = this._pipe.transform(this._rawStyle);
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
