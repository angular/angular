import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdChip, MdChipsModule} from './index';

describe('Chip Remove', () => {
  let fixture: ComponentFixture<any>;
  let testChip: TestChip;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdChipsModule],
      declarations: [
        TestChip
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestChip);
    testChip = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    chipDebugElement = fixture.debugElement.query(By.directive(MdChip));
    chipNativeElement = chipDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('should applies the `mat-chip-remove` CSS class', () => {
      let hrefElement = chipNativeElement.querySelector('a')!;

      expect(hrefElement.classList).toContain('mat-chip-remove');
    });

    it('should emits (remove) on click', () => {
      let hrefElement = chipNativeElement.querySelector('a')!;

      testChip.removable = true;
      fixture.detectChanges();

      spyOn(testChip, 'didRemove');

      hrefElement.click();

      expect(testChip.didRemove).toHaveBeenCalled();
    });
  });
});

@Component({
  template: `
    <md-chip [removable]="removable" (remove)="didRemove()"><a mdChipRemove></a></md-chip>
  `
})
class TestChip {
  removable: boolean;

  didRemove() {}
}
