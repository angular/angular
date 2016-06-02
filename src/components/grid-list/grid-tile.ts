import {
  Component,
  ViewEncapsulation,
  Renderer,
  ElementRef,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit
} from '@angular/core';
import { MdLine, MdLineSetter } from '@angular2-material/core/line/line';
import {coerceToNumber} from './grid-list-measure';

@Component({
  moduleId: module.id,
  selector: 'md-grid-tile',
  host: { 'role': 'listitem' },
  templateUrl: 'grid-tile.html',
  styleUrls: ['grid-list.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdGridTile {
  _rowspan: number = 1;
  _colspan: number = 1;

  constructor(private _renderer: Renderer, private _element: ElementRef) {}

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
    this._renderer.setElementStyle(this._element.nativeElement, property, value);
  }

}

@Component({
  moduleId: module.id,
  selector: 'md-grid-tile-header, md-grid-tile-footer',
  templateUrl: 'grid-tile-text.html'
})
export class MdGridTileText implements AfterContentInit {
  /**
   *  Helper that watches the number of lines in a text area and sets
   * a class on the host element that matches the line count.
   */
  _lineSetter: MdLineSetter;
  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  constructor(private _renderer: Renderer, private _element: ElementRef) {}

  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }
}

