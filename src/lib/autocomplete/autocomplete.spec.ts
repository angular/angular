import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MdAutocompleteModule} from './index';

describe('MdAutocomplete', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdAutocompleteModule.forRoot()],
      declarations: [SimpleAutocomplete],
      providers: []
    });

    TestBed.compileComponents();
  }));

  it('should have a test', () => {
    expect(true).toBe(true);
  });

});

@Component({
  template: `
    <md-autocomplete></md-autocomplete>
  `
})
class SimpleAutocomplete {}

