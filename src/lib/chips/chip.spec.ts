import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement}  from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdChip, MdChipsModule} from './index';

describe('MdChip', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdChipsModule.forRoot()],
      declarations: [
        SingleChip
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let chipDebugElement: DebugElement;
    let chipNativeElement: HTMLElement;
    let chipInstance: MdChip;
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MdChip));
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('adds the `md-chip` class', () => {
      expect(chipNativeElement.classList).toContain('md-chip');
    });
  });
});

@Component({
  template: `<md-chip>{{name}}</md-chip>`
})
class SingleChip {
  name: 'Test';
}
