import * as crypto from 'crypto';

export interface SwPluginConfig {
  manifestFile?: string;
  manifestKey?: string;
  baseHref?: string;
}

/**
 * Webpack plugin that generates a basic Angular service worker manifest.
 */
export class AngularServiceWorkerPlugin {
  public manifestFile: string;
  public manifestKey: string;
  public baseHref: string;

  constructor(config?: SwPluginConfig) {
    this.manifestFile = (config && config.manifestFile) || 'ngsw-manifest.json';
    this.manifestKey = (config && config.manifestKey) || 'static';
    this.baseHref = (config && config.baseHref) || '/';
    if (!this.baseHref.endsWith('/')) {
      this.baseHref += '/';
    }
  }

  apply(compiler: any) {
    // Determine the URL prefix under which all files will be served.
    compiler.plugin('emit', (compilation: any, callback: Function) => {
      // Manifest into which assets to be fetched will be recorded. This will either
      // be read from the existing template or created fresh.
      let manifest: any = {};

      // Look for an existing manifest. If there is one, parse it.
      try {
        if (compilation.assets.hasOwnProperty(this.manifestFile)) {
          manifest = JSON.parse(compilation.assets[this.manifestFile].source().toString());
        }
      } catch (err) {
        throw new Error(`Error reading existing service worker manifest: ${err}`);
      }

      // Throw if the manifest already has this particular key.
      if (manifest.hasOwnProperty(this.manifestKey) &&
          !manifest[this.manifestKey].hasOwnProperty('_generatedFromWebpack')) {
        throw new Error(`Manifest already contains key: ${this.manifestKey}`);
      }

      // Look for ignored patterns in the manifest.
      let ignored: RegExp[] = [];
      const ignoreKey = `${this.manifestKey}.ignore`;
      if (manifest.hasOwnProperty(ignoreKey)) {
        ignored.push(...(manifest[ignoreKey] as string[]).map(regex => new RegExp(regex)));
        delete manifest[ignoreKey];
      }

      // Map of urls to hashes.
      let urls: {[url: string]: string} = {};
      manifest[this.manifestKey] = {urls, _generatedFromWebpack: true};
      // Go through every asset in the compilation and include it in the manifest,
      // computing a hash for proper versioning.
      Object.keys(compilation.assets).filter(key => key !== this.manifestFile).forEach(key => {
        let url = `${this.baseHref}${key}`;
        if (ignored.some(regex => regex.test(url))) {
          return;
        }
        urls[url] = sha1(compilation.assets[key].source());
      });

      // Serialize the manifest to a buffer, and include (or overwrite) it in the assets.
      let serialized = new Buffer(JSON.stringify(manifest, null, 2));
      compilation.assets[this.manifestFile] = {
        source: () => serialized,
        size: () => serialized.length,
      };

      callback();
    });
  }
}

function sha1(buffer: any): string {
  let hash = crypto.createHash('sha1');
  hash.update(buffer);
  return hash.digest('hex');
}
