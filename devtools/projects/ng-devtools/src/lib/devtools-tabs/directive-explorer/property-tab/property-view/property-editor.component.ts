/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ContainerType} from 'protocol';

type EditorType = string | number | boolean;
type EditorResult = EditorType | Array<EditorType>;

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
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyEditorComponent {
  readonly key = input.required<string>();
  readonly initialValue = input.required<EditorResult>();
  readonly containerType = input<ContainerType>();

  readonly updateValue = output<EditorResult>();

  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  readState = PropertyEditorState.Read;
  writeState = PropertyEditorState.Write;

  readonly valueToSubmit = signal<EditorResult | undefined>(undefined);
  readonly currentPropertyState = signal(this.readState);

  constructor() {
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

  accept(): void {
    const parsed = parseValue(this.valueToSubmit()!);
    this.updateValue.emit(parsed);
    this._transition(this.readState);
  }

  reject(): void {
    this.valueToSubmit.set(this.initialValue());
    this._transition(this.readState);
  }

  onClick(): void {
    if (this.currentPropertyState() === this.readState) {
      this._transition(this.writeState);
    }
  }

  onBlur(): void {
    if (this.currentPropertyState() === this.writeState) {
      this.accept();
    }
  }

  private _transition(state: PropertyEditorState): void {
    this.currentPropertyState.set(state);
  }
}
