import {OverlayRef} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MdSnackBarContainer} from './snack-bar-container';

// TODO(josephperrott): Implement onAction observable.


/**
 * Reference to a snack bar dispatched from the snack bar service.
 */
export class MdSnackBarRef<T> {
  /** The instance of the component making up the content of the snack bar. */
  readonly instance: T;

  /** The instance of the component making up the content of the snack bar. */
  readonly containerInstance: MdSnackBarContainer;

  /** Subject for notifying the user that the snack bar has closed. */
  private _afterClosed: Subject<any> = new Subject();

  /** Subject for notifying the user that the snack bar has opened and appeared. */
  private _afterOpened: Subject<any>;

  /** Subject for notifying the user that the snack bar action was called. */
  private _onAction: Subject<any> = new Subject();

  constructor(instance: T,
              containerInstance: MdSnackBarContainer,
              private _overlayRef: OverlayRef) {
    // Sets the readonly instance of the snack bar content component.
    this.instance = instance;
    this.containerInstance = containerInstance;
    // Dismiss snackbar on action.
    this.onAction().subscribe(() => this.dismiss());
  }

  /** Dismisses the snack bar. */
  dismiss(): void {
    if (!this._afterClosed.closed) {
      this.containerInstance.exit().subscribe(() => {
        this._overlayRef.dispose();
        this._afterClosed.next();
        this._afterClosed.complete();
      });
    }
  }

  /** Marks the snackbar action clicked. */
  _action(): void {
    if (!this._onAction.closed) {
      this._onAction.next();
      this._onAction.complete();
    }
  }

  /** Marks the snackbar as opened */
  _open(): void {
    if (!this._afterOpened.closed) {
      this._afterOpened.next();
      this._afterOpened.complete();
    }
  }

  /** Gets an observable that is notified when the snack bar is finished closing. */
  afterDismissed(): Observable<void> {
    return this._afterClosed.asObservable();
  }

  /** Gets an observable that is notified when the snack bar has opened and appeared. */
  afterOpened(): Observable<void> {
    return this.containerInstance._onEnter();
  }

  /** Gets an observable that is notified when the snack bar action is called. */
  onAction(): Observable<void> {
    return this._onAction.asObservable();
  }
}
