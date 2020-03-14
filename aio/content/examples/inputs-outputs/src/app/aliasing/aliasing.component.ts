/* tslint:disable:use-input-property-decorator */
/* tslint:disable:use-output-property-decorator */

/* tslint:disable:no-input-rename */


import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-aliasing',
  templateUrl: './aliasing.component.html',
  styleUrls: ['./aliasing.component.css'],
  // #docregion alias
  // tslint:disable: no-inputs-metadata-property no-outputs-metadata-property
  inputs: ['input1: saveForLaterItem'], // 프로퍼티_이름:클래스_밖에서_사용할_이름
  outputs: ['outputEvent1: saveForLaterEvent']
  // tslint:disable: no-inputs-metadata-property no-outputs-metadata-property
  // #enddocregion alias

})
export class AliasingComponent {

  input1: string;
  outputEvent1: EventEmitter<string> = new EventEmitter<string>();

  // #docregion alias-input-output
  @Input('wishListItem') input2: string; //  @Input(클래스_밖에서_사용할_이름)
  @Output('wishEvent') outputEvent2 = new EventEmitter<string>(); //  @Output(클래스_밖에서_사용할_이름) 프로퍼티_이름 = ...
  // #enddocregion alias-input-output


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

