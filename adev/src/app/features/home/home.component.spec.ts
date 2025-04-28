/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// import {ComponentFixture, TestBed} from '@angular/core/testing';

// import Home from './home.component';
// import {HomeAnimation} from './services/home-animation.service';

// TODO: refactor for lazy-loading when both conditions are met
// 1. WebGL is available with isWebGLAvailable()
// 2. When a user's device settings are not set to reduced motion with !shouldReduceMotion()
/* describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  let fakeHomeAnimation = {
    init: () => Promise.resolve(),
    destroy: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    });

    TestBed.overrideProvider(HomeAnimation, {useValue: fakeHomeAnimation});

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call homeAnimation.destroy() on ngOnDestroy', () => {
    const destroySpy = spyOn(fakeHomeAnimation, 'destroy');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
  });
}); */
