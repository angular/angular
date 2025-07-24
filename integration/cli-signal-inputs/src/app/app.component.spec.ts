import {TestBed} from '@angular/core/testing';

import {AppComponent} from './app.component';

describe('app component', () => {
  it('should properly query for greet components', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.greets().length).toBe(2);
  });
});
