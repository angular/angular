import {TestBed} from '@angular/core/testing';
import {test, describe, expect, beforeEach, vi} from 'vitest';
import {App} from './app';
import {SIMULATION_DELAY} from './todos';
import {provideZonelessChangeDetection} from '@angular/core';

describe('Example', () => {
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: SIMULATION_DELAY, useValue: 1}],
    });
    const fixture = TestBed.createComponent(App);
    fixture.autoDetectChanges();
    element = fixture.nativeElement;
  });

  test('should show the loading state initially', () => {
    expect(element.textContent).toContain('Loading todos...');
  });

  test('should display data once loaded', async () => {
    await expect.poll(() => element.textContent).toContain('Learn Angular services with Promises');
  });

  test('updates remaining count after removing an incomplete item from the list', async () => {
    const button = (await vi.waitUntil(() =>
      element.querySelector('li:not(.completed) .remove-button'),
    )) as HTMLButtonElement;
    button.click();
    await expect
      .poll(() => element.querySelector('.todo-footer')?.textContent)
      .toContain('1 remaining');
  });

  test('can remove a completed item from the list', async () => {
    const button = (await vi.waitUntil(() =>
      element.querySelector('li.completed .remove-button'),
    )) as HTMLButtonElement;
    button.click();
    await expect.poll(() => element.querySelectorAll('.todo-text').length).toEqual(2);
    await expect
      .poll(() => element.querySelector('.todo-footer')?.textContent)
      .toContain('2 remaining');
  });
});
