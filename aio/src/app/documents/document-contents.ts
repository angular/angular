export interface DocumentContents {
  /** The unique identifier for this document */
  id: string;
  /** The HTML to display in the doc viewer */
  contents: string|null;
}
