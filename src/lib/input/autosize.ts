import {Directive, ElementRef, Input, OnInit} from '@angular/core';


/**
 * Directive to automatically resize a textarea to fit its content.
 */
@Directive({
  selector: 'textarea[md-autosize], textarea[mdTextareaAutosize],' +
            'textarea[mat-autosize], textarea[matTextareaAutosize]',
  exportAs: 'mdTextareaAutosize',
  host: {
    '(input)': 'resizeToFitContent()',
    '[style.min-height]': '_minHeight',
    '[style.max-height]': '_maxHeight',
  },
})
export class MdTextareaAutosize implements OnInit {
  /** Minimum number of rows for this textarea. */
  @Input() minRows: number;

  get mdAutosizeMinRows(): number {
    return this.minRows;
  }

  @Input() set mdAutosizeMinRows(value: number) {
    this.minRows = value;
  }

  /** Maximum number of rows for this textarea. */
  @Input() maxRows: number;

  get mdAutosizeMaxRows(): number {
    return this.maxRows;
  }

  @Input() set mdAutosizeMaxRows(value: number) {
    this.maxRows = value;
  }

  /** Cached height of a textarea with a single row. */
  private _cachedLineHeight: number;

  constructor(private _elementRef: ElementRef) { }

  /** The minimum height of the textarea as determined by minRows. */
  get _minHeight() {
    return this.minRows ? `${this.minRows * this._cachedLineHeight}px` : null;
  }

  /** The maximum height of the textarea as determined by maxRows. */
  get _maxHeight() {
    return this.maxRows ? `${this.maxRows * this._cachedLineHeight}px` : null;
  }

  ngOnInit() {
    this._cacheTextareaLineHeight();
    this.resizeToFitContent();
  }

  /**
   * Cache the height of a single-row textarea.
   *
   * We need to know how large a single "row" of a textarea is in order to apply minRows and
   * maxRows. For the initial version, we will assume that the height of a single line in the
   * textarea does not ever change.
   */
  private _cacheTextareaLineHeight(): void {
    let textarea = this._elementRef.nativeElement as HTMLTextAreaElement;

    // Use a clone element because we have to override some styles.
    let textareaClone = textarea.cloneNode(false) as HTMLTextAreaElement;
    textareaClone.rows = 1;

    // Use `position: absolute` so that this doesn't cause a browser layout and use
    // `visibility: hidden` so that nothing is rendered. Clear any other styles that
    // would affect the height.
    textareaClone.style.position = 'absolute';
    textareaClone.style.visibility = 'hidden';
    textareaClone.style.border = 'none';
    textareaClone.style.padding = '';
    textareaClone.style.height = '';
    textareaClone.style.minHeight = '';
    textareaClone.style.maxHeight = '';

    textarea.parentNode.appendChild(textareaClone);
    this._cachedLineHeight = textareaClone.offsetHeight;
    textarea.parentNode.removeChild(textareaClone);
  }

  /** Resize the textarea to fit its content. */
  resizeToFitContent() {
    let textarea = this._elementRef.nativeElement as HTMLTextAreaElement;
    // Reset the textarea height to auto in order to shrink back to its default size.
    textarea.style.height = 'auto';

    // Use the scrollHeight to know how large the textarea *would* be if fit its entire value.
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
