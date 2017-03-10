import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  Directive, NgZone, Inject, Optional,
} from '@angular/core';
import {MdInkBar} from '../ink-bar';
import {MdRipple} from '../../core/ripple/index';
import {ViewportRuler} from '../../core/overlay/position/viewport-ruler';
import {MD_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '../../core/ripple/ripple';

/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  moduleId: module.id,
  selector: '[md-tab-nav-bar], [mat-tab-nav-bar]',
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.css'],
  host: {
    '[class.mat-tab-nav-bar]': 'true',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdTabNavBar {
  _activeLinkChanged: boolean;
  _activeLinkElement: ElementRef;

  @ViewChild(MdInkBar) _inkBar: MdInkBar;

  /** Notifies the component that the active link has been changed. */
  updateActiveLink(element: ElementRef) {
    this._activeLinkChanged = this._activeLinkElement != element;
    this._activeLinkElement = element;
  }

  /** Checks if the active link has been changed and, if so, will update the ink bar. */
  ngAfterContentChecked(): void {
    if (this._activeLinkChanged) {
      this._inkBar.alignToElement(this._activeLinkElement.nativeElement);
      this._activeLinkChanged = false;
    }
  }
}

/**
 * Link inside of a `md-tab-nav-bar`.
 */
@Directive({
  selector: '[md-tab-link], [mat-tab-link]',
  host: {
    '[class.mat-tab-link]': 'true',
  }
})
export class MdTabLink {
  private _isActive: boolean = false;

  /** Whether the link is active. */
  @Input()
  get active(): boolean { return this._isActive; }
  set active(value: boolean) {
    this._isActive = value;
    if (value) {
      this._mdTabNavBar.updateActiveLink(this._elementRef);
    }
  }

  constructor(private _mdTabNavBar: MdTabNavBar, private _elementRef: ElementRef) {}
}

/**
 * Simple directive that extends the ripple and matches the selector of the MdTabLink. This
 * adds the ripple behavior to nav bar labels.
 */
@Directive({
  selector: '[md-tab-link], [mat-tab-link]',
  host: {
    '[class.mat-tab-link]': 'true',
  },
})
export class MdTabLinkRipple extends MdRipple {
  constructor(elementRef: ElementRef, ngZone: NgZone, ruler: ViewportRuler,
              @Optional() @Inject(MD_RIPPLE_GLOBAL_OPTIONS) globalOptions: RippleGlobalOptions) {
    super(elementRef, ngZone, ruler, globalOptions);
  }
}
