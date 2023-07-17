/* eslint-disable @angular-eslint/no-input-rename,
                  @angular-eslint/no-inputs-metadata-property,
                  @angular-eslint/no-output-rename,
                  @angular-eslint/no-outputs-metadata-property */
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-aliasing',
  templateUrl: './aliasing.component.html',
  styleUrls: ['./aliasing.component.css'],
  inputs: ['input1: saveForLaterItem'], // propertyName:alias
  outputs: ['outputEvent1: saveForLaterEvent']
})
export class AliasingComponent {

  input1 = '';
  outputEvent1: EventEmitter<string> = new EventEmitter<string>();

  @Input('wishListItem') input2 = ''; //  @Input(alias)
  @Output('wishEvent') outputEvent2 = new EventEmitter<string>(); //  @Output(alias) propertyName = ...


  saveIt() {
    console.warn('Child says: emitting outputEvent1 with', this.input1);
    this.outputEvent1.emit(this.input1);
  }

  wishForIt() {
    console.warn('Child says: emitting outputEvent2', this.input2);
    this.outputEvent2.emit(this.input2);
  }

}
