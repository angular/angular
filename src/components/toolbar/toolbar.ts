import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import {Renderer} from '@angular/core';
import {ElementRef} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'md-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdToolbar {

  private _color: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer) { }

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
      this.renderer.setElementClass(this.elementRef.nativeElement, `md-${color}`, isAdd);
    }
  }

}

export const MD_TOOLBAR_DIRECTIVES = [MdToolbar];
