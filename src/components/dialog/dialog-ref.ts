/**
 * Reference to a dialog opened via the MdDialog service.
 */
export class MdDialogRef<T> {
  /** The instance of component opened into the dialog. */
  componentInstance: T;

  // TODO(jelbourn): Add methods to resize, close, and get results from the dialog.
}
