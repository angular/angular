import {TestBed, async} from '@angular/core/testing';
import {
  NgModule,
  Component,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {ProjectionModule, DomProjection, DomProjectionHost} from './projection';


describe('Projection', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ProjectionModule.forRoot(), ProjectionTestModule],
    });

    TestBed.compileComponents();
  }));

  it('should project properly', async(() => {
    const fixture = TestBed.createComponent(ProjectionTestApp);
    const appEl: HTMLDivElement = fixture.nativeElement;
    const outerDivEl = appEl.querySelector('.outer');
    const innerDivEl = appEl.querySelector('.inner');

    // Expect the reverse of the tests down there.
    expect(appEl.querySelector('cdk-dom-projection-host')).not.toBeNull();
    expect(outerDivEl.querySelector('.inner')).not.toBe(innerDivEl);

    const innerHtml = appEl.innerHTML;

    // Trigger OnInit (and thus the projection).
    fixture.detectChanges();

    expect(appEl.innerHTML).not.toEqual(innerHtml);

    // Assert `<cdk-dom-projection-host>` is not in the DOM anymore.
    expect(appEl.querySelector('cdk-dom-projection-host')).toBeNull();

    // Assert the outerDiv contains the innerDiv.
    expect(outerDivEl.querySelector('.inner')).toBe(innerDivEl);

    // Assert the innerDiv contains the content.
    expect(innerDivEl.querySelector('.content')).not.toBeNull();
  }));
});


/** Test-bed component that contains a projection. */
@Component({
  selector: '[projection-test]',
  template: `
    <div class="outer">
      <cdk-dom-projection-host><ng-content></ng-content></cdk-dom-projection-host>
    </div>
  `,
})
class ProjectionTestComponent {
  @ViewChild(DomProjectionHost) _host: DomProjectionHost;

  constructor(private _projection: DomProjection, private _ref: ElementRef) {}
  ngOnInit() { this._projection.project(this._ref, this._host); }
}


/** Test-bed component that contains a portal host and a couple of template portals. */
@Component({
  selector: 'projection-app',
  template: `
    <div projection-test class="inner">
      <div class="content"></div>
    </div>
  `,
})
class ProjectionTestApp {
}



const TEST_COMPONENTS = [ProjectionTestApp, ProjectionTestComponent];
@NgModule({
  imports: [ProjectionModule],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class ProjectionTestModule { }

