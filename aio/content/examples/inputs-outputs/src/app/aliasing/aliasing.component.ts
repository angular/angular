// tslint:disable: no-input-rename no-output-rename use-input-property-decorator use-output-property-decorator
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-aliasing',
  templateUrl: './aliasing.component.html',
  styleUrls: ['./aliasing.component.css'],
  // tslint:disable: no-inputs-metadata-property no-outputs-metadata-property
  inputs: ['input1: saveForLaterItem'], // propertyName:alias
  outputs: ['outputEvent1: saveForLaterEvent']
  // tslint:disable: no-inputs-metadata-property no-outputs-metadata-property

})
export class AliasingComponent {

  input1 = '';
  outputEvent1: EventEmitter<string> = new EventEmitter<string>();

  @Input('wishListItem') input2 = ''; //  @Input(alias)
  @Output('wishEvent') outputEvent2 = new EventEmitter<string>(); //  @Output(alias) propertyName = ...


  saveIt() {
    console.warn('Child says: emiting outputEvent1 with', this.input1);
    this.outputEvent1.emit(this.input1);
  }

  wishForIt() {
    console.warn('Child says: emiting outputEvent2', this.input2);
    this.outputEvent2.emit(this.input2);
  }


}
/* tslint:enable:use-input-property-decorator */
/* tslint:enable:use-output-property-decorator */

