// TODO(kara): keyboard events for menu navigation
// TODO(kara): prevent-close functionality
// TODO(kara): set position of menu

import {
    Component,
    ViewEncapsulation,
    Output,
    ViewChild,
    TemplateRef,
    EventEmitter
} from '@angular/core';

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
  private _showClickCatcher: boolean = false;

  @Output() close = new EventEmitter;
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  /**
   * This function toggles the display of the menu's click catcher element.
   * This element covers the viewport when the menu is open to detect clicks outside the menu.
   * TODO: internal
   */
  _setClickCatcher(bool: boolean): void {
    this._showClickCatcher = bool;
  }

  private _emitCloseEvent(): void {
    this.close.emit(null);
  }
}

