import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement}  from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdChipList, MdChipsModule} from './index';

describe('MdChip', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdChipsModule.forRoot()],
      declarations: [
        StaticChipList
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let chipListDebugElement: DebugElement;
    let chipListNativeElement: HTMLElement;
    let chipListInstance: MdChipList;
    let testComponent: StaticChipList;

    beforeEach(() => {
      fixture = TestBed.createComponent(StaticChipList);
      fixture.detectChanges();

      chipListDebugElement = fixture.debugElement.query(By.directive(MdChipList));
      chipListNativeElement = chipListDebugElement.nativeElement;
      chipListInstance = chipListDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('adds the `md-chip-list` class', () => {
      expect(chipListNativeElement.classList).toContain('md-chip-list');
    });
  });
});

@Component({
  template: `
    <md-chip-list>
      <md-chip>{{name}} 1</md-chip>
      <md-chip>{{name}} 2</md-chip>
      <md-chip>{{name}} 3</md-chip>
    </md-chip-list>
  `
})
class StaticChipList {
  name: 'Test';
}
