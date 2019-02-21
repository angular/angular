/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Input, OnChanges, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('ngOnChanges', () => {
  it('should be inherited when super is a directive', () => {
    const log: string[] = [];

    @Directive({selector: '[superDir]'})
    class SuperDirective implements OnChanges {
      @Input() someInput = '';

      ngOnChanges() { log.push('on changes!'); }
    }

    @Directive({selector: '[subDir]'})
    class SubDirective extends SuperDirective {
    }

    TestBed.configureTestingModule({declarations: [AppComp, SubDirective]});
    TestBed.overrideComponent(
        AppComp, {set: new Component({template: '<div subDir [someInput]="1"></div>'})});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();

    expect(log).toEqual(['on changes!']);
  });

  it('should be inherited when super is a simple class', () => {
    const log: string[] = [];

    class SuperClass {
      ngOnChanges() { log.push('on changes!'); }
    }

    @Directive({selector: '[subDir]'})
    class SubDirective extends SuperClass {
      @Input() someInput = '';
    }

    TestBed.configureTestingModule({declarations: [AppComp, SubDirective]});
    TestBed.overrideComponent(
        AppComp, {set: new Component({template: '<div subDir [someInput]="1"></div>'})});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();

    expect(log).toEqual(['on changes!']);
  });

  it('should be inherited when super is a directive and grand-super is a directive', () => {
    const log: string[] = [];

    @Directive({selector: '[grandSuperDir]'})
    class GrandSuperDirective implements OnChanges {
      @Input() someInput = '';

      ngOnChanges() { log.push('on changes!'); }
    }

    @Directive({selector: '[superDir]'})
    class SuperDirective extends GrandSuperDirective {
    }

    @Directive({selector: '[subDir]'})
    class SubDirective extends SuperDirective {
    }

    TestBed.configureTestingModule({declarations: [AppComp, SubDirective]});
    TestBed.overrideComponent(
        AppComp, {set: new Component({template: '<div subDir [someInput]="1"></div>'})});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();

    expect(log).toEqual(['on changes!']);
  });

  it('should be inherited when super is a directive and grand-super is a simple class', () => {
    const log: string[] = [];

    class GrandSuperClass {
      ngOnChanges() { log.push('on changes!'); }
    }

    @Directive({selector: '[superDir]'})
    class SuperDirective extends GrandSuperClass {
      @Input() someInput = '';
    }

    @Directive({selector: '[subDir]'})
    class SubDirective extends SuperDirective {
    }

    TestBed.configureTestingModule({declarations: [AppComp, SubDirective]});
    TestBed.overrideComponent(
        AppComp, {set: new Component({template: '<div subDir [someInput]="1"></div>'})});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();

    expect(log).toEqual(['on changes!']);
  });

  it('should be inherited when super is a simple class and grand-super is a directive', () => {
    const log: string[] = [];

    @Directive({selector: '[grandSuperDir]'})
    class GrandSuperDirective implements OnChanges {
      @Input() someInput = '';

      ngOnChanges() { log.push('on changes!'); }
    }

    class SuperClass extends GrandSuperDirective {}

    @Directive({selector: '[subDir]'})
    class SubDirective extends SuperClass {
    }

    TestBed.configureTestingModule({declarations: [AppComp, SubDirective]});
    TestBed.overrideComponent(
        AppComp, {set: new Component({template: '<div subDir [someInput]="1"></div>'})});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();

    expect(log).toEqual(['on changes!']);
  });

  it('should be inherited when super is a simple class and grand-super is a simple class', () => {
    const log: string[] = [];

    class GrandSuperClass {
      ngOnChanges() { log.push('on changes!'); }
    }

    class SuperClass extends GrandSuperClass {}

    @Directive({selector: '[subDir]'})
    class SubDirective extends SuperClass {
      @Input() someInput = '';
    }

    TestBed.configureTestingModule({declarations: [AppComp, SubDirective]});
    TestBed.overrideComponent(
        AppComp, {set: new Component({template: '<div subDir [someInput]="1"></div>'})});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();

    expect(log).toEqual(['on changes!']);
  });
});

@Component({selector: 'app-comp', template: ``})
class AppComp {
}
