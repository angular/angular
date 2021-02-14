import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Clipboard } from '@angular/cdk/clipboard';

import { CodeComponent } from './code.component';
import { CodeModule } from './code.module';
import { Logger } from 'app/shared/logger.service';
import { MockPrettyPrinter } from 'testing/pretty-printer.service';
import { PrettyPrinter } from './pretty-printer.service';

const oneLineCode = 'const foo = "bar";';

const smallMultiLineCode =
`&lt;hero-details&gt;
  &lt;h2&gt;Bah Dah Bing&lt;/h2&gt;
  &lt;hero-team&gt;
    &lt;h3&gt;NYC Team&lt;/h3&gt;
  &lt;/hero-team&gt;
&lt;/hero-details&gt;`;

const bigMultiLineCode = `${smallMultiLineCode}\n${smallMultiLineCode}\n${smallMultiLineCode}`;

describe('CodeComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, CodeModule ],
      declarations: [ HostComponent ],
      providers: [
        { provide: Logger, useClass: TestLogger },
        { provide: PrettyPrinter, useClass: MockPrettyPrinter },
     ]
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('pretty printing', () => {
    const getFormattedCode = () => fixture.nativeElement.querySelector('code').innerHTML;

    it('should format a one-line code sample without linenums by default', () => {
      hostComponent.setCode(oneLineCode);
      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: false): ${oneLineCode}`);
    });

    it('should add line numbers to one-line code sample when linenums is `true`', () => {
      hostComponent.setCode(oneLineCode);
      hostComponent.linenums = true;
      fixture.detectChanges();

      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: true): ${oneLineCode}`);
    });

    it('should add line numbers to one-line code sample when linenums is `\'true\'`', () => {
      hostComponent.setCode(oneLineCode);
      hostComponent.linenums = 'true';
      fixture.detectChanges();

      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: true): ${oneLineCode}`);
    });

    it('should format a small multi-line code sample without linenums by default', () => {
      hostComponent.setCode(smallMultiLineCode);
      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: false): ${smallMultiLineCode}`);
    });

    it('should add line numbers to a small multi-line code sample when linenums is `true`', () => {
      hostComponent.setCode(smallMultiLineCode);
      hostComponent.linenums = true;
      fixture.detectChanges();

      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: true): ${smallMultiLineCode}`);
    });

    it('should add line numbers to  a small multi-line code sample when linenums is `\'true\'`', () => {
      hostComponent.setCode(smallMultiLineCode);
      hostComponent.linenums = 'true';
      fixture.detectChanges();

      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: true): ${smallMultiLineCode}`);
    });

    it('should format a big multi-line code without linenums by default', () => {
      hostComponent.setCode(bigMultiLineCode);
      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: false): ${bigMultiLineCode}`);
    });

    it('should add line numbers to a big multi-line code sample when linenums is `true`', () => {
      hostComponent.setCode(bigMultiLineCode);
      hostComponent.linenums = true;
      fixture.detectChanges();

      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: true): ${bigMultiLineCode}`);
    });

    it('should add line numbers to  a big multi-line code sample when linenums is `\'true\'`', () => {
      hostComponent.setCode(bigMultiLineCode);
      hostComponent.linenums = 'true';
      fixture.detectChanges();

      expect(getFormattedCode()).toBe(
          `Formatted code (language: auto, linenums: true): ${bigMultiLineCode}`);
    });
  });

  describe('whitespace handling', () => {
    it('should remove common indentation from the code before rendering', () => {
      hostComponent.linenums = false;
      fixture.detectChanges();

      hostComponent.setCode(`
        abc
          let x = text.split('\\n');
        ghi

        jkl
      `);
      const codeContent = fixture.nativeElement.querySelector('code').textContent;
      expect(codeContent).toEqual(
          'Formatted code (language: auto, linenums: false): abc\n  let x = text.split(\'\\n\');\nghi\n\njkl');
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
      const clipboard = TestBed.inject(Clipboard);
      const spy = spyOn(clipboard, 'copy');
      expect(spy.calls.count()).toBe(0, 'before click');
      getButton().click();
      expect(spy.calls.count()).toBe(1, 'after click');
    });

    it('should copy code text when clicked', () => {
      const clipboard = TestBed.inject(Clipboard);
      const spy = spyOn(clipboard, 'copy');
      getButton().click();
      expect(spy.calls.argsFor(0)[0]).toBe(oneLineCode, 'after click');
    });

    it('should preserve newlines in the copied code', () => {
      const clipboard = TestBed.inject(Clipboard);
      const spy = spyOn(clipboard, 'copy');
      const expectedCode = smallMultiLineCode.trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      let actualCode;

      hostComponent.setCode(smallMultiLineCode);

      [false, true, 42].forEach(linenums => {
        hostComponent.linenums = linenums;
        fixture.detectChanges();
        getButton().click();
        actualCode = spy.calls.mostRecent().args[0];

        expect(actualCode).toBe(expectedCode, `when linenums=${linenums}`);
        expect(actualCode.match(/\r?\n/g)?.length).toBe(5);

        spy.calls.reset();
      });
    });

    it('should display a message when copy succeeds', () => {
      const snackBar: MatSnackBar = TestBed.inject(MatSnackBar);
      const clipboard = TestBed.inject(Clipboard);
      spyOn(snackBar, 'open');
      spyOn(clipboard, 'copy').and.returnValue(true);
      getButton().click();
      expect(snackBar.open).toHaveBeenCalledWith('Code Copied', '', { duration: 800 });
    });

    it('should display an error when copy fails', () => {
      const snackBar: MatSnackBar = TestBed.inject(MatSnackBar);
      const clipboard = TestBed.inject(Clipboard);
      const logger = TestBed.inject(Logger) as unknown as TestLogger;
      spyOn(snackBar, 'open');
      spyOn(clipboard, 'copy').and.returnValue(false);
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

  @ViewChild(CodeComponent, {static: false}) codeComponent: CodeComponent;

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
