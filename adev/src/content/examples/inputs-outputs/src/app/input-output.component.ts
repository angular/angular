import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-input-output',
  template: `
  <p [style.text-decoration]="lineThrough">Item: {{item}}</p>
  <button type="button" (click)="delete()">Delete item with an Output!</button>
  `,
})
export class InputOutputComponent {
  @Input() item = '';
  @Output() deleteRequest = new EventEmitter<string>();

  lineThrough = '';

  delete() {
    console.warn('Child says: emitting item deleteRequest with', this.item);
    this.deleteRequest.emit(this.item);
    this.lineThrough = this.lineThrough ? '' : 'line-through';
  }
}
