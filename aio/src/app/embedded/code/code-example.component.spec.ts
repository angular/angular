/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { CodeExampleComponent } from './code-example.component';

describe('CodeExampleComponent', () => {
  let hostComponent: HostComponent;
  let codeComponent: TestCodeComponent;
  let codeExampleDe: DebugElement;
  let codeExampleComponent: CodeExampleComponent;
  let fixture: ComponentFixture<HostComponent>;

  const oneLineCode = `const foo = "bar";`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeExampleComponent, HostComponent, TestCodeComponent ],
    });
  });

  function createComponent(codeExampleContent = '') {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    codeExampleDe = fixture.debugElement.children[0];
    codeExampleComponent = codeExampleDe.componentInstance;
    codeComponent = codeExampleDe.query(By.directive(TestCodeComponent)).componentInstance;

    // Copy the CodeExample's innerHTML (content)
    // into the `codeExampleContent` property as the DocViewer does
    codeExampleDe.nativeElement.codeExampleContent = codeExampleContent;

    fixture.detectChanges();
  }

  it('should create CodeExampleComponent', () => {
    createComponent();
    expect(codeExampleComponent).toBeTruthy('CodeExampleComponent');
  });

  it('should pass content to CodeComponent (<aio-code>)', () => {
    createComponent(oneLineCode);
    expect(codeComponent.code).toBe(oneLineCode);
  });

  it('should pass language to CodeComponent', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example language="html"></code-example>'}});
    createComponent(oneLineCode);
    expect(codeComponent.language).toBe('html');
  });

  it('should pass linenums to CodeComponent', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example linenums="true"></code-example>'}});
    createComponent(oneLineCode);
    expect(codeComponent.linenums).toBe('true');
  });

  it('should add title (header) when set `title` attribute', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example title="Great Example"></code-example>'}});
    createComponent(oneLineCode);
    const actual = codeExampleDe.query(By.css('header')).nativeElement.innerText;
    expect(actual).toBe('Great Example');
  });

  it('should pass hideCopy to CodeComonent', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example hideCopy="true"></code-example>'}});
    createComponent(oneLineCode);
    expect(codeComponent.hideCopy).toBe(true);
  });
});

//// Test helpers ////
// tslint:disable:member-ordering
@Component({
  selector: 'aio-code',
  template: `
  <div>lang: {{language}}</div>
  <div>linenums: {{linenums}}</div>
  code: <pre>{{someCode}}</pre>
  `
})
class TestCodeComponent {
  @Input() code = '';
  @Input() language: string;
  @Input() linenums: boolean | number;
  @Input() path: string;
  @Input() region: string;
  @Input() hideCopy: boolean;

  get someCode() {
    return this.code && this.code.length > 30 ? this.code.substr(0, 30) + '...' : this.code;
  }
}

@Component({
  selector: 'aio-host-comp',
  template: `<code-example></code-example>`
})
class HostComponent { }
