import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';
import {MdOption} from './option';
import {ENTER, SPACE} from '../core/keyboard/keycodes';
import {ListKeyManager} from '../core/a11y/list-key-manager';
import {Dir} from '../core/rtl/dir';
import {Subscription} from 'rxjs/Subscription';
import {transformPlaceholder, transformPanel, fadeInContent} from './select-animations';

@Component({
  moduleId: module.id,
  selector: 'md-select',
  templateUrl: 'select.html',
  styleUrls: ['select.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'listbox',
    'tabindex': '0',
    '[attr.aria-label]': 'placeholder',
    '(keydown)': '_openOnActivate($event)'
  },
  animations: [
    transformPlaceholder,
    transformPanel,
    fadeInContent
  ],
  exportAs: 'mdSelect'
})
export class MdSelect implements AfterContentInit, OnDestroy {
  /** Whether or not the overlay panel is open. */
  private _panelOpen = false;

  /** The currently selected option. */
  private _selected: MdOption;

  /** Subscriptions to option events. */
  private _subscriptions: Subscription[] = [];

  /** Subscription to changes in the option list. */
  private _changeSubscription: Subscription;

  /** Subscription to tab events while overlay is focused. */
  private _tabSubscription: Subscription;

  /** Manages keyboard events for options in the panel. */
  _keyManager: ListKeyManager;

  /** This position config ensures that the top left corner of the overlay
   * is aligned with with the top left of the origin (overlapping the trigger
   * completely). In RTL mode, the top right corners are aligned instead.
   */
  _positions = [{
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top'
  }];

  @ViewChild('trigger') trigger: ElementRef;
  @ContentChildren(MdOption) options: QueryList<MdOption>;

  @Input() placeholder: string;
  @Output() onOpen = new EventEmitter();
  @Output() onClose = new EventEmitter();

  constructor(private _element: ElementRef, private _renderer: Renderer,
              @Optional() private _dir: Dir) {}

  ngAfterContentInit() {
    this._initKeyManager();
    this._listenToOptions();

    this._changeSubscription = this.options.changes.subscribe(() => {
      this._dropSubscriptions();
      this._listenToOptions();
    });
  }

  ngOnDestroy() {
    this._dropSubscriptions();
    this._changeSubscription.unsubscribe();
    this._tabSubscription.unsubscribe();
  }

  /** Toggles the overlay panel open or closed. */
  toggle(): void {
    this.panelOpen ? this.close() : this.open();
  }

  /** Opens the overlay panel. */
  open(): void {
    this._panelOpen = true;
  }

  /** Closes the overlay panel and focuses the host element. */
  close(): void {
    this._panelOpen = false;
    this._focusHost();
  }

  /** Whether or not the overlay panel is open. */
  get panelOpen(): boolean {
    return this._panelOpen;
  }

  /** The currently selected option. */
  get selected(): MdOption {
    return this._selected;
  }

  _isRtl(): boolean {
    return this._dir ? this._dir.value === 'rtl' : false;
  }

  /** The width of the trigger element. This is necessary to match
   * the overlay width to the trigger width.
   */
  _getWidth(): number {
    return this.trigger.nativeElement.getBoundingClientRect().width;
  }

  /** The animation state of the placeholder. */
  _getPlaceholderState(): string {
    if (this.panelOpen || this.selected) {
      return this._isRtl() ? 'floating-rtl' : 'floating-ltr';
    } else {
      return 'normal';
    }
  }

  /** The animation state of the overlay panel. */
  _getPanelState(): string {
    return this._isRtl() ? 'showing-rtl' : 'showing-ltr';
  }

  /** Ensures the panel opens if activated by the keyboard. */
  _openOnActivate(event: KeyboardEvent): void {
    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      this.open();
    }
  }

  /**
   * When the panel is finished animating, emits an event and focuses
   * an option if the panel is open.
   */
  _onPanelDone(): void {
    if (this.panelOpen) {
      this._focusCorrectOption();
      this.onOpen.emit();
    } else {
      this.onClose.emit();
    }
  }

  /** Sets up a key manager to listen to keyboard events on the overlay panel. */
  private _initKeyManager() {
    this._keyManager = new ListKeyManager(this.options);
    this._tabSubscription = this._keyManager.tabOut.subscribe(() => {
      this.close();
    });
  }

  /** Listens to selection events on each option. */
  private _listenToOptions(): void {
    this.options.forEach((option: MdOption) => {
      const sub = option.onSelect.subscribe(() => this._onSelect(option));
      this._subscriptions.push(sub);
    });
  }

  /** Unsubscribes from all option subscriptions. */
  private _dropSubscriptions(): void {
    this._subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    this._subscriptions = [];
  }

  /** When a new option is selected, deselects the others and closes the panel. */
  private _onSelect(option: MdOption): void {
    this._selected = option;
    this._updateOptions();
    this.close();
  }

  /** Deselect each option that doesn't match the current selection. */
  private _updateOptions(): void {
    this.options.forEach((option: MdOption) => {
      if (option !== this.selected) {
        option.deselect();
      }
    });
  }

  /** Focuses the selected item. If no option is selected, it will focus
   * the first item instead.
   */
  private _focusCorrectOption(): void {
    if (this.selected) {
      this._keyManager.focusedItemIndex = this._getOptionIndex(this.selected);
      this.selected.focus();
    } else {
      this._keyManager.focusedItemIndex = 0;
      this.options.first.focus();
    }
  }

  /** Focuses the host element when the panel closes. */
  private _focusHost(): void {
    this._renderer.invokeElementMethod(this._element.nativeElement, 'focus');
  }

  /** Gets the index of the provided option in the option list. */
  private _getOptionIndex(option: MdOption): number {
    return this.options.reduce((result: number, current: MdOption, index: number) => {
      return result === undefined ? (option === current ? index : undefined) : result;
    }, undefined);
  }

}
