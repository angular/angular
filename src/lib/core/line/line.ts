import {
    NgModule,
    Directive,
    Renderer,
    ElementRef,
    QueryList
} from '@angular/core';
import {CompatibilityModule} from '../compatibility/compatibility';


/**
 * Shared directive to count lines inside a text area, such as a list item.
 * Line elements can be extracted with a @ContentChildren(MdLine) query, then
 * counted by checking the query list's length.
 */
@Directive({
  selector: '[md-line], [mat-line]',
  host: {
    '[class.mat-line]': 'true'
  }
})
export class MdLine {}

/**
 * Helper that takes a query list of lines and sets the correct class on the host.
 * @docs-private
 */
export class MdLineSetter {
  constructor(private _lines: QueryList<MdLine>, private _renderer: Renderer,
              private _element: ElementRef) {
    this._setLineClass(this._lines.length);

    this._lines.changes.subscribe(() => {
      this._setLineClass(this._lines.length);
    });
  }

  private _setLineClass(count: number): void {
    this._resetClasses();
    if (count === 2 || count === 3) {
      this._setClass(`mat-${count}-line`, true);
    } else if (count > 3) {
      this._setClass(`mat-multi-line`, true);
    }
  }

  private _resetClasses(): void {
    this._setClass('mat-2-line', false);
    this._setClass('mat-3-line', false);
    this._setClass('mat-multi-line', false);
  }

  private _setClass(className: string, bool: boolean): void {
    this._renderer.setElementClass(this._element.nativeElement, className, bool);
  }

}

@NgModule({
  imports: [CompatibilityModule],
  exports: [MdLine, CompatibilityModule],
  declarations: [MdLine],
})
export class MdLineModule { }
