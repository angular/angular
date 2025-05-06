import {ComponentFixture, TestBed} from '@angular/core/testing';
import {test, describe, expect, beforeEach} from 'vitest';
import {Component, provideZoneChangeDetection} from '@angular/core';

@Component({
  template: '{{data ?? "loading..."}}',
})
class TestComponent {
  data: string | null = null;

  constructor() {
    // Simulate data loading
    setTimeout(() => {
      this.data = 'hello world';
    });
  }
}

describe('Example', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.autoDetectChanges();
  });

  test('should show the loading state initially', () => {
    expect(fixture.nativeElement.innerHTML).toContain('loading...');
  });

  test('should display data once loaded', async () => {
    await new Promise((resolve) => void setTimeout(resolve));
    expect(fixture.nativeElement.innerHTML).toContain('hello world');
  });
});
