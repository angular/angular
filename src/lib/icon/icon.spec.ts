import {inject, async, fakeAsync, tick, TestBed} from '@angular/core/testing';
import {SafeResourceUrl, DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Component} from '@angular/core';
import {MatIconModule, MAT_ICON_LOCATION} from './index';
import {MatIconRegistry, getMatIconNoHttpProviderError} from './icon-registry';
import {FAKE_SVGS} from './fake-svgs';
import {wrappedErrorMessage} from '@angular/cdk/testing';


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


describe('MatIcon', () => {
  let fakePath: string;

  beforeEach(async(() => {
    // The $ prefix tells Karma not to try to process the
    // request so that we don't get warnings in our logs.
    fakePath = '/$fake-path';

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatIconModule],
      declarations: [
        IconWithColor,
        IconWithLigature,
        IconWithCustomFontCss,
        IconFromSvgName,
        IconWithAriaHiddenFalse,
        IconWithBindingAndNgIf,
        InlineIcon,
        SvgIconWithUserContent,
      ],
      providers: [{
        provide: MAT_ICON_LOCATION,
        useValue: {getPathname: () => fakePath}
      }]
    });

    TestBed.compileComponents();
  }));

  let iconRegistry: MatIconRegistry;
  let http: HttpTestingController;
  let sanitizer: DomSanitizer;

  beforeEach(inject([MatIconRegistry, HttpTestingController, DomSanitizer],
    (mir: MatIconRegistry, h: HttpTestingController, ds: DomSanitizer) => {
      iconRegistry = mir;
      http = h;
      sanitizer = ds;
    }));

  it('should include notranslate class by default', () => {
    let fixture = TestBed.createComponent(IconWithColor);

    const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(matIconElement.classList.contains('notranslate'))
      .toBeTruthy('Expected the mat-icon element to include the notranslate class');
  });

  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(IconWithColor);

    const testComponent = fixture.componentInstance;
    const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    testComponent.iconName = 'home';
    testComponent.iconColor = 'primary';
    fixture.detectChanges();
    expect(sortedClassNames(matIconElement))
        .toEqual(['mat-icon', 'mat-primary', 'material-icons', 'notranslate']);
  });

  it('should apply a class if there is no color', () => {
    let fixture = TestBed.createComponent(IconWithColor);

    const testComponent = fixture.componentInstance;
    const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    testComponent.iconName = 'home';
    testComponent.iconColor = '';
    fixture.detectChanges();

    expect(sortedClassNames(matIconElement))
        .toEqual(['mat-icon', 'mat-icon-no-color', 'material-icons', 'notranslate']);
  });

  it('should mark mat-icon as aria-hidden by default', () => {
    const fixture = TestBed.createComponent(IconWithLigature);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(iconElement.getAttribute('aria-hidden'))
      .toBe('true', 'Expected the mat-icon element has aria-hidden="true" by default');
  });

  it('should not override a user-provided aria-hidden attribute', () => {
    const fixture = TestBed.createComponent(IconWithAriaHiddenFalse);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(iconElement.getAttribute('aria-hidden'))
      .toBe('false', 'Expected the mat-icon element has the user-provided aria-hidden value');
  });

  it('should apply inline styling', () => {
    const fixture = TestBed.createComponent(InlineIcon);
    const iconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    expect(iconElement.classList.contains('mat-icon-inline'))
      .toBeFalsy('Expected the mat-icon element to not include the inline styling class');

    fixture.debugElement.componentInstance.inline = true;
    fixture.detectChanges();
    expect(iconElement.classList.contains('mat-icon-inline'))
      .toBeTruthy('Expected the mat-icon element to include the inline styling class');
  });

  describe('Ligature icons', () => {
    it('should add material-icons class by default', () => {
      let fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement))
          .toEqual(['mat-icon', 'mat-icon-no-color', 'material-icons', 'notranslate']);
    });

    it('should use alternate icon font if set', () => {
      iconRegistry.setDefaultFontSetClass('myfont');

      let fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement))
          .toEqual(['mat-icon', 'mat-icon-no-color', 'myfont', 'notranslate']);
    });
  });

  describe('Icons from URLs', () => {
    it('should register icon URLs by name', fakeAsync(() => {
      iconRegistry.addSvgIcon('fluffy', trustUrl('cat.svg'));
      iconRegistry.addSvgIcon('fido', trustUrl('dog.svg'));

      let fixture = TestBed.createComponent(IconFromSvgName);
      let svgElement: SVGElement;
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

      // Assert that a registered icon can be looked-up by url.
      iconRegistry.getSvgIconFromUrl(trustUrl('cat.svg')).subscribe(element => {
        verifyPathChildElement(element, 'meow');
      });

      tick();
    }));

    it('should throw an error when using an untrusted icon url', () => {
      iconRegistry.addSvgIcon('fluffy', 'farm-set-1.svg');

      expect(() => {
        let fixture = TestBed.createComponent(IconFromSvgName);
        fixture.componentInstance.iconName = 'fluffy';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should throw an error when using an untrusted icon set url', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-1.svg');

      expect(() => {
        let fixture = TestBed.createComponent(IconFromSvgName);
        fixture.componentInstance.iconName = 'farm:pig';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should extract icon from SVG icon set', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trustUrl('farm-set-1.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: any;
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
      let svgElement: any;
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

    it('should not wrap <svg> elements in icon sets in another svg tag', () => {
      iconRegistry.addSvgIconSet(trustUrl('arrow-set.svg'));

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      let svgElement: any;

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
      let svgElement: any;

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

    it('should remove the SVG element from the DOM when the binding is cleared', () => {
      iconRegistry.addSvgIconSet(trustUrl('arrow-set.svg'));

      let fixture = TestBed.createComponent(IconFromSvgName);

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

  });

  describe('Icons from HTML string', () => {
    it('should register icon HTML strings by name', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral('fluffy', trustHtml(FAKE_SVGS.cat));
      iconRegistry.addSvgIconLiteral('fido', trustHtml(FAKE_SVGS.dog));

      let fixture = TestBed.createComponent(IconFromSvgName);
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
      let svgElement: any;
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
      let svgElement: any;
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
      let svgElement: any;

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

    it('should add an extra string to the end of `style` tags inside SVG', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral('fido', trustHtml(`
        <svg>
          <style>#woof {color: blue;}</style>
          <path id="woof" name="woof"></path>
        </svg>
      `));

      const fixture = TestBed.createComponent(IconFromSvgName);
      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
      const styleTag = fixture.nativeElement.querySelector('mat-icon svg style');

      // Note the extra whitespace at the end which is what we're testing for. This is a
      // workaround for IE and Edge ignoring `style` tags in dynamically-created SVGs.
      expect(styleTag.textContent).toBe('#woof {color: blue;} ');

      tick();
    }));

    it('should prepend the current path to attributes with `url()` references', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral('fido', trustHtml(`
        <svg>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>

          <circle cx="170" cy="60" r="50" fill="green" filter="url('#blur')" />
        </svg>
      `));

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
      iconRegistry.addSvgIconLiteral('fido', trustHtml(`
        <svg>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>

          <circle cx="170" cy="60" r="50" fill="green" filter="url('#blur')" />
        </svg>
      `));

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

      expect(circle.getAttribute('filter'))
          .toMatch(/^url\(['"]?\/\$another-fake-path#blur['"]?\)$/);
      tick();
    }));

    it('should update the `url()` references when the path changes', fakeAsync(() => {
      iconRegistry.addSvgIconLiteral('fido', trustHtml(`
        <svg>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>

          <circle cx="170" cy="60" r="50" fill="green" filter="url('#blur')" />
        </svg>
      `));

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
      expect(sortedClassNames(matIconElement))
          .toEqual(['font1', 'house', 'mat-icon', 'mat-icon-no-color', 'notranslate']);

      testComponent.fontSet = 'f2';
      testComponent.fontIcon = 'igloo';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement))
          .toEqual(['f2', 'igloo', 'mat-icon', 'mat-icon-no-color', 'notranslate']);

      testComponent.fontSet = 'f3';
      testComponent.fontIcon = 'tent';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement))
          .toEqual(['f3', 'mat-icon', 'mat-icon-no-color', 'notranslate', 'tent']);
    });

    it('should handle values with extraneous spaces being passed in to `fontSet`', () => {
      const fixture = TestBed.createComponent(IconWithCustomFontCss);
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      expect(() => {
        fixture.componentInstance.fontSet = 'font set';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement))
          .toEqual(['font', 'mat-icon', 'mat-icon-no-color', 'notranslate']);

      expect(() => {
        fixture.componentInstance.fontSet = ' changed';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement))
          .toEqual(['changed', 'mat-icon', 'mat-icon-no-color', 'notranslate']);
    });

    it('should handle values with extraneous spaces being passed in to `fontIcon`', () => {
      const fixture = TestBed.createComponent(IconWithCustomFontCss);
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');

      expect(() => {
        fixture.componentInstance.fontIcon = 'font icon';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement))
        .toEqual(['font', 'mat-icon', 'mat-icon-no-color', 'material-icons', 'notranslate']);

      expect(() => {
        fixture.componentInstance.fontIcon = ' changed';
        fixture.detectChanges();
      }).not.toThrow();

      expect(sortedClassNames(matIconElement))
        .toEqual(['changed', 'mat-icon', 'mat-icon-no-color', 'material-icons', 'notranslate']);
    });

  });

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

  beforeEach(async(() => {
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

  it('should throw an error when trying to load a remote icon', async() => {
    const expectedError = wrappedErrorMessage(getMatIconNoHttpProviderError());

    expect(() => {
      iconRegistry.addSvgIcon('fido', sanitizer.bypassSecurityTrustResourceUrl('dog.svg'));

      let fixture = TestBed.createComponent(IconFromSvgName);

      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
    }).toThrowError(expectedError);
  });
});


@Component({template: `<mat-icon>{{iconName}}</mat-icon>`})
class IconWithLigature {
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
