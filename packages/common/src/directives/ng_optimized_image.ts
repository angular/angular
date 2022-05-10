/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, InjectionToken, Input, NgModule, OnInit, Renderer2, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

/**
 * Config options recognized by the image loader function.
 */
export interface ImageLoaderConfig {
  src: string;
  quality?: number;
  width?: number;
}

/**
 * Represents an image loader function.
 */
export type ImageLoader = (config: ImageLoaderConfig) => string;

/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 */
const noopImageLoader = (config: ImageLoaderConfig) => config.src;

/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;

/**
 * Special token that allows to configure a function that will be used to produce an image URL based
 * on the specified input.
 */
export const IMAGE_LOADER = new InjectionToken<ImageLoader>('ImageLoader', {
  providedIn: 'root',
  factory: () => noopImageLoader,
});

/**
 * ** EXPERIMENTAL **
 *
 * TODO: add Image directive description.
 *
 * IMPORTANT: this directive should become standalone (i.e. not attached to any NgModule) once
 * the `standalone` flag is implemented and available as a public API.
 *
 * @usageNotes
 * TODO: add Image directive usage notes.
 */
@Directive({selector: 'img[rawSrc]'})
export class NgOptimizedImage implements OnInit {
  constructor(
      @Inject(IMAGE_LOADER) private imageLoader: ImageLoader, private renderer: Renderer2,
      private imgElement: ElementRef) {}

  // Private fields to keep normalized input values.
  private _width?: number;
  private _height?: number;
  private _priority?: boolean;

  /**
   * Name of the source image.
   * Image name will be processed by the image loader and the final URL will be applied as the `src`
   * property of the image.
   */
  @Input() rawSrc!: string;

  /**
   * The intrinsic width of the image in px.
   * This input is required unless the 'fill-parent' is provided.
   */
  @Input()
  set width(value: string|number|undefined) {
    this._width = inputToInteger(value);
  }
  get width(): number|undefined {
    return this._width;
  }

  /**
   * The intrinsic height of the image in px.
   * This input is required unless the 'fill-parent' is provided.
   */
  @Input()
  set height(value: string|number|undefined) {
    this._height = inputToInteger(value);
  }
  get height(): number|undefined {
    return this._height;
  }

  @Input()
  set priority(value: string|boolean|undefined) {
    this._priority = inputToBoolean(value);
  }
  get priority(): boolean|undefined {
    return this._priority;
  }

  /**
   * Get a value of the `src` if it's set on a host <img> element.
   * This input is needed to verify that there are no `src` and `rawSrc` provided
   * at the same time (thus causing an ambiguity on which src to use).
   */
  @Input() src?: string;

  ngOnInit() {
    if (ngDevMode) {
      assertExistingSrc(this);
      assertNotBase64Image(this);
      assertNotBlobURL(this);
    }
    this.setHostAttribute('loading', this.getLoadingBehavior());
    this.setHostAttribute('fetchpriority', this.getFetchPriority());
    // The `src` attribute should be set last since other attributes
    // could affect the image's loading behavior.
    this.setHostAttribute('src', this.getRewrittenSrc());
  }

  getLoadingBehavior(): string {
    return this.priority ? 'eager' : 'lazy';
  }

  getFetchPriority(): string {
    return this.priority ? 'high' : 'auto';
  }

  getRewrittenSrc(): string {
    const imgConfig = {
      src: this.rawSrc,
      // TODO: if we're going to support responsive serving, we don't want to request the width
      // based solely on the intrinsic width (e.g. if it's on mobile and the viewport is smaller).
      // The width would require pre-processing before passing to the image loader function.
      width: this.width,
    };
    return this.imageLoader(imgConfig);
  }

  private setHostAttribute(name: string, value: string): void {
    this.renderer.setAttribute(this.imgElement.nativeElement, name, value);
  }
}

/**
 * Temporary NgModule that exports the NgOptimizedImage directive.
 * The module should not be needed once the `standalone` flag is supported as a public API.
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

function inputToBoolean(value: unknown): boolean {
  return value != null && `${value}` !== 'false';
}

function imgDirectiveDetails(dir: NgOptimizedImage) {
  return `The NgOptimizedImage directive (activated on an <img> element ` +
      `with the \`rawSrc="${dir.rawSrc}"\`)`;
}

/***** Assert functions *****/

// Verifies that there is no `src` set on a host element.
function assertExistingSrc(dir: NgOptimizedImage) {
  if (dir.src) {
    throw new RuntimeError(
        RuntimeErrorCode.UNEXPECTED_SRC_ATTR,
        `${imgDirectiveDetails(dir)} detected that the \`src\` is also set (to \`${dir.src}\`). ` +
            `Please remove the \`src\` attribute from this image. The NgOptimizedImage directive will use ` +
            `the \`rawSrc\` to compute the final image URL and set the \`src\` itself.`);
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
        `The NgOptimizedImage directive detected that the \`rawSrc\` was set ` +
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
        `The NgOptimizedImage directive detected that the \`rawSrc\` was set ` +
            `to a blob URL (${rawSrc}). Blob URLs are not supported by the ` +
            `NgOptimizedImage directive. Use a regular \`src\` attribute ` +
            `(instead of \`rawSrc\`) to disable the NgOptimizedImage directive ` +
            `for this element.`);
  }
}
