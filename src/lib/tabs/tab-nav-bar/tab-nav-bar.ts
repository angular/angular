import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  Directive,
  NgZone,
  Inject,
  Optional,
  OnDestroy,
  AfterContentInit,
} from '@angular/core';
import {MdInkBar} from '../ink-bar';
import {MdRipple} from '../../core/ripple/index';
import {ViewportRuler} from '../../core/overlay/position/viewport-ruler';
import {MD_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions, Dir, Platform} from '../../core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/auditTime';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';

/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  moduleId: module.id,
  selector: '[md-tab-nav-bar], [mat-tab-nav-bar]',
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.css'],
  host: {'class': 'mat-tab-nav-bar'},
  encapsulation: ViewEncapsulation.None,
})
export class MdTabNavBar implements AfterContentInit, OnDestroy {
  /** Combines listeners that will re-align the ink bar whenever they're invoked. */
  private _realignInkBar: Subscription = null;

  _activeLinkChanged: boolean;
  _activeLinkElement: ElementRef;

  @ViewChild(MdInkBar) _inkBar: MdInkBar;

  constructor(@Optional() private _dir: Dir, private _ngZone: NgZone) { }

  /** Notifies the component that the active link has been changed. */
  updateActiveLink(element: ElementRef) {
    this._activeLinkChanged = this._activeLinkElement != element;
    this._activeLinkElement = element;
  }

  ngAfterContentInit(): void {
    this._realignInkBar = this._ngZone.runOutsideAngular(() => {
      let dirChange = this._dir ? this._dir.dirChange : Observable.of(null);
      let resize = typeof window !== 'undefined' ?
          Observable.fromEvent(window, 'resize').auditTime(10) :
          Observable.of(null);

      return Observable.merge(dirChange, resize).subscribe(() => this._alignInkBar());
    });
  }

  /** Checks if the active link has been changed and, if so, will update the ink bar. */
  ngAfterContentChecked(): void {
    if (this._activeLinkChanged) {
      this._alignInkBar();
      this._activeLinkChanged = false;
    }
  }

  ngOnDestroy() {
    if (this._realignInkBar) {
      this._realignInkBar.unsubscribe();
      this._realignInkBar = null;
    }
  }

  /** Aligns the ink bar to the active link. */
  private _alignInkBar(): void {
    if (this._activeLinkElement) {
      this._inkBar.alignToElement(this._activeLinkElement.nativeElement);
    }
  }
}

/**
 * Link inside of a `md-tab-nav-bar`.
 */
@Directive({
  selector: '[md-tab-link], [mat-tab-link]',
  host: {'class': 'mat-tab-link'}
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
  host: {'class': 'mat-tab-link'},
})
export class MdTabLinkRipple extends MdRipple {
  constructor(
      elementRef: ElementRef,
      ngZone: NgZone,
      ruler: ViewportRuler,
      platform: Platform,
      @Optional() @Inject(MD_RIPPLE_GLOBAL_OPTIONS) globalOptions: RippleGlobalOptions) {
    super(elementRef, ngZone, ruler, platform, globalOptions);
  }
}
