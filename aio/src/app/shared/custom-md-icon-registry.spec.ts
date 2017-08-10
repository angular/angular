import { MdIconRegistry } from '@angular/material';
import { CustomMdIconRegistry, SVG_ICONS, SvgIconInfo } from './custom-md-icon-registry';

describe('CustomMdIconRegistry', () => {
  it('should get the SVG element for a preloaded icon from the cache', () => {
    const mockHttp: any = {};
    const mockSanitizer: any = {};
    const svgSrc = '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" ' +
                 'viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/></svg>';
    const svgIcons: SvgIconInfo[] = [
      { name: 'test_icon', svgSource: svgSrc }
    ];
    const registry = new CustomMdIconRegistry(mockHttp, mockSanitizer, svgIcons);
    let svgElement: SVGElement;
    registry.getNamedSvgIcon('test_icon', null).subscribe(el => svgElement = el as SVGElement);
    expect(svgElement).toEqual(createSvg(svgSrc));
  });

  it('should call through to the MdIconRegistry if the icon name is not in the preloaded cache', () => {
    const mockHttp: any = {};
    const mockSanitizer: any = {};
    const svgSrc = '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" ' +
                 'viewBox="0 0 24 24"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/></svg>';
    const svgIcons: SvgIconInfo[] = [
      { name: 'test_icon', svgSource: svgSrc }
    ];
    spyOn(MdIconRegistry.prototype, 'getNamedSvgIcon');

    const registry = new CustomMdIconRegistry(mockHttp, mockSanitizer, svgIcons);
    registry.getNamedSvgIcon('other_icon', null);
    expect(MdIconRegistry.prototype.getNamedSvgIcon).toHaveBeenCalledWith('other_icon', null);
  });
});

function createSvg(svgSrc) {
  const div = document.createElement('div');
  div.innerHTML = svgSrc;
  return div.querySelector('svg');
}
