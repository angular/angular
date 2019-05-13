import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {Component, NgZone, ViewChild} from '@angular/core';
import {take} from 'rxjs/operators';

/** @title Auto-resizing textarea */
@Component({
  selector: 'text-field-autosize-textarea-example',
  templateUrl: './text-field-autosize-textarea-example.html',
  styleUrls: ['./text-field-autosize-textarea-example.css'],
})
export class TextFieldAutosizeTextareaExample {
  constructor(private _ngZone: NgZone) {}

  @ViewChild('autosize', {static: false}) autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }
}
