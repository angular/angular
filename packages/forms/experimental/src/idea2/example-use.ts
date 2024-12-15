import {Component, signal} from '@angular/core';
import {NativeInput} from './native-controls';
import {FormField, NgBindField, NgField} from './ngfield';

@Component({
  selector: 'app-root',
  template: `
    <div *ngField="field">
      <label ngBindField></label>:
      <input ngBindField />
    </div>
    <input [ngField]="field" ngBindField /> <!-- could have input[ngField] auto-bind -->
  `,
  imports: [NgField, NgBindField, NativeInput],
})
export class App {
  field = new FormField(signal('value'), signal('label'));
}
