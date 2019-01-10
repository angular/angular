import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { first } from 'rxjs/operators';

import { CodeComponent } from './code.component';
import { CodeModule } from './code.module';
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
    delete (window as any)['prettyPrint'];
    delete (window as any)['prettyPrintOne'];
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, CodeModule ],
      declarations: [ HostComponent ],
      providers: [
        PrettyPrinter,
        CopierService,
        {provide: Logger, useClass: TestLogger }
     ]
    }).compileComponents();
  });

  // Must be async because
  // CodeComponent creates PrettyPrintService which async loads `prettify.js`.
  // If not async, `afterAll` finishes before tests do!
  beforeEach(async(() => {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('pretty printing', () => {
    const untilCodeFormatted = () => {
      const emitter = hostComponent.codeComponent.codeFormatted;
      return emitter.pipe(first()).toPromise();
    };
    const hasLineNumbers = async () => {
      // presence of `<li>`s are a tell-tale for line numbers
      await untilCodeFormatted();
      return 0 < fixture.nativeElement.querySelectorAll('li').length;
    };

    it('should format a one-line code sample', async () => {
      hostComponent.setCode(oneLineCode);
      await untilCodeFormatted();

      // 'pln' spans are a tell-tale for syntax highlighting
      const spans = fixture.nativeElement.querySelectorAll('span.pln');
      expect(spans.length).toBeGreaterThan(0, 'formatted spans');
    });

    it('should format a one-line code sample without linenums by default', async () => {
      hostComponent.setCode(oneLineCode);
      expect(await hasLineNumbers()).toBe(false);
    });

    it('should add line numbers to one-line code sample when linenums set true', async () => {
      hostComponent.linenums = 'true';
      fixture.detectChanges();

      expect(await hasLineNumbers()).toBe(true);
    });

    it('should format a small multi-line code without linenums by default', async () => {
      hostComponent.setCode(smallMultiLineCode);
      expect(await hasLineNumbers()).toBe(false);
    });

    it('should add line numbers to a big multi-line code by default', async () => {
      hostComponent.setCode(bigMultiLineCode);
      expect(await hasLineNumbers()).toBe(true);
    });

    it('should format big multi-line code without linenums when linenums set false', async () => {
      hostComponent.linenums = false;
      fixture.detectChanges();

      hostComponent.setCode(bigMultiLineCode);
      expect(await hasLineNumbers()).toBe(false);
    });
  });

  describe('whitespace handling', () => {
    it('should remove common indentation from the code before rendering', () => {
      hostComponent.linenums = false;
      fixture.detectChanges();

      hostComponent.setCode('  abc\n   let x = text.split(\'\\n\');\n  ghi\n\n  jkl\n');
      const codeContent = fixture.nativeElement.querySelector('code').textContent;
      expect(codeContent).toEqual('abc\n let x = text.split(\'\\n\');\nghi\n\njkl');
    });

    it('should trim whitespace from the code before rendering', () => {
      hostComponent.linenums = false;
      fixture.detectChanges();

      hostComponent.setCode('\n\n\n' + smallMultiLineCode + '\n\n\n');
      const codeContent = fixture.nativeElement.querySelector('code').textContent;
      expect(codeContent).toEqual(codeContent.trim());
    });

    it('should trim whitespace from code before computing whether to format linenums', () => {
      hostComponent.setCode('\n\n\n' + oneLineCode + '\n\n\n');

      // `<li>`s are a tell-tale for line numbers
      const lis = fixture.nativeElement.querySelectorAll('li');
      expect(lis.length).toBe(0, 'should be no linenums');
    });
  });

  describe('error message', () => {

    function getErrorMessage() {
      const missing: HTMLElement = fixture.nativeElement.querySelector('.code-missing');
      return missing ? missing.textContent : null;
    }

    it('should not display "code-missing" class when there is some code', () => {
      expect(getErrorMessage()).toBeNull('should not have element with "code-missing" class');
    });

    it('should display error message when there is no code (after trimming)', () => {
      hostComponent.setCode(' \n ');
      expect(getErrorMessage()).toContain('missing');
    });

    it('should show path and region in missing-code error message', () => {
      hostComponent.path = 'fizz/buzz/foo.html';
      hostComponent.region = 'something';
      fixture.detectChanges();

      hostComponent.setCode(' \n ');
      expect(getErrorMessage()).toMatch(/for[\s\S]fizz\/buzz\/foo\.html#something$/);
    });

    it('should show path only in missing-code error message when no region', () => {
      hostComponent.path = 'fizz/buzz/foo.html';
      fixture.detectChanges();

      hostComponent.setCode(' \n ');
      expect(getErrorMessage()).toMatch(/for[\s\S]fizz\/buzz\/foo\.html$/);
    });

    it('should show simple missing-code error message when no path/region', () => {
      hostComponent.setCode(' \n ');
      expect(getErrorMessage()).toMatch(/missing.$/);
    });
  });

  describe('copy button', () => {

    function getButton() {
      const btnDe = fixture.debugElement.query(By.css('button'));
      return btnDe ? btnDe.nativeElement : null;
    }

    it('should be hidden if the `hideCopy` input is true', () => {
      hostComponent.hideCopy = true;
      fixture.detectChanges();
      expect(getButton()).toBe(null);
    });

    it('should have title', () => {
      expect(getButton().title).toBe('Copy code snippet');
    });

    it('should have no aria-label by default', () => {
      expect(getButton().getAttribute('aria-label')).toBe('');
    });

    it('should have aria-label explaining what is being copied when header passed in', () => {
      hostComponent.header = 'a/b/c/foo.ts';
      fixture.detectChanges();
      expect(getButton().getAttribute('aria-label')).toContain(hostComponent.header);
    });

    it('should call copier service when clicked', () => {
      const copierService: CopierService = TestBed.get(CopierService);
      const spy = spyOn(copierService, 'copyText');
      expect(spy.calls.count()).toBe(0, 'before click');
      getButton().click();
      expect(spy.calls.count()).toBe(1, 'after click');
    });

    it('should copy code text when clicked', () => {
      const copierService: CopierService = TestBed.get(CopierService);
      const spy = spyOn(copierService, 'copyText');
      getButton().click();
      expect(spy.calls.argsFor(0)[0]).toBe(oneLineCode, 'after click');
    });

    it('should preserve newlines in the copied code', () => {
      const copierService: CopierService = TestBed.get(CopierService);
      const spy = spyOn(copierService, 'copyText');
      const expectedCode = smallMultiLineCode.trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      let actualCode;

      hostComponent.setCode(smallMultiLineCode);

      [false, true, 42].forEach(linenums => {
        hostComponent.linenums = linenums;
        fixture.detectChanges();
        getButton().click();
        actualCode = spy.calls.mostRecent().args[0];

        expect(actualCode).toBe(expectedCode, `when linenums=${linenums}`);
        expect(actualCode.match(/\r?\n/g).length).toBe(5);

        spy.calls.reset();
      });
    });

    it('should display a message when copy succeeds', () => {
      const snackBar: MatSnackBar = TestBed.get(MatSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(true);
      getButton().click();
      expect(snackBar.open).toHaveBeenCalledWith('Code Copied', '', { duration: 800 });
    });

    it('should display an error when copy fails', () => {
      const snackBar: MatSnackBar = TestBed.get(MatSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      const logger: TestLogger = TestBed.get(Logger);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(false);
      getButton().click();
      expect(snackBar.open).toHaveBeenCalledWith('Copy failed. Please try again!', '', { duration: 800 });
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(jasmine.any(Error));
      expect(logger.error.calls.mostRecent().args[0].message).toMatch(/^ERROR copying code to clipboard:/);
    });
  });
});

//// Test helpers ////
// tslint:disable:member-ordering
@Component({
  selector: 'aio-host-comp',
  template: `
    <aio-code [language]="language"
    [linenums]="linenums" [path]="path" [region]="region"
    [hideCopy]="hideCopy" [header]="header"></aio-code>
  `
})
class HostComponent implements AfterViewInit {
  hideCopy: boolean;
  language: string;
  linenums: boolean | number | string;
  path: string;
  region: string;
  header: string;

  @ViewChild(CodeComponent) codeComponent: CodeComponent;

  ngAfterViewInit() {
    this.setCode(oneLineCode);
  }

  /** Changes the displayed code on the code component. */
  setCode(code: string) {
    this.codeComponent.code = code;
  }
}

class TestLogger {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
}
