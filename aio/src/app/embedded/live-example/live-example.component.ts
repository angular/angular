/* tslint:disable component-selector */
import { Component, ElementRef, HostListener, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { CONTENT_URL_PREFIX } from 'app/documents/document.service';

import { boolFromValue, getAttrs, getAttrValue } from 'app/shared/attribute-utils';

const defaultPlnkrImg = 'plunker/placeholder.png';
const imageBase  = CONTENT_URL_PREFIX + 'images/';
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
*      [name="..."]      // name of the example directory
*      [plnkr="...""]    // name of the plunker file (becomes part of zip file name as well)
*      [embedded]        // embed the plunker in the doc page, else display in new browser tab (default)
*      [img="..."]       // image to display if embedded in doc page
*      [embedded-style]  // show plnkr in embedded style (default and on narrow screens)
*      [flat-style]      // show plnkr in flat (original) style
*      [noDownload]      // no downloadable zip option
*      [downloadOnly]    // just the zip
*      [title="..."]>    // text for live example link and tooltip
*        text            // higher precedence way to specify text for live example link and tooltip
*  </live-example>
* Example:
*   <p>Run <live-example>Try the live example</live-example></p>.
*   // ~/resources/live-examples/{page}/plnkr.html
*
*   <p>Run <live-example name="toh-pt1">this example</live-example></p>.
*   // ~/resources/live-examples/toh-pt1/plnkr.html
*
*   // Link to the default plunker in the toh-pt1 sample
*   // The title overrides default ("live example") with "Tour of Heroes - Part 1"
*   <p>Run <live-example name="toh-pt1" title="Tour of Heroes - Part 1"></live-example></p>.
*   // ~/resources/live-examples/toh-pt1/plnkr.html
*
*   <p>Run <live-example plnkr="minimal"></live-example></p>.
*   // ~/resources/live-examples/{page}/minimal.plnkr.html
*
*   // Embed the current page's default plunker
*   // Text within tag is "live example"
*   // No title (no tooltip)
*   <live-example embedded title=""></live-example>
*   // ~/resources/live-examples/{page}/eplnkr.html
*
*   // Links to a *new* browser tab as an embedded style plunker editor
*   <live-example embedded-style>this example</live-example>
*   // ~/resources/live-examples/{page}/eplnkr.html
*
*   // Links to a *new* browser tab in the flat (original editor) style plunker editor
*   <live-example flat-style>this example</live-example>
*   // ~/resources/live-examples/{page}/plnkr.html
*
*   // Displays within the document page as an embedded style plunker editor
*   <live-example name="toh-pt1" embedded plnkr="minimal" img="toh>Tour of Heroes - Part 1</live-example>
*   // ~/resources/live-examples/toh-pt1/minimal.eplnkr.html
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
  plnkr: string;
  plnkrName: string;
  plnkrImg: string;
  showEmbedded = false;
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
      exampleDir = location.path(false).match(/[^\/?\#]+(?=\/?(?:$|\#|\?))/)[0];
    }
    this.exampleDir = exampleDir.trim();
    this.zipName = exampleDir.indexOf('/') === -1 ? this.exampleDir : exampleDir.split('/')[0];
    this.plnkrName = attrs.plnkr ? attrs.plnkr.trim() + '.' : '';
    this.zip = `${zipBase}${exampleDir}/${this.plnkrName}${this.zipName}.zip`;

    this.enableDownload = !boolFromValue(getAttrValue(attrs, 'nodownload'));

    this.plnkrImg = imageBase + (attrs.img || defaultPlnkrImg);

    if (boolFromValue(getAttrValue(attrs, 'downloadonly'))) {
      this.mode = 'downloadOnly';
    }
  }

  calcPlnkrLink(width: number) {

    const attrs = this.attrs;
    const exampleDir = this.exampleDir;

    let plnkrStyle = 'eplnkr'; // embedded style by default
    this.mode = 'default';     // display in another browser tab by default

    this.isEmbedded = boolFromValue(attrs.embedded);

    if (this.isEmbedded) {
      this.mode = 'embedded'; // display embedded in the doc
    } else {
      // Not embedded in doc page; determine if is embedded- or flat-style in another browser tab.
      // Embedded style if on tiny screen (reg. plunker no good on narrow screen)
      // If wide enough, choose style based on style attributes
      if (width > this.narrowWidth) {
        // Make flat style with `flat-style` or `embedded-style="false`; support atty aliases
        const flatStyle = getAttrValue(attrs, ['flat-style', 'flatstyle']);
        const isFlatStyle = boolFromValue(flatStyle);

        const embeddedStyle = getAttrValue(attrs, ['embedded-style', 'embeddedstyle']);
        const isEmbeddedStyle = boolFromValue(embeddedStyle, !isFlatStyle);
        plnkrStyle = isEmbeddedStyle ? 'eplnkr' : 'plnkr';
      }
    }

    this.plnkr = `${liveExampleBase}${exampleDir}/${this.plnkrName}${plnkrStyle}.html`;
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
  onResize(width) {
    if (this.mode !== 'downloadOnly') {
      this.calcPlnkrLink(width);
    }
  }

  toggleEmbedded () { this.showEmbedded = !this.showEmbedded; }
}

///// EmbeddedPlunkerComponent ///
/**
 * Hides the <iframe> so we can test LiveExampleComponent without actually triggering
 * a call to plunker to load the iframe
 */
@Component({
  selector: 'aio-embedded-plunker',
  template: `<iframe #iframe frameborder="0" width="100%" height="100%"></iframe>`,
  styles: [ 'iframe { min-height: 400px; }']
})
export class EmbeddedPlunkerComponent implements AfterViewInit {
  @Input() src: string;

  @ViewChild('iframe') iframe: ElementRef;

  ngAfterViewInit() {
    // DEVELOPMENT TESTING ONLY
    // this.src = 'https://angular.io/resources/live-examples/quickstart/ts/eplnkr.html';

    if (this.iframe) {
      // security: the `src` is always authored by the documentation team
      // and is considered to be safe
      this.iframe.nativeElement.src = this.src;
    }
  }
}
