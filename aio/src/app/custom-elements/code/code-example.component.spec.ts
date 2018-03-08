import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeExampleComponent } from './code-example.component';
import { CodeExampleModule } from './code-example.module';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';

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
      ]
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    codeExampleComponent = hostComponent.codeExampleComponent;

    fixture.detectChanges();
  });

  it('should be able to capture the code snippet provided in content', () => {
    expect(codeExampleComponent.aioCode.code.trim()).toBe(`const foo = "bar";`);
  });

  it('should change aio-code classes based on title presence', () => {
    expect(codeExampleComponent.title).toBe('Great Example');
    expect(fixture.nativeElement.querySelector('header')).toBeTruthy();
    expect(codeExampleComponent.classes).toEqual({
      'headed-code': true,
      'simple-code': false
    });

    codeExampleComponent.title = '';
    fixture.detectChanges();

    expect(codeExampleComponent.title).toBe('');
    expect(fixture.nativeElement.querySelector('header')).toBeFalsy();
    expect(codeExampleComponent.classes).toEqual({
      'headed-code': false,
      'simple-code': true
    });
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
    <code-example [title]="title" [path]="path" [hidecopy]="hidecopy">
      {{code}}
    </code-example>
  `
})
class HostComponent {
  code = `const foo = "bar";`;
  title = 'Great Example';
  path = 'code-path';
  hidecopy: boolean | string = false;

  @ViewChild(CodeExampleComponent) codeExampleComponent: CodeExampleComponent;
}
