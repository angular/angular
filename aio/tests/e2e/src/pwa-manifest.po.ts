import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import { browser } from 'protractor';
import { SitePage } from './app.po';


export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/**
 * The shape of a PWA manifest.
 * For simplicity, we only define types for the properties we care about in tests.
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
export type PwaManifest = Json & {
  shortcuts?: PwaShortcutItem[],
};

/**
 * The shape of an item in a PWA manifest's `shortcuts` list.
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/shortcuts
 */
export type PwaShortcutItem = Json & {
  url: string,
  name: string,
  short_name?: string,
  description?: string,
  icons?: PwaImageResource[],
};

/**
 * The shape of an item in a PWA manifest's icons list (such as the value of the top-level `icons` property or that of
 * the `icons` property of a shortcut item).
 * @see https://w3c.github.io/manifest/#manifestimageresource-and-its-members
 */
export type PwaImageResource = Json & {
  src: string,
  sizes?: string,
  type?: string,
  purpose?: string,
};


export class PwaManifestPage extends SitePage {
  /** The base URL with the trailing `/` stripped off (if any). */
  baseUrl = browser.baseUrl.replace(/\/$/, '');

  /** The URL to the app's PWA manifest. */
  pwaManifestUrl = `${this.baseUrl}/pwa-manifest.json`;

  private pwaManifestText: string | null = null;

  /** Get the app's PWA manifest as an object. */
  async getPwaManifest(): Promise<PwaManifest> {
    if (this.pwaManifestText === null) {
      const get = /^https:/.test(this.pwaManifestUrl) ? httpsGet : httpGet;

      this.pwaManifestText = await new Promise<string>((resolve, reject) => {
        let responseText = '';
        get(this.pwaManifestUrl, res => res
            .on('data', chunk => responseText += chunk)
            .on('end', () => resolve(responseText))
            .on('error', reject));
      });
    }

    return JSON.parse(this.pwaManifestText);
  }

  /** Get a list of PWA shortcuts as extracted from the app's PWA manifest. */
  async getPwaShortcuts(): Promise<PwaShortcutItem[]> {
    const {shortcuts = []} = await this.getPwaManifest();
    return shortcuts;
  }
}
