import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

class MonthYear {
  constructor(
    public month: number | string,
    public year: number | string
  ) { }
}

type SettableReleaseProp = Omit<
  Release,
  'activeDuration' |
  'ltsDuration' |
  'set' |
  'isActive' |
  'isFuture' |
  'isUnsupported' |
  'isLTS' |
  'get'
>;

type SettableReleaseKey = keyof SettableReleaseProp;

class Release  {
  private _camelToOriginalKeyMap: Record<string, string> = {};

  version='';
  status='';
  released='';
  activeEnds='';
  ltsEnds='';
  activeDuration: MonthYear[] = [];
  ltsDuration: MonthYear[] = [];
  constructor(
    r: Release
  ) {
    Object.assign(this, r);
  }

  get(prop: SettableReleaseKey) {
    // for future mute ltsends/activends dates and display approximation
    if (this.isFuture()) {
      const mutableProps = ['ltsEnds', 'activeEnds'];
      const camelifiedProp = this._camelToOriginalKeyMap[prop];
      if (mutableProps.includes(camelifiedProp)) {
        return '';
      }
      if (camelifiedProp === 'released') {
        const releaseDate = new Date(this.released);
        const monthName = releaseDate.toLocaleString('default', { month: 'long' });
        const year = releaseDate.getFullYear();
        return `~ ${monthName}, ${year}`;
      }
    }
    return this[prop];
  }

  set(camelProp: SettableReleaseKey, originalProp: SettableReleaseKey, value: string) {
    this._camelToOriginalKeyMap[originalProp] = camelProp;
    this[originalProp] = value;
    this[camelProp] = value;
  }

  isActive() {
    const released = new Date(this.released).getTime();
    const activeEnds = new Date(this.activeEnds).getTime();
    const today = new Date().getTime();
    return (released <= today && activeEnds >= today);
  }

  isFuture() {
    if (!this.released) {
      return true;
    }
    const released = new Date(this.released).getTime();
    const today = new Date().getTime();
    return released > today;
  }

  isUnsupported() {
    const ltsEnds = new Date(this.ltsEnds).getTime();
    const today = new Date().getTime();
    return ltsEnds <= today;
  }

  isLTS() {
    const activeEnds = new Date(this.activeEnds).getTime();
    const ltsEnds = new Date(this.ltsEnds).getTime();
    const today = new Date().getTime();
    return (today >= activeEnds && today <= ltsEnds);
  }

}

enum SVGType {
  rect = 'rect',
  text = 'text',
  line = 'line'
}

abstract class SVGBase {
  abstract type: SVGType;
  get asLine(): SVGLine {
    throw Error(`asLine called incorrectly by ${this.type} or not overridden.`);
  }

  get asRect(): SVGRect {
    throw Error(`asRect called incorrectly by ${this.type} or not overridden.`);
  }

  get asText(): SVGText {
    throw Error(`asText called incorrectly by ${this.type} or not overridden.`);
  }
}

class SVGRect extends SVGBase {
  type = SVGType.rect;
  override get asRect() {
    return this;
  }
  constructor(
    public width: number,
    public height: number,
    public x: number,
    public cssClass = '',
    public y: number | string = 0,
    public rx: number | string = 0
  ) {
    super();
  }
}

class SVGLine extends SVGBase {
  type = SVGType.line;
  override get asLine() {
    return this;
  }
  constructor(
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number,
    public cssClass = '',
    public dashed = true,
  ) {
    super();
  }
}

class SVGText extends SVGBase {
  type = SVGType.text;
  override get asText() {
    return this;
  }
  constructor(
    public x: number,
    public y: number,
    public text: string | number,
    public cssClass = '',
  ){
    super();
  }
}

class SVGGroup {
  constructor(
    public translateCoords: number[],
    public children: SVGBase[]
  ) { }
}

class VersionLine {
  private readonly _keysAsCamel = {
    version: 'version',
    status: 'status',
    released: 'released',
    'active ends': 'activeEnds',
    'lts ends': 'ltsEnds'
  } as Record<string, string>;

  get keys(): SettableReleaseKey[] {
    return this._keys;
  }

  asCamel(key: string): string {
    return this._keysAsCamel[key];
  }

  private split() {
    return this._line.trim().split('|').filter(x => x).map(x => x.trim());
  }

  constructor(private _line: string, private _keys: SettableReleaseKey[] = []) { }

  asArray() {
    return this.split();
  }

  asObject(): Release {
    const release = new Release({} as Release);
    this.asArray().forEach((k: string, i) => {
      const camelKey = this.asCamel(
        (this._keys[i] || '').toLowerCase()
      ) as SettableReleaseKey;

      release.set(camelKey, this._keys[i], k);
    });
    return release;
  }
}

class ReleaseCollection {
  private _lines: VersionLine[] = [];
  private _releases: Release[] = [];
  private _duration: MonthYear[] = [];

  // used in template
  get lines() {
    return this._lines;
  }

  get releases() {
    return this._releases;
  }

  get duration() {
    return this._duration;
  }

  get releaseKeys(): SettableReleaseKey[] {
    return (this.lines || [ { keys: [] } ])[0].keys;
  }

  constructor(rawText: string, private monthBuffer = 0, public sortAscendingTopToBottom = false) {
    this._lines = this.parseVersionLinesFromRawText(rawText);
    this._releases = this.massageReleaseData(this._lines.map(x => new Release(x.asObject())));
    const { first, last } = this.getFirstAndLastReleaseDates(this.releases);
    this._duration = this.getMonthsAndYearsBetweenDateStrings(first, last, this.monthBuffer);
  }

  private getFirstAndLastReleaseDates(releases: Release[]) {
    return this.sortAscendingTopToBottom ?
      {
        first: releases[0].released,
        last: releases[releases.length - 1].ltsEnds
      }:
      {
        first: releases[this.releases.length - 1].released,
        last: releases[0].ltsEnds,
      };
  }

  private parseVersionLinesFromRawText(versionText: string) {
    const allLines = versionText.split('\n');
    const versionLines = allLines.slice(1, -1);
    const keys = new VersionLine(versionLines[0]).asArray();
    const result = [] as any;
    for (let i = 0; i < versionLines.length; i++) {

      // skip header and separator rows
      if (i === 0 || i === 1) {
        continue;
      }

      // body row(s)
      result.push(new VersionLine(versionLines[i], keys as SettableReleaseKey[]));

    }
    return result;
  }

  private massageReleaseData(releases: Release[]) {
    return this.appendDurations(
      this.sortReleases(releases)
    );
  }

  private appendDurations(releases: Release[]) {
    return releases.map((r) => {
      r.activeDuration = this.getMonthsAndYearsBetweenDateStrings(r.released, r.activeEnds);
      r.ltsDuration = this.getMonthsAndYearsBetweenDateStrings(r.activeEnds, r.ltsEnds);
      return r;
    });
  }

  private sortReleases(releases: Release[]) {
    const result = releases.sort((a, b) => {
      const aReleaseDate = new Date(a.released).getTime();
      const bReleaseDate = new Date(b.released).getTime();
      const abOrder = ((aReleaseDate < bReleaseDate) ? -1 : 1);
      return (aReleaseDate === bReleaseDate) ? 0 : abOrder;
    });
    return this.sortAscendingTopToBottom ? result : result.reverse();
  }

  private getDates(firstDate: string, secondDate: string, endBuffer: number) {
    const fromDate = new Date(firstDate);
    const toDate = new Date(secondDate);

    return [
      new Date(fromDate.setMonth(fromDate.getMonth() - endBuffer)),
      new Date(toDate.setMonth(toDate.getMonth() + endBuffer))
    ];
  }

  private getMonthsAndYearsBetweenDateStrings(firstDate: string, secondDate: string, endBuffer = 0): MonthYear[] {
    const [ fromDate, toDate ] = this.getDates(firstDate, secondDate, endBuffer);
    const fromYear = fromDate.getFullYear();
    const fromMonth = fromDate.getMonth();
    const toYear = toDate.getFullYear();
    const toMonth = toDate.getMonth();
    const monthYearPairs = [];

    for(let year = fromYear; year <= toYear; year++) {
      let monthNum = year === fromYear ? fromMonth : 0;
      const monthLimit = year === toYear ? toMonth : 11;

      for(; monthNum <= monthLimit; monthNum++) {
        const month = monthNum + 1;
        monthYearPairs.push({ year, month });
      }
    }
    return monthYearPairs;
  }

}

export class SVG {
  // element containing svg
  private _svgContainer: HTMLElement | undefined;

  // base svg height
  private _height = 300;

  // base svg width
  private _width = 460;

  // height should only be calc'd once
  private _initialHeighSet = false;

  // classes for svg table elements
  private readonly _cssClasses = {
    monthLine: 'rv-month-line',
    monthText: 'rv-month-text',
    legendText: 'rv-legend-text',
    todayLine: 'rv-today-line',
    todayText: 'rv-today-text',
    active: 'rv-active',
    lts: 'rv-lts',
    unsupported: 'rv-unsupported',
    future: 'rv-future',
    partialOpaque: 'rv-partial-opaque',
    versionDark: 'rv-version-dark',
    versionLight: 'rv-version-light'
  };

  private _releaseCollection: ReleaseCollection;
  private _monthLines: SVGGroup[] = [];
  private _releaseBars: SVGGroup[] = [];
  private _legend: SVGGroup[] = [];

  // margins within svg element
  private readonly _margin = { top: 40, right: 50, bottom: 60, left: 80 };

  // computed svg width, accounting for margins
  private _graphAreaWidth = this._width - this._margin.left - this._margin.right;

  // computed svg height, accounting for margins
  private _graphAreaHeight = this._height - this._margin.top - this._margin.bottom;

  // height of bars in bar/rect graph (incl yAxis bars)
  private readonly _rectHeight = 35;

  // margin between bars/rects
  private readonly _rectMargin = 15;

  // lines margin between line top/bottom and containing svg
  private readonly _lineMargin = 5;

  // width of yAxis version bar/rect
  private readonly _yAxisVersionRectWidth = 55;

  // number of months before and after first and last release month (respectively)
  private readonly _monthBuffer = 3;

  // divisions of space by no of months
  private get _units() {
    return this._graphAreaWidth / this._releaseCollection.duration.length;
  }

  get releaseCollection() {
    return this._releaseCollection;
  }

  get renderGroups() {
    return [
      ...this._monthLines,
      ...this._releaseBars,
      ...this._legend,
      this.getTodayLine()
    ];
  }

  get overallWidth() {
    return this._graphAreaWidth + this._margin.left + this._margin.right;
  }

  get overallHeight() {
    return this._graphAreaHeight + this._margin.top + this._margin.bottom;
  }

  constructor(releaseMarkdown: string) {
    this._releaseCollection = new ReleaseCollection(releaseMarkdown, this._monthBuffer);
  }

  private init(calculateHeightWidth = false) {
    this.initMonthLinesAndXAxis();
    this.initReleaseBarsAndYAxis();
    this.initLegend();

    if (calculateHeightWidth) {
      this.calcHeightAndWidth();
    }
  }

  private getTodayLine() {
    const todayDate = new Date();
    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth() + 1
    const todayDayInMonth = todayDate.getDate();
    const daysInMonth = new Date(todayYear, todayMonth, 0).getDate();
    const percentIntoCurrentMonth = this._units * (todayDayInMonth/daysInMonth);
    const x = this.getX(new MonthYear(todayMonth, todayYear)) + percentIntoCurrentMonth;
    const children = [
      new SVGLine (
        x,
        this._graphAreaHeight - this._lineMargin,
        x,
        0,
        this._cssClasses.todayLine,
        true
      ),
      new SVGText(
        x - 35,
        (this._lineMargin - 2) * -1,
        `${todayYear}-${todayMonth < 10 ? '0' + todayMonth : todayMonth}-${todayDayInMonth}`,
        this._cssClasses.todayText
      )
    ] as SVGBase[];

    return new SVGGroup(
      this.getTranslate(0, true),
      children
    );
  }

  private initLegend() {
    const statuses: Record<string, string> = {};
    this._releaseCollection.releases.forEach((release: Release) => {
      statuses[release.status] = this.determineReleaseClass(release);
    });

    const statusKeys = Object.keys(statuses);
    const y = this.getTranslate(this.releaseCollection.releases.length + 1)[1] + (this._rectHeight * .5);
    const statusUnits = this._graphAreaWidth / statusKeys.length;
    this._legend = statusKeys.map((status: string, i) => {
      const statusCamel = statuses[status];
      const unadjustedX = ((i + 1) * statusUnits);
      const x = unadjustedX - this._margin.left - this._margin.right;

      const children = [

        new SVGRect(
          10,
          10,
          0,
          statusCamel,
          0,
          15
        ),

        new SVGText(
          15,
          10,
          status,
          this._cssClasses.legendText
        )

      ] as SVGBase[];
      return new SVGGroup(
        [x, y],
        children
      );
    });
  }

  private initMonthLinesAndXAxis(): void {
    this._monthLines = [
      ...this._releaseCollection.duration.map((releaseMonthAndYear: MonthYear, i: number) => {

        const children = [
          new SVGLine(
            this.getX(releaseMonthAndYear),
            this._graphAreaHeight - this._lineMargin,
            this.getX(releaseMonthAndYear),
            0,
            [this._cssClasses.monthLine, this._cssClasses.partialOpaque].join(' '),
            releaseMonthAndYear.month !== 1
          ),
        ] as SVGBase[];

        // x axis year element
        if (releaseMonthAndYear.month === 1) {
          children.push(
            new SVGText(
              this.getX(releaseMonthAndYear) - 18,
              this._graphAreaHeight + 20,
              releaseMonthAndYear.year,
              this._cssClasses.monthText
            )
          );
        }

        return new SVGGroup(
          this.getTranslate(i, true),
          children
        );

      })
    ];
  }

  private determineReleaseClass(release: Release) {
    return release.isActive() ? this._cssClasses.active :
      release.isFuture() ? this._cssClasses.future :
        release.isUnsupported() ? this._cssClasses.unsupported:
          release.isLTS() ? this._cssClasses.lts: '';
  }

  private getYAxisElements() {
    return this._releaseCollection.releases.map((release: Release, i: number) => {
      const children = [

        // y axis background
        new SVGRect(
          this._yAxisVersionRectWidth,
          this._rectHeight,
          0,
          this.determineReleaseClass(release),
          0,
          10
        ),

        // y axis text (always add text last for z-index purposes)
        new SVGText(
          (this._rectHeight * 2) * .1,
          this._rectHeight * .65,
          release.version,
          !release.isFuture() && ! release.isUnsupported() ?
            this._cssClasses.versionDark :
            this._cssClasses.versionLight
        ),

      ] as SVGBase[];

      return new SVGGroup(
        [0, this.getTranslate(i)[1]],
        children
      );
    });
  }

  private getReleaseBarsElements() {
    return this._releaseCollection.releases.map((release: Release, i: number) => {

      const children = [

        // active release period
        new SVGRect(
          this.getBarWidth(release.activeDuration),
          this._rectHeight,
          this.getX(release.activeDuration[0]),
          this._cssClasses.active,
        ),

        // lts release period
        new SVGRect(
          this.getBarWidth(release.ltsDuration),
          this._rectHeight,
          this.getX(release.ltsDuration[0]),
          this._cssClasses.lts,
        ),

      ];

      // purple stripe for future
      if (release.isFuture()) {
        children.push(
          new SVGRect(
            this.getBarWidth([...release.activeDuration, ...release.ltsDuration]),
            this._rectHeight/3,
            this.getX(release.activeDuration[0]),
            [this._cssClasses.future, this._cssClasses.partialOpaque].join(' '),
            (this._rectHeight/3)*2
          )
        );
      }

      // red stripe for unsupported
      if (release.isUnsupported()) {
        children.push(
          new SVGRect(
            this.getBarWidth([...release.activeDuration, ...release.ltsDuration]),
            this._rectHeight/3,
            this.getX(release.activeDuration[0]),
            [this._cssClasses.unsupported,, this._cssClasses.partialOpaque].join(' '),
            (this._rectHeight/3)*2
          )
        );
      }

      return new SVGGroup(
        this.getTranslate(i),
        children
      );
    });
  }

  private initReleaseBarsAndYAxis(): void {
    this._releaseBars = [
      ...this.getYAxisElements(),
      ...this.getReleaseBarsElements()
    ];
  }

  private getTranslate(index: number, forLine = false) {
    let rectTop = 0;
    let margin = this._rectMargin;
    if (!forLine) {
      rectTop = (index + 1) * 25;
      margin = (index + 1) * this._rectMargin;
    }
    return [this._margin.left, rectTop + margin];
  }

  private getX(monthYear: MonthYear) {
    const ofMonthYear = (item: MonthYear) =>
      monthYear.month === item.month && monthYear.year === item.year;

    return this._releaseCollection.duration.findIndex(ofMonthYear) * this._units;
  }

  private getBarWidth(duration: MonthYear[]) {
    return this.getX(duration[duration.length -1]) - this.getX(duration[0]);
  }

  calcHeightAndWidth() {
    if (!this._svgContainer) { return; }
    this._graphAreaWidth = this._svgContainer.offsetWidth - this._margin.left - this._margin.right;

    if (!this._initialHeighSet) {
      this._graphAreaHeight = this.getTranslate(this.releaseCollection.releases.length + 1)[1] - this._rectHeight;
      this._initialHeighSet = true;
    }

    this.init();
  }

  initContainer(container: HTMLElement) {
    this._svgContainer = container;
    this.init(true);
  }
}

const styles = [
  `
  svg {
    height: 100%;
    width: 100%;
    position: relative;
    display: block;
    min-height: 250px;
  }

  .rv-container {
    width: calc(100% - 2em);
    position: relative;
    min-height: 250px;
    padding-left: 2em;
  }

  .rv-month-line {
    stroke: #bbb9b9;
  }

  .rv-today-line {
    stroke: black;
  }

  @media (prefers-color-scheme: dark),  {
    .rv-today-line {
      stroke: #1a77d2;
    }
    .rv-today-text, .rv-month-text, .rv-legend-text {
      fill: white !important;
    }
  }

  .rv-today-text {
    fill: gray;
  }

  .rv-month-line[stroke-dasharray] {
    opacity: .7;
  }

  .rv-table-version {
    text-align: center;
    display: inline-block;
    padding: 0.5em 0.5em 0.5em 0.5em;
    border-radius: 15px;
  }

  .rv-active {
    fill: #07ba60;
    background-color: #07ba60;
  }

  .rv-lts {
    fill: #f3d354;
    background-color: #f3d354;
  }

  .rv-unsupported {
    fill: #dd0032;
    background-color: #dd0032;
  }

  .rv-future {
    fill: #1a77d2;
    background-color: #1a77d2
  }

  .rv-partial-opaque {
    opacity: .85;
  }

  .rv-version-dark {
    font-size: .75em;
    color: black;
    fill: black;
  }

  .rv-version-light {
    font-size: .75em;
    color: white;
    fill: white;
  }

  .rv-table-chip {
    font-size: 1em !important;
  }

  .rv-table {
    margin-bottom: 3em;
  }

  .rv-table-head {
    background: rgba(219, 219, 219, 0.2) !important;
    border-bottom: 1px solid #DBDBDB;
    color: #444444;
  }

  `
];

/**
 * Displays supported versions as a visualisation.
 *
 * The data for the supported versions is a md table in the
 * `aio/content/guide/releases.md#Actively supported versions` section
 *
 * The format for that table looks like this:
 *
 * ```
 * | Version   | Status      | Released   | Active ends | LTS ends   |
 * |:---       |:---         |:---        |:---         |:---        |
 * | ^99.99.99 | Future      | 2123-11-18 | 2124-05-18  | 2125-05-18 |
 * | ^15.0.0   | Active      | 2022-11-18 | 2023-05-18  | 2024-05-18 |
 * | ^14.0.0   | LTS         | 2022-06-02 | 2022-11-18  | 2023-11-18 |
 * | ^13.0.0   | LTS         | 2021-11-04 | 2022-06-02  | 2023-05-04 |
 * | ^12.0.0   | Unsupported | 1920-11-04 | 1921-06-02  | 1922-05-04 |
 * ```
 *
 * Markdown/Table Structure:
 *  - This component requires that the dividing row between header and body
 *    is there (eg. `:--- |: ---`); it will parse incorrectly if it is not.
 *    ```
 *    Header Row
 *    Dividing Row
 *    1-n Release Rows
 *    ```
 *
 * Statuses:
 *  - The legend under the graph requires unique statuses for Active, Future,
 *    LTS and Unsupported releases/types.
 *
 * Future Releases:
 *  - To list a release as a future release, make certain the
 *    `Released`/`Active ends`/`LTS ends` date(s) in the future, and give it a
 *    `Status` that indicates it's a future release (eg. 'Future', 'TBD')
 *  - The `Released` date is presented as `~${month name}, ${year}` and the
 *    `Active Ends`/`LTS Ends` dates are not shown
 *
 * Releases That Are No Longer Supported:
 *  - To list a release as no longer supported, make certain the `LTS ends` date
 *    is in the past, and again, give the line a `Status` that indicates it is
 *    no longer supported (eg. 'Unsupported', 'No Longer Supported').
 *
 */
@Component({
  selector: 'aio-release-viz',
  styles,
  templateUrl: './release-viz.component.html',
})
export class ReleaseVizComponent implements OnInit, AfterViewInit {
  @ViewChild('svgContainer', { static: true }) svgContainer: ElementRef<HTMLDivElement>;

  svg: SVG | undefined;
  renderGroups: SVGGroup[] = [];
  displayedColumns = [] as SettableReleaseKey[];
  dataSource = [] as Release[];

  constructor(
    private elementRef: ElementRef
  ) {  }

  @HostListener('window:resize', ['$event'])
  onResize(_e: any) {
    this.svg?.calcHeightAndWidth();
  }

  ngOnInit() {
    const releaseMarkdown = this.elementRef.nativeElement.innerHTML;
    this.svg = new SVG(releaseMarkdown);
  }

  ngAfterViewInit(): void {
    this.svg?.initContainer(this.svgContainer.nativeElement);
    this.renderGroups = this.svg?.renderGroups as any;
    if (
      this.svg?.releaseCollection.releaseKeys.length &&
      this.svg?.releaseCollection?.releases.length
    ) {
      this.displayedColumns = this.svg.releaseCollection.releaseKeys;
      this.dataSource = this.svg.releaseCollection.releases;
    }
  }
}
