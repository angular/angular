import {
    it,
    describe,
    expect,
    beforeEach,
    beforeEachProviders,
    inject,
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {HTTP_PROVIDERS, XHRBackend} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {provide, Component} from '@angular/core';
import {MdIcon} from './icon';
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

  beforeEachProviders(() => [
    MdIconRegistry,
    HTTP_PROVIDERS,
    MockBackend,
    provide(XHRBackend, {useExisting: MockBackend}),
  ]);

  let builder: TestComponentBuilder;
  let mdIconRegistry: MdIconRegistry;
  let httpRequestUrls: string[];

  beforeEach(
      inject([TestComponentBuilder, MdIconRegistry, MockBackend],
      (tcb: TestComponentBuilder, mir: MdIconRegistry, mockBackend: MockBackend) => {
    builder = tcb;
    mdIconRegistry = mir;
    // Keep track of requests so we can verify caching behavior.
    // Return responses for the SVGs defined in fake-svgs.ts.
    httpRequestUrls = [];
    mockBackend.connections.subscribe((connection: any) => {
      const url = connection.request.url;
      httpRequestUrls.push(url);
      connection.mockRespond(getFakeSvgHttpResponse(url));
    });
  }));

  describe('Ligature icons', () => {
    it('should add material-icons class by default', (done: () => void) => {
      return builder.createAsync(MdIconLigatureTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        testComponent.iconName = 'home';
        fixture.detectChanges();
        expect(sortedClassNames(mdIconElement)).toEqual(['material-icons']);
        done();
      });
    });

    it('should use alternate icon font if set', (done: () => void) => {
      mdIconRegistry.setDefaultFontSetClass('myfont');
      return builder.createAsync(MdIconLigatureTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        testComponent.iconName = 'home';
        fixture.detectChanges();
        expect(sortedClassNames(mdIconElement)).toEqual(['myfont']);
        done();
      });
    });
  });

  describe('Icons from URLs', () => {
    it('should fetch SVG icon from URL and inline the content', (done: () => void) => {
      return builder.createAsync(MdIconFromSvgUrlTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        let svgElement: any;

        testComponent.iconUrl = 'cat.svg';
        fixture.detectChanges();
        // An <svg> element should have been added as a child of <md-icon>.
        svgElement = verifyAndGetSingleSvgChild(mdIconElement);
        // Default attributes should be set.
        expect(svgElement.getAttribute('height')).toBe('100%');
        expect(svgElement.getAttribute('height')).toBe('100%');
        // Make sure SVG content is taken from response.
        verifyPathChildElement(svgElement, 'meow');

        // Change the icon, and the SVG element should be replaced.
        testComponent.iconUrl = 'dog.svg';
        fixture.detectChanges();
        svgElement = verifyAndGetSingleSvgChild(mdIconElement);
        verifyPathChildElement(svgElement, 'woof');

        expect(httpRequestUrls).toEqual(['cat.svg', 'dog.svg']);
        // Using an icon from a previously loaded URL should not cause another HTTP request.
        testComponent.iconUrl = 'cat.svg';
        fixture.detectChanges();
        svgElement = verifyAndGetSingleSvgChild(mdIconElement);
        verifyPathChildElement(svgElement, 'meow');
        expect(httpRequestUrls).toEqual(['cat.svg', 'dog.svg']);

        done();
      });
    });

    it('should register icon URLs by name', (done: () => void) => {
      mdIconRegistry.addSvgIcon('fluffy', 'cat.svg');
      mdIconRegistry.addSvgIcon('fido', 'dog.svg');
      return builder.createAsync(MdIconFromSvgNameTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
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

        done();
      });
    });

    it('should extract icon from SVG icon set', (done: () => void) => {
      mdIconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-1.svg');
      return builder.createAsync(MdIconFromSvgNameTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
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

        done();
      });
    });

    it('should allow multiple icon sets in a namespace', (done: () => void) => {
      mdIconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-1.svg');
      mdIconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-2.svg');
      mdIconRegistry.addSvgIconSetInNamespace('arrows', 'arrow-set.svg');
      return builder.createAsync(MdIconFromSvgNameTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
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

        done();
      });
    });

    it('should not wrap <svg> elements in icon sets in another svg tag', (done: () => void) => {
      mdIconRegistry.addSvgIconSet('arrow-set.svg');
      return builder.createAsync(MdIconFromSvgNameTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        let svgElement: any;

        testComponent.iconName = 'left-arrow';
        fixture.detectChanges();
        // arrow-set.svg stores its icons as nested <svg> elements, so they should be used
        // directly and not wrapped in an outer <svg> tag like the <g> elements in other sets.
        svgElement = verifyAndGetSingleSvgChild(mdIconElement);
        verifyPathChildElement(svgElement, 'left');
        expect(mdIconElement.getAttribute('aria-label')).toBe('left-arrow');

        done();
      });
    });

    it('should return unmodified copies of icons from URLs', (done: () => void) => {
      return builder.createAsync(MdIconFromSvgUrlTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        let svgElement: any;

        testComponent.iconUrl = 'cat.svg';
        fixture.detectChanges();
        svgElement = verifyAndGetSingleSvgChild(mdIconElement);
        verifyPathChildElement(svgElement, 'meow');
        // Modify the SVG element by setting a viewBox attribute.
        svgElement.setAttribute('viewBox', '0 0 100 100');

        // Switch to a different icon.
        testComponent.iconUrl = 'dog.svg';
        fixture.detectChanges();
        svgElement = verifyAndGetSingleSvgChild(mdIconElement);
        verifyPathChildElement(svgElement, 'woof');

        // Switch back to the first icon. The viewBox attribute should not be present.
        testComponent.iconUrl = 'cat.svg';
        fixture.detectChanges();
        svgElement = verifyAndGetSingleSvgChild(mdIconElement);
        verifyPathChildElement(svgElement, 'meow');
        expect(svgElement.getAttribute('viewBox')).toBeFalsy();

        done();
      });
    });

    it('should return unmodified copies of icons from icon sets', (done: () => void) => {
      mdIconRegistry.addSvgIconSet('arrow-set.svg');
      return builder.createAsync(MdIconFromSvgNameTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
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

        done();
      });
    });
  });

  describe('custom fonts', () => {
    it('should apply CSS classes for custom font and icon', (done: () => void) => {
      mdIconRegistry.registerFontClassAlias('f1', 'font1');
      mdIconRegistry.registerFontClassAlias('f2');
      return builder.createAsync(MdIconCustomFontCssTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        testComponent.fontSet = 'f1';
        testComponent.fontIcon = 'house';
        fixture.detectChanges();
        expect(sortedClassNames(mdIconElement)).toEqual(['font1', 'house']);
        expect(mdIconElement.getAttribute('aria-label')).toBe('house');

        testComponent.fontSet = 'f2';
        testComponent.fontIcon = 'igloo';
        fixture.detectChanges();
        expect(sortedClassNames(mdIconElement)).toEqual(['f2', 'igloo']);
        expect(mdIconElement.getAttribute('aria-label')).toBe('igloo');

        testComponent.fontSet = 'f3';
        testComponent.fontIcon = 'tent';
        fixture.detectChanges();
        expect(sortedClassNames(mdIconElement)).toEqual(['f3', 'tent']);
        expect(mdIconElement.getAttribute('aria-label')).toBe('tent');

        done();
      });
    });
  });

  describe('aria label', () => {
    it('should set aria label from text content if not specified', (done: () => void) => {
      return builder.createAsync(MdIconLigatureTestApp).then(fixture => {

        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        testComponent.iconName = 'home';

        fixture.detectChanges();
        expect(mdIconElement.getAttribute('aria-label')).toBe('home');

        testComponent.iconName = 'hand';
        fixture.detectChanges();
        expect(mdIconElement.getAttribute('aria-label')).toBe('hand');

        done();
      });
    });

    it('should use alt tag if aria label is not specified', (done: () => void) => {
      return builder.createAsync(MdIconLigatureWithAriaBindingTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        testComponent.iconName = 'home';
        testComponent.altText = 'castle';
        fixture.detectChanges();
        expect(mdIconElement.getAttribute('aria-label')).toBe('castle');

        testComponent.ariaLabel = 'house';
        fixture.detectChanges();
        expect(mdIconElement.getAttribute('aria-label')).toBe('house');

        done();
      });
    });

    it('should use provided aria label rather than icon name', (done: () => void) => {
      return builder.createAsync(MdIconLigatureWithAriaBindingTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        testComponent.iconName = 'home';
        testComponent.ariaLabel = 'house';
        fixture.detectChanges();
        expect(mdIconElement.getAttribute('aria-label')).toBe('house');
        done();
      });
    });

    it('should use provided aria label rather than font icon', (done: () => void) => {
      return builder.createAsync(MdIconCustomFontCssTestApp).then(fixture => {
        const testComponent = fixture.debugElement.componentInstance;
        const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
        testComponent.fontSet = 'f1';
        testComponent.fontIcon = 'house';
        testComponent.ariaLabel = 'home';
        fixture.detectChanges();
        expect(mdIconElement.getAttribute('aria-label')).toBe('home');
        done();
      });
    });
  });
});

/** Test components that contain an MdIcon. */
@Component({
  selector: 'test-app',
  template: `<md-icon>{{iconName}}</md-icon>`,
  directives: [MdIcon],
})
class MdIconLigatureTestApp {
  ariaLabel: string = null;
  iconName = '';
}

@Component({
  selector: 'test-app',
  template: `<md-icon [aria-label]="ariaLabel" [alt]="altText">{{iconName}}</md-icon>`,
  directives: [MdIcon],
})
class MdIconLigatureWithAriaBindingTestApp {
  ariaLabel: string = null;
  iconName = '';
}

@Component({
  selector: 'test-app',
  template: `
      <md-icon [fontSet]="fontSet" [fontIcon]="fontIcon" [aria-label]="ariaLabel"></md-icon>
  `,
  directives: [MdIcon],
})
class MdIconCustomFontCssTestApp {
  ariaLabel: string = null;
  fontSet = '';
  fontIcon = '';
}

@Component({
  selector: 'test-app',
  template: `<md-icon [svgSrc]="iconUrl" [aria-label]="ariaLabel"></md-icon>`,
  directives: [MdIcon],
})
class MdIconFromSvgUrlTestApp {
  ariaLabel: string = null;
  iconUrl = '';
}

@Component({
  selector: 'test-app',
  template: `<md-icon [svgIcon]="iconName" [aria-label]="ariaLabel"></md-icon>`,
  directives: [MdIcon],
})
class MdIconFromSvgNameTestApp {
  ariaLabel: string = null;
  iconName = '';
}
