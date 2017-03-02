import {
  Component,
  ComponentRef,
  ViewChild,
  ViewEncapsulation,
  NgZone,
  OnDestroy,
  Renderer,
  ElementRef,
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTransitionEvent,
  EventEmitter,
} from '@angular/core';
import {BasePortalHost, ComponentPortal, PortalHostDirective, TemplatePortal} from '../core';
import {MdDialogConfig} from './dialog-config';
import {MdDialogContentAlreadyAttachedError} from './dialog-errors';
import {FocusTrapFactory, FocusTrap} from '../core/a11y/focus-trap';
import 'rxjs/add/operator/first';


/** Possible states for the dialog container animation. */
export type MdDialogContainerAnimationState = 'void' | 'enter' | 'exit' | 'exit-start';


/**
 * Internal component that wraps user-provided dialog content.
 * Animation is based on https://material.io/guidelines/motion/choreography.html.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-dialog-container, mat-dialog-container',
  templateUrl: 'dialog-container.html',
  styleUrls: ['dialog.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideDialog', [
      state('void', style({ transform: 'translateY(25%) scale(0.9)', opacity: 0 })),
      state('enter', style({ transform: 'translateY(0%) scale(1)', opacity: 1 })),
      state('exit', style({ transform: 'translateY(25%)', opacity: 0 })),
      transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
    ])
  ],
  host: {
    '[class.mat-dialog-container]': 'true',
    '[attr.role]': 'dialogConfig?.role',
    '[@slideDialog]': '_state',
    '(@slideDialog.done)': '_onAnimationDone($event)',
  },
})
export class MdDialogContainer extends BasePortalHost implements OnDestroy {
  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** The class that traps and manages focus within the dialog. */
  private _focusTrap: FocusTrap;

  /** Element that was focused before the dialog was opened. Save this to restore upon close. */
  private _elementFocusedBeforeDialogWasOpened: HTMLElement = null;

  /** The dialog configuration. */
  dialogConfig: MdDialogConfig;

  /** State of the dialog animation. */
  _state: MdDialogContainerAnimationState = 'enter';

  /** Emits the current animation state whenever it changes. */
  _onAnimationStateChange = new EventEmitter<MdDialogContainerAnimationState>();

  constructor(
    private _ngZone: NgZone,
    private _renderer: Renderer,
    private _elementRef: ElementRef,
    private _focusTrapFactory: FocusTrapFactory) {

    super();
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throw new MdDialogContentAlreadyAttachedError();
    }

    let attachResult = this._portalHost.attachComponentPortal(portal);
    this._trapFocus();
    return attachResult;
  }

  /**
   * Attach a TemplatePortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    if (this._portalHost.hasAttached()) {
      throw new MdDialogContentAlreadyAttachedError();
    }

    let attachedResult = this._portalHost.attachTemplatePortal(portal);
    this._trapFocus();
    return attachedResult;
  }

  /**
   * Moves the focus inside the focus trap.
   * @private
   */
  private _trapFocus() {
    if (!this._focusTrap) {
      this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
    }

    // If were to attempt to focus immediately, then the content of the dialog would not yet be
    // ready in instances where change detection has to run first. To deal with this, we simply
    // wait for the microtask queue to be empty.
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
      this._elementFocusedBeforeDialogWasOpened = document.activeElement as HTMLElement;
      this._focusTrap.focusFirstTabbableElement();
    });
  }

  /**
   * Kicks off the leave animation.
   * @docs-private
   */
  _exit(): void {
    this._state = 'exit';
    this._onAnimationStateChange.emit('exit-start');
  }

  /**
   * Callback, invoked whenever an animation on the host completes.
   * @docs-private
   */
  _onAnimationDone(event: AnimationTransitionEvent) {
    this._onAnimationStateChange.emit(event.toState as MdDialogContainerAnimationState);
  }

  ngOnDestroy() {
    // When the dialog is destroyed, return focus to the element that originally had it before
    // the dialog was opened. Wait for the DOM to finish settling before changing the focus so
    // that it doesn't end up back on the <body>. Also note that we need the extra check, because
    // IE can set the `activeElement` to null in some cases.
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
      let toFocus = this._elementFocusedBeforeDialogWasOpened as HTMLElement;

      // We need to check whether the focus method exists at all, because IE seems to throw an
      // exception, even if the element is the document.body.
      if (toFocus && 'focus' in toFocus) {
        toFocus.focus();
      }

      this._onAnimationStateChange.complete();
    });

    this._focusTrap.destroy();
  }
}
