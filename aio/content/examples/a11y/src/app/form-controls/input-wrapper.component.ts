import { Component, Output, EventEmitter } from '@angular/core';

// #docregion
@Component({
  selector: 'app-input-wrapper',
  templateUrl: './input-wrapper.component.html',
  styleUrls: ['./input-wrapper.component.css']
})
export class InputWrapperComponent {
  @Output() onSave = new EventEmitter();

  save(): void {
    this.onSave.emit(null);
  }
}
// #enddocregion
