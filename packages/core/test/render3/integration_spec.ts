/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {Component, Directive, HostBinding} from '../../src/core';
import {TestBed} from '../../testing';

import {getLContext, readPatchedData} from '../../src/render3/context_discovery';
import {CONTEXT, HEADER_OFFSET} from '../../src/render3/interfaces/view';
import {Sanitizer} from '../../src/sanitization/sanitizer';
import {SecurityContext} from '../../src/sanitization/security';

describe('element discovery', () => {
  it('should only monkey-patch immediate child nodes in a component', () => {
    @Component({
      template: '<div><p></p></div>',
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const host = fixture.nativeElement;
    const parent = host.querySelector('div') as any;
    const child = host.querySelector('p') as any;

    expect(readPatchedData(parent)).toBeTruthy();
    expect(readPatchedData(child)).toBeFalsy();
  });

  it('should only monkey-patch immediate child nodes in a sub component', () => {
    @Component({
      selector: 'child-comp',
      template: `
        <div></div>
        <div></div>
        <div></div>
      `,
    })
    class ChildComp {}

    @Component({
      selector: 'parent-comp',
      imports: [ChildComp],
      template: `
        <section>
          <child-comp></child-comp>
        </section>
      `,
    })
    class ParentComp {}

    const fixture = TestBed.createComponent(ParentComp);
    fixture.detectChanges();

    const host = fixture.nativeElement;
    const child = host.querySelector('child-comp') as any;
    expect(readPatchedData(child)).toBeTruthy();

    const [kid1, kid2, kid3] = Array.from(host.querySelectorAll('child-comp > *'));
    expect(readPatchedData(kid1)).toBeTruthy();
    expect(readPatchedData(kid2)).toBeTruthy();
    expect(readPatchedData(kid3)).toBeTruthy();
  });

  it('should only monkey-patch immediate child nodes in an embedded template container', () => {
    @Component({
      selector: 'structured-comp',
      imports: [CommonModule],
      template: `
        <section>
          <ng-container *ngIf="true">
            <div><p></p></div>
            <div></div>
          </ng-container>
        </section>
      `,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const host = fixture.nativeElement;
    const [section, div1, p, div2] = Array.from<HTMLElement>(
      host.querySelectorAll('section, div, p'),
    );

    expect(section.nodeName.toLowerCase()).toBe('section');
    expect(readPatchedData(section)).toBeTruthy();

    expect(div1.nodeName.toLowerCase()).toBe('div');
    expect(readPatchedData(div1)).toBeTruthy();

    expect(p.nodeName.toLowerCase()).toBe('p');
    expect(readPatchedData(p)).toBeFalsy();

    expect(div2.nodeName.toLowerCase()).toBe('div');
    expect(readPatchedData(div2)).toBeTruthy();
  });

  it('should return a context object from a given dom node', () => {
    @Component({
      selector: 'structured-comp',
      template: `
        <section></section>
        <div></div>
      `,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section')!;
    const sectionContext = getLContext(section)!;
    expect(sectionContext.nodeIndex).toEqual(HEADER_OFFSET);
    expect(sectionContext.lView!.length).toBeGreaterThan(HEADER_OFFSET);
    expect(sectionContext.native).toBe(section);

    const div = fixture.nativeElement.querySelector('div')!;
    const divContext = getLContext(div)!;
    expect(divContext.nodeIndex).toEqual(HEADER_OFFSET + 1);
    expect(divContext.lView!.length).toBeGreaterThan(HEADER_OFFSET);
    expect(divContext.native).toBe(div);

    expect(divContext.lView).toBe(sectionContext.lView);
  });

  it('should cache the element context on a element was preemptively monkey-patched', () => {
    @Component({
      selector: 'structured-comp',
      template: `
        <section></section>
      `,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section')! as any;
    const result1 = readPatchedData(section);
    expect(Array.isArray(result1)).toBeTruthy();

    const context = getLContext(section)!;
    const result2 = readPatchedData(section) as any;
    expect(Array.isArray(result2)).toBeFalsy();

    expect(result2).toBe(context);
    expect(result2.lView).toBe(result1);
  });

  it("should cache the element context on an intermediate element that isn't preemptively monkey-patched", () => {
    @Component({
      selector: 'structured-comp',
      template: `
            <section>
              <p></p>
            </section>
          `,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section')! as any;
    expect(readPatchedData(section)).toBeTruthy();

    const p = fixture.nativeElement.querySelector('p')! as any;
    expect(readPatchedData(p)).toBeFalsy();

    const pContext = getLContext(p)!;
    expect(pContext.native).toBe(p);
    expect(readPatchedData(p)).toBe(pContext);
  });

  it('should be able to pull in element context data even if the element is decorated using styling', () => {
    @Component({
      selector: 'structured-comp',
      template: `
            <section></section>
          `,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section')! as any;
    const result1 = readPatchedData(section) as any;
    expect(Array.isArray(result1)).toBeTruthy();

    const elementResult = result1[HEADER_OFFSET]; // first element
    expect(elementResult).toBe(section);

    const context = getLContext(section)!;
    const result2 = readPatchedData(section);
    expect(Array.isArray(result2)).toBeFalsy();

    expect(context.native).toBe(section);
  });

  it('should monkey-patch immediate child nodes in a content-projected region with a reference to the parent component', () => {
    /*
         <!-- DOM view -->
         <section>
           <projection-comp>
             welcome
             <header>
               <h1>
                 <p>this content is projected</p>
                 this content is projected also
               </h1>
             </header>
           </projection-comp>
         </section>
       */
    @Component({
      selector: 'projector-comp',
      template: `
            welcome
            <header>
              <h1>
                <ng-content></ng-content>
              </h1>
            </header>
          `,
    })
    class ProjectorComp {}

    @Component({
      selector: 'parent-comp',
      imports: [ProjectorComp],
      template: `
            <section>
              <projector-comp>
                <p>this content is projected</p>
                this content is projected also
              </projector-comp>
            </section>
          `,
    })
    class ParentComp {}

    const fixture = TestBed.createComponent(ParentComp);
    fixture.detectChanges();

    const host = fixture.nativeElement;
    const textNode = host.firstChild as any;
    const section = host.querySelector('section')! as any;
    const projectorComp = host.querySelector('projector-comp')! as any;
    const header = host.querySelector('header')! as any;
    const h1 = host.querySelector('h1')! as any;
    const p = host.querySelector('p')! as any;
    const pText = p.firstChild as any;
    const projectedTextNode = p.nextSibling;

    expect(projectorComp.children).toContain(header);
    expect(h1.children).toContain(p);

    expect(readPatchedData(textNode)).toBeTruthy();
    expect(readPatchedData(section)).toBeTruthy();
    expect(readPatchedData(projectorComp)).toBeTruthy();
    expect(readPatchedData(header)).toBeTruthy();
    expect(readPatchedData(h1)).toBeFalsy();
    expect(readPatchedData(p)).toBeTruthy();
    expect(readPatchedData(pText)).toBeFalsy();
    expect(readPatchedData(projectedTextNode)).toBeTruthy();

    const parentContext = getLContext(section)!;
    const shadowContext = getLContext(header)!;
    const projectedContext = getLContext(p)!;

    const parentComponentData = parentContext.lView;
    const shadowComponentData = shadowContext.lView;
    const projectedComponentData = projectedContext.lView;

    expect(projectedComponentData).toBe(parentComponentData);
    expect(shadowComponentData).not.toBe(parentComponentData);
  });

  it("should return `null` when an element context is retrieved that isn't situated in Angular", () => {
    const elm1 = document.createElement('div');
    const context1 = getLContext(elm1);
    expect(context1).toBeFalsy();

    const elm2 = document.createElement('div');
    document.body.appendChild(elm2);
    const context2 = getLContext(elm2);
    expect(context2).toBeFalsy();
  });

  it('should return `null` when an element context is retrieved that is a DOM node that was not created by Angular', () => {
    @Component({
      selector: 'structured-comp',
      template: `
             <section></section>
           `,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('section')! as any;
    const manuallyCreatedElement = document.createElement('div');
    section.appendChild(manuallyCreatedElement);

    const context = getLContext(manuallyCreatedElement);
    expect(context).toBeFalsy();
  });

  it('should by default monkey-patch the bootstrap component with context details', () => {
    @Component({
      selector: 'structured-comp',
      template: ``,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const hostElm = fixture.nativeElement;
    const component = fixture.componentInstance;

    const componentLView = readPatchedData(component);
    expect(Array.isArray(componentLView)).toBeTruthy();

    const hostLView = readPatchedData(hostElm) as any;
    expect(hostLView).toBe(componentLView);

    const context1 = getLContext(hostElm)!;
    expect(context1.lView).toBe(hostLView);
    expect(context1.native).toEqual(hostElm);

    const context2 = getLContext(component)!;
    expect(context2).toBe(context1);
    expect(context2.lView).toBe(hostLView);
    expect(context2.native).toEqual(hostElm);
  });

  it('should by default monkey-patch the directives with LView so that they can be examined', () => {
    let myDir1Instance: MyDir1 | null = null;
    let myDir2Instance: MyDir2 | null = null;
    let myDir3Instance: MyDir2 | null = null;

    @Directive({
      selector: '[my-dir-1]',
    })
    class MyDir1 {
      constructor() {
        myDir1Instance = this;
      }
    }

    @Directive({
      selector: '[my-dir-2]',
    })
    class MyDir2 {
      constructor() {
        myDir2Instance = this;
      }
    }

    @Directive({
      selector: '[my-dir-3]',
    })
    class MyDir3 {
      constructor() {
        myDir3Instance = this;
      }
    }

    @Component({
      selector: 'structured-comp',
      imports: [MyDir1, MyDir2, MyDir3],
      template: `
            <div my-dir-1 my-dir-2></div>
            <div my-dir-3></div>
          `,
    })
    class StructuredComp {}

    const fixture = TestBed.createComponent(StructuredComp);
    fixture.detectChanges();

    const hostElm = fixture.nativeElement;
    const div1 = hostElm.querySelector('div:first-child')! as any;
    const div2 = hostElm.querySelector('div:last-child')! as any;
    const context = getLContext(hostElm)!;
    const componentView = context.lView![context.nodeIndex];

    expect(componentView).toContain(myDir1Instance);
    expect(componentView).toContain(myDir2Instance);
    expect(componentView).toContain(myDir3Instance);

    expect(Array.isArray(readPatchedData(myDir1Instance))).toBeTruthy();
    expect(Array.isArray(readPatchedData(myDir2Instance))).toBeTruthy();
    expect(Array.isArray(readPatchedData(myDir3Instance))).toBeTruthy();

    const d1Context = getLContext(myDir1Instance)!;
    const d2Context = getLContext(myDir2Instance)!;
    const d3Context = getLContext(myDir3Instance)!;

    expect(d1Context.lView).toEqual(componentView);
    expect(d2Context.lView).toEqual(componentView);
    expect(d3Context.lView).toEqual(componentView);

    expect(readPatchedData(myDir1Instance)).toBe(d1Context);
    expect(readPatchedData(myDir2Instance)).toBe(d2Context);
    expect(readPatchedData(myDir3Instance)).toBe(d3Context);

    expect(d1Context.nodeIndex).toEqual(HEADER_OFFSET);
    expect(d1Context.native).toBe(div1);
    expect(d1Context.directives as any[]).toEqual([myDir1Instance, myDir2Instance]);

    expect(d2Context.nodeIndex).toEqual(HEADER_OFFSET);
    expect(d2Context.native).toBe(div1);
    expect(d2Context.directives as any[]).toEqual([myDir1Instance, myDir2Instance]);

    expect(d3Context.nodeIndex).toEqual(HEADER_OFFSET + 1);
    expect(d3Context.native).toBe(div2);
    expect(d3Context.directives as any[]).toEqual([myDir3Instance]);
  });

  it('should monkey-patch the exact same context instance of the DOM node, component and any directives on the same element', () => {
    let myDir1Instance: MyDir1 | null = null;
    let myDir2Instance: MyDir2 | null = null;
    let childComponentInstance: ChildComp | null = null;

    @Directive({
      selector: '[my-dir-1]',
    })
    class MyDir1 {
      constructor() {
        myDir1Instance = this;
      }
    }

    @Directive({
      selector: '[my-dir-2]',
    })
    class MyDir2 {
      constructor() {
        myDir2Instance = this;
      }
    }

    @Component({
      selector: 'child-comp',
      template: `
             <div></div>
           `,
    })
    class ChildComp {
      constructor() {
        childComponentInstance = this;
      }
    }

    @Component({
      selector: 'parent-comp',
      imports: [ChildComp, MyDir1, MyDir2],
      template: `
             <child-comp my-dir-1 my-dir-2></child-comp>
           `,
    })
    class ParentComp {}

    const fixture = TestBed.createComponent(ParentComp);
    fixture.detectChanges();

    const childCompHostElm = fixture.nativeElement.querySelector('child-comp')! as any;

    const lView = readPatchedData(childCompHostElm);
    expect(Array.isArray(lView)).toBeTruthy();
    expect(readPatchedData(myDir1Instance)).toBe(lView);
    expect(readPatchedData(myDir2Instance)).toBe(lView);
    expect(readPatchedData(childComponentInstance)).toBe(lView);

    const childNodeContext = getLContext(childCompHostElm)!;
    expect(childNodeContext.component).toBeFalsy();
    expect(childNodeContext.directives).toBeFalsy();
    assertMonkeyPatchValueIsLView(myDir1Instance);
    assertMonkeyPatchValueIsLView(myDir2Instance);
    assertMonkeyPatchValueIsLView(childComponentInstance);

    expect(getLContext(myDir1Instance)).toBe(childNodeContext);
    expect(childNodeContext.component).toBeFalsy();
    expect(childNodeContext.directives!.length).toEqual(2);
    assertMonkeyPatchValueIsLView(myDir1Instance, false);
    assertMonkeyPatchValueIsLView(myDir2Instance, false);
    assertMonkeyPatchValueIsLView(childComponentInstance);

    expect(getLContext(myDir2Instance)).toBe(childNodeContext);
    expect(childNodeContext.component).toBeFalsy();
    expect(childNodeContext.directives!.length).toEqual(2);
    assertMonkeyPatchValueIsLView(myDir1Instance, false);
    assertMonkeyPatchValueIsLView(myDir2Instance, false);
    assertMonkeyPatchValueIsLView(childComponentInstance);

    expect(getLContext(childComponentInstance)).toBe(childNodeContext);
    expect(childNodeContext.component).toBeTruthy();
    expect(childNodeContext.directives!.length).toEqual(2);
    assertMonkeyPatchValueIsLView(myDir1Instance, false);
    assertMonkeyPatchValueIsLView(myDir2Instance, false);
    assertMonkeyPatchValueIsLView(childComponentInstance, false);

    function assertMonkeyPatchValueIsLView(value: any, yesOrNo = true) {
      expect(Array.isArray(readPatchedData(value))).toBe(yesOrNo);
    }
  });

  it('should monkey-patch sub components with the view data and then replace them with the context result once a lookup occurs', () => {
    @Component({
      selector: 'child-comp',
      template: `
            <div></div>
            <div></div>
            <div></div>
          `,
    })
    class ChildComp {}

    @Component({
      selector: 'parent-comp',
      imports: [ChildComp],
      template: `
            <section>
              <child-comp></child-comp>
            </section>
          `,
    })
    class ParentComp {}

    const fixture = TestBed.createComponent(ParentComp);
    fixture.detectChanges();

    const host = fixture.nativeElement;
    const child = host.querySelector('child-comp') as any;
    expect(readPatchedData(child)).toBeTruthy();

    const context = getLContext(child)!;
    expect(readPatchedData(child)).toBeTruthy();

    const componentData = context.lView![context.nodeIndex];
    const component = componentData[CONTEXT];
    expect(component instanceof ChildComp).toBeTruthy();
    expect(readPatchedData(component)).toBe(context.lView);

    const componentContext = getLContext(component)!;
    expect(readPatchedData(component)).toBe(componentContext);
    expect(componentContext.nodeIndex).toEqual(context.nodeIndex);
    expect(componentContext.native).toEqual(context.native);
    expect(componentContext.lView).toEqual(context.lView);
  });
});

describe('sanitization', () => {
  it('should sanitize data using the provided sanitization interface', () => {
    @Component({
      selector: 'sanitize-this',
      template: `
        <a [href]="href"></a>
      `,
    })
    class SanitizationComp {
      href = '';

      updateLink(href: any) {
        this.href = href;
      }
    }

    const sanitizer = new LocalSanitizer((value) => {
      return 'http://bar';
    });

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Sanitizer,
          useValue: sanitizer,
        },
      ],
    });
    const fixture = TestBed.createComponent(SanitizationComp);
    fixture.componentInstance.updateLink('http://foo');
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('a')!;
    expect(anchor.getAttribute('href')).toEqual('http://bar');

    fixture.componentInstance.updateLink(sanitizer.bypassSecurityTrustUrl('http://foo'));
    fixture.detectChanges();

    expect(anchor.getAttribute('href')).toEqual('http://foo');
  });

  it('should sanitize HostBindings data using provided sanitization interface', () => {
    let hostBindingDir: UnsafeUrlHostBindingDir;

    @Directive({
      selector: '[unsafeUrlHostBindingDir]',
    })
    class UnsafeUrlHostBindingDir {
      @HostBinding() cite: any = 'http://cite-dir-value';

      constructor() {
        hostBindingDir = this;
      }
    }

    @Component({
      selector: 'sanitize-this',
      imports: [UnsafeUrlHostBindingDir],
      template: `
        <blockquote unsafeUrlHostBindingDir></blockquote>
      `,
    })
    class SimpleComp {}

    const sanitizer = new LocalSanitizer((value) => 'http://bar');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Sanitizer,
          useValue: sanitizer,
        },
      ],
    });
    const fixture = TestBed.createComponent(SimpleComp);
    hostBindingDir!.cite = 'http://foo';
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('blockquote')!;
    expect(anchor.getAttribute('cite')).toEqual('http://bar');

    hostBindingDir!.cite = sanitizer.bypassSecurityTrustUrl('http://foo');
    fixture.detectChanges();

    expect(anchor.getAttribute('cite')).toEqual('http://foo');
  });
});

class LocalSanitizedValue {
  constructor(public value: any) {}
  toString() {
    return this.value;
  }
}

class LocalSanitizer implements Sanitizer {
  constructor(private _interceptor: (value: string | null | any) => string) {}

  sanitize(context: SecurityContext, value: LocalSanitizedValue | string | null): string | null {
    if (value instanceof LocalSanitizedValue) {
      return value.toString();
    }
    return this._interceptor(value);
  }

  bypassSecurityTrustHtml(value: string) {}
  bypassSecurityTrustStyle(value: string) {}
  bypassSecurityTrustScript(value: string) {}
  bypassSecurityTrustResourceUrl(value: string) {}

  bypassSecurityTrustUrl(value: string) {
    return new LocalSanitizedValue(value);
  }
}
