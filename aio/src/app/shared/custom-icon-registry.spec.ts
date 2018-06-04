import { MatIconRegistry } from '@angular/material';
import { CustomIconRegistry, SvgIconInfo } from './custom-icon-registry';

describe('CustomIconRegistry', () => {
  it('should get the SVG element for a preloaded icon from the cache', () => {
    const mockHttp: any = {};
    const mockSanitizer: any = {};
    const mockDocument: any = {};
    const svgSrc = '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" ' +
                 'viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/></svg>';
    const svgIcons: SvgIconInfo[] = [
      { name: 'test_icon', svgSource: svgSrc }
    ];
    const registry = new CustomIconRegistry(mockHttp, mockSanitizer, mockDocument, svgIcons);
    let svgElement: SVGElement|undefined;
    registry.getNamedSvgIcon('test_icon').subscribe(el => svgElement = el);
    expect(svgElement).toEqual(createSvg(svgSrc));
  });

  it('should call through to the MdIconRegistry if the icon name is not in the preloaded cache', () => {
    const mockHttp: any = {};
    const mockSanitizer: any = {};
    const mockDocument: any = {};
    const svgSrc = '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" ' +
                 'viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/></svg>';
    const svgIcons: SvgIconInfo[] = [
      { name: 'test_icon', svgSource: svgSrc }
    ];
    spyOn(MatIconRegistry.prototype, 'getNamedSvgIcon');

    const registry = new CustomIconRegistry(mockHttp, mockSanitizer, mockDocument, svgIcons);

    registry.getNamedSvgIcon('other_icon');
    expect(MatIconRegistry.prototype.getNamedSvgIcon).toHaveBeenCalledWith('other_icon', undefined);

    registry.getNamedSvgIcon('other_icon', 'foo');
    expect(MatIconRegistry.prototype.getNamedSvgIcon).toHaveBeenCalledWith('other_icon', 'foo');
  });
});

function createSvg(svgSrc: string): SVGElement {
  const div = document.createElement('div');
  div.innerHTML = svgSrc;
  return div.querySelector('svg')!;
}
