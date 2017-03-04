import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewEncapsulation,
  Directive,
  ElementRef,
  Renderer
} from '@angular/core';


@Directive({
  selector: 'md-toolbar-row, mat-toolbar-row',
  host: {
    '[class.mat-toolbar-row]': 'true',
  },
})
export class MdToolbarRow {}

@Component({
  moduleId: module.id,
  selector: 'md-toolbar, mat-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.css'],
  host: {
    '[class.mat-toolbar]': 'true',
    'role': 'toolbar'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MdToolbar {

  private _color: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer) { }

  /** The color of the toolbar. Can be primary, accent, or warn. */
  @Input()
  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  private _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  private _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this.renderer.setElementClass(this.elementRef.nativeElement, `mat-${color}`, isAdd);
    }
  }

}
