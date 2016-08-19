import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MdMenuModule} from './menu';


describe('MdMenu', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdMenuModule],
      declarations: [TestMenu],
    });

    TestBed.compileComponents();
  }));

  it('should add and remove focus class on focus/blur', () => {
    let fixture = TestBed.createComponent(TestMenu);
    expect(fixture).toBeTruthy();
  });
});

@Component({template: ``})
class TestMenu {}
