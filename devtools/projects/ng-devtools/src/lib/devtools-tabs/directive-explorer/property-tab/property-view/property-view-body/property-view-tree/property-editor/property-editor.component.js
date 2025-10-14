/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  afterNextRender,
  Component,
  effect,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
var PropertyEditorState;
(function (PropertyEditorState) {
  PropertyEditorState[(PropertyEditorState['Read'] = 0)] = 'Read';
  PropertyEditorState[(PropertyEditorState['Write'] = 1)] = 'Write';
})(PropertyEditorState || (PropertyEditorState = {}));
const parseValue = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value.toString();
  }
};
let PropertyEditorComponent = class PropertyEditorComponent {
  constructor() {
    this.key = input.required();
    this.initialValue = input.required();
    this.containerType = input();
    this.updateValue = output();
    this.inputEl = viewChild('inputEl');
    this.readState = PropertyEditorState.Read;
    this.writeState = PropertyEditorState.Write;
    this.valueToSubmit = signal(undefined);
    this.currentPropertyState = signal(this.readState);
    afterNextRender({
      read: () => {
        this.valueToSubmit.set(this.initialValue());
      },
    });
    effect(() => {
      const editor = this.inputEl()?.nativeElement;
      if (editor && this.currentPropertyState() === this.writeState) {
        editor.focus();
        editor.select();
      }
    });
  }
  accept() {
    const parsed = parseValue(this.valueToSubmit());
    this.updateValue.emit(parsed);
    this.currentPropertyState.set(this.readState);
  }
  reject() {
    this.valueToSubmit.set(this.initialValue());
    this.currentPropertyState.set(this.readState);
  }
  onClick() {
    if (this.currentPropertyState() === this.readState) {
      this.currentPropertyState.set(this.writeState);
    }
  }
  onBlur() {
    if (this.currentPropertyState() === this.writeState) {
      this.accept();
    }
  }
};
PropertyEditorComponent = __decorate(
  [
    Component({
      templateUrl: './property-editor.component.html',
      selector: 'ng-property-editor',
      styleUrls: ['./property-editor.component.scss'],
      imports: [FormsModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  PropertyEditorComponent,
);
export {PropertyEditorComponent};
//# sourceMappingURL=property-editor.component.js.map
