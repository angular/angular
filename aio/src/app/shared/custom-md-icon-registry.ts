import { InjectionToken, Inject, Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { MdIconRegistry } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Use SVG_ICONS (and SvgIconInfo) as "multi" providers to provide the SVG source
 * code for the icons that you wish to have preloaded in the `CustomMdIconRegistry`
 * For compatibility with the MdIconComponent, please ensure that the SVG source has
 * the following attributes:
 *
 * * `xmlns="http://www.w3.org/2000/svg"`
 * * `focusable="false"` (disable IE11 default behavior to make SVGs focusable)
 * * `height="100%"` (the default)
 * * `width="100%"` (the default)
 * * `preserveAspectRatio="xMidYMid meet"` (the default)
 *
 */
export const SVG_ICONS = new InjectionToken<Array<SvgIconInfo>>('SvgIcons');
export interface SvgIconInfo {
  name: string;
  svgSource: string;
}

interface SvgIconMap {
  [iconName: string]: SVGElement;
}

// <hack-alert>
// @angular/material's `MdIconRegitry` currently (v2.0.0-beta.8) requires an instance of `Http`
// (from @angular/http). It is only used to [get some text content][1], so we can create a wrapper
// around `HttpClient` and pretend it is `Http`.
// [1]: https://github.com/angular/material2/blob/2.0.0-beta.8/src/lib/icon/icon-registry.ts#L465-L466
// </hack-alert>
function createFakeHttp(http: HttpClient): any {
  return {
    get: (url: string) => http.get(url, {responseType: 'text'})
      .map(data => ({text: () => data}))
  };
}

/**
 * A custom replacement for Angular Material's `MdIconRegistry`, which allows
 * us to provide preloaded icon SVG sources.
 */
@Injectable()
export class CustomMdIconRegistry extends MdIconRegistry {
  private preloadedSvgElements: SvgIconMap = {};

  constructor(http: HttpClient, sanitizer: DomSanitizer, @Inject(SVG_ICONS) svgIcons: SvgIconInfo[]) {
    super(createFakeHttp(http), sanitizer);
    this.loadSvgElements(svgIcons);
  }

  getNamedSvgIcon(iconName: string, namespace?: string) {
    if (this.preloadedSvgElements[iconName]) {
      return of(this.preloadedSvgElements[iconName].cloneNode(true) as SVGElement);
    }
    return super.getNamedSvgIcon(iconName, namespace);
  }

  private loadSvgElements(svgIcons: SvgIconInfo[]) {
    const div = document.createElement('DIV');
    svgIcons.forEach(icon => {
      // SECURITY: the source for the SVG icons is provided in code by trusted developers
      div.innerHTML = icon.svgSource;
      this.preloadedSvgElements[icon.name] = div.querySelector('svg');
    });
  }
}
