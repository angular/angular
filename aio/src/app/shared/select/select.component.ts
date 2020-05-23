import { Component, ElementRef, EventEmitter, HostListener, Input, Output, OnInit } from '@angular/core';

export interface Option {
  title: string;
  value?: any;
}

@Component({
  selector: 'aio-select',
  templateUrl: 'select.component.html'
})
export class SelectComponent implements OnInit {
  @Input()
  selected: Option;

  @Input()
  options: Option[];

  // tslint:disable-next-line: no-output-native
  @Output()
  change = new EventEmitter<{option: Option, index: number}>();

  @Input()
  showSymbol = false;

  @Input()
  label: string;

  @Input()
  disabled: boolean;

  showOptions = false;

  constructor(private hostElement: ElementRef) {}

  ngOnInit() {
    this.label = this.label || '';
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  hideOptions() {
    this.showOptions = false;
  }

  select(option: Option, index: number) {
    this.selected = option;
    this.change.emit({option, index});
    this.hideOptions();
  }

  @HostListener('document:click', ['$event.target'])
  onClick(eventTarget: HTMLElement) {
    // Hide the options if we clicked outside the component
    if (!this.hostElement.nativeElement.contains(eventTarget)) {
      this.hideOptions();
    }
  }

  @HostListener('document:keydown.escape')
  onKeyDown() {
    this.hideOptions();
  }
}
