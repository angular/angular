import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-output',
  templateUrl: './input-output.component.html',
  styleUrls: ['./input-output.component.css']
})
export class InputOutputComponent {
// #docregion input-output
  @Input() item: string;
// #docregion output
  @Output() deleteRequest = new EventEmitter<string>();
// #enddocregion output
// #enddocregion input-output

  lineThrough = '';

  // #docregion delete-method
  delete() {
    console.warn('Child says: emiting item deleteRequest with', this.item);
    this.deleteRequest.emit(this.item);
    this.lineThrough = this.lineThrough ? '' : 'line-through';
  }
  // #enddocregion delete-method
}
