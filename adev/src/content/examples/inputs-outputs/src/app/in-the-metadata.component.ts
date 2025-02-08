/* eslint-disable @angular-eslint/no-inputs-metadata-property, @angular-eslint/no-outputs-metadata-property */
import {Component, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-in-the-metadata',
  template: `
  <p>Latest clearance item: {{clearanceItem}}</p>

  <button type="button" (click)="buyIt()"> Buy it with an Output!</button>
  `,
  inputs: ['clearanceItem'],
  outputs: ['buyEvent'],
})
export class InTheMetadataComponent {
  buyEvent = new EventEmitter<string>();
  clearanceItem = '';

  buyIt() {
    console.warn('Child says: emitting buyEvent with', this.clearanceItem);
    this.buyEvent.emit(this.clearanceItem);
  }
}
