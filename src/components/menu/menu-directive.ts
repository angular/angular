// TODO(kara): keyboard events for menu navigation
// TODO(kara): prevent-close functionality

import {
  Attribute,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {MdMenuInvalidPositionX, MdMenuInvalidPositionY} from './menu-errors';

@Component({
  moduleId: module.id,
  selector: 'md-menu',
  host: {'role': 'menu'},
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mdMenu'
})
export class MdMenu {
  _showClickCatcher: boolean = false;

  // config object to be passed into the menu's ngClass
  _classList: Object;

  positionX: MenuPositionX = 'after';
  positionY: MenuPositionY = 'below';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(@Attribute('x-position') posX: MenuPositionX,
              @Attribute('y-position') posY: MenuPositionY) {
    if (posX) { this._setPositionX(posX); }
    if (posY) { this._setPositionY(posY); }
  }

  /**
   * This method takes classes set on the host md-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @param classes list of class names
   */
  @Input('class')
  set classList(classes: string) {
    this._classList = classes.split(' ').reduce((obj: any, className: string) => {
      obj[className] = true;
      return obj;
    }, {});
  }

  @Output() close = new EventEmitter;

  /**
   * This function toggles the display of the menu's click catcher element.
   * This element covers the viewport when the menu is open to detect clicks outside the menu.
   * TODO: internal
   */
  _setClickCatcher(bool: boolean): void {
    this._showClickCatcher = bool;
  }

  private _setPositionX(pos: MenuPositionX): void {
    if ( pos !== 'before' && pos !== 'after') {
      throw new MdMenuInvalidPositionX();
    }
    this.positionX = pos;
  }

  private _setPositionY(pos: MenuPositionY): void {
    if ( pos !== 'above' && pos !== 'below') {
      throw new MdMenuInvalidPositionY();
    }
    this.positionY = pos;
  }

  private _emitCloseEvent(): void {
    this.close.emit(null);
  }
}
