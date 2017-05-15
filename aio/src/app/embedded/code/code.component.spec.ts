/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';
import { MdSnackBarModule, MdSnackBar } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CodeComponent } from './code.component';
import { CopierService } from 'app/shared//copier.service';
import { Logger } from 'app/shared/logger.service';
import { PrettyPrinter } from './pretty-printer.service';

const oneLineCode = 'const foo = "bar";';

const smallMultiLineCode = `
&lt;hero-details&gt;
  &lt;h2&gt;Bah Dah Bing&lt;/h2&gt;
  &lt;hero-team&gt;
    &lt;h3&gt;NYC Team&lt;/h3&gt;
  &lt;/hero-team&gt;
&lt;/hero-details&gt;`;

const bigMultiLineCode = smallMultiLineCode + smallMultiLineCode + smallMultiLineCode;

describe('CodeComponent', () => {
  let codeComponentDe: DebugElement;
  let codeComponent: CodeComponent;
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;


  // WARNING: Chance of cross-test pollution
  // CodeComponent injects PrettyPrintService
  // Once PrettyPrintService runs once _anywhere_, its ctor loads `prettify.js`
  // which sets `window['prettyPrintOne']`
  // That global survives these tests unless
  // we take strict measures to wipe it out in the `afterAll`
  // and make sure THAT runs after the tests by making component creation async
  afterAll(() => {
    delete window['prettyPrint'];
    delete window['prettyPrintOne'];
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ MdSnackBarModule, NoopAnimationsModule ],
      declarations: [ CodeComponent, HostComponent ],
      providers: [
        PrettyPrinter,
        CopierService,
        {provide: Logger, useClass: TestLogger }
     ]
    });
  });

  // Must be async because
  // CodeComponent creates PrettyPrintService which async loads `prettify.js`.
  // If not async, `afterAll` finishes before tests do!
  beforeEach(async(() => {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    codeComponentDe = fixture.debugElement.children[0];
    codeComponent = codeComponentDe.componentInstance;
    fixture.detectChanges();
  }));

  it('should create CodeComponent', () => {
    expect(codeComponentDe.name).toBe('aio-code', 'selector');
    expect(codeComponent).toBeTruthy('CodeComponent');
  });

  describe('pretty printing', () => {
    it('should format a one-line code sample', () => {
      // 'pln' spans are a tell-tale for syntax highlighing
      const spans = codeComponentDe.nativeElement.querySelectorAll('span.pln');
      expect(spans.length).toBeGreaterThan(0, 'formatted spans');
    });

    function hasLineNumbers() {
      // presence of `<li>`s are a tell-tale for line numbers
      return 0 < codeComponentDe.nativeElement.querySelectorAll('li').length;
    }

    it('should format a one-line code sample without linenums by default', () => {
      expect(hasLineNumbers()).toBe(false);
    });

    it('should add line numbers to one-line code sample when linenums set true', () => {
      hostComponent.linenums = 'true';
      fixture.detectChanges();
      expect(hasLineNumbers()).toBe(true);
    });

    it('should format a small multi-line code without linenums by default', () => {
      hostComponent.code = smallMultiLineCode;
      fixture.detectChanges();
      expect(hasLineNumbers()).toBe(false);
    });

    it('should add line numbers to a big multi-line code by default', () => {
      hostComponent.code = bigMultiLineCode;
      fixture.detectChanges();
      expect(hasLineNumbers()).toBe(true);
    });

    it('should format big multi-line code without linenums when linenums set false', () => {
      hostComponent.linenums = false;
      hostComponent.code = bigMultiLineCode;
      fixture.detectChanges();
      expect(hasLineNumbers()).toBe(false);
    });
  });

  describe('whitespace handling', () => {
    it('should remove common indentation from the code before rendering', () => {
      hostComponent.linenums = false;
      hostComponent.code = '  abc\n   let x = text.split(\'\\n\');\n  ghi\n\n  jkl\n';
      fixture.detectChanges();
      const codeContent = codeComponentDe.nativeElement.querySelector('code').innerText;
      expect(codeContent).toEqual('abc\n let x = text.split(\'\\n\');\nghi\n\njkl');
    });

    it('should trim whitespace from the code before rendering', () => {
      hostComponent.linenums = false;
      hostComponent.code = '\n\n\n' + smallMultiLineCode + '\n\n\n';
      fixture.detectChanges();
      const codeContent = codeComponentDe.nativeElement.querySelector('code').innerText;
      expect(codeContent).toEqual(codeContent.trim());
    });

    it('should trim whitespace from code before computing whether to format linenums', () => {
      hostComponent.code = '\n\n\n' + hostComponent.code + '\n\n\n';
      fixture.detectChanges();
      // `<li>`s are a tell-tale for line numbers
      const lis = codeComponentDe.nativeElement.querySelectorAll('li');
      expect(lis.length).toBe(0, 'should be no linenums');
    });
  });

  describe('error message', () => {

    function getErrorMessage() {
      const missing: HTMLElement = codeComponentDe.nativeElement.querySelector('.code-missing');
      return missing ? missing.innerText : null;
    }

    it('should not display "code-missing" class when there is some code', () => {
      fixture.detectChanges();
      expect(getErrorMessage()).toBeNull('should not have element with "code-missing" class');
    });

    it('should display error message when there is no code (after trimming)', () => {
      hostComponent.code = ' \n ';
      fixture.detectChanges();
      expect(getErrorMessage()).toContain('missing');
    });

    it('should show path and region in missing-code error message', () => {
      hostComponent.code = ' \n ';
      hostComponent.path = 'fizz/buzz/foo.html';
      hostComponent.region = 'something';
      fixture.detectChanges();
      expect(getErrorMessage()).toMatch(/for[\s\S]fizz\/buzz\/foo\.html#something$/);
    });

    it('should show path only in missing-code error message when no region', () => {
      hostComponent.code = ' \n ';
      hostComponent.path = 'fizz/buzz/foo.html';
      fixture.detectChanges();
      expect(getErrorMessage()).toMatch(/for[\s\S]fizz\/buzz\/foo\.html$/);
    });

    it('should show simple missing-code error message when no path/region', () => {
      hostComponent.code = ' \n ';
      fixture.detectChanges();
      expect(getErrorMessage()).toMatch(/missing.$/);
    });
  });

  describe('copy button', () => {

    it('should be hidden if the `hideCopy` input is true', () => {
      hostComponent.hideCopy = true;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('button'))).toBe(null);
    });

    it('should call copier service when clicked', () => {
      const copierService: CopierService = TestBed.get(CopierService);
      const spy = spyOn(copierService, 'copyText');
      const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
      expect(spy.calls.count()).toBe(0, 'before click');
      button.click();
      expect(spy.calls.count()).toBe(1, 'after click');
    });

    it('should copy code text when clicked', () => {
      const copierService: CopierService = TestBed.get(CopierService);
      const spy = spyOn(copierService, 'copyText');
      const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
      button.click();
      expect(spy.calls.argsFor(0)[0]).toEqual(oneLineCode, 'after click');
    });

    it('should display a message when copy succeeds', () => {
      const snackBar: MdSnackBar = TestBed.get(MdSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(true);
      const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
      button.click();
      expect(snackBar.open).toHaveBeenCalledWith('Code Copied', '', { duration: 800 });
    });

    it('should display an error when copy fails', () => {
      const snackBar: MdSnackBar = TestBed.get(MdSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(false);
      const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
      button.click();
      expect(snackBar.open).toHaveBeenCalledWith('Copy failed. Please try again!', '', { duration: 800 });
    });
  });
});

//// Test helpers ////
// tslint:disable:member-ordering
@Component({
  selector: 'aio-host-comp',
  template: `
      <aio-code md-no-ink [code]="code" [language]="language"
      [linenums]="linenums" [path]="path" [region]="region" [hideCopy]="hideCopy"></aio-code>
  `
})
class HostComponent {
  code = oneLineCode;
  language: string;
  linenums: boolean | number | string;
  path: string;
  region: string;
  hideCopy: boolean;
}

class TestLogger {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
}
