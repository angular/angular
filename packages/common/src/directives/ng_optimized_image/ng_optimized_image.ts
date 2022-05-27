/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, Injectable, Injector, Input, NgModule, NgZone, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, ɵformatRuntimeError as formatRuntimeError, ɵRuntimeError as RuntimeError} from '@angular/core';

import {DOCUMENT} from '../../dom_tokens';
import {RuntimeErrorCode} from '../../errors';

import {IMAGE_LOADER, ImageLoader} from './image_loaders/image_loader';

/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;

/**
 * RegExpr to determine whether a src in a srcset is using width descriptors.
 * Should match something like: "100w, 200w".
 */
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;

/**
 * RegExpr to determine whether a src in a srcset is using density descriptors.
 * Should match something like: "1x, 2x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d(\.\d)?x\s*(,|$)){1,})$/;

/**
 * Contains the logic to detect whether an image with the `NgOptimizedImage` directive
 * is treated as an LCP element. If so, verifies that the image is marked as a priority,
 * using the `priority` attribute.
 *
 * Note: this is a dev-mode only class, which should not appear in prod bundles,
 * thus there is no `ngDevMode` use in the code.
 *
 * Based on https://web.dev/lcp/#measure-lcp-in-javascript.
 */
@Injectable({
  providedIn: 'root',
})
class LCPImageObserver implements OnDestroy {
  // Map of full image URLs -> original `rawSrc` values.
  private images = new Map<string, string>();
  // Keep track of images for which `console.warn` was produced.
  private alreadyWarned = new Set<string>();

  private window: Window|null = null;
  private observer: PerformanceObserver|null = null;

  constructor(@Inject(DOCUMENT) doc: Document) {
    const win = doc.defaultView;
    if (typeof win !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
      this.window = win;
      this.observer = this.initPerformanceObserver();
    }
  }

  // Converts relative image URL to a full URL.
  private getFullUrl(src: string) {
    return new URL(src, this.window!.location.href).href;
  }

  // Inits PerformanceObserver and subscribes to LCP events.
  // Based on https://web.dev/lcp/#measure-lcp-in-javascript
  private initPerformanceObserver(): PerformanceObserver {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length === 0) return;
      // Note: we use the latest entry produced by the `PerformanceObserver` as the best
      // signal on which element is actually an LCP one. As an example, the first image to load on
      // a page, by virtue of being the only thing on the page so far, is often a LCP candidate
      // and gets reported by PerformanceObserver, but isn't necessarily the LCP element.
      const lcpElement = entries[entries.length - 1];
      // Cast to `any` due to missing `element` on observed type of entry.
      const imgSrc = (lcpElement as any).element?.src ?? '';

      // Exclude `data:` and `blob:` URLs, since they are not supported by the directive.
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) return;

      const imgRawSrc = this.images.get(imgSrc);
      if (imgRawSrc && !this.alreadyWarned.has(imgSrc)) {
        this.alreadyWarned.add(imgSrc);
        const directiveDetails = imgDirectiveDetails(imgRawSrc);
        console.warn(formatRuntimeError(
            RuntimeErrorCode.LCP_IMG_MISSING_PRIORITY,
            `${directiveDetails}: the image was detected as the Largest Contentful Paint (LCP) ` +
                `element, so its loading should be prioritized for optimal performance. Please ` +
                `add the "priority" attribute if this image is above the fold.`));
      }
    });
    observer.observe({type: 'largest-contentful-paint', buffered: true});
    return observer;
  }

  registerImage(rewrittenSrc: string, rawSrc: string) {
    if (!this.observer) return;
    this.images.set(this.getFullUrl(rewrittenSrc), rawSrc);
  }

  unregisterImage(rewrittenSrc: string) {
    if (!this.observer) return;
    this.images.delete(this.getFullUrl(rewrittenSrc));
  }

  ngOnDestroy() {
    if (!this.observer) return;
    this.observer.disconnect();
    this.images.clear();
    this.alreadyWarned.clear();
  }
}

/**
 * ** EXPERIMENTAL **
 *
 * TODO: add Image directive description.
 *
 * @usageNotes
 * TODO: add Image directive usage notes.
 */
@Directive({
  selector: 'img[rawSrc]',
})
export class NgOptimizedImage implements OnInit, OnChanges, OnDestroy {
  constructor(
      @Inject(IMAGE_LOADER) private imageLoader: ImageLoader, private renderer: Renderer2,
      private imgElement: ElementRef, private injector: Injector) {}

  // Private fields to keep normalized input values.
  private _width?: number;
  private _height?: number;
  private _priority = false;

  /**
   * Name of the source image.
   * Image name will be processed by the image loader and the final URL will be applied as the `src`
   * property of the image.
   */
  @Input() rawSrc!: string;

  /**
   * A comma separated list of width or density descriptors.
   * The image name will be taken from `rawSrc` and combined with the list of width or density
   * descriptors to generate the final `srcset` property of the image.
   *
   * Example:
   * <img rawSrc="hello.jpg" rawSrcset="100w, 200w" />  =>
   * <img src="path/hello.jpg" srcset="path/hello.jpg?w=100 100w, path/hello.jpg?w=200 200w" />
   */
  @Input() rawSrcset!: string;

  /**
   * The intrinsic width of the image in px.
   */
  @Input()
  set width(value: string|number|undefined) {
    ngDevMode && assertValidNumberInput(value, 'width');
    this._width = inputToInteger(value);
  }
  get width(): number|undefined {
    return this._width;
  }

  /**
   * The intrinsic height of the image in px.
   */
  @Input()
  set height(value: string|number|undefined) {
    ngDevMode && assertValidNumberInput(value, 'height');
    this._height = inputToInteger(value);
  }
  get height(): number|undefined {
    return this._height;
  }

  /**
   * The desired loading behavior (lazy, eager, or auto).
   * The primary use case for this input is opting-out non-priority images
   * from lazy loading by marking them loading='eager' or loading='auto'.
   * This input should not be used with priority images.
   */
  @Input() loading?: string;

  /**
   * Indicates whether this image should have a high priority.
   */
  @Input()
  set priority(value: string|boolean|undefined) {
    this._priority = inputToBoolean(value);
  }
  get priority(): boolean {
    return this._priority;
  }

  /**
   * Get a value of the `src` and `srcset` if they're set on a host <img> element.
   * These inputs are needed to verify that there are no conflicting sources provided
   * at the same time (e.g. `src` and `rawSrc` together or `srcset` and `rawSrcset`,
   * thus causing an ambiguity on which src to use) and that images
   * don't start to load until a lazy loading strategy is set.
   * @internal
   */
  @Input() src?: string;
  @Input() srcset?: string;

  ngOnInit() {
    if (ngDevMode) {
      assertNonEmptyInput('rawSrc', this.rawSrc);
      assertValidRawSrcset(this.rawSrcset);
      assertNoConflictingSrc(this);
      assertNoConflictingSrcset(this);
      assertNotBase64Image(this);
      assertNotBlobURL(this);
      assertRequiredNumberInput(this, this.width, 'width');
      assertRequiredNumberInput(this, this.height, 'height');
      assertValidLoadingInput(this);
      if (!this.priority) {
        // Monitor whether an image is an LCP element only in case
        // the `priority` attribute is missing. Otherwise, an image
        // has the necessary settings and no extra checks are required.
        withLCPImageObserver(
            this.injector,
            (observer: LCPImageObserver) =>
                observer.registerImage(this.getRewrittenSrc(), this.rawSrc));
      }
    }
    this.setHostAttribute('loading', this.getLoadingBehavior());
    this.setHostAttribute('fetchpriority', this.getFetchPriority());
    // The `src` and `srcset` attributes should be set last since other attributes
    // could affect the image's loading behavior.
    this.setHostAttribute('src', this.getRewrittenSrc());
    if (this.rawSrcset) {
      this.setHostAttribute('srcset', this.getRewrittenSrcset());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (ngDevMode) {
      assertNoPostInitInputChange(
          this, changes, ['rawSrc', 'rawSrcset', 'width', 'height', 'priority']);
    }
  }

  private getLoadingBehavior(): string {
    if (!this.priority && this.loading !== undefined && isNonEmptyString(this.loading)) {
      return this.loading;
    }
    return this.priority ? 'eager' : 'lazy';
  }

  private getFetchPriority(): string {
    return this.priority ? 'high' : 'auto';
  }

  private getRewrittenSrc(): string {
    // ImageLoaderConfig supports setting a width property. However, we're not setting width here
    // because if the developer uses rendered width instead of intrinsic width in the HTML width
    // attribute, the image requested may be too small for 2x+ screens.
    const imgConfig = {src: this.rawSrc};
    return this.imageLoader(imgConfig);
  }

  private getRewrittenSrcset(): string {
    const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.rawSrcset);
    const finalSrcs = this.rawSrcset.split(',').filter(src => src !== '').map(srcStr => {
      srcStr = srcStr.trim();
      const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width!;
      return `${this.imageLoader({src: this.rawSrc, width})} ${srcStr}`;
    });
    return finalSrcs.join(', ');
  }

  ngOnDestroy() {
    if (ngDevMode && !this.priority) {
      // An image is only registered in dev mode, try to unregister only in dev mode as well.
      withLCPImageObserver(
          this.injector,
          (observer: LCPImageObserver) => observer.unregisterImage(this.getRewrittenSrc()));
    }
  }

  private setHostAttribute(name: string, value: string): void {
    this.renderer.setAttribute(this.imgElement.nativeElement, name, value);
  }
}


/**
 * NgModule that declares and exports the `NgOptimizedImage` directive.
 * This NgModule is a compatibility layer for apps that use pre-v14
 * versions of Angular (before the `standalone` flag became available).
 *
 * The `NgOptimizedImage` will become a standalone directive in v14 and
 * this NgModule will be removed.
 */
@NgModule({
  declarations: [NgOptimizedImage],
  exports: [NgOptimizedImage],
})
export class NgOptimizedImageModule {
}

/***** Helpers *****/

// Convert input value to integer.
function inputToInteger(value: string|number|undefined): number|undefined {
  return typeof value === 'string' ? parseInt(value, 10) : value;
}

// Convert input value to boolean.
function inputToBoolean(value: unknown): boolean {
  return value != null && `${value}` !== 'false';
}

function isNonEmptyString(value: unknown): boolean {
  const isString = typeof value === 'string';
  const isEmptyString = isString && value.trim() === '';
  return isString && !isEmptyString;
}

/**
 * Invokes a function, passing an instance of the `LCPImageObserver` as an argument.
 *
 * Notes:
 * - the `LCPImageObserver` is a tree-shakable provider, provided in 'root',
 *   thus it's a singleton within this application
 * - the process of `LCPImageObserver` creation and an actual operation are invoked outside of the
 *   NgZone to make sure none of the calls inside the `LCPImageObserver` class trigger unnecessary
 *   change detection
 */
function withLCPImageObserver(
    injector: Injector, operation: (observer: LCPImageObserver) => void): void {
  const ngZone = injector.get(NgZone);
  return ngZone.runOutsideAngular(() => {
    const observer = injector.get(LCPImageObserver);
    operation(observer);
  });
}

function imgDirectiveDetails(rawSrc: string) {
  return `The NgOptimizedImage directive (activated on an <img> element ` +
      `with the \`rawSrc="${rawSrc}"\`)`;
}

/***** Assert functions *****/

// Verifies that there is no `src` set on a host element.
function assertNoConflictingSrc(dir: NgOptimizedImage) {
  if (dir.src) {
    throw new RuntimeError(
        RuntimeErrorCode.UNEXPECTED_SRC_ATTR,
        `${
            imgDirectiveDetails(
                dir.rawSrc)} has detected that the \`src\` has already been set (to ` +
            `\`${dir.src}\`). Please remove the \`src\` attribute from this image. ` +
            `The NgOptimizedImage directive will use the \`rawSrc\` to compute ` +
            `the final image URL and set the \`src\` itself.`);
  }
}

// Verifies that there is no `srcset` set on a host element.
function assertNoConflictingSrcset(dir: NgOptimizedImage) {
  if (dir.srcset) {
    throw new RuntimeError(
        RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR,
        `${imgDirectiveDetails(dir.rawSrc)} has detected that the \`srcset\` has been set. ` +
            `Please replace the \`srcset\` attribute from this image with \`rawSrcset\`. ` +
            `The NgOptimizedImage directive uses \`rawSrcset\` to set the \`srcset\` attribute` +
            `at a time that does not disrupt lazy loading.`);
  }
}

// Verifies that the `rawSrc` is not a Base64-encoded image.
function assertNotBase64Image(dir: NgOptimizedImage) {
  let rawSrc = dir.rawSrc.trim();
  if (rawSrc.startsWith('data:')) {
    if (rawSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
      rawSrc = rawSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
    }
    throw new RuntimeError(
        RuntimeErrorCode.INVALID_INPUT,
        `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
            `to a Base64-encoded string (${rawSrc}). Base64-encoded strings are ` +
            `not supported by the NgOptimizedImage directive. Use a regular \`src\` ` +
            `attribute (instead of \`rawSrc\`) to disable the NgOptimizedImage ` +
            `directive for this element.`);
  }
}

// Verifies that the `rawSrc` is not a Blob URL.
function assertNotBlobURL(dir: NgOptimizedImage) {
  const rawSrc = dir.rawSrc.trim();
  if (rawSrc.startsWith('blob:')) {
    throw new RuntimeError(
        RuntimeErrorCode.INVALID_INPUT,
        `The NgOptimizedImage directive has detected that the \`rawSrc\` was set ` +
            `to a blob URL (${rawSrc}). Blob URLs are not supported by the ` +
            `NgOptimizedImage directive. Use a regular \`src\` attribute ` +
            `(instead of \`rawSrc\`) to disable the NgOptimizedImage directive ` +
            `for this element.`);
  }
}

// Verifies that the input is set to a non-empty string.
function assertNonEmptyInput(name: string, value: unknown) {
  const isString = typeof value === 'string';
  const isEmptyString = isString && value.trim() === '';
  if (!isString || isEmptyString) {
    const extraMessage = isEmptyString ? ' (empty string)' : '';
    throw new RuntimeError(
        RuntimeErrorCode.INVALID_INPUT,
        `The NgOptimizedImage directive has detected that the \`${name}\` has an invalid value: ` +
            `expecting a non-empty string, but got: \`${value}\`${extraMessage}.`);
  }
}

// Verifies that the `rawSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x"
export function assertValidRawSrcset(value: unknown) {
  if (value == null) return;
  assertNonEmptyInput('rawSrcset', value);
  const isValidSrcset = VALID_WIDTH_DESCRIPTOR_SRCSET.test(value as string) ||
      VALID_DENSITY_DESCRIPTOR_SRCSET.test(value as string);

  if (!isValidSrcset) {
    throw new RuntimeError(
        RuntimeErrorCode.INVALID_INPUT,
        `The NgOptimizedImage directive has detected that the \`rawSrcset\` has an invalid value: ` +
            `expecting width descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x"), ` +
            `but got: \`${value}\``);
  }
}

// Creates a `RuntimeError` instance to represent a situation when an input is set after
// the directive has initialized.
function postInitInputChangeError(dir: NgOptimizedImage, inputName: string): {} {
  return new RuntimeError(
      RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE,
      `${imgDirectiveDetails(dir.rawSrc)} has detected that the \`${
          inputName}\` is updated after the ` +
          `initialization. The NgOptimizedImage directive will not react to this input change.`);
}

// Verify that none of the listed inputs has changed.
function assertNoPostInitInputChange(
    dir: NgOptimizedImage, changes: SimpleChanges, inputs: string[]) {
  inputs.forEach(input => {
    const isUpdated = changes.hasOwnProperty(input);
    if (isUpdated && !changes[input].isFirstChange()) {
      if (input === 'rawSrc') {
        // When the `rawSrc` input changes, we detect that only in the
        // `ngOnChanges` hook, thus the `rawSrc` is already set. We use
        // `rawSrc` in the error message, so we use a previous value, but
        // not the updated one in it.
        dir = {rawSrc: changes[input].previousValue} as NgOptimizedImage;
      }
      throw postInitInputChangeError(dir, input);
    }
  });
}

// Verifies that a specified input has a correct type (number).
function assertValidNumberInput(inputValue: unknown, inputName: string) {
  const isValid = typeof inputValue === 'number' ||
      (typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()));
  if (!isValid) {
    throw new RuntimeError(
        RuntimeErrorCode.INVALID_INPUT,
        `The NgOptimizedImage directive has detected that the \`${inputName}\` has an invalid ` +
            `value: expecting a number that represents the ${inputName} in pixels, but got: ` +
            `\`${inputValue}\`.`);
  }
}

// Verifies that a specified input is set.
function assertRequiredNumberInput(dir: NgOptimizedImage, inputValue: unknown, inputName: string) {
  if (typeof inputValue === 'undefined') {
    throw new RuntimeError(
        RuntimeErrorCode.REQUIRED_INPUT_MISSING,
        `${imgDirectiveDetails(dir.rawSrc)} has detected that the required \`${inputName}\` ` +
            `attribute is missing. Please specify the \`${inputName}\` attribute ` +
            `on the mentioned element.`);
  }
}

// Verifies that the `loading` attribute is set to a valid input &
// is not used on priority images.
function assertValidLoadingInput(dir: NgOptimizedImage) {
  if (dir.loading && dir.priority) {
    throw new RuntimeError(
        RuntimeErrorCode.INVALID_INPUT,
        `The NgOptimizedImage directive has detected that the \`loading\` attribute ` +
            `was used on an image that was marked "priority". Images marked "priority" ` +
            `are always eagerly loaded and this behavior cannot be overwritten by using ` +
            `the "loading" attribute.`);
  }
  const validInputs = ['auto', 'eager', 'lazy'];
  if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
    throw new RuntimeError(
        RuntimeErrorCode.INVALID_INPUT,
        `The NgOptimizedImage directive has detected that the \`loading\` attribute ` +
            `has an invalid value: expecting "lazy", "eager", or "auto" but got: ` +
            `\`${dir.loading}\`.`);
  }
}
