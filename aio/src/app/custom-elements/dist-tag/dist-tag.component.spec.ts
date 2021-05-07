import { VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { DistTagComponent } from './dist-tag.component';

describe('DistTagComponent', () => {
  let actualMode: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [DistTagComponent] });
    actualMode = environment.mode;
  });

  afterEach(() => {
    (environment.mode as any) = actualMode;
  });

  describe('rendering', () => {
    it('should display nothing (for stable versions)', () => {
      environment.mode = 'stable';
      const fixture = TestBed.createComponent(DistTagComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('');
    });

    it('should display the current major version (for archive versions)', () => {
      environment.mode = 'archive';
      const fixture = TestBed.createComponent(DistTagComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('@' + VERSION.major);
    });

    it('should display "@next" (for rc versions)', () => {
      environment.mode = 'rc';
      const fixture = TestBed.createComponent(DistTagComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('@next');
    });

    it('should display "@next" (for next versions)', () => {
      environment.mode = 'next';
      const fixture = TestBed.createComponent(DistTagComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('@next');
    });
  });
});
