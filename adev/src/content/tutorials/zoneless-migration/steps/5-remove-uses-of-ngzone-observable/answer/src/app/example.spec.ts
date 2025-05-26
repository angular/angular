import {TestBed} from '@angular/core/testing';
import {test, describe, expect, afterEach, beforeEach, vi} from 'vitest';
import {
  Component,
  input,
  provideZonelessChangeDetection,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';

describe('Example', () => {
  test('test wrappers must be OnPush compatible', () => {
    @Component({
      selector: 'example',
      template: '{{someInput()}}',
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Example {
      someInput = input.required<string>();
    }

    @Component({
      template: '<example [someInput]="someInput" />',
      imports: [Example],
    })
    class TestWrapper {
      someInput = 'initial';
    }

    const fixture = TestBed.createComponent(TestWrapper);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('initial');

    fixture.componentInstance.someInput = 'new';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('new');
  });
});
