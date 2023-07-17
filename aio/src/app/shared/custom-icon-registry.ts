import { ErrorHandler, InjectionToken, Inject, Injectable, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { of } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { unwrapHtml } from 'safevalues';

/**
 * Use SVG_ICONS (and SvgIconInfo) as "multi" providers to provide the SVG source
 * code for the icons that you wish to have preloaded in the `CustomIconRegistry`
 * For compatibility with the MdIconComponent, please ensure that the SVG source has
 * the following attributes:
 *
 * * `xmlns="http://www.w3.org/2000/svg"`
 * * `focusable="false"` (the default)
 * * `height="100%"` (the default)
 * * `width="100%"` (the default)
 * * `preserveAspectRatio="xMidYMid meet"` (the default)
 *
 */
export const SVG_ICONS = new InjectionToken<Array<SvgIconInfo>>('SvgIcons');
export interface SvgIconInfo {
  namespace?: string;
  name: string;
  svgSource: TrustedHTML;
}

interface SvgIconMap {
  [namespace: string]: {
    [iconName: string]: SVGElement;
  };
}

const DEFAULT_NS = '$$default';

/**
 * A custom replacement for Angular Material's `MdIconRegistry`, which allows
 * us to provide preloaded icon SVG sources.
 */
@Injectable()
export class CustomIconRegistry extends MatIconRegistry {
  private cachedSvgElements: SvgIconMap = {[DEFAULT_NS]: {}};

  constructor(http: HttpClient, sanitizer: DomSanitizer, @Optional() @Inject(DOCUMENT) document: Document,
              errorHandler: ErrorHandler, @Inject(SVG_ICONS) private svgIcons: SvgIconInfo[]) {
    super(http, sanitizer, document, errorHandler);
  }

  override getNamedSvgIcon(iconName: string, namespace?: string) {
    const nsIconMap = this.cachedSvgElements[namespace || DEFAULT_NS];
    let preloadedElement: SVGElement | undefined = nsIconMap && nsIconMap[iconName];
    if (!preloadedElement) {
      preloadedElement = this.loadSvgElement(iconName, namespace);
    }

    return preloadedElement
        ? of(preloadedElement.cloneNode(true) as SVGElement)
        : super.getNamedSvgIcon(iconName, namespace);
  }

  private loadSvgElement(iconName: string, namespace?: string): SVGElement | undefined {
    const svgIcon = this.svgIcons.find(icon => namespace
      ? icon.name === iconName && icon.namespace === namespace
      : icon.name === iconName
    );

    if (!svgIcon) {
      return;
    }

    const ns = svgIcon.namespace || DEFAULT_NS;
    const nsIconMap = this.cachedSvgElements[ns] || (this.cachedSvgElements[ns] = {});

    // Creating a new `<div>` per icon is necessary for the SVGs to work correctly in IE11.
    const div = document.createElement('DIV');

    // SECURITY: the source for the SVG icons is provided in code by trusted developers
    div.innerHTML = unwrapHtml(svgIcon.svgSource) as string;

    const svgElement = div.querySelector('svg') as SVGElement;
    nsIconMap[svgIcon.name] = svgElement;

    return svgElement;
  }
}
