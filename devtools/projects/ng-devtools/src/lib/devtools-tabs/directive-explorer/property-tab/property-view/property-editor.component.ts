/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output,} from '@angular/core';

type EditorType = string|number|boolean;
type EditorResult = EditorType|Array<EditorType>;

enum PropertyEditorState {
  Read,
  Write,
}

const parseValue = (value: EditorResult): EditorResult => {
  try {
    return JSON.parse(value as any);
  } catch {
    return value.toString();
  }
};

@Component({
  templateUrl: './property-editor.component.html',
  selector: 'ng-property-editor',
  styleUrls: ['./property-editor.component.scss'],
})
export class PropertyEditorComponent implements AfterViewChecked, OnInit {
  @Input() key: string;
  @Input() initialValue: EditorResult;
  @Output() updateValue = new EventEmitter<EditorResult>();

  readState = PropertyEditorState.Read;
  writeState = PropertyEditorState.Write;

  valueToSubmit: EditorResult;
  currentPropertyState = this.readState;

  constructor(private _cd: ChangeDetectorRef, private _elementRef: ElementRef) {}

  ngOnInit(): void {
    this.valueToSubmit = this.initialValue;
  }

  ngAfterViewChecked(): void {
    if (this.currentPropertyState === this.writeState) {
      this.editor.focus();
    }
  }

  accept(): void {
    const parsed = parseValue(this.valueToSubmit);
    this.updateValue.emit(parsed);
    this._transition(this.readState);
  }

  reject(): void {
    this.valueToSubmit = this.initialValue;
    this._transition(this.readState);
  }

  onClick(): void {
    if (this.currentPropertyState === this.readState) {
      this._transition(this.writeState);
    }
  }

  onBlur(): void {
    if (this.currentPropertyState === this.writeState) {
      this.accept();
    }
  }

  get editor(): HTMLInputElement {
    return this._elementRef.nativeElement.querySelector('input');
  }

  private _transition(state: PropertyEditorState): void {
    this.currentPropertyState = state;
    if (this.currentPropertyState === this.writeState) {
      this._cd.detectChanges();
      this.editor.focus();
      this.editor.select();
    }
  }
}
