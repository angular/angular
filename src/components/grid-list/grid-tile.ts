import {
  Component,
  ViewEncapsulation,
  Renderer,
  ElementRef,
  Input,
} from '@angular/core';

import {coerceToNumber} from './grid-list';

@Component({
  selector: 'md-grid-tile',
  host: { 'role': 'listitem' },
  templateUrl: './components/grid-list/grid-tile.html',
  styleUrls: ['./components/grid-list/grid-list.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdGridTile {
  _rowspan: number = 1;
  _colspan: number = 1;
  _element: HTMLElement;

  constructor(private _renderer: Renderer, element: ElementRef) {
    this._element = element.nativeElement;
  }

  @Input()
  get rowspan() {
    return this._rowspan;
  }

  @Input()
  get colspan() {
    return this._colspan;
  }

  set rowspan(value) {
    this._rowspan = coerceToNumber(value);
  }

  set colspan(value) {
    this._colspan = coerceToNumber(value);
  }

  /** Sets the style of the grid-tile element.  Needs to be set manually to avoid
   * "Changed after checked" errors that would occur with HostBinding.
   * @internal
   */
  setStyle(property: string, value: string): void {
    this._renderer.setElementStyle(this._element, property, value);
  }

}
