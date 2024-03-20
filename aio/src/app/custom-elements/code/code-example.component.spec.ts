import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeExampleComponent } from './code-example.component';
import { CodeExampleModule } from './code-example.module';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';
import { MockPrettyPrinter } from 'testing/pretty-printer.service';
import { PrettyPrinter } from './pretty-printer.service';

describe('CodeExampleComponent', () => {
  let hostComponent: HostComponent;
  let codeExampleComponent: CodeExampleComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ CodeExampleModule ],
      declarations: [
        HostComponent,
      ],
      providers: [
        { provide: Logger, useClass: MockLogger },
        { provide: PrettyPrinter, useClass: MockPrettyPrinter },
      ]
    });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    hostComponent = fixture.componentInstance;
    codeExampleComponent = hostComponent.codeExampleComponent;
  });

  it('should be able to capture the code snippet provided in content', () => {
    expect(codeExampleComponent.aioCode.code.toString().trim()).toBe('const foo = "bar";');
  });

  it('should clean-up the projected code snippet once captured', () => {
    expect(codeExampleComponent.content.nativeElement.innerHTML).toBe('');
  });

  it('should change aio-code classes based on header presence', () => {
    expect(codeExampleComponent.header).toBe('Great Example');
    expect(fixture.nativeElement.querySelector('header')).toBeTruthy();

    const aioCodeEl = fixture.nativeElement.querySelector('aio-code');

    expect(aioCodeEl).toHaveClass('headed-code');
    expect(aioCodeEl).not.toHaveClass('simple-code');

    codeExampleComponent.header = '';
    fixture.detectChanges();

    expect(codeExampleComponent.header).toBe('');
    expect(fixture.nativeElement.querySelector('header')).toBeFalsy();
    expect(aioCodeEl).not.toHaveClass('headed-code');
    expect(aioCodeEl).toHaveClass('simple-code');
  });

  it('should set avoidFile class if path has .avoid.', () => {
    const codeExampleComponentElement: HTMLElement =
        fixture.nativeElement.querySelector('code-example');

    expect(codeExampleComponent.path).toBe('code-path');
    expect(codeExampleComponentElement.className.indexOf('avoidFile') === -1).toBe(true);

    codeExampleComponent.path = 'code-path.avoid.';
    fixture.detectChanges();

    expect(codeExampleComponentElement.className.indexOf('avoidFile') === -1).toBe(false);
  });

  it('should coerce hidecopy', () => {
    expect(codeExampleComponent.hidecopy).toBe(false);

    hostComponent.hidecopy = true;
    fixture.detectChanges();
    expect(codeExampleComponent.hidecopy).toBe(true);

    hostComponent.hidecopy = 'false';
    fixture.detectChanges();
    expect(codeExampleComponent.hidecopy).toBe(false);

    hostComponent.hidecopy = 'true';
    fixture.detectChanges();
    expect(codeExampleComponent.hidecopy).toBe(true);
  });
});

@Component({
  selector: 'aio-host-comp',
  template: `
    <code-example [header]="header" [path]="path" [hidecopy]="hidecopy">
      {{code}}
    </code-example>
  `
})
class HostComponent {
  code = 'const foo = "bar";';
  header = 'Great Example';
  path = 'code-path';
  hidecopy: boolean | string = false;

  @ViewChild(CodeExampleComponent, {static: true}) codeExampleComponent: CodeExampleComponent;
}
