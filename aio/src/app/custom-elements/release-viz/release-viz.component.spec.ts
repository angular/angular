import { ComponentFixture, TestBed } from '@angular/core/testing';;
import { ReleaseVizComponent } from './release-viz.component';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';

const releaseMarkdown = [
  '| Version | Status         | Released   | Active ends | LTS ends   |',
  '|:---     |:---            |:---        |:---         |:---        |',
  '| ^16.0.0 | TBD            | 2023-11-18 | 2024-05-18  | 2025-05-18 |',
  '| ^15.0.0 | Active         | 2022-11-18 | 2023-05-18  | 2024-05-18 |',
  '| ^14.0.0 | LTS            | 2022-06-02 | 2022-11-18  | 2023-11-18 |',
  '| ^13.0.0 | LTS            | 2021-11-04 | 2022-06-02  | 2023-05-04 |',
  '| ^12.0.0 | Out Of Support | 2020-11-04 | 2021-06-02  | 2022-05-04 |'
].join('\n');

@Component({
  template: `
    <aio-release-viz>
      ${releaseMarkdown}
    </aio-release-viz>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true
})
class TestComponent {
  @ViewChild(ReleaseVizComponent, { static: true }) child: ReleaseVizComponent | undefined;
}

describe('ReleaseVizComponent', () => {

  let shellComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let initContainerSpy: jasmine.Spy;
  let calcHeightAndWidthSpy: jasmine.Spy;
  let todayLineSpy: jasmine.Spy;
  let component: ReleaseVizComponent | any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent,ReleaseVizComponent],
      providers: [ ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    shellComponent = fixture.componentInstance;
    component = shellComponent.child as ReleaseVizComponent;

    component.ngOnInit();

    initContainerSpy = spyOn(component.svg, 'initContainer').and.callThrough();
    calcHeightAndWidthSpy = spyOn(component.svg, 'calcHeightAndWidth').and.callThrough();
    todayLineSpy = spyOn(component.svg, 'getTodayLine').and.callThrough();

    component.ngAfterViewInit();

    fixture.detectChanges();
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    initContainerSpy && initContainerSpy.calls.reset();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    calcHeightAndWidthSpy && calcHeightAndWidthSpy.calls.reset();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    todayLineSpy && todayLineSpy.calls.reset();
    component.svg = undefined;
  });

  it('should contain original markdown content', () => {
    expect((component as any).elementRef.nativeElement.innerHTML).toContain(releaseMarkdown);
  });

  it('should instantiate svg', () => {
    expect(component.svg).toBeDefined();
  });

  it('should have a defined svgContainer element', () => {
    expect(component.svgContainer).toBeDefined();
  });

  it('should initialize svg container', () => {
    expect(initContainerSpy).toHaveBeenCalledTimes(1);
  });

  it('should call svg.calcHeightAndWidth on window resize', () => {
    // called in afterViewInit
    expect(calcHeightAndWidthSpy).toHaveBeenCalledTimes(1);
    calcHeightAndWidthSpy.calls.reset();
    expect(calcHeightAndWidthSpy.calls.count()).toBe(0);

    calcHeightAndWidthSpy = spyOn(component.svg, 'calcHeightAndWidth').and.callThrough();
    component.onResize({});
    expect(calcHeightAndWidthSpy).toHaveBeenCalledTimes(1);
  });

  describe('SVG', () => {

    it('should instantiate _releaseCollection', () => {
      expect((component.svg as any)._releaseCollection).toBeDefined();
    });
    it('should initialize _monthLines', () => {
      expect(component.svg).toBeDefined();
      expect((component.svg as any)._releaseCollection.duration.length).toBe(61);
      expect(todayLineSpy).toHaveBeenCalled();
    });

    it('should not calculate height and width if _svgContainer is undefined', () => {
      const initMonthLinesSpy = spyOn(component.svg, 'initMonthLinesAndXAxis');
      (component.svg as any)._svgContainer = undefined;
      component.svg.calcHeightAndWidth();
      expect(initMonthLinesSpy).not.toHaveBeenCalled();
    });


  });



});
