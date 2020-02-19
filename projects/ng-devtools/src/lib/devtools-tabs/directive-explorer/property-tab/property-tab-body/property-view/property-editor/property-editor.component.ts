import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

export type EditorType = string | number | object;
export type EditorResult = EditorType | Array<EditorType>;

export enum PropertyEditorState {
  Read,
  Write,
  Unparseable,
}

@Component({
  templateUrl: './property-editor.component.html',
  selector: 'ng-property-editor',
  styleUrls: ['./property-editor.component.css'],
})
export class PropertyEditorComponent implements OnChanges, AfterViewChecked {
  @Input() key: string;
  @Input() initialValue: EditorResult;

  @Output() updateValue = new EventEmitter<EditorResult>();

  valueToSubmit: EditorResult;

  readState = PropertyEditorState.Read;
  writeState = PropertyEditorState.Write;
  currentPropertyState = this.readState;

  constructor(private _cd: ChangeDetectorRef, private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes !== null && this.hasChanged(changes)) {
      this.valueToSubmit = this.initialValue;
    }
  }

  get editor(): HTMLInputElement {
    return this.elementRef.nativeElement.querySelector('input');
  }

  ngAfterViewChecked(): void {
    if (this.currentPropertyState === PropertyEditorState.Write) {
      this.focus();
    }
  }

  focus(): void {
    this.editor.focus();
  }

  reject(): void {
    this.valueToSubmit = this.initialValue;

    this.transition(PropertyEditorState.Read);
  }

  private hasChanged(changes: SimpleChanges): boolean {
    return changes.hasOwnProperty('initialValue');
  }

  private transition(state: PropertyEditorState): void {
    this.currentPropertyState = state;

    if (state === PropertyEditorState.Write) {
      this._initWrite();
    }
  }

  private _initWrite(): void {
    this._cd.detectChanges();
    this.focus();
    this.editor.select();
    this.moveCursorToEnd();
  }

  private moveCursorToEnd(): void {
    const element = this.elementRef.nativeElement;

    if (typeof element.selectionStart === 'number') {
      element.selectionStart = element.selectionEnd = element.value.length;
    } else if (element.createTextRange) {
      element.focus();
      const range = element.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  accept(): void {
    const parsed = this.parseValue(this.valueToSubmit);

    this.updateValue.emit({ key: this.key, newValue: parsed });

    this.initialValue = parsed;

    this.transition(PropertyEditorState.Read);
  }

  private parseValue(value: EditorResult) {
    if (value === 'undefined') {
      return undefined;
    } else {
      return JSON.parse(JSON.stringify(value));
    }
  }

  onClick(): void {
    if (this.currentPropertyState === PropertyEditorState.Read) {
      this.transition(PropertyEditorState.Write);
    }
  }

  onBlur(): void {
    switch (this.currentPropertyState) {
      case PropertyEditorState.Read:
        break;
      case PropertyEditorState.Write:
        this.accept();
        break;
    }
  }
}
