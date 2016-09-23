import {OverlayRef} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

// TODO(josephperrott): Implement onAction observable.


/**
 * Reference to a snack bar dispatched from the snack bar service.
 */
export class MdSnackBarRef<T> {
  /** The instance of the component making up the content of the snack bar. */
  readonly instance: T;

  /** Subject for notifying the user that the snack bar has closed. */
  private _afterClosed: Subject<any> = new Subject();

  constructor(instance: T, private _overlayRef: OverlayRef) {
    // Sets the readonly instance of the snack bar content component.
    this.instance = instance;
  }

  /** Dismisses the snack bar. */
  dismiss(): void {
    if (!this._afterClosed.closed) {
      this._overlayRef.dispose();
      this._afterClosed.complete();
    }
  }

  /** Gets an observable that is notified when the snack bar is finished closing. */
  afterDismissed(): Observable<void> {
    return this._afterClosed.asObservable();
  }
}
