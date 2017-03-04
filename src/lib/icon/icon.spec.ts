import {inject, async, TestBed} from '@angular/core/testing';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {XHRBackend} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Component} from '@angular/core';
import {MdIconModule} from './index';
import {MdIconRegistry} from './icon-registry';
import {getFakeSvgHttpResponse} from './fake-svgs';


/** Returns the CSS classes assigned to an element as a sorted array. */
const sortedClassNames = (elem: Element) => elem.className.split(' ').sort();

/**
 * Verifies that an element contains a single <svg> child element, and returns that child.
 */
const verifyAndGetSingleSvgChild = (element: SVGElement): any => {
  expect(element.childNodes.length).toBe(1);
  const svgChild = <Element>element.childNodes[0];
  expect(svgChild.tagName.toLowerCase()).toBe('svg');
  return svgChild;
};

/**
 * Verifies that an element contains a single <path> child element whose "id" attribute has
 * the specified value.
 */
const verifyPathChildElement = (element: Element, attributeValue: string) => {
  expect(element.childNodes.length).toBe(1);
  const pathElement = <Element>element.childNodes[0];
  expect(pathElement.tagName.toLowerCase()).toBe('path');
  expect(pathElement.getAttribute('id')).toBe(attributeValue);
};

describe('MdIcon', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdIconModule.forRoot()],
      declarations: [
        MdIconColorTestApp,
        MdIconLigatureTestApp,
        MdIconLigatureWithAriaBindingTestApp,
        MdIconCustomFontCssTestApp,
        MdIconFromSvgNameTestApp,
      ],
      providers: [
        MockBackend,
        {provide: XHRBackend, useExisting: MockBackend},
      ]
    });

    TestBed.compileComponents();
  }));

  let mdIconRegistry: MdIconRegistry;
  let sanitizer: DomSanitizer;
  let httpRequestUrls: string[];

  let deps = [MdIconRegistry, MockBackend, DomSanitizer];
  beforeEach(inject(deps, (mir: MdIconRegistry, mockBackend: MockBackend, ds: DomSanitizer) => {
    mdIconRegistry = mir;
    sanitizer = ds;
    // Keep track of requests so we can verify caching behavior.
    // Return responses for the SVGs defined in fake-svgs.ts.
    httpRequestUrls = [];
    mockBackend.connections.subscribe((connection: any) => {
      const url = connection.request.url;
      httpRequestUrls.push(url);
      connection.mockRespond(getFakeSvgHttpResponse(url));
    });
  }));

  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(MdIconColorTestApp);

    const testComponent = fixture.componentInstance;
    const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
    testComponent.iconName = 'home';
    testComponent.iconColor = 'primary';
    fixture.detectChanges();
    expect(sortedClassNames(mdIconElement)).toEqual(['mat-icon', 'mat-primary', 'material-icons']);
  });

  describe('Ligature icons', () => {
    it('should add material-icons class by default', () => {
      let fixture = TestBed.createComponent(MdIconLigatureTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['mat-icon', 'material-icons']);
    });

    it('should use alternate icon font if set', () => {
      mdIconRegistry.setDefaultFontSetClass('myfont');

      let fixture = TestBed.createComponent(MdIconLigatureTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['mat-icon', 'myfont']);
    });
  });

  describe('Icons from URLs', () => {
    it('should register icon URLs by name', () => {
      mdIconRegistry.addSvgIcon('fluffy', trust('cat.svg'));
      mdIconRegistry.addSvgIcon('fido', trust('dog.svg'));

      let fixture = TestBed.createComponent(MdIconFromSvgNameTestApp);
      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: SVGElement;

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'woof');
      // The aria label should be taken from the icon name.
      expect(mdIconElement.getAttribute('aria-label')).toBe('fido');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'meow');
      expect(mdIconElement.getAttribute('aria-label')).toBe('fluffy');

      expect(httpRequestUrls).toEqual(['dog.svg', 'cat.svg']);
      // Using an icon from a previously loaded URL should not cause another HTTP request.
      testComponent.iconName = 'fido';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'woof');
      expect(httpRequestUrls).toEqual(['dog.svg', 'cat.svg']);
    });

    it('should throw an error when using an untrusted icon url', () => {
      mdIconRegistry.addSvgIcon('fluffy', 'farm-set-1.svg');

      expect(() => {
        let fixture = TestBed.createComponent(MdIconFromSvgNameTestApp);
        fixture.componentInstance.iconName = 'fluffy';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should throw an error when using an untrusted icon set url', () => {
      mdIconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-1.svg');

      expect(() => {
        let fixture = TestBed.createComponent(MdIconFromSvgNameTestApp);
        fixture.componentInstance.iconName = 'farm:pig';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should extract icon from SVG icon set', () => {
      mdIconRegistry.addSvgIconSetInNamespace('farm', trust('farm-set-1.svg'));

      let fixture = TestBed.createComponent(MdIconFromSvgNameTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();

      expect(mdIconElement.childNodes.length).toBe(1);
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('pig');
      verifyPathChildElement(svgChild, 'oink');
      // The aria label should be taken from the icon name (without the icon set portion).
      expect(mdIconElement.getAttribute('aria-label')).toBe('pig');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('cow');
      verifyPathChildElement(svgChild, 'moo');
      expect(mdIconElement.getAttribute('aria-label')).toBe('cow');
    });

    it('should allow multiple icon sets in a namespace', () => {
      mdIconRegistry.addSvgIconSetInNamespace('farm', trust('farm-set-1.svg'));
      mdIconRegistry.addSvgIconSetInNamespace('farm', trust('farm-set-2.svg'));
      mdIconRegistry.addSvgIconSetInNamespace('arrows', trust('arrow-set.svg'));

      let fixture = TestBed.createComponent(MdIconFromSvgNameTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];
      // The <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('pig');
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'oink');
      // The aria label should be taken from the icon name (without the namespace).
      expect(mdIconElement.getAttribute('aria-label')).toBe('pig');

      // Both icon sets registered in the 'farm' namespace should have been fetched.
      expect(httpRequestUrls.sort()).toEqual(['farm-set-1.svg', 'farm-set-2.svg']);

      // Change the icon name to one that appears in both icon sets. The icon from the set that
      // was registered last should be used (with id attribute of 'moo moo' instead of 'moo'),
      // and no additional HTTP request should be made.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('cow');
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'moo moo');
      expect(mdIconElement.getAttribute('aria-label')).toBe('cow');
      expect(httpRequestUrls.sort()).toEqual(['farm-set-1.svg', 'farm-set-2.svg']);
    });

    it('should not wrap <svg> elements in icon sets in another svg tag', () => {
      mdIconRegistry.addSvgIconSet(trust('arrow-set.svg'));

      let fixture = TestBed.createComponent(MdIconFromSvgNameTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      // arrow-set.svg stores its icons as nested <svg> elements, so they should be used
      // directly and not wrapped in an outer <svg> tag like the <g> elements in other sets.
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'left');
      expect(mdIconElement.getAttribute('aria-label')).toBe('left-arrow');
    });

    it('should return unmodified copies of icons from icon sets', () => {
      mdIconRegistry.addSvgIconSet(trust('arrow-set.svg'));

      let fixture = TestBed.createComponent(MdIconFromSvgNameTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'left');
      // Modify the SVG element by setting a viewBox attribute.
      svgElement.setAttribute('viewBox', '0 0 100 100');

      // Switch to a different icon.
      testComponent.iconName = 'right-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'right');

      // Switch back to the first icon. The viewBox attribute should not be present.
      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'left');
      expect(svgElement.getAttribute('viewBox')).toBeFalsy();
    });
  });

  describe('custom fonts', () => {
    it('should apply CSS classes for custom font and icon', () => {
      mdIconRegistry.registerFontClassAlias('f1', 'font1');
      mdIconRegistry.registerFontClassAlias('f2');

      let fixture = TestBed.createComponent(MdIconCustomFontCssTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.fontSet = 'f1';
      testComponent.fontIcon = 'house';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['font1', 'house', 'mat-icon']);
      expect(mdIconElement.getAttribute('aria-label')).toBe('house');

      testComponent.fontSet = 'f2';
      testComponent.fontIcon = 'igloo';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['f2', 'igloo', 'mat-icon']);
      expect(mdIconElement.getAttribute('aria-label')).toBe('igloo');

      testComponent.fontSet = 'f3';
      testComponent.fontIcon = 'tent';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['f3', 'mat-icon', 'tent']);
      expect(mdIconElement.getAttribute('aria-label')).toBe('tent');
    });
  });

  describe('aria label', () => {
    it('should set aria label from text content if not specified', () => {
      let fixture = TestBed.createComponent(MdIconLigatureTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';

      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBe('home');

      testComponent.iconName = 'hand';
      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBe('hand');
    });

    it('should not set aria label unless it actually changed', () => {
      let fixture = TestBed.createComponent(MdIconLigatureTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';

      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBe('home');

      mdIconElement.removeAttribute('aria-label');
      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBeFalsy();
    });

    it('should use alt tag if aria label is not specified', () => {
      let fixture = TestBed.createComponent(MdIconLigatureWithAriaBindingTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';
      testComponent.altText = 'castle';
      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBe('castle');

      testComponent.ariaLabel = 'house';
      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBe('house');
    });

    it('should use provided aria label rather than icon name', () => {
      let fixture = TestBed.createComponent(MdIconLigatureWithAriaBindingTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';
      testComponent.ariaLabel = 'house';
      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBe('house');
    });

    it('should use provided aria label rather than font icon', () => {
      let fixture = TestBed.createComponent(MdIconCustomFontCssTestApp);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.fontSet = 'f1';
      testComponent.fontIcon = 'house';
      testComponent.ariaLabel = 'home';
      fixture.detectChanges();
      expect(mdIconElement.getAttribute('aria-label')).toBe('home');
    });
  });

  /** Marks an svg icon url as explicitly trusted. */
  function trust(iconUrl: string): SafeResourceUrl {
    return sanitizer.bypassSecurityTrustResourceUrl(iconUrl);
  }
});


/** Test components that contain an MdIcon. */
@Component({template: `<md-icon>{{iconName}}</md-icon>`})
class MdIconLigatureTestApp {
  ariaLabel: string = null;
  iconName = '';
}

@Component({template: `<md-icon [color]="iconColor">{{iconName}}</md-icon>`})
class MdIconColorTestApp {
  ariaLabel: string = null;
  iconName = '';
  iconColor = 'primary';
}

@Component({template: `<md-icon [aria-label]="ariaLabel" [alt]="altText">{{iconName}}</md-icon>`})
class MdIconLigatureWithAriaBindingTestApp {
  altText: string = '';
  ariaLabel: string = null;
  iconName = '';
}

@Component({
  template: `<md-icon [fontSet]="fontSet" [fontIcon]="fontIcon" [aria-label]="ariaLabel"></md-icon>`
})
class MdIconCustomFontCssTestApp {
  ariaLabel: string = null;
  fontSet = '';
  fontIcon = '';
}

@Component({template: `<md-icon [svgIcon]="iconName" [aria-label]="ariaLabel"></md-icon>`})
class MdIconFromSvgNameTestApp {
  ariaLabel: string = null;
  iconName = '';
}
