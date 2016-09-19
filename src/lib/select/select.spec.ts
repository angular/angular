import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MdSelectModule} from './index';


describe('MdSelect', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSelectModule.forRoot()],
      declarations: [TestSelect],
    });

    TestBed.compileComponents();
  }));

  it('should test', () => {
    // let fixture = TestBed.createComponent(TestSelect);
    expect(true).toBeTruthy();
  });
});

@Component({selector: 'test-select', template: ``})
class TestSelect {}
