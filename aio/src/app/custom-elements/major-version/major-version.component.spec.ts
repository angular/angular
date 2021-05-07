import { VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MajorVersionComponent } from './major-version.component';

describe('MajorVersionComponent', () => {
  let actualPatch: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [MajorVersionComponent] });
    actualPatch = VERSION.patch;
  });

  afterEach(() => {
    (VERSION.patch as any) = actualPatch;
  });

  describe('rendering', () => {
    it('should display the current major version (for stable versions)', () => {
      (VERSION.patch as any) = '0';
      const fixture = TestBed.createComponent(MajorVersionComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(VERSION.major);
    });

    it('should display "next" (for rc versions)', () => {
      (VERSION.patch as any) = '0-rc.2';
      const fixture = TestBed.createComponent(MajorVersionComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('next');
    });

    it('should display "next" (for next versions)', () => {
      (VERSION.patch as any) = '0-next.1';
      const fixture = TestBed.createComponent(MajorVersionComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('next');
    });
  });
});
