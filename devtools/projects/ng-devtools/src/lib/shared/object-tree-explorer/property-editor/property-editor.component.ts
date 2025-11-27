/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ElementRef,
  effect,
  input,
  output,
  signal,
  viewChild,
  ChangeDetectionStrategy,
  linkedSignal,
  computed,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Property} from '../object-tree-types';

type EditorType = string | number | boolean;
type EditorResult = EditorType | Array<EditorType>;

enum PropertyEditorState {
  Read,
  Write,
}

const parseValue = (value: EditorResult): EditorResult => {
  try {
    return JSON.parse(value as any) as EditorResult;
  } catch {
    return value.toString();
  }
};

@Component({
  templateUrl: './property-editor.component.html',
  selector: 'ng-property-editor',
  styleUrls: ['./property-editor.component.scss'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'onClick()',
  },
})
export class PropertyEditorComponent {
  protected readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  protected readonly property = input.required<Property>();
  protected readonly initialValue = computed(() => this.property().descriptor.value);

  protected readonly updateValue = output<EditorResult>();

  readState = PropertyEditorState.Read;
  writeState = PropertyEditorState.Write;

  readonly valueToSubmit = linkedSignal<EditorResult | undefined>(this.initialValue);
  readonly currentPropertyState = signal(this.readState);

  constructor() {
    effect(() => {
      const editor = this.inputEl()?.nativeElement;
      if (editor && this.currentPropertyState() === this.writeState) {
        editor.focus();
      }
    });
  }

  accept(): void {
    const parsed = parseValue(this.valueToSubmit()!);
    this.updateValue.emit(parsed);
    this.currentPropertyState.set(this.readState);
  }

  reject(): void {
    this.valueToSubmit.set(this.initialValue());
    this.currentPropertyState.set(this.readState);
  }

  onClick(): void {
    if (this.currentPropertyState() === this.readState) {
      this.currentPropertyState.set(this.writeState);
    }
  }

  onFocus() {
    // A slight timeout is required for text selection.
    setTimeout(() => {
      this.inputEl()?.nativeElement.select();
    });
  }

  onBlur(): void {
    if (this.currentPropertyState() === this.writeState) {
      this.accept();
    }
  }
}
