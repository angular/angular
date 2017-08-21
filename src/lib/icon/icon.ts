/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation,
  Attribute,
} from '@angular/core';
import {MdIconRegistry} from './icon-registry';
import {CanColor, mixinColor} from '../core/common-behaviors/color';
import {first} from '../core/rxjs/index';


// Boilerplate for applying mixins to MdIcon.
/** @docs-private */
export class MdIconBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdIconMixinBase = mixinColor(MdIconBase);


/**
 * Component to display an icon. It can be used in the following ways:
 *
 * - Specify the svgIcon input to load an SVG icon from a URL previously registered with the
 *   addSvgIcon, addSvgIconInNamespace, addSvgIconSet, or addSvgIconSetInNamespace methods of
 *   MdIconRegistry. If the svgIcon value contains a colon it is assumed to be in the format
 *   "[namespace]:[name]", if not the value will be the name of an icon in the default namespace.
 *   Examples:
 *     <md-icon svgIcon="left-arrow"></md-icon>
 *     <md-icon svgIcon="animals:cat"></md-icon>
 *
 * - Use a font ligature as an icon by putting the ligature text in the content of the <md-icon>
 *   component. By default the Material icons font is used as described at
 *   http://google.github.io/material-design-icons/#icon-font-for-the-web. You can specify an
 *   alternate font by setting the fontSet input to either the CSS class to apply to use the
 *   desired font, or to an alias previously registered with MdIconRegistry.registerFontClassAlias.
 *   Examples:
 *     <md-icon>home</md-icon>
 *     <md-icon fontSet="myfont">sun</md-icon>
 *
 * - Specify a font glyph to be included via CSS rules by setting the fontSet input to specify the
 *   font, and the fontIcon input to specify the icon. Typically the fontIcon will specify a
 *   CSS class which causes the glyph to be displayed via a :before selector, as in
 *   https://fortawesome.github.io/Font-Awesome/examples/
 *   Example:
 *     <md-icon fontSet="fa" fontIcon="alarm"></md-icon>
 */
@Component({
  moduleId: module.id,
  template: '<ng-content></ng-content>',
  selector: 'md-icon, mat-icon',
  styleUrls: ['icon.css'],
  inputs: ['color'],
  host: {
    'role': 'img',
    'class': 'mat-icon',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdIcon extends _MdIconMixinBase implements OnChanges, OnInit, CanColor {

  /** Name of the icon in the SVG icon set. */
  @Input() svgIcon: string;

  /** Font set that the icon is a part of. */
  @Input() fontSet: string;

  /** Name of an icon within a font set. */
  @Input() fontIcon: string;

  private _previousFontSetClass: string;
  private _previousFontIconClass: string;

  constructor(
      renderer: Renderer2,
      elementRef: ElementRef,
      private _mdIconRegistry: MdIconRegistry,
      @Attribute('aria-hidden') ariaHidden: string) {
    super(renderer, elementRef);

    // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
    // the right thing to do for the majority of icon use-cases.
    if (!ariaHidden) {
      renderer.setAttribute(elementRef.nativeElement, 'aria-hidden', 'true');
    }
  }

  /**
   * Splits an svgIcon binding value into its icon set and icon name components.
   * Returns a 2-element array of [(icon set), (icon name)].
   * The separator for the two fields is ':'. If there is no separator, an empty
   * string is returned for the icon set and the entire value is returned for
   * the icon name. If the argument is falsy, returns an array of two empty strings.
   * Throws an error if the name contains two or more ':' separators.
   * Examples:
   *   'social:cake' -> ['social', 'cake']
   *   'penguin' -> ['', 'penguin']
   *   null -> ['', '']
   *   'a:b:c' -> (throws Error)
   */
  private _splitIconName(iconName: string): [string, string] {
    if (!iconName) {
      return ['', ''];
    }
    const parts = iconName.split(':');
    switch (parts.length) {
      case 1: return ['', parts[0]]; // Use default namespace.
      case 2: return <[string, string]>parts;
      default: throw Error(`Invalid icon name: "${iconName}"`);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only update the inline SVG icon if the inputs changed, to avoid unnecessary DOM operations.
    if (changes.svgIcon) {
      if (this.svgIcon) {
        const [namespace, iconName] = this._splitIconName(this.svgIcon);

        first.call(this._mdIconRegistry.getNamedSvgIcon(iconName, namespace)).subscribe(
            svg => this._setSvgElement(svg),
            (err: Error) => console.log(`Error retrieving icon: ${err.message}`));
      } else {
        this._clearSvgElement();
      }
    }

    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
  }

  ngOnInit() {
    // Update font classes because ngOnChanges won't be called if none of the inputs are present,
    // e.g. <md-icon>arrow</md-icon>. In this case we need to add a CSS class for the default font.
    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
  }

  private _usingFontIcon(): boolean {
    return !this.svgIcon;
  }

  private _setSvgElement(svg: SVGElement) {
    this._clearSvgElement();
    this._renderer.appendChild(this._elementRef.nativeElement, svg);
  }

  private _clearSvgElement() {
    const layoutElement = this._elementRef.nativeElement;
    const childCount = layoutElement.childNodes.length;

    // Remove existing child nodes and add the new SVG element. Note that we can't
    // use innerHTML, because IE will throw if the element has a data binding.
    for (let i = 0; i < childCount; i++) {
      this._renderer.removeChild(layoutElement, layoutElement.childNodes[i]);
    }
  }

  private _updateFontIconClasses() {
    if (!this._usingFontIcon()) {
      return;
    }

    const elem = this._elementRef.nativeElement;
    const fontSetClass = this.fontSet ?
        this._mdIconRegistry.classNameForFontAlias(this.fontSet) :
        this._mdIconRegistry.getDefaultFontSetClass();

    if (fontSetClass != this._previousFontSetClass) {
      if (this._previousFontSetClass) {
        this._renderer.removeClass(elem, this._previousFontSetClass);
      }
      if (fontSetClass) {
        this._renderer.addClass(elem, fontSetClass);
      }
      this._previousFontSetClass = fontSetClass;
    }

    if (this.fontIcon != this._previousFontIconClass) {
      if (this._previousFontIconClass) {
        this._renderer.removeClass(elem, this._previousFontIconClass);
      }
      if (this.fontIcon) {
        this._renderer.addClass(elem, this.fontIcon);
      }
      this._previousFontIconClass = this.fontIcon;
    }
  }
}
