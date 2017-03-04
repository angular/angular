import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer,
  SimpleChange,
  ViewEncapsulation,
  AfterViewChecked,
  Optional,
  SkipSelf,
} from '@angular/core';
import {Http} from '@angular/http';
import {DomSanitizer} from '@angular/platform-browser';
import {MdError} from '../core';
import {MdIconRegistry, MdIconNameNotFoundError} from './icon-registry';

/** Exception thrown when an invalid icon name is passed to an md-icon component. */
export class MdIconInvalidNameError extends MdError {
  constructor(iconName: string) {
      super(`Invalid icon name: "${iconName}"`);
  }
}

/**
 * Component to display an icon. It can be used in the following ways:
 * - Specify the svgSrc input to load an SVG icon from a URL. The SVG content is directly inlined
 *   as a child of the <md-icon> component, so that CSS styles can easily be applied to it.
 *   The URL is loaded via an XMLHttpRequest, so it must be on the same domain as the page or its
 *   server must be configured to allow cross-domain requests.
 *   Example:
 *     <md-icon svgSrc="assets/arrow.svg"></md-icon>
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
  host: {
    'role': 'img',
    '[class.mat-icon]': 'true',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdIcon implements OnChanges, OnInit, AfterViewChecked {
  private _color: string;

  /** Name of the icon in the SVG icon set. */
  @Input() svgIcon: string;

  /** Font set that the icon is a part of. */
  @Input() fontSet: string;

  /** Name of an icon within a font set. */
  @Input() fontIcon: string;

  /** Alt label to be used for accessibility. */
  @Input() alt: string;

  /** Screenreader label for the icon. */
  @Input('aria-label') hostAriaLabel: string = '';

  /** Color of the icon. */
  @Input()
  get color(): string { return this._color; }
  set color(value: string) { this._updateColor(value); }

  private _previousFontSetClass: string;
  private _previousFontIconClass: string;
  private _previousAriaLabel: string;

  constructor(
      private _elementRef: ElementRef,
      private _renderer: Renderer,
      private _mdIconRegistry: MdIconRegistry) { }

  _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this._renderer.setElementClass(this._elementRef.nativeElement, `mat-${color}`, isAdd);
    }
  }

  /**
   * Splits an svgIcon binding value into its icon set and icon name components.
   * Returns a 2-element array of [(icon set), (icon name)].
   * The separator for the two fields is ':'. If there is no separator, an empty
   * string is returned for the icon set and the entire value is returned for
   * the icon name. If the argument is falsy, returns an array of two empty strings.
   * Throws a MdIconInvalidNameError if the name contains two or more ':' separators.
   * Examples:
   *   'social:cake' -> ['social', 'cake']
   *   'penguin' -> ['', 'penguin']
   *   null -> ['', '']
   *   'a:b:c' -> (throws MdIconInvalidNameError)
   */
  private _splitIconName(iconName: string): [string, string] {
    if (!iconName) {
      return ['', ''];
    }
    const parts = iconName.split(':');
    switch (parts.length) {
      case 1:
        // Use default namespace.
        return ['', parts[0]];
      case 2:
        return <[string, string]>parts;
      default:
        throw new MdIconInvalidNameError(iconName);
    }
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    const changedInputs = Object.keys(changes);
    // Only update the inline SVG icon if the inputs changed, to avoid unnecessary DOM operations.
    if (changedInputs.indexOf('svgIcon') != -1 || changedInputs.indexOf('svgSrc') != -1) {
      if (this.svgIcon) {
        const [namespace, iconName] = this._splitIconName(this.svgIcon);
        this._mdIconRegistry.getNamedSvgIcon(iconName, namespace).first().subscribe(
            svg => this._setSvgElement(svg),
            (err: MdIconNameNotFoundError) => console.log(`Error retrieving icon: ${err.message}`));
      }
    }
    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
    this._updateAriaLabel();
  }

  ngOnInit() {
    // Update font classes because ngOnChanges won't be called if none of the inputs are present,
    // e.g. <md-icon>arrow</md-icon>. In this case we need to add a CSS class for the default font.
    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
  }

  ngAfterViewChecked() {
    // Update aria label here because it may depend on the projected text content.
    // (e.g. <md-icon>home</md-icon> should use 'home').
    this._updateAriaLabel();
  }

  private _updateAriaLabel() {
      const ariaLabel = this._getAriaLabel();
      if (ariaLabel && ariaLabel !== this._previousAriaLabel) {
        this._previousAriaLabel = ariaLabel;
        this._renderer.setElementAttribute(this._elementRef.nativeElement, 'aria-label', ariaLabel);
      }
  }

  private _getAriaLabel() {
    // If the parent provided an aria-label attribute value, use it as-is. Otherwise look for a
    // reasonable value from the alt attribute, font icon name, SVG icon name, or (for ligatures)
    // the text content of the directive.
    const label =
        this.hostAriaLabel ||
        this.alt ||
        this.fontIcon ||
        this._splitIconName(this.svgIcon)[1];
    if (label) {
      return label;
    }
    // The "content" of an SVG icon is not a useful label.
    if (this._usingFontIcon()) {
      const text = this._elementRef.nativeElement.textContent;
      if (text) {
        return text;
      }
    }
    // TODO: Warn here in dev mode.
    return null;
  }

  private _usingFontIcon(): boolean {
    return !this.svgIcon;
  }

  private _setSvgElement(svg: SVGElement) {
    const layoutElement = this._elementRef.nativeElement;
    // Remove existing child nodes and add the new SVG element.
    // We would use renderer.detachView(Array.from(layoutElement.childNodes)) here,
    // but it fails in IE11: https://github.com/angular/angular/issues/6327
    layoutElement.innerHTML = '';
    this._renderer.projectNodes(layoutElement, [svg]);
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
        this._renderer.setElementClass(elem, this._previousFontSetClass, false);
      }
      if (fontSetClass) {
        this._renderer.setElementClass(elem, fontSetClass, true);
      }
      this._previousFontSetClass = fontSetClass;
    }

    if (this.fontIcon != this._previousFontIconClass) {
      if (this._previousFontIconClass) {
        this._renderer.setElementClass(elem, this._previousFontIconClass, false);
      }
      if (this.fontIcon) {
        this._renderer.setElementClass(elem, this.fontIcon, true);
      }
      this._previousFontIconClass = this.fontIcon;
    }
  }
}

export function ICON_REGISTRY_PROVIDER_FACTORY(
    parentRegistry: MdIconRegistry, http: Http, sanitizer: DomSanitizer) {
  return parentRegistry || new MdIconRegistry(http, sanitizer);
};

export const ICON_REGISTRY_PROVIDER = {
  // If there is already an MdIconRegistry available, use that. Otherwise, provide a new one.
  provide: MdIconRegistry,
  deps: [[new Optional(), new SkipSelf(), MdIconRegistry], Http, DomSanitizer],
  useFactory: ICON_REGISTRY_PROVIDER_FACTORY,
};
