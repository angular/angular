export interface DocumentContents {
  /** The unique identifier for this document */
  id: string;
  /** The string to display in the browser tab when this document is being viewed */
  title: string;
  /** The HTML to display in the doc viewer */
  contents: string;
}
