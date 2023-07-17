import { HttpClient } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { unwrapHtml, concatHtmls } from 'safevalues';
import { CustomIconRegistry, SvgIconInfo } from './custom-icon-registry';
import { svg } from './security';

describe('CustomIconRegistry', () => {
  const fakeHttpClient: HttpClient = {} as any;
  const fakeDomSanitizer: DomSanitizer = {} as any;
  const fakeDocument: Document = {} as any;
  const fakeErrorHandler: ErrorHandler = {handleError: err => console.error(err)};

  it('should get the SVG element for a preloaded icon from the cache', () => {
    const svgSrc = concatHtmls([
        svg`<svg xmlns="http://www.w3.org/2000/svg" focusable="false" `,
        svg`viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/></svg>`]);
    const svgIcons: SvgIconInfo[] = [
      { name: 'test_icon', svgSource: svgSrc }
    ];

    const registry = new CustomIconRegistry(
        fakeHttpClient, fakeDomSanitizer, fakeDocument, fakeErrorHandler, svgIcons);
    let svgElement: SVGElement|undefined;
    registry.getNamedSvgIcon('test_icon').subscribe(el => svgElement = el);

    expect(svgElement).toEqual(createSvg(svgSrc));
  });

  it('should support caching icons with a namespace', () => {
    const svgSrc1 = svg`<svg xmlns="http://www.w3.org/2000/svg"><path d="h100" /></svg>`;
    const svgSrc2 = svg`<svg xmlns="http://www.w3.org/2000/svg"><path d="h200" /></svg>`;
    const svgSrc3 = svg`<svg xmlns="http://www.w3.org/2000/svg"><path d="h300" /></svg>`;
    const svgIcons: SvgIconInfo[] = [
      { name: 'test_icon', svgSource: svgSrc1 },
      { namespace: 'foo', name: 'test_icon', svgSource: svgSrc2 },
      { namespace: 'bar', name: 'test_icon', svgSource: svgSrc3 },
    ];

    const registry = new CustomIconRegistry(
        fakeHttpClient, fakeDomSanitizer, fakeDocument, fakeErrorHandler, svgIcons);
    let svgElement: SVGElement|undefined;
    registry.getNamedSvgIcon('test_icon', 'foo').subscribe(el => svgElement = el);

    expect(svgElement).toEqual(createSvg(svgSrc2));
  });

  it('should call through to the MdIconRegistry if the icon name is not in the preloaded cache', () => {
    const svgSrc = concatHtmls([
        svg`<svg xmlns="http://www.w3.org/2000/svg" focusable="false" `,
        svg`viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/></svg>`]);
    const svgIcons: SvgIconInfo[] = [
      { name: 'test_icon', svgSource: svgSrc }
    ];
    spyOn(MatIconRegistry.prototype, 'getNamedSvgIcon');

    const registry = new CustomIconRegistry(
        fakeHttpClient, fakeDomSanitizer, fakeDocument, fakeErrorHandler, svgIcons);

    registry.getNamedSvgIcon('other_icon');
    expect(MatIconRegistry.prototype.getNamedSvgIcon).toHaveBeenCalledWith('other_icon', undefined);

    registry.getNamedSvgIcon('other_icon', 'foo');
    expect(MatIconRegistry.prototype.getNamedSvgIcon).toHaveBeenCalledWith('other_icon', 'foo');
  });
});

function createSvg(svgSrc: TrustedHTML): SVGElement {
  const div = document.createElement('div');
  div.innerHTML = unwrapHtml(svgSrc) as string;
  return div.querySelector('svg') as SVGElement;
}
