/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, InjectionToken, Input, SimpleChanges, ɵRuntimeError as RuntimeError} from '@angular/core';

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
@Directive({
  selector: 'img[raw-src]',
  host: {
    '[src]': 'getRewrittenSrc()',
  },
})
export class NgImage {
  constructor(@Inject(IMAGE_LOADER) private imageLoader: ImageLoader) {}

  // Private fields to keep normalized input values.
  private _width?: number;
  private _height?: number;

  /**
   * Name of the source image.
   * Image name will be processed by the image loader and the final URL will be applied as the `src`
   * property of the image.
   */
  @Input('raw-src') rawSrc!: string;

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

  /**
   * Function that takes the name of the image, its width, and a quality %,
   * then turns it into a valid image CDN URL.
   */
  @Input() loader?: (config: ImageLoaderConfig) => string;

  /**
   * Get a value of the `src` if it's set on a host <img> element.
   * This input is needed to verify that there are no `src` and `raw-src` provided
   * at the same time (thus causing an ambiguity on which src to use).
   */
  @Input() src?: string;

  ngOnInit() {
    if (ngDevMode) {
      assertExistingSrc(this);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // TODO: react to input changes.
  }

  getRewrittenSrc(): string {
    // If a loader is provided as an input - use it, otherwise fall back
    // to the loader configured globally using the `IMAGE_LOADER` token.
    const imgLoader = this.loader ?? this.imageLoader;
    const imgConfig = {
      src: this.rawSrc,
      // TODO: if we're going to support responsive serving, we don't want to request the width
      // based solely on the intrinsic width (e.g. if it's on mobile and the viewport is smaller).
      // The width would require pre-processing before passing to the image loader function.
      width: this.width,
    };
    return imgLoader(imgConfig);
  }
}

/***** Helpers *****/

// Convert input value to integer.
function inputToInteger(value: string|number|undefined): number|undefined {
  return typeof value === 'string' ? parseInt(value, 10) : value;
}

function imgDirectiveDetails(dir: NgImage) {
  return `The NgImage directive (activated on an <img> element ` +
      `with the \`raw-src="${dir.rawSrc}"\`)`;
}

/***** Assert functions *****/

// Verifies that there is no `src` set on a host element.
function assertExistingSrc(dir: NgImage) {
  if (dir.src) {
    throw new RuntimeError(
        RuntimeErrorCode.UNEXPECTED_SRC_ATTR,
        `${imgDirectiveDetails(dir)} detected that the \`src\` is also set (to \`${dir.src}\`). ` +
            `Please remove the \`src\` attribute from this image. The NgImage directive will use ` +
            `the \`raw-src\` to compute the final image URL and set the \`src\` itself.`);
  }
}
