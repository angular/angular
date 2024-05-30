import {createImageLoader, ImageLoaderConfig, ImageLoaderInfo} from './image_loader';
import {build_IE_url} from '@imageengine/imageengine-helpers';
import {IEDirectives, IEFormat, IEFit} from '@imageengine/imageengine-helpers';

/**
 * Extending the ImageLoaderConfig to include additional properties for ImageEngine.
 */
export interface ExtendedImageLoaderConfig extends ImageLoaderConfig {
  width?: number; // the intrinsic width of the final image
  height?: number; // the intrinsic height of the final image

  auto_width_fallback?: number; // if WURFL device detection should be tried with a
  // fallback value in case it fails
  autoWidthWithFallback?: number; // backward compatible key

  scale_to_screen_width?: number; // 0-100 float
  scaleToScreenWidth?: number; // backward compatible key

  crop?: [number, number, number, number]; // [width, height, left, top]

  format?: IEFormat; // the output format
  outputFormat?: IEFormat;

  fit?: IEFit; // the image fit in relation to the provided width/height
  fitMethod?: IEFit; // backward compatible key

  compression?: number; // 0-100
  sharpness?: number; // 0-100
  rotate?: number; // -360-360

  inline?: true; // convert image to dataURL
  keep_meta?: true; // keep EXIF image data
  keepMeta?: true; // backward compatible key
  no_optimization?: true; // don't apply IE optimizations
  noOptimization?: true; // backward compatible key
  force_download?: true;
  max_device_pixel_ratio?: number;
  maxDevicePixelRatio?: number;
}

/**
 * Name and URL tester for ImageEngine.
 */
export const imageEngineLoaderInfo: ImageLoaderInfo = {
  name: 'ImageEngine',
  testUrl: isImageEngineUrl,
};

const IMAGE_ENGINE_LOADER_REGEX = /https?\:\/\/[^\/]+\.cdn.imgeng.in\/.+/;

/**
 * Tests whether a URL is from ImageEngine CDN.
 */
function isImageEngineUrl(url: string): boolean {
  return IMAGE_ENGINE_LOADER_REGEX.test(url);
}

/**
 * Function that generates an ImageLoader for ImageEngine and turns it into an Angular provider.
 *
 * @param path Base URL of your ImageEngine images
 * This URL should match the following format:
 * https://yourdomain.cdn.imgeng.in
 * @returns Set of providers to configure the ImageEngine loader.
 *
 * @publicApi
 */
export const provideImageEngineLoader = createImageLoader(
  createImageEngineUrl,
  ngDevMode ? ['https://somepath.cdn.imgeng.in'] : undefined,
);

/**
 * Creates a URL for an image with ImageEngine directives applied.
 *
 * @param path Base URL of the ImageEngine images
 * @param config Configuration object containing source and directives
 * @returns Fully formed URL with ImageEngine directives
 */
export function createImageEngineUrl(path: string, config: ExtendedImageLoaderConfig): string {
  const directives: IEDirectives = {
    width: config.width,
    height: config.height,
    auto_width_fallback: config.auto_width_fallback,
    format: config.format,
    fit: config.fit,
    compression: config.compression,
    sharpness: config.sharpness,
    rotate: config.rotate,
    inline: config.inline,
    keep_meta: config.keep_meta,
    no_optimization: config.no_optimization,
    force_download: config.force_download,
    max_device_pixel_ratio: config.max_device_pixel_ratio,
  };

  return build_IE_url(`${path}/${config.src}`, directives);
}
