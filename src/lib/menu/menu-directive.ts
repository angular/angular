// TODO(kara): prevent-close functionality

import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {MdMenuInvalidPositionX, MdMenuInvalidPositionY} from './menu-errors';
import {MdMenuItem} from './menu-item';
import {FocusKeyManager} from '../core/a11y/focus-key-manager';
import {MdMenuPanel} from './menu-panel';
import {Subscription} from 'rxjs/Subscription';
import {transformMenu, fadeInItems} from './menu-animations';

@Component({
  moduleId: module.id,
  selector: 'md-menu, mat-menu',
  host: {'role': 'menu'},
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    transformMenu,
    fadeInItems
  ],
  exportAs: 'mdMenu'
})
export class MdMenu implements AfterContentInit, MdMenuPanel, OnDestroy {
  private _keyManager: FocusKeyManager;
  private _xPosition: MenuPositionX = 'after';
  private _yPosition: MenuPositionY = 'below';

  /** Subscription to tab events on the menu panel */
  private _tabSubscription: Subscription;

  /** Config object to be passed into the menu's ngClass */
  _classList: any = {};

  /** Position of the menu in the X axis. */
  @Input()
  get xPosition() { return this._xPosition; }
  set xPosition(value: MenuPositionX) {
    if (value !== 'before' && value !== 'after') {
      throw new MdMenuInvalidPositionX();
    }
    this._xPosition = value;
    this.setPositionClasses();
  }

  /** Position of the menu in the Y axis. */
  @Input()
  get yPosition() { return this._yPosition; }
  set yPosition(value: MenuPositionY) {
    if (value !== 'above' && value !== 'below') {
      throw new MdMenuInvalidPositionY();
    }
    this._yPosition = value;
    this.setPositionClasses();
  }

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  /** List of the items inside of a menu. */
  @ContentChildren(MdMenuItem) items: QueryList<MdMenuItem>;

  /** Whether the menu should overlap its trigger. */
  @Input() overlapTrigger = true;

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager(this.items).withWrap();
    this._tabSubscription = this._keyManager.tabOut.subscribe(() => this._emitCloseEvent());
  }

  ngOnDestroy() {
    if (this._tabSubscription) {
      this._tabSubscription.unsubscribe();
    }
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
    this.setPositionClasses();
  }

  /** Event emitted when the menu is closed. */
  @Output() close = new EventEmitter<void>();

  /**
   * Focus the first item in the menu. This method is used by the menu trigger
   * to focus the first item when the menu is opened by the ENTER key.
   */
  focusFirstItem() {
    this._keyManager.setFirstItemActive();
  }

  /**
   * This emits a close event to which the trigger is subscribed. When emitted, the
   * trigger will close the menu.
   */
  _emitCloseEvent(): void {
    this.close.emit();
  }

  /**
   * It's necessary to set position-based classes to ensure the menu panel animation
   * folds out from the correct direction.
   */
  setPositionClasses(posX = this.xPosition, posY = this.yPosition): void {
    this._classList['mat-menu-before'] = posX === 'before';
    this._classList['mat-menu-after'] = posX === 'after';
    this._classList['mat-menu-above'] = posY === 'above';
    this._classList['mat-menu-below'] = posY === 'below';
  }

}
