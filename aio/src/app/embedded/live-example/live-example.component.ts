/* tslint:disable component-selector */
import { Component, ElementRef, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

const defaultPlnkrImg = 'plunker/placeholder.png';
const imageBase  = 'assets/images/';
const liveExampleBase = 'content/live-examples/';
const zipBase = 'content/zips/';

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
*      [embedded]        // embed the plunker in the doc page, else display in new browser tab (external)
*      [img="..."]       // image to display if embedded in doc page
*      [embedded-style]  // show external plnkr in embedded style
*      [flat-style]      // show external plnkr in flat (original) style
*      [noDownload]      // no downloadable zip option
*      [title="..."]>    // text for live example link and tooltip
*        text            // higher precedence way to specify text for live example link and tooltip
*  </live-example>
* Example:
*   <p>Run <live-example>Try the live example</live-example></p>.
*   // ~/resources/live-examples/{page}/plnkr.html
*
*   <p>Run <live-example name="toh-1">this example</live-example></p>.
*   // ~/resources/live-examples/toh-1/plnkr.html
*
*   // Link to the default plunker in the toh-1 sample
*   // The title overrides default ("live example") with "Tour of Heroes - Part 1"
*   <p>Run <live-example name="toh-1" title="Tour of Heroes - Part 1"></live-example></p>.
*   // ~/resources/live-examples/toh-1/plnkr.html
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
*   <live-example name="toh-1" embedded plnkr="minimal" img="toh>Tour of Heroes - Part 1</live-example>
*   // ~/resources/live-examples/toh-1/minimal.eplnkr.html
*/
@Component({
  selector: 'live-example',
  templateUrl: 'live-example.component.html'
})
export class LiveExampleComponent implements OnInit {

  enableDownload = true;
  isEmbedded = false;
  plnkr: string;
  plnkrImg: string;
  showEmbedded = false;
  title: string;
  zip: string;

  constructor(private elementRef: ElementRef, location: Location ) {
    const attrs = this.getAttrs();

    let exampleDir = attrs.name;
    if (!exampleDir) {
      // take last segment, excluding hash fragment and query params
      exampleDir = location.path(false).match(/[^\/?\#]+(?=\/?(?:$|\#|\?))/)[0];
    }
    exampleDir = exampleDir.trim();

    let plnkrStyle = 'eplnkr';

    this.isEmbedded = boolFromAtty(attrs.embedded);
    if (!this.isEmbedded) {
      // Not embedded in doc page; determine if is embedded- or flat-style in another browser tab.
      // External plunker is embedded style by default.
      // Make flat style with `flat-style` or `embedded-style="false`
      // Must support aliases
      const flatStyle = getAttrValue(['flat-style', 'flatstyle', 'flatStyle']);
      const isFlatStyle = boolFromAtty(flatStyle);
      const embeddedStyle = getAttrValue(['embedded-style', 'embeddedstyle', 'embeddedStyle']);
      const isEmbeddedStyle = boolFromAtty(embeddedStyle, !isFlatStyle);

      plnkrStyle = isEmbeddedStyle ? 'eplnkr' : 'plnkr';
    }

    const plnkrName = attrs.plnkr ? attrs.plnkr.trim() + '.' : '';

    this.plnkr = `${liveExampleBase}${exampleDir}/${plnkrName}${plnkrStyle}.html`;
    this.zip = `${zipBase}${exampleDir}/${plnkrName}${exampleDir}.zip`;

    const noDownload = getAttrValue(['noDownload', 'nodownload']); // noDownload aliases
    this.enableDownload = !boolFromAtty(noDownload);
    this.plnkrImg = imageBase + (attrs.img || defaultPlnkrImg);

    this.title = attrs.title || '';

    function getAttrValue(atty: string | string[]) {
      return attrs[typeof atty === 'string' ? atty : atty.find(a => attrs[a] !== undefined)];
    }
  }

  getAttrs(): any {
    const attrs = this.elementRef.nativeElement.attributes;
    const attrMap = {};
    Object.keys(attrs).forEach(key => attrMap[attrs[key].name] = attrs[key].value);
    return attrMap;
  }

  ngOnInit() {
    // The `liveExampleContent` property is set by the DocViewer when it builds this component.
    // It is the original innerHTML of the host element.
    // Angular will sanitize this title when displayed so should be plain text.
    const title = this.elementRef.nativeElement.liveExampleContent;
    this.title = (title || this.title || 'live example').trim();
  }

  toggleEmbedded () { this.showEmbedded = !this.showEmbedded; }
}

function boolFromAtty(atty: string , def: boolean = false) {
  // tslint:disable-next-line:triple-equals
  return atty == undefined ? def :  atty.trim() !== 'false';
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
