/* tslint:disable component-selector */
import { Component, ElementRef, HostListener, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';

import { boolFromValue, getAttrs, getAttrValue } from 'app/shared/attribute-utils';

const liveExampleBase = CONTENT_URL_PREFIX + 'live-examples/';
const zipBase = CONTENT_URL_PREFIX + 'zips/';

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
export class LiveExampleComponent implements OnInit {

  // Will force to embedded-style when viewport width is narrow
  // "narrow" value was picked based on phone dimensions from http://screensiz.es/phone
  readonly narrowWidth = 1000;

  attrs: any;
  enableDownload = true;
  exampleDir: string;
  isEmbedded = false;
  mode = 'disabled';
  stackblitz: string;
  stackblitzName: string;
  title: string;
  zip: string;
  zipName: string;

  constructor(
    private elementRef: ElementRef,
    location: Location ) {

    const attrs = this.attrs = getAttrs(this.elementRef);
    let exampleDir = attrs.name;
    if (!exampleDir) {
      // take last segment, excluding hash fragment and query params
      exampleDir = (location.path(false).match(/[^\/?\#]+(?=\/?(?:$|\#|\?))/) || [])[0];
    }
    this.exampleDir = exampleDir.trim();
    this.zipName = exampleDir.indexOf('/') === -1 ? this.exampleDir : exampleDir.split('/')[0];
    this.stackblitzName = attrs.stackblitz ? attrs.stackblitz.trim() + '.' : '';
    this.zip = `${zipBase}${exampleDir}/${this.stackblitzName}${this.zipName}.zip`;

    this.enableDownload = !boolFromValue(getAttrValue(attrs, 'nodownload'));

    if (boolFromValue(getAttrValue(attrs, 'downloadonly'))) {
      this.mode = 'downloadOnly';
    }
  }

  calcStackblitzLink(width: number) {

    const attrs = this.attrs;
    const exampleDir = this.exampleDir;
    let urlQuery = '';

    this.mode = 'default';     // display in another browser tab by default

    this.isEmbedded = boolFromValue(attrs.embedded);

    if (this.isEmbedded) {
      this.mode = 'embedded'; // display embedded in the doc
      urlQuery = '?ctl=1';
    }

    this.stackblitz = `${liveExampleBase}${exampleDir}/${this.stackblitzName}stackblitz.html${urlQuery}`;
  }

  ngOnInit() {
    // The `liveExampleContent` property is set by the DocViewer when it builds this component.
    // It is the original innerHTML of the host element.
    // Angular will sanitize this title when displayed so should be plain text.
    const title = this.elementRef.nativeElement.liveExampleContent;
    this.title = (title || this.attrs.title || 'live example').trim();
    this.onResize(window.innerWidth);
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    if (this.mode !== 'downloadOnly') {
      this.calcStackblitzLink(width);
    }
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
  styles: [ 'iframe { min-height: 400px; }']
})
export class EmbeddedStackblitzComponent implements AfterViewInit {
  @Input() src: string;

  @ViewChild('iframe') iframe: ElementRef;

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
