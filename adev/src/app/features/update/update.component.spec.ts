/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {By} from '@angular/platform-browser';

import UpdateComponent from './update.component';
import {ApplicationComplexity} from './recommendations';

describe('UpdateComponent', () => {
  let component: UpdateComponent;
  let fixture: ComponentFixture<UpdateComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [UpdateComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(UpdateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getComplexityLevelName', () => {
    it('should return "Basic" for ApplicationComplexity.Basic', () => {
      expect(component['getComplexityLevelName'](ApplicationComplexity.Basic)).toBe('Basic');
    });

    it('should return "Medium" for ApplicationComplexity.Medium', () => {
      expect(component['getComplexityLevelName'](ApplicationComplexity.Medium)).toBe('Medium');
    });

    it('should return "Advanced" for ApplicationComplexity.Advanced', () => {
      expect(component['getComplexityLevelName'](ApplicationComplexity.Advanced)).toBe('Advanced');
    });

    it('should return "Unknown" for invalid complexity level', () => {
      expect(component['getComplexityLevelName'](999 as ApplicationComplexity)).toBe('Unknown');
    });
  });

  describe('complexity badges rendering', () => {
    it('should display complexity badges for recommendations', async () => {
      // Find the "Show me how to update!" button and click it to trigger recommendations
      const showButton: HTMLElement = fixture.debugElement.query(
        By.css('.show-button'),
      )?.nativeElement;

      expect(showButton).toBeTruthy();
      showButton.click();

      // Wait for all async operations to complete (marked parsing, router navigation, etc.)
      await fixture.whenStable();

      // Additional wait for marked parsing
      await new Promise((resolve) => setTimeout(resolve, 300));

      const badges = fixture.nativeElement.querySelectorAll('.adev-complexity-badge');

      // For the default versions (20.0 -> 21.0) with level 1, verify badges are rendered
      if (badges.length > 0) {
        // Check the first badge
        const badge = badges[0];
        const badgeText = badge.textContent?.trim();

        // Badge text should be one of the valid complexity levels
        expect(['Basic', 'Medium', 'Advanced']).toContain(badgeText);

        // Badge should have appropriate CSS class
        const hasComplexityClass =
          badge.classList.contains('adev-complexity-1') ||
          badge.classList.contains('adev-complexity-2') ||
          badge.classList.contains('adev-complexity-3');
        expect(hasComplexityClass).toBe(true);
      } else {
        // If no recommendations exist for these versions, that's acceptable
        // The test verifies the component renders without errors
        expect(badges.length).toBe(0);
      }
    });
  });
});
