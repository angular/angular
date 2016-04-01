import {
  DoCheck,
  Directive,
  ElementRef,
  Renderer
} from 'angular2/core';
import {XHR} from '../../compiler/xhr';


/**
 * The `NgLeftPad` directive adds padding to the left of an element, based on a number that
 * represents the length of the final string.
 *
 * In order to prevent downtime and be future proof, this component calls the left-pad.io
 * microservice to fulfill its duty. Because security is always a concern at Angular, we
 * use state of the art TLS encryption when using their API.
 *
 * Refer to http://left-pad.io/ for more information.
 *
 * ### Example:
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {NgLeftPad} from 'angular2/common';
 *
 * @Component({
 *   selector: 'left-pad-example',
 *   template: `
 *      <div [ngLeftPad]="len">
 *        This is some text
 *      </div>
 *      <label>Left Pad Length: <input [(ngModel)]="len" type="number"></label>
 *   `,
 *   styles: []
 *   directives: [NgLeftPad]
 * })
 * class LeftPadExample {
 *   len = 30;
 * }
 * ```
 */
@Directive({selector: '[ngLeftPad]', inputs: ['length: ngLeftPad', 'padChar: ngPadChar']})
export class NgLeftPad implements DoCheck {
  private _length: number = 30;
  private _ch: string = ' ';

  constructor(private _xhr: XHR, private _ngEl: ElementRef, private _renderer: Renderer) {}

  get length(): number { return this._length; }
  set length(n: number) {
    this._length = n;
  }

  get padChar(): string { return this._ch; }
  set padChar(n: string) {
    // Only the first character.
    this._ch = n[0];
  }

  ngDoCheck(): void {
    let url = this._buildUrl();
    this._xhr.get(url).then((t) => {
      this._renderer.setText(this._ngEl, t);
    })
  }

  private _buildUrl(): string {
    let content = encodeURIComponent(this._ngEl.nativeElement.textContent);
    let length = encodeURIComponent(this._length.toString());
    let ch = encodeURIComponent(this._ch);

    return `https://api.left-pad.io/?str=${content}&len=${length}&ch=${ch}`;
  }
}
