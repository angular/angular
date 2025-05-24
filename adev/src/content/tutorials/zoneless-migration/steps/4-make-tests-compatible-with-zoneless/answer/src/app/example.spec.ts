import {TestBed, ComponentFixture} from '@angular/core/testing';
import {test, describe, expect, beforeEach, afterEach, vi} from 'vitest';
import {Component, input, signal, ChangeDetectionStrategy} from '@angular/core';

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
      template: '<example [someInput]="someInput()" />',
      imports: [Example],
    })
    class TestWrapper {
      someInput = signal('initial');
    }

    const fixture: ComponentFixture<TestWrapper> = TestBed.createComponent(TestWrapper);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('initial');

    fixture.componentInstance.someInput.set('new');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('new');
  });

  test('change detection is never synchronous', async () => {
    @Component({
      template: '<button (click)="increment()"></button> {{count()}}',
    })
    class Example {
      count = signal(0);

      increment() {
        this.count.update((v: number) => v + 1);
      }
    }

    const fixture = TestBed.createComponent(Example);
    fixture.autoDetectChanges();
    expect(fixture.nativeElement.textContent).toContain('0');

    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('1');
  });

  test('fixture.whenStable does not include timers automatically', async () => {
    @Component({
      template: '<button (click)="load()"></button> {{data()}}',
    })
    class Example {
      data = signal<string | undefined>(undefined);

      load() {
        setTimeout(() => {
          this.data.set('data loaded');
        });
      }
    }

    const fixture = TestBed.createComponent(Example);
    fixture.autoDetectChanges();

    fixture.nativeElement.querySelector('button').click();
    await expect.poll(() => fixture.nativeElement.textContent).toContain('data loaded');
  });

  describe('fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    test('fakeAsync requires zone.js', async () => {
      @Component({
        template: '<button (click)="load()"></button> {{data()}}',
      })
      class Example {
        data = signal<string | undefined>(undefined);

        load() {
          setTimeout(() => {
            this.data.set('data loaded');
          }, 5000);
        }
      }

      const fixture = TestBed.createComponent(Example);
      fixture.autoDetectChanges();

      fixture.nativeElement.querySelector('button').click();
      await vi.runAllTimersAsync();
      expect(fixture.nativeElement.textContent).toContain('data loaded');
    });
  });
});
