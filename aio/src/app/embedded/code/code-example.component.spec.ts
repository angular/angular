import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

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
    const actual = codeExampleDe.query(By.css('header')).nativeElement.textContent;
    expect(actual).toBe('Great Example');
  });

  it('should remove the `title` attribute after initialisation', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example title="Great Example"></code-example>'}});
    createComponent(oneLineCode);
    expect(codeExampleDe.nativeElement.getAttribute('title')).toEqual(null);
  });

  it('should pass hideCopy to CodeComponent', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example hideCopy="true"></code-example>'}});
    createComponent(oneLineCode);
    expect(codeComponent.hideCopy).toBe(true);
  });

  it('should have `avoidFile` class when `avoid` atty present', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example avoid></code-example>'}});
    createComponent(oneLineCode);
    const classes: DOMTokenList = codeExampleDe.nativeElement.classList;
    expect(classes.contains('avoidFile')).toBe(true, 'has avoidFile class');
    expect(codeExampleComponent.isAvoid).toBe(true, 'isAvoid flag');
    expect(codeComponent.hideCopy).toBe(true, 'hiding copy button');
  });

  it('should have `avoidFile` class when `.avoid` in path', () => {
    TestBed.overrideComponent(HostComponent, {
      set: {template: '<code-example path="test.avoid.ts"></code-example>'}});
    createComponent(oneLineCode);
    const classes: DOMTokenList = codeExampleDe.nativeElement.classList;
    expect(classes.contains('avoidFile')).toBe(true, 'has avoidFile class');
    expect(codeExampleComponent.isAvoid).toBe(true, 'isAvoid flag');
    expect(codeComponent.hideCopy).toBe(true, 'hide copy button flag');
  });

  it('should not have `avoidFile` class in normal case', () => {
    createComponent(oneLineCode);
    const classes: DOMTokenList = codeExampleDe.nativeElement.classList;
    expect(classes.contains('avoidFile')).toBe(false, 'avoidFile class');
    expect(codeExampleComponent.isAvoid).toBe(false, 'isAvoid flag');
    expect(codeComponent.hideCopy).toBe(false, 'hide copy button flag');
  });
});

//// Test helpers ////
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
  @Input() linenums: string;
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
