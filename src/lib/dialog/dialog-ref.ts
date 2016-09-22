import {OverlayRef} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


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

  constructor(private _overlayRef: OverlayRef) { }

  /**
   * Close the dialog.
   * @param dialogResult Optional result to return to the dialog opener.
   */
  close(dialogResult?: any): void {
    this._overlayRef.dispose();
    this._afterClosed.next(dialogResult);
    this._afterClosed.complete();
  }

  /** Gets an observable that is notified when the dialog is finished closing. */
  afterClosed(): Observable<any> {
    return this._afterClosed.asObservable();
  }
}
