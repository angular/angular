import {
  AfterContentInit,
  Component,
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MdInkBar} from '../ink-bar';
import {MdRipple} from '../../core/ripple/index';
import {ViewportRuler} from '../../core/overlay/position/viewport-ruler';
import {Dir, MD_RIPPLE_GLOBAL_OPTIONS, Platform, RippleGlobalOptions} from '../../core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/auditTime';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import {Subject} from 'rxjs/Subject';

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
  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

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
    this._ngZone.runOutsideAngular(() => {
      let dirChange = this._dir ? this._dir.dirChange : Observable.of(null);
      let resize = typeof window !== 'undefined' ?
          Observable.fromEvent(window, 'resize').auditTime(10) :
          Observable.of(null);

      return Observable.merge(dirChange, resize)
          .takeUntil(this._onDestroy)
          .subscribe(() => this._alignInkBar());
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
    this._onDestroy.next();
  }

  /** Aligns the ink bar to the active link. */
  _alignInkBar(): void {
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
