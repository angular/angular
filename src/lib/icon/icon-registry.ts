import {Injectable, SecurityContext} from '@angular/core';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {Http} from '@angular/http';
import {MdError} from '../core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';


/**
 * Exception thrown when attempting to load an icon with a name that cannot be found.
 * @docs-private
 */
export class MdIconNameNotFoundError extends MdError {
  constructor(iconName: string) {
    super(`Unable to find icon with the name "${iconName}"`);
  }
}

/**
 * Exception thrown when attempting to load SVG content that does not contain the expected
 * <svg> tag.
 * @docs-private
 */
export class MdIconSvgTagNotFoundError extends MdError {
  constructor() {
    super('<svg> tag not found');
  }
}

/**
 * Configuration for an icon, including the URL and possibly the cached SVG element.
 * @docs-private
 */
class SvgIconConfig {
  svgElement: SVGElement = null;
  constructor(public url: SafeResourceUrl) { }
}

/** Returns the cache key to use for an icon namespace and name. */
const iconKey = (namespace: string, name: string) => namespace + ':' + name;

/**
 * Service to register and display icons used by the <md-icon> component.
 * - Registers icon URLs by namespace and name.
 * - Registers icon set URLs by namespace.
 * - Registers aliases for CSS classes, for use with icon fonts.
 * - Loads icons from URLs and extracts individual icons from icon sets.
 */
@Injectable()
export class MdIconRegistry {
  /**
   * URLs and cached SVG elements for individual icons. Keys are of the format "[namespace]:[icon]".
   */
  private _svgIconConfigs = new Map<string, SvgIconConfig>();

  /**
   * SvgIconConfig objects and cached SVG elements for icon sets, keyed by namespace.
   * Multiple icon sets can be registered under the same namespace.
   */
  private _iconSetConfigs = new Map<string, SvgIconConfig[]>();

  /** Cache for icons loaded by direct URLs. */
  private _cachedIconsByUrl = new Map<string, SVGElement>();

  /** In-progress icon fetches. Used to coalesce multiple requests to the same URL. */
  private _inProgressUrlFetches = new Map<string, Observable<string>>();

  /** Map from font identifiers to their CSS class names. Used for icon fonts. */
  private _fontCssClassesByAlias = new Map<string, string>();

  /**
   * The CSS class to apply when an <md-icon> component has no icon name, url, or font specified.
   * The default 'material-icons' value assumes that the material icon font has been loaded as
   * described at http://google.github.io/material-design-icons/#icon-font-for-the-web
   */
  private _defaultFontSetClass = 'material-icons';

  constructor(private _http: Http, private _sanitizer: DomSanitizer) {}

  /**
   * Registers an icon by URL in the default namespace.
   * @param iconName Name under which the icon should be registered.
   * @param url
   */
  addSvgIcon(iconName: string, url: SafeResourceUrl): this {
    return this.addSvgIconInNamespace('', iconName, url);
  }

  /**
   * Registers an icon by URL in the specified namespace.
   * @param namespace Namespace in which the icon should be registered.
   * @param iconName Name under which the icon should be registered.
   * @param url
   */
  addSvgIconInNamespace(namespace: string, iconName: string, url: SafeResourceUrl): this {
    const key = iconKey(namespace, iconName);
    this._svgIconConfigs.set(key, new SvgIconConfig(url));
    return this;
  }

  /**
   * Registers an icon set by URL in the default namespace.
   * @param url
   */
  addSvgIconSet(url: SafeResourceUrl): this {
    return this.addSvgIconSetInNamespace('', url);
  }

  /**
   * Registers an icon set by URL in the specified namespace.
   * @param namespace Namespace in which to register the icon set.
   * @param url
   */
  addSvgIconSetInNamespace(namespace: string, url: SafeResourceUrl): this {
    const config = new SvgIconConfig(url);
    if (this._iconSetConfigs.has(namespace)) {
      this._iconSetConfigs.get(namespace).push(config);
    } else {
      this._iconSetConfigs.set(namespace, [config]);
    }
    return this;
  }

  /**
   * Defines an alias for a CSS class name to be used for icon fonts. Creating an mdIcon
   * component with the alias as the fontSet input will cause the class name to be applied
   * to the <md-icon> element.
   *
   * @param alias Alias for the font.
   * @param className Class name override to be used instead of the alias.
   */
  registerFontClassAlias(alias: string, className = alias): this {
    this._fontCssClassesByAlias.set(alias, className);
    return this;
  }

  /**
   * Returns the CSS class name associated with the alias by a previous call to
   * registerFontClassAlias. If no CSS class has been associated, returns the alias unmodified.
   */
  classNameForFontAlias(alias: string): string {
    return this._fontCssClassesByAlias.get(alias) || alias;
  }

  /**
   * Sets the CSS class name to be used for icon fonts when an <md-icon> component does not
   * have a fontSet input value, and is not loading an icon by name or URL.
   *
   * @param className
   */
  setDefaultFontSetClass(className: string): this {
    this._defaultFontSetClass = className;
    return this;
  }

  /**
   * Returns the CSS class name to be used for icon fonts when an <md-icon> component does not
   * have a fontSet input value, and is not loading an icon by name or URL.
   */
  getDefaultFontSetClass(): string {
    return this._defaultFontSetClass;
  }

  /**
   * Returns an Observable that produces the icon (as an <svg> DOM element) from the given URL.
   * The response from the URL may be cached so this will not always cause an HTTP request, but
   * the produced element will always be a new copy of the originally fetched icon. (That is,
   * it will not contain any modifications made to elements previously returned).
   *
   * @param safeUrl URL from which to fetch the SVG icon.
   */
  getSvgIconFromUrl(safeUrl: SafeResourceUrl): Observable<SVGElement> {
    let url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);

    if (this._cachedIconsByUrl.has(url)) {
      return Observable.of(cloneSvg(this._cachedIconsByUrl.get(url)));
    }
    return this._loadSvgIconFromConfig(new SvgIconConfig(url))
        .do(svg => this._cachedIconsByUrl.set(url, svg))
        .map(svg => cloneSvg(svg));
  }

  /**
   * Returns an Observable that produces the icon (as an <svg> DOM element) with the given name
   * and namespace. The icon must have been previously registered with addIcon or addIconSet;
   * if not, the Observable will throw an MdIconNameNotFoundError.
   *
   * @param name Name of the icon to be retrieved.
   * @param namespace Namespace in which to look for the icon.
   */
  getNamedSvgIcon(name: string, namespace = ''): Observable<SVGElement> {
    // Return (copy of) cached icon if possible.
    const key = iconKey(namespace, name);
    if (this._svgIconConfigs.has(key)) {
      return this._getSvgFromConfig(this._svgIconConfigs.get(key));
    }
    // See if we have any icon sets registered for the namespace.
    const iconSetConfigs = this._iconSetConfigs.get(namespace);
    if (iconSetConfigs) {
      return this._getSvgFromIconSetConfigs(name, iconSetConfigs);
    }
    return Observable.throw(new MdIconNameNotFoundError(key));
  }

  /**
   * Returns the cached icon for a SvgIconConfig if available, or fetches it from its URL if not.
   */
  private _getSvgFromConfig(config: SvgIconConfig): Observable<SVGElement> {
    if (config.svgElement) {
      // We already have the SVG element for this icon, return a copy.
      return Observable.of(cloneSvg(config.svgElement));
    } else {
      // Fetch the icon from the config's URL, cache it, and return a copy.
      return this._loadSvgIconFromConfig(config)
          .do(svg => config.svgElement = svg)
          .map(svg => cloneSvg(svg));
    }
  }

  /**
   * Attempts to find an icon with the specified name in any of the SVG icon sets.
   * First searches the available cached icons for a nested element with a matching name, and
   * if found copies the element to a new <svg> element. If not found, fetches all icon sets
   * that have not been cached, and searches again after all fetches are completed.
   * The returned Observable produces the SVG element if possible, and throws
   * MdIconNameNotFoundError if no icon with the specified name can be found.
   */
  private _getSvgFromIconSetConfigs(name: string, iconSetConfigs: SvgIconConfig[]):
      Observable<SVGElement> {
    // For all the icon set SVG elements we've fetched, see if any contain an icon with the
    // requested name.
    const namedIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);
    if (namedIcon) {
      // We could cache namedIcon in _svgIconConfigs, but since we have to make a copy every
      // time anyway, there's probably not much advantage compared to just always extracting
      // it from the icon set.
      return Observable.of(namedIcon);
    }
    // Not found in any cached icon sets. If there are icon sets with URLs that we haven't
    // fetched, fetch them now and look for iconName in the results.
    const iconSetFetchRequests: Observable<SVGElement>[] = iconSetConfigs
        .filter(iconSetConfig => !iconSetConfig.svgElement)
        .map(iconSetConfig =>
            this._loadSvgIconSetFromConfig(iconSetConfig)
                .catch((err: any, caught: Observable<SVGElement>): Observable<SVGElement> => {
                  let url =
                      this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, iconSetConfig.url);

                  // Swallow errors fetching individual URLs so the combined Observable won't
                  // necessarily fail.
                  console.log(`Loading icon set URL: ${url} failed: ${err}`);
                  return Observable.of(null);
                })
                .do(svg => {
                  // Cache SVG element.
                  if (svg) {
                    iconSetConfig.svgElement = svg;
                  }
                }));
    // Fetch all the icon set URLs. When the requests complete, every IconSet should have a
    // cached SVG element (unless the request failed), and we can check again for the icon.
    return Observable.forkJoin(iconSetFetchRequests)
        .map((ignoredResults: any) => {
          const foundIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);
          if (!foundIcon) {
            throw new MdIconNameNotFoundError(name);
          }
          return foundIcon;
        });
  }

  /**
   * Searches the cached SVG elements for the given icon sets for a nested icon element whose "id"
   * tag matches the specified name. If found, copies the nested element to a new SVG element and
   * returns it. Returns null if no matching element is found.
   */
  private _extractIconWithNameFromAnySet(iconName: string, iconSetConfigs: SvgIconConfig[]):
      SVGElement {
    // Iterate backwards, so icon sets added later have precedence.
    for (let i = iconSetConfigs.length - 1; i >= 0; i--) {
      const config = iconSetConfigs[i];
      if (config.svgElement) {
        const foundIcon = this._extractSvgIconFromSet(config.svgElement, iconName);
        if (foundIcon) {
          return foundIcon;
        }
      }
    }
    return null;
  }

  /**
   * Loads the content of the icon URL specified in the SvgIconConfig and creates an SVG element
   * from it.
   */
  private _loadSvgIconFromConfig(config: SvgIconConfig): Observable<SVGElement> {
    return this._fetchUrl(config.url)
        .map(svgText => this._createSvgElementForSingleIcon(svgText));
  }

  /**
   * Loads the content of the icon set URL specified in the SvgIconConfig and creates an SVG element
   * from it.
   */
  private _loadSvgIconSetFromConfig(config: SvgIconConfig): Observable<SVGElement> {
      // TODO: Document that icons should only be loaded from trusted sources.
    return this._fetchUrl(config.url)
        .map(svgText => this._svgElementFromString(svgText));
  }

  /**
   * Creates a DOM element from the given SVG string, and adds default attributes.
   */
  private _createSvgElementForSingleIcon(responseText: string): SVGElement {
    const svg = this._svgElementFromString(responseText);
    this._setSvgAttributes(svg);
    return svg;
  }

  /**
   * Searches the cached element of the given SvgIconConfig for a nested icon element whose "id"
   * tag matches the specified name. If found, copies the nested element to a new SVG element and
   * returns it. Returns null if no matching element is found.
   */
  private _extractSvgIconFromSet(iconSet: SVGElement, iconName: string): SVGElement {
    const iconNode = iconSet.querySelector('#' + iconName);
    if (!iconNode) {
      return null;
    }
    // If the icon node is itself an <svg> node, clone and return it directly. If not, set it as
    // the content of a new <svg> node.
    if (iconNode.tagName.toLowerCase() == 'svg') {
      return this._setSvgAttributes(iconNode.cloneNode(true) as SVGElement);
    }
    // createElement('SVG') doesn't work as expected; the DOM ends up with
    // the correct nodes, but the SVG content doesn't render. Instead we
    // have to create an empty SVG node using innerHTML and append its content.
    // Elements created using DOMParser.parseFromString have the same problem.
    // http://stackoverflow.com/questions/23003278/svg-innerhtml-in-firefox-can-not-display
    const svg = this._svgElementFromString('<svg></svg>');
    // Clone the node so we don't remove it from the parent icon set element.
    svg.appendChild(iconNode.cloneNode(true));
    return this._setSvgAttributes(svg);
  }

  /**
   * Creates a DOM element from the given SVG string.
   */
  private _svgElementFromString(str: string): SVGElement {
    // TODO: Is there a better way than innerHTML? Renderer doesn't appear to have a method for
    // creating an element from an HTML string.
    const div = document.createElement('DIV');
    div.innerHTML = str;
    const svg = div.querySelector('svg') as SVGElement;
    if (!svg) {
      throw new MdIconSvgTagNotFoundError();
    }
    return svg;
  }

  /**
   * Sets the default attributes for an SVG element to be used as an icon.
   */
  private _setSvgAttributes(svg: SVGElement): SVGElement {
    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    svg.setAttribute('fit', '');
    svg.setAttribute('height', '100%');
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('focusable', 'false'); // Disable IE11 default behavior to make SVGs focusable.
    return svg;
  }

  /**
   * Returns an Observable which produces the string contents of the given URL. Results may be
   * cached, so future calls with the same URL may not cause another HTTP request.
   */
  private _fetchUrl(safeUrl: SafeResourceUrl): Observable<string> {
    let url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);

    // Store in-progress fetches to avoid sending a duplicate request for a URL when there is
    // already a request in progress for that URL. It's necessary to call share() on the
    // Observable returned by http.get() so that multiple subscribers don't cause multiple XHRs.
    if (this._inProgressUrlFetches.has(url)) {
      return this._inProgressUrlFetches.get(url);
    }

    // TODO(jelbourn): for some reason, the `finally` operator "loses" the generic type on the
    // Observable. Figure out why and fix it.
    const req = <Observable<string>> this._http.get(url)
        .map(response => response.text())
        .finally(() => {
          this._inProgressUrlFetches.delete(url);
        })
        .share();
    this._inProgressUrlFetches.set(url, req);
    return req;
  }
}


/** Clones an SVGElement while preserving type information. */
function cloneSvg(svg: SVGElement): SVGElement {
  return svg.cloneNode(true) as SVGElement;
}
