import {EventEmitter, TemplateRef} from '@angular/core';
import {MenuPositionX, MenuPositionY} from './menu-positions';

export interface MdMenuPanel {
  positionX: MenuPositionX;
  positionY: MenuPositionY;
  templateRef: TemplateRef<any>;
  close: EventEmitter<void>;
  focusFirstItem: () => void;
}
