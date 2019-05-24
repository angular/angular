/* tslint:disable component-selector */
import { AfterContentInit, AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';
import { AttrMap, boolFromValue, getAttrs, getAttrValue } from 'app/shared/attribute-utils';


const LIVE_EXAMPLE_BASE = CONTENT_URL_PREFIX + 'live-examples/';
const ZIP_BASE = CONTENT_URL_PREFIX + 'zips/';

/**
 * Angular.io Live Example Embedded Component
 *
 * Renders a link to a live/host example of the doc page.
 *
 * All attributes and the text content are optional
 *
 * Usage:
 *   <live-example
 *      [name="..."]        // name of the example directory
 *      [stackblitz="...""] // name of the stackblitz file (becomes part of zip file name as well)
 *      [embedded]          // embed the stackblitz in the doc page, else display in new browser tab (default)
 *      [noDownload]        // no downloadable zip option
 *      [downloadOnly]      // just the zip
 *      [title="..."]>      // text for live example link and tooltip
 *        text              // higher precedence way to specify text for live example link and tooltip
 *  </live-example>
 * Example:
 *   <p>Run <live-example>Try the live example</live-example></p>.
 *   // ~/resources/live-examples/{page}/stackblitz.json
 *
 *   <p>Run <live-example name="toh-pt1">this example</live-example></p>.
 *   // ~/resources/live-examples/toh-pt1/stackblitz.json
 *
 *   // Link to the default stackblitz in the toh-pt1 sample
 *   // The title overrides default ("live example") with "Tour of Heroes - Part 1"
 *   <p>Run <live-example name="toh-pt1" title="Tour of Heroes - Part 1"></live-example></p>.
 *   // ~/resources/live-examples/toh-pt1/stackblitz.json
 *
 *   <p>Run <live-example stackblitz="minimal"></live-example></p>.
 *   // ~/resources/live-examples/{page}/minimal.stackblitz.json
 *
 *   // Embed the current page's default stackblitz
 *   // Text within tag is "live example"
 *   // No title (no tooltip)
 *   <live-example embedded title=""></live-example>
 *   // ~/resources/live-examples/{page}/stackblitz.json
 *
 *   // Displays within the document page as an embedded style stackblitz editor
 *   <live-example name="toh-pt1" embedded stackblitz="minimal">Tour of Heroes - Part 1</live-example>
 *   // ~/resources/live-examples/toh-pt1/minimal.stackblitz.json
 */
@Component({
  selector: 'live-example',
  templateUrl: 'live-example.component.html'
})
export class LiveExampleComponent implements AfterContentInit {

  readonly mode: 'default' | 'embedded' | 'downloadOnly';
  readonly enableDownload: boolean;
  readonly stackblitz: string;
  readonly zip: string;
  title: string;

  @ViewChild('content', { static: true })
  private content: ElementRef;

  constructor(elementRef: ElementRef, location: Location) {
    const attrs = getAttrs(elementRef);
    const exampleDir = this.getExampleDir(attrs, location.path(false));
    const stackblitzName = this.getStackblitzName(attrs);

    this.mode = this.getMode(attrs);
    this.enableDownload = this.getEnableDownload(attrs);
    this.stackblitz = this.getStackblitz(exampleDir, stackblitzName, this.mode === 'embedded');
    this.zip = this.getZip(exampleDir, stackblitzName);
    this.title = this.getTitle(attrs);
  }

  ngAfterContentInit() {
    // Angular will sanitize this title when displayed, so it should be plain text.
    const textContent = this.content.nativeElement.textContent.trim();
    if (textContent) {
      this.title = textContent;
    }
  }

  private getEnableDownload(attrs: AttrMap) {
    const downloadDisabled = boolFromValue(getAttrValue(attrs, 'noDownload'));
    return !downloadDisabled;
  }

  private getExampleDir(attrs: AttrMap, path: string) {
    let exampleDir = getAttrValue(attrs, 'name');
    if (!exampleDir) {
      // Take the last path segment, excluding query params and hash fragment.
      const match = path.match(/[^/?#]+(?=\/?(?:\?|#|$))/);
      exampleDir = match ? match[0] : 'index';
    }
    return exampleDir.trim();
  }

  private getMode(this: LiveExampleComponent, attrs: AttrMap): typeof this.mode {
    const downloadOnly = boolFromValue(getAttrValue(attrs, 'downloadOnly'));
    const isEmbedded = boolFromValue(getAttrValue(attrs, 'embedded'));

    return downloadOnly ? 'downloadOnly'
           : isEmbedded ? 'embedded' :
                          'default';
  }

  private getStackblitz(exampleDir: string, stackblitzName: string, isEmbedded: boolean) {
    const urlQuery = isEmbedded ? '?ctl=1' : '';
    return `${LIVE_EXAMPLE_BASE}${exampleDir}/${stackblitzName}stackblitz.html${urlQuery}`;
  }

  private getStackblitzName(attrs: AttrMap) {
    const attrValue = (getAttrValue(attrs, 'stackblitz') || '').trim();
    return attrValue && `${attrValue}.`;
  }

  private getTitle(attrs: AttrMap) {
    return (getAttrValue(attrs, 'title') || 'live example').trim();
  }

  private getZip(exampleDir: string, stackblitzName: string) {
    const zipName = exampleDir.split('/')[0];
    return `${ZIP_BASE}${exampleDir}/${stackblitzName}${zipName}.zip`;
  }
}

///// EmbeddedStackblitzComponent ///
/**
 * Hides the <iframe> so we can test LiveExampleComponent without actually triggering
 * a call to stackblitz to load the iframe
 */
@Component({
  selector: 'aio-embedded-stackblitz',
  template: `<iframe #iframe frameborder="0" width="100%" height="100%"></iframe>`,
  styles: [ 'iframe { min-height: 400px; }' ]
})
export class EmbeddedStackblitzComponent implements AfterViewInit {
  @Input() src: string;

  @ViewChild('iframe', { static: true }) iframe: ElementRef;

  ngAfterViewInit() {
    // DEVELOPMENT TESTING ONLY
    // this.src = 'https://angular.io/resources/live-examples/quickstart/ts/stackblitz.json';

    if (this.iframe) {
      // security: the `src` is always authored by the documentation team
      // and is considered to be safe
      this.iframe.nativeElement.src = this.src;
    }
  }
}
