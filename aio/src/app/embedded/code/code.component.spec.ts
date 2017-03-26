/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';

import { CodeComponent } from './code.component';
import { CopierService } from 'app/shared//copier.service';
import { Logger } from 'app/shared/logger.service';
import { PrettyPrinter } from './pretty-printer.service';

const oneLineCode = 'const foo = "bar";';

const multiLineCode = `
&lt;hero-details&gt;
  &lt;h2&gt;Bah Dah Bing&lt;/h2&gt;
  &lt;hero-team&gt;
    &lt;h3&gt;NYC Team&lt;/h3&gt;
  &lt;/hero-team&gt;
&lt;/hero-details&gt;`;

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeComponent, HostComponent ],
      providers: [
        PrettyPrinter,
        {provide: CopierService, useClass: TestCopierService },
        {provide: Logger, useClass: TestLogger }
     ]
    })
    .compileComponents();
  }));

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

  it('should format a one-line code sample', () => {
    // 'pln' spans are a tell-tale for syntax highlighing
    const spans = codeComponentDe.nativeElement.querySelectorAll('span.pln');
    expect(spans.length).toBeGreaterThan(0, 'formatted spans');
  });

  it('should format a one-line code sample without linenums by default', () => {
    // `<li>`s are a tell-tale for line numbers
    const lis = codeComponentDe.nativeElement.querySelectorAll('li');
    expect(lis.length).toBe(0, 'should be no linenums');
  });

  it('should add line numbers to one-line code sample when linenums set true', () => {
    hostComponent.linenums = 'true';
    fixture.detectChanges();

    // `<li>`s are a tell-tale for line numbers
    const lis = codeComponentDe.nativeElement.querySelectorAll('li');
    expect(lis.length).toBe(1, 'has linenums');
  });

  it('should format multi-line code with linenums by default', () => {
    hostComponent.code = multiLineCode;
    fixture.detectChanges();

    // `<li>`s are a tell-tale for line numbers
    const lis = codeComponentDe.nativeElement.querySelectorAll('li');
    expect(lis.length).toBeGreaterThan(0, 'has linenums');
  });

  it('should not format multi-line code when linenums set false', () => {
    hostComponent.linenums = false;
    hostComponent.code = multiLineCode;
    fixture.detectChanges();

    // `<li>`s are a tell-tale for line numbers
    const lis = codeComponentDe.nativeElement.querySelectorAll('li');
    expect(lis.length).toBe(0, 'should be no linenums');
  });

  it('should call copier service when copy button clicked', () => {
    const copierService: TestCopierService = <any> codeComponentDe.injector.get(CopierService) ;
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(copierService.copyText.calls.count()).toBe(0, 'before click');
    button.click();
    expect(copierService.copyText.calls.count()).toBe(1, 'after click');
  });

  it('should copy code text when copy button clicked', () => {
    const copierService: TestCopierService = <any> codeComponentDe.injector.get(CopierService) ;
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    expect(copierService.copyText.calls.argsFor(0)[0]).toEqual(oneLineCode, 'after click');
  });

});

//// Test helpers ////
// tslint:disable:member-ordering
@Component({
  selector: 'aio-host-comp',
  template: `
      <aio-code [code]="code" [language]="language" [linenums]="linenums"></aio-code>
  `
})
class HostComponent {
  code = oneLineCode;
  language: string;
  linenums: boolean | number | string;
}

class TestCopierService {
  copyText = jasmine.createSpy('copyText');
}

class TestLogger {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
}
