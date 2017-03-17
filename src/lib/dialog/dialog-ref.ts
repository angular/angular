import {OverlayRef} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MdDialogContainer, MdDialogContainerAnimationState} from './dialog-container';


// TODO(jelbourn): resizing
// TODO(jelbourn): afterOpen and beforeClose


/**
 * Reference to a dialog opened via the MdDialog service.
 */
export class MdDialogRef<T> {
  /** The instance of component opened into the dialog. */
  componentInstance: T;

  /** Subject for notifying the user that the dialog has finished closing. */
  private _afterClosed: Subject<any> = new Subject();

  /** Result to be passed to afterClosed. */
  private _result: any;

  constructor(private _overlayRef: OverlayRef, public _containerInstance: MdDialogContainer) {
    _containerInstance._onAnimationStateChange.subscribe(
      (state: MdDialogContainerAnimationState) => {
        if (state === 'exit-start') {
          // Transition the backdrop in parallel with the dialog.
          this._overlayRef.detachBackdrop();
        } else if (state === 'exit') {
          this._overlayRef.dispose();
          this._afterClosed.next(this._result);
          this._afterClosed.complete();
          this.componentInstance = null;
        }
      });
  }

  /**
   * Close the dialog.
   * @param dialogResult Optional result to return to the dialog opener.
   */
  close(dialogResult?: any): void {
    this._result = dialogResult;
    this._containerInstance._exit();
  }

  /**
   * Gets an observable that is notified when the dialog is finished closing.
   */
  afterClosed(): Observable<any> {
    return this._afterClosed.asObservable();
  }
}
