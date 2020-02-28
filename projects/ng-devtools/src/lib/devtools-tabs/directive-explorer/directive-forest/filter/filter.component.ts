import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ng-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  @Output() filter: EventEmitter<string> = new EventEmitter<string>();
  @Output() nextMatched: EventEmitter<void> = new EventEmitter();
  @Output() prevMatched: EventEmitter<void> = new EventEmitter();

  @Input() hasMatched = false;

  emitFilter(event: InputEvent) {
    this.filter.emit((event.target as HTMLInputElement).value);
  }

  emitNextMatched() {
    this.nextMatched.emit();
  }

  emitPrevMatched() {
    this.prevMatched.emit();
  }
}
