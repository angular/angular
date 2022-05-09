import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

export interface Option {
  title: string;
  value?: any;
}

@Component({
  selector: 'aio-select',
  templateUrl: 'select.component.html'
})
export class SelectComponent implements OnInit {
  selectedIdx = -1;

  @Input() set selected(selected: Option) {
    this.selectedIdx = (this.options ?? []).indexOf(selected);
  };

  get selected(): Option {
    return this.options?.[this.selectedIdx];
  }

  @Input() options: Option[];

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<{option: Option, index: number}>();

  @Input() showSymbol = false;

  @Input() label: string;

  @Input() disabled: boolean;

  ngOnInit() {
    this.label = this.label || '';
  }

  select(index: number) {
    this.selected = this.options[index];
    this.change.emit({option: this.selected, index});
  }
}
