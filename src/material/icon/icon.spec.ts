import {inject, waitForAsync, fakeAsync, tick, TestBed} from '@angular/core/testing';
import {SafeResourceUrl, DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import {Component, ErrorHandler, Provider, Type, ViewChild} from '@angular/core';
import {MAT_ICON_DEFAULT_OPTIONS, MAT_ICON_LOCATION, MatIconModule} from './index';
import {MatIconRegistry, getMatIconNoHttpProviderError} from './icon-registry';
import {FAKE_SVGS} from './fake-svgs';
import {wrappedErrorMessage} from '../../cdk/testing/private';
import {MatIcon} from './icon';

/** Returns the CSS classes assigned to an element as a sorted array. */
function sortedClassNames(element: Element): string[] {
  return element.className.split(' ').sort();
}

/**
 * Verifies that an element contains a single `<svg>` child element, and returns that child.
 */
function verifyAndGetSingleSvgChild(element: SVGElement): SVGElement {
  expect(element.id).toBeFalsy();
  expect(element.childNodes.length).toBe(1);
  const svgChild = element.childNodes[0] as SVGElement;
  expect(svgChild.tagName.toLowerCase()).toBe('svg');
  return svgChild;
}

/**
 * Verifies that an element contains a single `<path>` child element whose "id" attribute has
 * the specified value.
 */
function verifyPathChildElement(element: Element, attributeValue: string): void {
  expect(element.childNodes.length).toBe(1);
  const pathElement = element.childNodes[0] as SVGPathElement;
  expect(pathElement.tagName.toLowerCase()).toBe('path');

  // The testing data SVGs have the name attribute set for verification.
  expect(pathElement.getAttribute('name')).toBe(attributeValue);
}

/** Creates a test component fixture. */
function createComponent<T>(component: Type<T>, providers: Provider[] = []) {
  TestBed.configureTestingModule({
    imports: [MatIconModule],
    declarations: [component],
    providers: [...providers],
  });

  TestBed.compileComponents();

  return TestBed.createComponent<T>(component);
}

describe('MatIcon', () => {
  let fakePath: string;
  let errorHandler: jasmine.SpyObj<ErrorHandler>;

  beforeEach(waitForAsync(() => {
    // The $ prefix tells Karma not to try to process the
    // request so that we don't get warnings in our logs.
    fakePath = '/$fake-path';
    errorHandler = jasmine.createSpyObj('errorHandler', ['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatIconModule],
      declarations: [
        IconWithColor,
        IconWithLigature,
        IconWithLigatureByAttribute,
        IconWithCustomFontCss,
        IconFromSvgName,
        IconWithAriaHiddenFalse,
        IconWithBindingAndNgIf,
        InlineIcon,
        SvgIconWithUserContent,
        IconWithLigatureAndSvgBinding,
        BlankIcon,
      ],
      providers: [
        {
          provide: MAT_ICON_LOCATION,
          useValue: {getPathname: () => fakePath},
        },
        {
          provide: ErrorHandler,
          useValue: errorHandler,
        },
      ],
    });

    TestBed.compileComponents();
  }));

  let iconRegistry: MatIconRegistry;
  let http: HttpTestingController;
  let sanitizer: DomSanitizer;

  beforeEach(inject(
    [MatIconRegistry, HttpTestingController, DomSanitizer],
    (mir: MatIconRegistry, h: HttpTestingController, ds: DomSanitizer) => {
      iconRegistry = mir;
      http = h;
      sanitizer = ds;
    },
  ));

  it('should include notranslate class by default', () => {
    const fixture = TestBed.createComponent(IconWithColor);

    const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(matIconElement.classList.contains('notranslate'))
      .withContext('Expected the mat-icon element to include the notranslate class')
      .toBeTruthy();
  });

  it('should apply class based on color attribute', () => {
    const fixture = TestBed.createComponent(IconWithColor);

    const testComponent = fixture.componentInstance;
    const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    testComponent.iconName = 'home';
    testComponent.iconColor = 'primary';
    fixture.detectChanges();
    expect(sortedClassNames(matIconElement)).toEqual([
      'mat-icon',
      'mat-ligature-font',
      'mat-primary',
      'material-icons',
      'notranslate',
    ]);
  });

  it('should apply a class if there is no color', () => {
    const fixture = TestBed.createComponent(IconWithColor);

    const testComponent = fixture.componentInstance;
    const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    testComponent.iconName = 'home';
    testComponent.iconColor = '';
    fixture.detectChanges();

    expect(sortedClassNames(matIconElement)).toEqual([
      'mat-icon',
      'mat-icon-no-color',
      'mat-ligature-font',
      'material-icons',
      'notranslate',
    ]);
  });

  it('should mark mat-icon as aria-hidden by default', () => {
    const fixture = TestBed.createComponent(IconWithLigature);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(iconElement.getAttribute('aria-hidden'))
      .withContext('Expected the mat-icon element has aria-hidden="true" by default')
      .toBe('true');
  });

  it('should not override a user-provided aria-hidden attribute', () => {
    const fixture = TestBed.createComponent(IconWithAriaHiddenFalse);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(iconElement.getAttribute('aria-hidden'))
      .withContext('Expected the mat-icon element has the user-provided aria-hidden value')
      .toBe('false');
  });

  it('should apply inline styling', () => {
    const fixture = TestBed.createComponent(InlineIcon);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(iconElement.classList.contains('mat-icon-inline'))
      .withContext('Expected the mat-icon element to not include the inline styling class')
      .toBeFalsy();

    fixture.debugElement.componentInstance.inline = true;
    fixture.detectChanges();
    expect(iconElement.classList.contains('mat-icon-inline'))
      .withContext('Expected the mat-icon element to include the inline styling class')
      .toBeTruthy();
  });

  describe('Ligature icons', () => {
    it('should add material-icons and mat-ligature-font class by default', () => {
      const fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'mat-icon',
        'mat-icon-no-color',
        'mat-ligature-font',
        'material-icons',
        'notranslate',
      ]);
    });

    it('should use alternate icon font if set', () => {
      iconRegistry.setDefaultFontSetClass('myfont', 'mat-ligature-font');

      const fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'mat-icon',
        'mat-icon-no-color',
        'mat-ligature-font',
        'myfont',
        'notranslate',
      ]);
    });

    it('should not clear the text of a ligature icon if the svgIcon is bound to something falsy', () => {
      const fixture = TestBed.createComponent(IconWithLigatureAndSvgBinding);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = undefined;
      fixture.detectChanges();

      expect(matIconElement.textContent.trim()).toBe('house');
    });

    it('should be able to provide multiple alternate icon set classes', () => {
      iconRegistry.setDefaultFontSetClass('myfont', 'mat-ligature-font', 'myfont-48x48');

      let fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'mat-icon',
        'mat-icon-no-color',
        'mat-ligature-font',
        'myfont',
        'myfont-48x48',
        'notranslate',
      ]);
    });
  });

  describe('Ligature icons by attribute', () => {
    it('should forward the fontIcon attribute', () => {
      const fixture = TestBed.createComponent(IconWithLigatureByAttribute);

      const testComponent = fixture.componentInstance;
      const icon = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(icon.getAttribute('fontIcon')).toBe('home');

      testComponent.iconName = 'house';
      fixture.detectChanges();
      expect(icon.getAttribute('fontIcon')).toBe('house');
    });

    it('should add material-icons and mat-ligature-font class by default', () => {
      const fixture = TestBed.createComponent(IconWithLigatureByAttribute);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'mat-icon',
        'mat-icon-no-color',
        'mat-ligature-font',
        'material-icons',
        'notranslate',
      ]);
    });

    it('should use alternate icon font if set', () => {
      iconRegistry.setDefaultFontSetClass('myfont', 'mat-ligature-font');

      const fixture = TestBed.createComponent(IconWithLigatureByAttribute);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'mat-icon',
        'mat-icon-no-color',
        'mat-ligature-font',
        'myfont',
        'notranslate',
      ]);
    });

    it('should be able to provide multiple alternate icon set classes', () => {
      iconRegistry.setDefaultFontSetClass('myfont', 'mat-ligature-font', 'myfont-48x48');

      let fixture = TestBed.createComponent(IconWithLigatureByAttribute);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'mat-icon',
        'mat-icon-no-color',
        'mat-ligature-font',
        'myfont',
        'myfont-48x48',
        'notranslate',
      ]);
    });
  });

  describe('Icons from URLs', () => {
    it('should register icon URLs by name', fakeAsync(() => {
      iconRegistry.addSvgIcon('fluffy', trustUrl('cat.svg'));
      iconRegistry.addSvgIcon('fido', trustUrl('dog.svg'));
      iconRegistry.addSvgIcon('felix', trustUrl('auth-cat.svg'), {withCredentials: true});

      const fixture = TestBed.createComponent(IconFromSvgName);
      let svgElement: SVGElement;
      let testRequest: TestRequest;
      const testComponent = fixture.componentInstance;
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      http.expectOne('dog.svg').flush(FAKE_SVGS.dog);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'woof');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      http.expectOne('cat.svg').flush(FAKE_SVGS.cat);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'meow');

      // Using an icon from a previously loaded URL should not cause another HTTP request.
      testComponent.iconName = 'fido';
      fixture.detectChanges();
      http.expectNone('dog.svg');
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'woof');

      // Change icon to one that needs credentials during fetch.
      testComponent.iconName = 'felix';
      fixture.detectChanges();
      testRequest = http.expectOne('auth-cat.svg');
      expect(testRequest.request.withCredentials).toBeTrue();
      testRequest.flush(FAKE_SVGS.cat);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'meow');

      // Assert that a registered icon can be looked-up by url.
      iconRegistry.getSvgIconFromUrl(trustUrl('cat.svg')).subscribe(element => {
        verifyPathChildElement(element, 'meow');
      });

      tick();
    }));

    it('should be able to set the viewBox when registering a single SVG icon', fakeAsync(() => {
      iconRegistry.addSvgIcon('fluffy', trustUrl('cat.svg'), {viewBox: '0 0 27 27'});
      iconRegistry.addSvgIcon('fido', trustUrl('dog.svg'), {viewBox: '0 0 43 43'});

      const fixture = TestBed.createComponent(IconFromSvgName);
      let svgElement: SVGElement;
      const testComponent = fixture.componentInstance;
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      http.expectOne('dog.svg').flush(FAKE_SVGS.dog);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      expect(svgElement.getAttribute('viewBox')).toBe('0 0 43 43');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      http.expectOne('cat.svg').flush(FAKE_SVGS.cat);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      expect(svgElement.getAttribute('viewBox')).toBe('0 0 27 27');
    }));

    it('should throw an error when using an untrusted icon url', () => {
      iconRegistry.addSvgIcon('fluffy', 'farm-set-1.svg');

      expect(() => {
        const fixture = TestBed.createComponent(IconFromSvgName);
        fixture.componentInstance.iconName = 'fluffy';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should throw an error when using an untrusted icon set url', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-1.svg');

      expect(() => {
        const fixture = TestBed.createComponent(IconFromSvgName);
        fixture.componentInstance.iconName = 'farm:pig';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should delegate http error logging to the ErrorHandler', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-1.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();
      http.expectOne('farm-set-1.svg').error(new ErrorEvent('Network error'));
      fixture.detectChanges();

      // Called twice once for the HTTP request failing and once for the icon
      // then not being able to be found.
      expect(errorHandler.handleError).toHaveBeenCalledTimes(2);
      expect(errorHandler.handleError.calls.argsFor(0)[0].message).toEqual(
        'Loading icon set URL: farm-set-1.svg failed: Http failure response ' +
          'for farm-set-1.svg: 0 ',
      );
      expect(errorHandler.handleError.calls.argsFor(1)[0].message).toEqual(
        `Error retrieving icon ${testComponent.iconName}! ` +
          'Unable to find icon with the name "pig"',
      );
    });

    it('should delegate an error getting an SVG icon to the ErrorHandler', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-1.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;

      testComponent.iconName = 'farm:DNE';
      fixture.detectChanges();
      http.expectOne('farm-set-1.svg').flush(FAKE_SVGS.farmSet1);
      fixture.detectChanges();

      // The HTTP request succeeded but the icon was not found so we logged.
      expect(errorHandler.handleError).toHaveBeenCalledTimes(1);
      expect(errorHandler.handleError.calls.argsFor(0)[0].message).toEqual(
        `Error retrieving icon ${testComponent.iconName}! ` +
          'Unable to find icon with the name "DNE"',
      );
    });

    it('should extract icon from SVG icon set', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-1.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();
      http.expectOne('farm-set-1.svg').flush(FAKE_SVGS.farmSet1);

      expect(matIconElement.childNodes.length).toBe(1);
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('pig');
      verifyPathChildElement(svgChild, 'oink');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('cow');
      verifyPathChildElement(svgChild, 'moo');
    });

    it('should handle unescape characters in icon names', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-4.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;
      let svgChild: any;

      testComponent.iconName = 'farm:pig with spaces';
      fixture.detectChanges();
      http.expectOne('farm-set-4.svg').flush(FAKE_SVGS.farmSet4);

      expect(matIconElement.childNodes.length).toBe(1);
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('pig');
      verifyPathChildElement(svgChild, 'oink');
    });

    it('should never parse the same icon set multiple times', () => {
      // Normally we avoid spying on private methods like this, but the parsing is a private
      // implementation detail that should not be exposed to the public API. This test, though,
      // is important enough to warrant the brittle-ness that results.
      spyOn(iconRegistry, '_svgElementFromString' as any).and.callThrough();

      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-1.svg'));

      // Requests for icons must be subscribed to in order for requests to be made.
      iconRegistry.getNamedSvgIcon('pig', 'farm').subscribe(() => {});
      iconRegistry.getNamedSvgIcon('cow', 'farm').subscribe(() => {});

      http.expectOne('farm-set-1.svg').flush(FAKE_SVGS.farmSet1);

      // _svgElementFromString is called once for each icon to create an empty SVG element
      // and once to parse the full icon set.
      expect((iconRegistry as any)._svgElementFromString).toHaveBeenCalledTimes(3);
    });

    it('should allow multiple icon sets in a namespace', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-1.svg'));
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-2.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();
      http.expectOne('farm-set-1.svg').flush(FAKE_SVGS.farmSet1);
      http.expectOne('farm-set-2.svg').flush(FAKE_SVGS.farmSet2);

      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];
      // The <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('pig');
      expect(svgChild.getAttribute('id')).toBeFalsy();
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'oink');

      // Change the icon name to one that appears in both icon sets. The icon from the set that
      // was registered last should be used (with id attribute of 'moo moo' instead of 'moo'),
      // and no additional HTTP request should be made.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('cow');
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'moo moo');
    });

    it('should clear the id attribute from the svg node', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-1.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);

      fixture.componentInstance.iconName = 'farm:pig';
      fixture.detectChanges();
      http.expectOne('farm-set-1.svg').flush(FAKE_SVGS.farmSet1);

      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      const svgElement = verifyAndGetSingleSvgChild(matIconElement);

      expect(svgElement.hasAttribute('id')).toBe(false);
    });

    it('should unwrap <symbol> nodes', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-3.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'farm:duck';
      fixture.detectChanges();
      http.expectOne('farm-set-3.svg').flush(FAKE_SVGS.farmSet3);

      const svgElement = verifyAndGetSingleSvgChild(matIconElement);
      const firstChild = svgElement.childNodes[0];

      expect(svgElement.querySelector('symbol')).toBeFalsy();
      expect(svgElement.childNodes.length).toBe(1);
      expect(firstChild.nodeName.toLowerCase()).toBe('path');
      expect((firstChild as HTMLElement).getAttribute('name')).toBe('quack');
    });

    it('should copy over the attributes when unwrapping <symbol> nodes', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-5.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'farm:duck';
      fixture.detectChanges();
      http.expectOne('farm-set-5.svg').flush(FAKE_SVGS.farmSet5);

      const svgElement = verifyAndGetSingleSvgChild(matIconElement);
      expect(svgElement.getAttribute('viewBox')).toBe('0 0 13 37');
      expect(svgElement.getAttribute('id')).toBeFalsy();
      expect(svgElement.querySelector('symbol')).toBeFalsy();
    });

    it('should not wrap <svg> elements in icon sets in another svg tag', () => {
      iconRegistry.addSvgIconSet(trustUrl('arrow-set.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      http.expectOne('arrow-set.svg').flush(FAKE_SVGS.arrows);

      // arrow-set.svg stores its icons as nested <svg> elements, so they should be used
      // directly and not wrapped in an outer <svg> tag like the <g> elements in other sets.
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      verifyPathChildElement(svgElement, 'left');
    });

    it('should return unmodified copies of icons from icon sets', () => {
      iconRegistry.addSvgIconSet(trustUrl('arrow-set.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      http.expectOne('arrow-set.svg').flush(FAKE_SVGS.arrows);
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      verifyPathChildElement(svgElement, 'left');
      // Modify the SVG element by setting a viewBox attribute.
      svgElement.setAttribute('viewBox', '0 0 100 100');

      // Switch to a different icon.
      testComponent.iconName = 'right-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      verifyPathChildElement(svgElement, 'right');

      // Switch back to the first icon. The viewBox attribute should not be present.
      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      verifyPathChildElement(svgElement, 'left');
      expect(svgElement.getAttribute('viewBox')).toBeFalsy();
    });

    it('should not throw when toggling an icon that has a binding in IE11', () => {
      iconRegistry.addSvgIcon('fluffy', trustUrl('cat.svg'));

      const fixture = TestBed.createComponent(IconWithBindingAndNgIf);

      fixture.detectChanges();
      http.expectOne('cat.svg').flush(FAKE_SVGS.cat);

      expect(() => {
        fixture.componentInstance.showIcon = false;
        fixture.detectChanges();

        fixture.componentInstance.showIcon = true;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should be able to configure the viewBox for the icon set', () => {
      iconRegistry.addSvgIconSet(trustUrl('arrow-set.svg'), {viewBox: '0 0 43 43'});

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      http.expectOne('arrow-set.svg').flush(FAKE_SVGS.arrows);
      svgElement = verifyAndGetSingleSvgChild(matIconElement);

      expect(svgElement.getAttribute('viewBox')).toBe('0 0 43 43');
    });

    it('should remove the SVG element from the DOM when the binding is cleared', () => {
      iconRegistry.addSvgIconSet(trustUrl('arrow-set.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);

      const testComponent = fixture.componentInstance;
      const icon = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      http.expectOne('arrow-set.svg').flush(FAKE_SVGS.arrows);

      expect(icon.querySelector('svg')).toBeTruthy();

      testComponent.iconName = undefined;
      fixture.detectChanges();

      expect(icon.querySelector('svg')).toBeFalsy();
    });

    it('should keep non-SVG user content inside the icon element', fakeAsync(() => {
      iconRegistry.addSvgIcon('fido', trustUrl('dog.svg'));

      const fixture = TestBed.createComponent(SvgIconWithUserContent);
      const testComponent = fixture.componentInstance;
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      http.expectOne('dog.svg').flush(FAKE_SVGS.dog);

      const userDiv = iconElement.querySelector('div');

      expect(userDiv).toBeTruthy();
      expect(iconElement.textContent.trim()).toContain('Hello');

      tick();
    }));

    it('should cancel in-progress fetches if the icon changes', fakeAsync(() => {
      // Register an icon that will resolve immediately.
      iconRegistry.addSvgIconLiteral('fluffy', trustHtml(FAKE_SVGS.cat));

      // Register a different icon that takes some time to resolve.
      iconRegistry.addSvgIcon('fido', trustUrl('dog.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      // Assign the slow icon first.
      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();

      // Assign the quick icon while the slow one is still in-flight.
      fixture.componentInstance.iconName = 'fluffy';
      fixture.detectChanges();

      // Expect for the in-flight request to have been cancelled.
      expect(http.expectOne('dog.svg').cancelled).toBe(true);

      // Expect the last icon to have been assigned.
      verifyPathChildElement(verifyAndGetSingleSvgChild(iconElement), 'meow');
    }));

    it('should cancel in-progress fetches if the component is destroyed', fakeAsync(() => {
      iconRegistry.addSvgIcon('fido', trustUrl('dog.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
      fixture.destroy();

      expect(http.expectOne('dog.svg').cancelled).toBe(true);
    }));
  });

  describe('Icons from HTML string', () => {
    it('should register icon HTML strings by name', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral('fluffy', trustHtml(FAKE_SVGS.cat));
      iconRegistry.addSvgIconLiteral('fido', trustHtml(FAKE_SVGS.dog));

      const fixture = TestBed.createComponent(IconFromSvgName);
      let svgElement: SVGElement;
      const testComponent = fixture.componentInstance;
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'woof');

      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'meow');

      // Assert that a registered icon can be looked-up by name.
      iconRegistry.getNamedSvgIcon('fluffy').subscribe(element => {
        verifyPathChildElement(element, 'meow');
      });

      tick();
    }));

    it('should be able to configure the icon viewBox', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral('fluffy', trustHtml(FAKE_SVGS.cat), {viewBox: '0 0 43 43'});
      iconRegistry.addSvgIconLiteral('fido', trustHtml(FAKE_SVGS.dog), {viewBox: '0 0 27 27'});

      const fixture = TestBed.createComponent(IconFromSvgName);
      let svgElement: SVGElement;
      const testComponent = fixture.componentInstance;
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      expect(svgElement.getAttribute('viewBox')).toBe('0 0 27 27');

      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      expect(svgElement.getAttribute('viewBox')).toBe('0 0 43 43');
    }));

    it('should throw an error when using untrusted HTML', () => {
      // Stub out console.warn so we don't pollute our logs with Angular's warnings.
      // Jasmine will tear the spy down at the end of the test.
      spyOn(console, 'warn');

      expect(() => {
        iconRegistry.addSvgIconLiteral('circle', '<svg><circle></svg>');
      }).toThrowError(/was not trusted as safe HTML/);
    });

    it('should extract an icon from SVG icon set', () => {
      iconRegistry.addSvgIconSetLiteralInNamespace('farm', trustHtml(FAKE_SVGS.farmSet1));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();

      expect(matIconElement.childNodes.length).toBe(1);
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];

      // The first <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('pig');
      verifyPathChildElement(svgChild, 'oink');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      svgChild = svgElement.childNodes[0];

      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('cow');
      verifyPathChildElement(svgChild, 'moo');
    });

    it('should allow multiple icon sets in a namespace', () => {
      iconRegistry.addSvgIconSetLiteralInNamespace('farm', trustHtml(FAKE_SVGS.farmSet1));
      iconRegistry.addSvgIconSetLiteralInNamespace('farm', trustHtml(FAKE_SVGS.farmSet2));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();

      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];

      // The <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('pig');
      expect(svgChild.getAttribute('id')).toBeFalsy();
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'oink');

      // Change the icon name to one that appears in both icon sets. The icon from the set that
      // was registered last should be used (with id attribute of 'moo moo' instead of 'moo'),
      // and no additional HTTP request should be made.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      svgChild = svgElement.childNodes[0];

      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('name')).toBe('cow');
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'moo moo');
    });

    it('should return unmodified copies of icons from icon sets', () => {
      iconRegistry.addSvgIconSetLiteral(trustHtml(FAKE_SVGS.arrows));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      verifyPathChildElement(svgElement, 'left');

      // Modify the SVG element by setting a viewBox attribute.
      svgElement.setAttribute('viewBox', '0 0 100 100');

      // Switch to a different icon.
      testComponent.iconName = 'right-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      verifyPathChildElement(svgElement, 'right');

      // Switch back to the first icon. The viewBox attribute should not be present.
      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);
      verifyPathChildElement(svgElement, 'left');
      expect(svgElement.getAttribute('viewBox')).toBeFalsy();
    });

    it('should be able to configure the viewBox for the icon set', () => {
      iconRegistry.addSvgIconSetLiteral(trustHtml(FAKE_SVGS.arrows), {viewBox: '0 0 43 43'});

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: SVGElement;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(matIconElement);

      expect(svgElement.getAttribute('viewBox')).toBe('0 0 43 43');
    });

    it('should prepend the current path to attributes with `url()` references', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral(
        'fido',
        trustHtml(`
        <svg>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>

          <circle cx="170" cy="60" r="50" fill="green" filter="url('#blur')" />
        </svg>
      `),
      );

      const fixture = TestBed.createComponent(IconFromSvgName);
      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
      const circle = fixture.nativeElement.querySelector('mat-icon svg circle');

      // We use a regex to match here, rather than the exact value, because different browsers
      // return different quotes through `getAttribute`, while some even omit the quotes altogether.
      expect(circle.getAttribute('filter')).toMatch(/^url\(['"]?\/\$fake-path#blur['"]?\)$/);

      tick();
    }));

    it('should use latest path when prefixing the `url()` references', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral(
        'fido',
        trustHtml(`
        <svg>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>

          <circle cx="170" cy="60" r="50" fill="green" filter="url('#blur')" />
        </svg>
      `),
      );

      let fixture = TestBed.createComponent(IconFromSvgName);
      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
      let circle = fixture.nativeElement.querySelector('mat-icon svg circle');

      expect(circle.getAttribute('filter')).toMatch(/^url\(['"]?\/\$fake-path#blur['"]?\)$/);
      tick();
      fixture.destroy();

      fakePath = '/$another-fake-path';
      fixture = TestBed.createComponent(IconFromSvgName);
      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
      circle = fixture.nativeElement.querySelector('mat-icon svg circle');

      expect(circle.getAttribute('filter')).toMatch(
        /^url\(['"]?\/\$another-fake-path#blur['"]?\)$/,
      );
      tick();
    }));

    it('should update the `url()` references when the path changes', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral(
        'fido',
        trustHtml(`
        <svg>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>

          <circle cx="170" cy="60" r="50" fill="green" filter="url('#blur')" />
        </svg>
      `),
      );

      const fixture = TestBed.createComponent(IconFromSvgName);
      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
      const circle = fixture.nativeElement.querySelector('mat-icon svg circle');

      // We use a regex to match here, rather than the exact value, because different browsers
      // return different quotes through `getAttribute`, while some even omit the quotes altogether.
      expect(circle.getAttribute('filter')).toMatch(/^url\(['"]?\/\$fake-path#blur['"]?\)$/);
      tick();

      fakePath = '/$different-path';
      fixture.detectChanges();

      expect(circle.getAttribute('filter')).toMatch(/^url\(['"]?\/\$different-path#blur['"]?\)$/);
    }));
  });

  describe('custom fonts', () => {
    it('should apply CSS classes for custom font and icon', () => {
      iconRegistry.registerFontClassAlias('f1', 'font1');
      iconRegistry.registerFontClassAlias('f2');

      const fixture = TestBed.createComponent(IconWithCustomFontCss);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.fontSet = 'f1';
      testComponent.fontIcon = 'house';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'font1',
        'house',
        'mat-icon',
        'mat-icon-no-color',
        'notranslate',
      ]);

      testComponent.fontSet = 'f2';
      testComponent.fontIcon = 'igloo';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'f2',
        'igloo',
        'mat-icon',
        'mat-icon-no-color',
        'notranslate',
      ]);

      testComponent.fontSet = 'f3';
      testComponent.fontIcon = 'tent';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual([
        'f3',
        'mat-icon',
        'mat-icon-no-color',
        'notranslate',
        'tent',
      ]);
    });

    it('should handle values with extraneous spaces being passed in to `fontSet`', () => {
      const fixture = TestBed.createComponent(IconWithCustomFontCss);
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      expect(() => {
        fixture.componentInstance.fontSet = 'font set';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement)).toEqual([
        'font',
        'mat-icon',
        'mat-icon-no-color',
        'notranslate',
      ]);

      expect(() => {
        fixture.componentInstance.fontSet = ' changed';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement)).toEqual([
        'changed',
        'mat-icon',
        'mat-icon-no-color',
        'notranslate',
      ]);
    });

    it('should handle values with extraneous spaces being passed in to `fontIcon`', () => {
      const fixture = TestBed.createComponent(IconWithCustomFontCss);
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      fixture.componentInstance.fontSet = 'f1';

      expect(() => {
        fixture.componentInstance.fontIcon = 'font icon';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement)).toEqual([
        'f1',
        'font',
        'mat-icon',
        'mat-icon-no-color',
        'notranslate',
      ]);

      expect(() => {
        fixture.componentInstance.fontIcon = ' changed';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement)).toEqual([
        'changed',
        'f1',
        'mat-icon',
        'mat-icon-no-color',
        'notranslate',
      ]);
    });
  });

  describe('Icons resolved through a resolver function', () => {
    it('should resolve icons through a resolver function', fakeAsync(() => {
      iconRegistry.addSvgIconResolver(name => {
        if (name === 'fluffy') {
          return trustUrl('cat.svg');
        } else if (name === 'fido') {
          return trustUrl('dog.svg');
        } else if (name === 'felix') {
          return {url: trustUrl('auth-cat.svg'), options: {withCredentials: true}};
        }
        return null;
      });

      const fixture = TestBed.createComponent(IconFromSvgName);
      let svgElement: SVGElement;
      let testRequest: TestRequest;
      const testComponent = fixture.componentInstance;
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      http.expectOne('dog.svg').flush(FAKE_SVGS.dog);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'woof');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      http.expectOne('cat.svg').flush(FAKE_SVGS.cat);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'meow');

      // Using an icon from a previously loaded URL should not cause another HTTP request.
      testComponent.iconName = 'fido';
      fixture.detectChanges();
      http.expectNone('dog.svg');
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'woof');

      // Change icon to one that needs credentials during fetch.
      testComponent.iconName = 'felix';
      fixture.detectChanges();
      testRequest = http.expectOne('auth-cat.svg');
      expect(testRequest.request.withCredentials).toBeTrue();
      testRequest.flush(FAKE_SVGS.cat);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      verifyPathChildElement(svgElement, 'meow');

      // Assert that a registered icon can be looked-up by url.
      iconRegistry.getSvgIconFromUrl(trustUrl('cat.svg')).subscribe(element => {
        verifyPathChildElement(element, 'meow');
      });

      tick();
    }));

    it('should fall back to second resolver if the first one returned null', fakeAsync(() => {
      iconRegistry
        .addSvgIconResolver(() => null)
        .addSvgIconResolver(name => (name === 'fido' ? trustUrl('dog.svg') : null));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
      http.expectOne('dog.svg').flush(FAKE_SVGS.dog);
      verifyPathChildElement(verifyAndGetSingleSvgChild(iconElement), 'woof');
      tick();
    }));

    it('should be able to set the viewBox when resolving an icon with a function', fakeAsync(() => {
      iconRegistry.addSvgIconResolver(name => {
        if (name === 'fluffy') {
          return {url: trustUrl('cat.svg'), options: {viewBox: '0 0 27 27'}};
        } else if (name === 'fido') {
          return {url: trustUrl('dog.svg'), options: {viewBox: '0 0 43 43'}};
        }
        return null;
      });

      const fixture = TestBed.createComponent(IconFromSvgName);
      let svgElement: SVGElement;
      const testComponent = fixture.componentInstance;
      const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      http.expectOne('dog.svg').flush(FAKE_SVGS.dog);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      expect(svgElement.getAttribute('viewBox')).toBe('0 0 43 43');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      http.expectOne('cat.svg').flush(FAKE_SVGS.cat);
      svgElement = verifyAndGetSingleSvgChild(iconElement);
      expect(svgElement.getAttribute('viewBox')).toBe('0 0 27 27');
    }));

    it('should throw an error when the resolver returns an untrusted URL', () => {
      iconRegistry.addSvgIconResolver(() => 'not-trusted.svg');

      expect(() => {
        const fixture = TestBed.createComponent(IconFromSvgName);
        fixture.componentInstance.iconName = 'fluffy';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });
  });

  it('should handle assigning an icon through the setter', fakeAsync(() => {
    iconRegistry.addSvgIconLiteral('fido', trustHtml(FAKE_SVGS.dog));

    const fixture = TestBed.createComponent(BlankIcon);
    fixture.detectChanges();
    let svgElement: SVGElement;
    const testComponent = fixture.componentInstance;
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

    testComponent.icon.svgIcon = 'fido';
    fixture.detectChanges();
    svgElement = verifyAndGetSingleSvgChild(iconElement);
    verifyPathChildElement(svgElement, 'woof');
    tick();
  }));

  /** Marks an SVG icon url as explicitly trusted. */
  function trustUrl(iconUrl: string): SafeResourceUrl {
    return sanitizer.bypassSecurityTrustResourceUrl(iconUrl);
  }

  /** Marks an SVG icon string as explicitly trusted. */
  function trustHtml(iconHtml: string): SafeHtml {
    return sanitizer.bypassSecurityTrustHtml(iconHtml);
  }
});

describe('MatIcon without HttpClientModule', () => {
  let iconRegistry: MatIconRegistry;
  let sanitizer: DomSanitizer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatIconModule],
      declarations: [IconFromSvgName],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MatIconRegistry, DomSanitizer], (mir: MatIconRegistry, ds: DomSanitizer) => {
    iconRegistry = mir;
    sanitizer = ds;
  }));

  it('should throw an error when trying to load a remote icon', () => {
    const expectedError = wrappedErrorMessage(getMatIconNoHttpProviderError());

    expect(() => {
      iconRegistry.addSvgIcon('fido', sanitizer.bypassSecurityTrustResourceUrl('dog.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);

      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
    }).toThrowError(expectedError);
  });
});

describe('MatIcon with default options', () => {
  it('should be able to configure color globally', fakeAsync(() => {
    const fixture = createComponent(IconWithLigature, [
      {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {color: 'accent'}},
    ]);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    fixture.detectChanges();
    expect(iconElement.classList).not.toContain('mat-icon-no-color');
    expect(iconElement.classList).toContain('mat-accent');
  }));

  it('should use passed color rather then color provided', fakeAsync(() => {
    const fixture = createComponent(IconWithColor, [
      {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {color: 'warn'}},
    ]);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    fixture.detectChanges();
    expect(iconElement.classList).not.toContain('mat-warn');
    expect(iconElement.classList).toContain('mat-primary');
  }));

  it('should use default color if no color passed', fakeAsync(() => {
    const fixture = createComponent(IconWithColor, [
      {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {color: 'accent'}},
    ]);
    const component = fixture.componentInstance;
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    component.iconColor = '';
    fixture.detectChanges();
    expect(iconElement.classList).not.toContain('mat-icon-no-color');
    expect(iconElement.classList).not.toContain('mat-primary');
    expect(iconElement.classList).toContain('mat-accent');
  }));

  it('should be able to configure font set globally', fakeAsync(() => {
    const fixture = createComponent(IconWithLigature, [
      {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'custom-font-set'}},
    ]);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    fixture.detectChanges();
    expect(iconElement.classList).toContain('custom-font-set');
  }));

  it('should use passed fontSet rather then default one', fakeAsync(() => {
    const fixture = createComponent(IconWithCustomFontCss, [
      {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'default-font-set'}},
    ]);
    const component = fixture.componentInstance;
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    component.fontSet = 'custom-font-set';
    fixture.detectChanges();
    expect(iconElement.classList).not.toContain('default-font-set');
    expect(iconElement.classList).toContain('custom-font-set');
  }));

  it('should use passed empty fontSet rather then default one', fakeAsync(() => {
    const fixture = createComponent(IconWithCustomFontCss, [
      {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'default-font-set'}},
    ]);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    fixture.detectChanges();
    expect(iconElement.classList).not.toContain('default-font-set');
  }));
});

@Component({template: `<mat-icon>{{iconName}}</mat-icon>`})
class IconWithLigature {
  iconName = '';
}

@Component({template: `<mat-icon [fontIcon]="iconName"></mat-icon>`})
class IconWithLigatureByAttribute {
  iconName = '';
}

@Component({template: `<mat-icon [color]="iconColor">{{iconName}}</mat-icon>`})
class IconWithColor {
  iconName = '';
  iconColor = 'primary';
}

@Component({template: `<mat-icon [fontSet]="fontSet" [fontIcon]="fontIcon"></mat-icon>`})
class IconWithCustomFontCss {
  fontSet = '';
  fontIcon = '';
}

@Component({template: `<mat-icon [svgIcon]="iconName"></mat-icon>`})
class IconFromSvgName {
  iconName: string | undefined = '';
}

@Component({template: '<mat-icon aria-hidden="false">face</mat-icon>'})
class IconWithAriaHiddenFalse {}

@Component({template: `<mat-icon [svgIcon]="iconName" *ngIf="showIcon">{{iconName}}</mat-icon>`})
class IconWithBindingAndNgIf {
  iconName = 'fluffy';
  showIcon = true;
}

@Component({template: `<mat-icon [inline]="inline">{{iconName}}</mat-icon>`})
class InlineIcon {
  inline = false;
}

@Component({template: `<mat-icon [svgIcon]="iconName"><div>Hello</div></mat-icon>`})
class SvgIconWithUserContent {
  iconName: string | undefined = '';
}

@Component({template: '<mat-icon [svgIcon]="iconName">house</mat-icon>'})
class IconWithLigatureAndSvgBinding {
  iconName: string | undefined;
}

@Component({template: `<mat-icon></mat-icon>`})
class BlankIcon {
  @ViewChild(MatIcon) icon: MatIcon;
}
