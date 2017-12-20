import {inject, async, fakeAsync, tick, TestBed} from '@angular/core/testing';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Component} from '@angular/core';
import {MatIconModule} from './index';
import {MatIconRegistry, getMatIconNoHttpProviderError} from './icon-registry';
import {FAKE_SVGS} from './fake-svgs';
import {wrappedErrorMessage} from '@angular/cdk/testing';


/** Returns the CSS classes assigned to an element as a sorted array. */
function sortedClassNames(element: Element): string[] {
  return element.className.split(' ').sort();
}

/**
 * Verifies that an element contains a single <svg> child element, and returns that child.
 */
function verifyAndGetSingleSvgChild(element: SVGElement): SVGElement {
  expect(element.id).toBeFalsy();
  expect(element.childNodes.length).toBe(1);
  const svgChild = element.childNodes[0] as SVGElement;
  expect(svgChild.tagName.toLowerCase()).toBe('svg');
  return svgChild;
}

/**
 * Verifies that an element contains a single <path> child element whose "id" attribute has
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatIconModule],
      declarations: [
        IconWithColor,
        IconWithLigature,
        IconWithCustomFontCss,
        IconFromSvgName,
        IconWithAriaHiddenFalse,
        IconWithBindingAndNgIf,
      ]
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

  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(IconWithColor);

    const testComponent = fixture.componentInstance;
    const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
    testComponent.iconName = 'home';
    testComponent.iconColor = 'primary';
    fixture.detectChanges();
    expect(sortedClassNames(matIconElement)).toEqual(['mat-icon', 'mat-primary', 'material-icons']);
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

  describe('Ligature icons', () => {
    it('should add material-icons class by default', () => {
      let fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual(['mat-icon', 'material-icons']);
    });

    it('should use alternate icon font if set', () => {
      iconRegistry.setDefaultFontSetClass('myfont');

      let fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual(['mat-icon', 'myfont']);
    });
  });

  describe('Icons from URLs', () => {
    it('should register icon URLs by name', fakeAsync(() => {
      iconRegistry.addSvgIcon('fluffy', trust('cat.svg'));
      iconRegistry.addSvgIcon('fido', trust('dog.svg'));

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
      iconRegistry.getSvgIconFromUrl(trust('cat.svg')).subscribe(element => {
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
      iconRegistry.addSvgIconSetInNamespace('farm', trust('farm-set-1.svg'));

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

    it('should allow multiple icon sets in a namespace', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trust('farm-set-1.svg'));
      iconRegistry.addSvgIconSetInNamespace('farm', trust('farm-set-2.svg'));

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
      expect(svgChild.getAttribute('id')).toBe('');
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

    it('should unwrap <symbol> nodes', () => {
      iconRegistry.addSvgIconSetInNamespace('farm', trust('farm-set-3.svg'));

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
      iconRegistry.addSvgIconSet(trust('arrow-set.svg'));

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
      iconRegistry.addSvgIconSet(trust('arrow-set.svg'));

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
      iconRegistry.addSvgIcon('fluffy', trust('cat.svg'));

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
      iconRegistry.addSvgIconSet(trust('arrow-set.svg'));

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

  });

  describe('custom fonts', () => {
    it('should apply CSS classes for custom font and icon', () => {
      iconRegistry.registerFontClassAlias('f1', 'font1');
      iconRegistry.registerFontClassAlias('f2');

      let fixture = TestBed.createComponent(IconWithCustomFontCss);

      const testComponent = fixture.componentInstance;
      const matIconElement = fixture.debugElement.nativeElement.querySelector('mat-icon');
      testComponent.fontSet = 'f1';
      testComponent.fontIcon = 'house';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual(['font1', 'house', 'mat-icon']);

      testComponent.fontSet = 'f2';
      testComponent.fontIcon = 'igloo';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual(['f2', 'igloo', 'mat-icon']);

      testComponent.fontSet = 'f3';
      testComponent.fontIcon = 'tent';
      fixture.detectChanges();
      expect(sortedClassNames(matIconElement)).toEqual(['f3', 'mat-icon', 'tent']);
    });
  });

  /** Marks an svg icon url as explicitly trusted. */
  function trust(iconUrl: string): SafeResourceUrl {
    return sanitizer.bypassSecurityTrustResourceUrl(iconUrl);
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
class IconWithAriaHiddenFalse { }

@Component({template: `<mat-icon [svgIcon]="iconName" *ngIf="showIcon">{{iconName}}</mat-icon>`})
class IconWithBindingAndNgIf {
  iconName = 'fluffy';
  showIcon = true;
}
