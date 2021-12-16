// tslint:disable
import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, QueryList, Renderer2, ViewChildren,} from '@angular/core';
import {Observable, Subject, Subscriber} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {IArea, IAreaSnapshot, IOutputAreaSizes, IOutputData, IPoint, ISplitSnapshot} from './interface';
import {SplitAreaDirective} from './splitArea.directive';
import {getAreaMaxSize, getAreaMinSize, getElementPixelSize, getGutterSideAbsorptionCapacity, getInputBoolean, getInputPositiveNumber, getPointFromEvent, isUserSizesValid, updateAreaSize,} from './utils';

/**
 * angular-split
 *
 *
 *  PERCENT MODE ([unit]="'percent'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |       20                 30                 20                 15                 15      | <--
 * [size]="x" |               10px               10px               10px               10px | <--
 * [gutterSize]="10" |calc(20% - 8px)    calc(30% - 12px)   calc(20% - 8px)    calc(15% - 6px)
 * calc(15% - 6px)| <-- CSS flex-basis property (with flex-grow&shrink at 0) |     152px 228px 152px
 * 114px              114px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <--
 * el.getBoundingClientRect().width flex-basis = calc( { area.size }% - { area.size/100 *
 * nbGutter*gutterSize }px );
 *
 *
 *  PIXEL MODE ([unit]="'pixel'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |      100                250                 *                 150                100      | <--
 * [size]="y" |               10px               10px               10px               10px | <--
 * [gutterSize]="10" |   0 0 100px          0 0 250px           1 1 auto          0 0 150px 0 0
 * 100px   | <-- CSS flex property (flex-grow/flex-shrink/flex-basis) |     100px              250px
 * 200px              150px              100px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <--
 * el.getBoundingClientRect().width
 *
 */

@Component({
  selector: 'as-split',
  exportAs: 'asSplit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [`./split.component.scss`],
  template: ` <ng-content></ng-content>
    <ng-template ngFor [ngForOf]="displayedAreas" let-index="index" let-last="last">
      <div
        *ngIf="last === false"
        #gutterEls
        class="as-split-gutter"
        [style.flex-basis.px]="gutterSize"
        [style.order]="index * 2 + 1"
        (mousedown)="startDragging($event, index * 2 + 1, index + 1)"
        (touchstart)="startDragging($event, index * 2 + 1, index + 1)"
        (mouseup)="clickGutter($event, index + 1)"
        (touchend)="clickGutter($event, index + 1)"
      >
        <div class="as-split-gutter-icon"></div>
      </div>
    </ng-template>`,
})
export class SplitComponent implements AfterViewInit, OnDestroy {
  private _direction: 'horizontal'|'vertical' = 'horizontal';

  @Input()
  set direction(v: 'horizontal'|'vertical') {
    this._direction = v === 'vertical' ? 'vertical' : 'horizontal';

    this.renderer.addClass(this.elRef.nativeElement, `as-${this._direction}`);
    this.renderer.removeClass(
        this.elRef.nativeElement,
        `as-${this._direction === 'vertical' ? 'horizontal' : 'vertical'}`);

    this.build(false, false);
  }

  get direction(): 'horizontal'|'vertical' {
    return this._direction;
  }

  ////

  private _unit: 'percent'|'pixel' = 'percent';

  @Input()
  set unit(v: 'percent'|'pixel') {
    this._unit = v === 'pixel' ? 'pixel' : 'percent';

    this.renderer.addClass(this.elRef.nativeElement, `as-${this._unit}`);
    this.renderer.removeClass(
        this.elRef.nativeElement, `as-${this._unit === 'pixel' ? 'percent' : 'pixel'}`);

    this.build(false, true);
  }

  get unit(): 'percent'|'pixel' {
    return this._unit;
  }

  ////

  private _gutterSize: number = 11;

  @Input()
  set gutterSize(v: number|null) {
    this._gutterSize = getInputPositiveNumber(v, 11);

    this.build(false, false);
  }

  get gutterSize(): number|null {
    return this._gutterSize;
  }

  ////

  private _gutterStep: number = 1;

  @Input()
  set gutterStep(v: number) {
    this._gutterStep = getInputPositiveNumber(v, 1);
  }

  get gutterStep(): number {
    return this._gutterStep;
  }

  ////

  private _restrictMove: boolean = false;

  @Input()
  set restrictMove(v: boolean) {
    this._restrictMove = getInputBoolean(v);
  }

  get restrictMove(): boolean {
    return this._restrictMove;
  }

  ////

  private _useTransition: boolean = false;

  @Input()
  set useTransition(v: boolean) {
    this._useTransition = getInputBoolean(v);

    if (this._useTransition)
      this.renderer.addClass(this.elRef.nativeElement, 'as-transition');
    else
      this.renderer.removeClass(this.elRef.nativeElement, 'as-transition');
  }

  get useTransition(): boolean {
    return this._useTransition;
  }

  ////

  private _disabled: boolean = false;

  @Input()
  set disabled(v: boolean) {
    this._disabled = getInputBoolean(v);

    if (this._disabled)
      this.renderer.addClass(this.elRef.nativeElement, 'as-disabled');
    else
      this.renderer.removeClass(this.elRef.nativeElement, 'as-disabled');
  }

  get disabled(): boolean {
    return this._disabled;
  }

  ////

  private _dir: 'ltr'|'rtl' = 'ltr';

  @Input()
  set dir(v: 'ltr'|'rtl') {
    this._dir = v === 'rtl' ? 'rtl' : 'ltr';

    this.renderer.setAttribute(this.elRef.nativeElement, 'dir', this._dir);
  }

  get dir(): 'ltr'|'rtl' {
    return this._dir;
  }

  ////

  private _gutterDblClickDuration: number = 0;

  @Input()
  set gutterDblClickDuration(v: number) {
    this._gutterDblClickDuration = getInputPositiveNumber(v, 0);
  }

  get gutterDblClickDuration(): number {
    return this._gutterDblClickDuration;
  }

  ////

  @Output() dragStart = new EventEmitter<IOutputData>(false);
  @Output() dragEnd = new EventEmitter<IOutputData>(false);
  @Output() gutterClick = new EventEmitter<IOutputData>(false);
  @Output() gutterDblClick = new EventEmitter<IOutputData>(false);

  private transitionEndSubscriber: Subscriber<IOutputAreaSizes>;
  @Output()
  get transitionEnd(): Observable<IOutputAreaSizes> {
    return new Observable((subscriber) => (this.transitionEndSubscriber = subscriber))
        .pipe(debounceTime<any>(20));
  }

  private dragProgressSubject: Subject<IOutputData> = new Subject();
  dragProgress$: Observable<IOutputData> = this.dragProgressSubject.asObservable();

  ////

  private isDragging: boolean = false;
  private dragListeners: Array<Function> = [];
  private snapshot: ISplitSnapshot|null = null;
  private startPoint: IPoint|null = null;
  private endPoint: IPoint|null = null;

  public readonly displayedAreas: Array<IArea> = [];
  private readonly hidedAreas: Array<IArea> = [];

  @ViewChildren('gutterEls') private gutterEls: QueryList<ElementRef>;

  constructor(
      private ngZone: NgZone, private elRef: ElementRef, private cdRef: ChangeDetectorRef,
      private renderer: Renderer2) {
    // To force adding default class, could be override by user @Input() or not
    this.direction = this._direction;
  }

  public ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      // To avoid transition at first rendering
      setTimeout(() => this.renderer.addClass(this.elRef.nativeElement, 'as-init'));
    });
  }

  private getNbGutters(): number {
    return this.displayedAreas.length === 0 ? 0 : this.displayedAreas.length - 1;
  }

  public addArea(component: SplitAreaDirective): void {
    const newArea: IArea = {
      component,
      order: 0,
      size: 0,
      minSize: null,
      maxSize: null,
    };

    if (component.visible === true) {
      this.displayedAreas.push(newArea);

      this.build(true, true);
    } else {
      this.hidedAreas.push(newArea);
    }
  }

  public removeArea(component: SplitAreaDirective): void {
    if (this.displayedAreas.some((a) => a.component === component)) {
      const area = this.displayedAreas.find((a) => a.component === component);
      this.displayedAreas.splice(this.displayedAreas.indexOf(area!), 1);

      this.build(true, true);
    } else if (this.hidedAreas.some((a) => a.component === component)) {
      const area = this.hidedAreas.find((a) => a.component === component);
      this.hidedAreas.splice(this.hidedAreas.indexOf(area!), 1);
    }
  }

  public updateArea(component: SplitAreaDirective, resetOrders: boolean, resetSizes: boolean):
      void {
    if (component.visible === true) {
      this.build(resetOrders, resetSizes);
    }
  }

  public showArea(component: SplitAreaDirective): void {
    const area = this.hidedAreas.find((a) => a.component === component);
    if (area === undefined) {
      return;
    }

    const areas = this.hidedAreas.splice(this.hidedAreas.indexOf(area), 1);
    this.displayedAreas.push(...areas);

    this.build(true, true);
  }

  public hideArea(comp: SplitAreaDirective): void {
    const area = this.displayedAreas.find((a) => a.component === comp);
    if (area === undefined) {
      return;
    }

    const areas = this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
    areas.forEach((area) => {
      area.order = 0;
      area.size = 0;
    });
    this.hidedAreas.push(...areas);

    this.build(true, true);
  }

  public getVisibleAreaSizes(): IOutputAreaSizes {
    return this.displayedAreas.map((a) => (a.size === null ? '*' : a.size));
  }

  public setVisibleAreaSizes(sizes: IOutputAreaSizes): boolean {
    if (sizes.length !== this.displayedAreas.length) {
      return false;
    }

    const formatedSizes = sizes.map((s) => getInputPositiveNumber(s, null));
    const isValid = isUserSizesValid(this.unit, formatedSizes);

    if (isValid === false) {
      return false;
    }

    // @ts-ignore
    this.displayedAreas.forEach((area, i) => (area.component._size = formatedSizes[i]));

    this.build(false, true);
    return true;
  }

  private build(resetOrders: boolean, resetSizes: boolean): void {
    this.stopDragging();

    // ¤ AREAS ORDER

    if (resetOrders === true) {
      // If user provided 'order' for each area, use it to sort them.
      if (this.displayedAreas.every((a) => a.component.order !== null)) {
        this.displayedAreas.sort((a, b) => <number>a.component.order - <number>b.component.order);
      }

      // Then set real order with multiples of 2, numbers between will be used by gutters.
      this.displayedAreas.forEach((area, i) => {
        area.order = i * 2;
        area.component.setStyleOrder(area.order);
      });
    }

    // ¤ AREAS SIZE

    if (resetSizes === true) {
      const useUserSizes =
          isUserSizesValid(this.unit, this.displayedAreas.map((a) => a.component.size));

      switch (this.unit) {
        case 'percent': {
          const defaultSize = 100 / this.displayedAreas.length;

          this.displayedAreas.forEach((area) => {
            area.size = useUserSizes ? <number>area.component.size : defaultSize;
            area.minSize = getAreaMinSize(area);
            area.maxSize = getAreaMaxSize(area);
          });
          break;
        }
        case 'pixel': {
          if (useUserSizes) {
            this.displayedAreas.forEach((area) => {
              area.size = area.component.size;
              area.minSize = getAreaMinSize(area);
              area.maxSize = getAreaMaxSize(area);
            });
          } else {
            const wildcardSizeAreas = this.displayedAreas.filter((a) => a.component.size === null);

            // No wildcard area > Need to select one arbitrarily > first
            if (wildcardSizeAreas.length === 0 && this.displayedAreas.length > 0) {
              this.displayedAreas.forEach((area, i) => {
                area.size = i === 0 ? null : area.component.size;
                area.minSize = i === 0 ? null : getAreaMinSize(area);
                area.maxSize = i === 0 ? null : getAreaMaxSize(area);
              });
            }
            // More than one wildcard area > Need to keep only one arbitrarly > first
            else if (wildcardSizeAreas.length > 1) {
              let alreadyGotOne = false;
              this.displayedAreas.forEach((area) => {
                if (area.component.size === null) {
                  if (alreadyGotOne === false) {
                    area.size = null;
                    area.minSize = null;
                    area.maxSize = null;
                    alreadyGotOne = true;
                  } else {
                    area.size = 100;
                    area.minSize = null;
                    area.maxSize = null;
                  }
                } else {
                  area.size = area.component.size;
                  area.minSize = getAreaMinSize(area);
                  area.maxSize = getAreaMaxSize(area);
                }
              });
            }
          }
          break;
        }
      }
    }

    this.refreshStyleSizes();
    this.cdRef.markForCheck();
  }

  private refreshStyleSizes(): void {
    ///////////////////////////////////////////
    // PERCENT MODE
    if (this.unit === 'percent') {
      // Only one area > flex-basis 100%
      if (this.displayedAreas.length === 1) {
        this.displayedAreas[0].component.setStyleFlex(0, 0, `100%`, false, false);
      }
      // Multiple areas > use each percent basis
      else {
        // Size in pixels
        const visibleGutterSize = 1;
        // Use visible gutter size in calculation instead of the invisible draggable gutter
        const sumGutterSize = this.getNbGutters() * visibleGutterSize;

        this.displayedAreas.forEach((area) => {
          area.component.setStyleFlex(
              0, 0, `calc( ${area.size}% - ${(<number>area.size / 100) * sumGutterSize}px )`,
              area.minSize !== null && area.minSize === area.size ? true : false,
              area.maxSize !== null && area.maxSize === area.size ? true : false);
        });
      }
    }
    ///////////////////////////////////////////
    // PIXEL MODE
    else if (this.unit === 'pixel') {
      this.displayedAreas.forEach((area) => {
        // Area with wildcard size
        if (area.size === null) {
          if (this.displayedAreas.length === 1) {
            area.component.setStyleFlex(1, 1, `100%`, false, false);
          } else {
            area.component.setStyleFlex(1, 1, `auto`, false, false);
          }
        }
        // Area with pixel size
        else {
          // Only one area > flex-basis 100%
          if (this.displayedAreas.length === 1) {
            area.component.setStyleFlex(0, 0, `100%`, false, false);
          }
          // Multiple areas > use each pixel basis
          else {
            area.component.setStyleFlex(
                0, 0, `${area.size}px`,
                area.minSize !== null && area.minSize === area.size ? true : false,
                area.maxSize !== null && area.maxSize === area.size ? true : false);
          }
        }
      });
    }
  }

  _clickTimeout: number|null = null;

  public clickGutter(event: MouseEvent|TouchEvent, gutterNum: number): void {
    const tempPoint = getPointFromEvent(event);

    // Be sure mouseup/touchend happened at same point as mousedown/touchstart to trigger
    // click/dblclick
    if (this.startPoint && this.startPoint.x === tempPoint!.x &&
        this.startPoint.y === tempPoint!.y) {
      // If timeout in progress and new click > clearTimeout & dblClickEvent
      if (this._clickTimeout !== null) {
        window.clearTimeout(this._clickTimeout);
        this._clickTimeout = null;
        this.notify('dblclick', gutterNum);
        this.stopDragging();
      }
      // Else start timeout to call clickEvent at end
      else {
        this._clickTimeout = window.setTimeout(() => {
          this._clickTimeout = null;
          this.notify('click', gutterNum);
          this.stopDragging();
        }, this.gutterDblClickDuration);
      }
    }
  }

  public startDragging(event: MouseEvent|TouchEvent, gutterOrder: number, gutterNum: number): void {
    event.preventDefault();
    event.stopPropagation();

    this.startPoint = getPointFromEvent(event);
    if (this.startPoint === null || this.disabled === true) {
      return;
    }

    this.snapshot = {
      gutterNum,
      lastSteppedOffset: 0,
      allAreasSizePixel:
          getElementPixelSize(this.elRef, this.direction) - this.getNbGutters() * this.gutterSize!,
      allInvolvedAreasSizePercent: 100,
      areasBeforeGutter: [],
      areasAfterGutter: [],
    };

    this.displayedAreas.forEach((area) => {
      const areaSnapshot: IAreaSnapshot = {
        area,
        sizePixelAtStart: getElementPixelSize(area.component.elRef, this.direction),
        sizePercentAtStart: (this.unit === 'percent' ? area.size : -1) as
            number,  // If pixel mode, anyway, will not be used.
      };

      if (area.order < gutterOrder) {
        if (this.restrictMove === true) {
          this.snapshot!.areasBeforeGutter = [areaSnapshot];
        } else {
          this.snapshot!.areasBeforeGutter.unshift(areaSnapshot);
        }
      } else if (area.order > gutterOrder) {
        if (this.restrictMove === true) {
          if (this.snapshot!.areasAfterGutter.length === 0)
            this.snapshot!.areasAfterGutter = [areaSnapshot];
        } else {
          this.snapshot!.areasAfterGutter.push(areaSnapshot);
        }
      }
    });

    this.snapshot.allInvolvedAreasSizePercent = [
      ...this.snapshot.areasBeforeGutter,
      ...this.snapshot.areasAfterGutter,
    ].reduce((t, a) => t + a.sizePercentAtStart, 0);

    if (this.snapshot.areasBeforeGutter.length === 0 ||
        this.snapshot.areasAfterGutter.length === 0) {
      return;
    }

    this.dragListeners.push(
        this.renderer.listen('document', 'mouseup', this.stopDragging.bind(this)));
    this.dragListeners.push(
        this.renderer.listen('document', 'touchend', this.stopDragging.bind(this)));
    this.dragListeners.push(
        this.renderer.listen('document', 'touchcancel', this.stopDragging.bind(this)));

    this.ngZone.runOutsideAngular(() => {
      this.dragListeners.push(
          this.renderer.listen('document', 'mousemove', this.dragEvent.bind(this)));
      this.dragListeners.push(
          this.renderer.listen('document', 'touchmove', this.dragEvent.bind(this)));
    });

    this.displayedAreas.forEach((area) => area.component.lockEvents());

    this.isDragging = true;
    this.renderer.addClass(this.elRef.nativeElement, 'as-dragging');
    this.renderer.addClass(
        this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');

    this.notify('start', this.snapshot.gutterNum);
  }

  private dragEvent(event: MouseEvent|TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this._clickTimeout !== null) {
      window.clearTimeout(this._clickTimeout);
      this._clickTimeout = null;
    }

    if (this.isDragging === false) {
      return;
    }

    this.endPoint = getPointFromEvent(event);
    if (this.endPoint === null) {
      return;
    }

    // Calculate steppedOffset

    let offset = this.direction === 'horizontal' ? this.startPoint!.x - this.endPoint.x :
                                                   this.startPoint!.y - this.endPoint.y;
    if (this.dir === 'rtl') {
      offset = -offset;
    }
    const steppedOffset = Math.round(offset / this.gutterStep) * this.gutterStep;

    if (steppedOffset === this.snapshot!.lastSteppedOffset) {
      return;
    }

    this.snapshot!.lastSteppedOffset = steppedOffset;

    // Need to know if each gutter side areas could reacts to steppedOffset

    let areasBefore = getGutterSideAbsorptionCapacity(
        this.unit, this.snapshot!.areasBeforeGutter, -steppedOffset,
        this.snapshot!.allAreasSizePixel);
    let areasAfter = getGutterSideAbsorptionCapacity(
        this.unit, this.snapshot!.areasAfterGutter, steppedOffset,
        this.snapshot!.allAreasSizePixel);

    // Each gutter side areas can't absorb all offset
    if (areasBefore.remain !== 0 && areasAfter.remain !== 0) {
      if (Math.abs(areasBefore.remain) === Math.abs(areasAfter.remain)) {
      } else if (Math.abs(areasBefore.remain) > Math.abs(areasAfter.remain)) {
        areasAfter = getGutterSideAbsorptionCapacity(
            this.unit, this.snapshot!.areasAfterGutter, steppedOffset + areasBefore.remain,
            this.snapshot!.allAreasSizePixel);
      } else {
        areasBefore = getGutterSideAbsorptionCapacity(
            this.unit, this.snapshot!.areasBeforeGutter, -(steppedOffset - areasAfter.remain),
            this.snapshot!.allAreasSizePixel);
      }
    }
    // Areas before gutter can't absorbs all offset > need to recalculate sizes for areas after
    // gutter.
    else if (areasBefore.remain !== 0) {
      areasAfter = getGutterSideAbsorptionCapacity(
          this.unit, this.snapshot!.areasAfterGutter, steppedOffset + areasBefore.remain,
          this.snapshot!.allAreasSizePixel);
    }
    // Areas after gutter can't absorbs all offset > need to recalculate sizes for areas before
    // gutter.
    else if (areasAfter.remain !== 0) {
      areasBefore = getGutterSideAbsorptionCapacity(
          this.unit, this.snapshot!.areasBeforeGutter, -(steppedOffset - areasAfter.remain),
          this.snapshot!.allAreasSizePixel);
    }

    if (this.unit === 'percent') {
      // Hack because of browser messing up with sizes using calc(X% - Ypx) ->
      // el.getBoundingClientRect() If not there, playing with gutters makes total going down
      // to 99.99875% then 99.99286%, 99.98986%,..
      const all = [...areasBefore.list, ...areasAfter.list];
      const areaToReset = all.find(
          (a) => a.percentAfterAbsorption !== 0 &&
              a.percentAfterAbsorption !== a.areaSnapshot.area.minSize &&
              a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize);

      if (areaToReset) {
        areaToReset.percentAfterAbsorption = this.snapshot!.allInvolvedAreasSizePercent -
            all.filter((a) => a !== areaToReset)
                .reduce((total, a) => total + a.percentAfterAbsorption, 0);
      }
    }

    // Now we know areas could absorb steppedOffset, time to really update sizes

    areasBefore.list.forEach((item) => updateAreaSize(this.unit, item));
    areasAfter.list.forEach((item) => updateAreaSize(this.unit, item));

    this.refreshStyleSizes();
    this.notify('progress', this.snapshot!.gutterNum);
  }

  private stopDragging(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.isDragging === false) {
      return;
    }

    this.displayedAreas.forEach((area) => area.component.unlockEvents());

    while (this.dragListeners.length > 0) {
      const fct = this.dragListeners.pop();
      if (fct) fct();
    }

    // Warning: Have to be before "notify('end')"
    // because "notify('end')"" can be linked to "[size]='x'" > "build()" > "stopDragging()"
    this.isDragging = false;

    // If moved from starting point, notify end
    if (this.endPoint &&
        (this.startPoint!.x !== this.endPoint.x || this.startPoint!.y !== this.endPoint.y)) {
      this.notify('end', this.snapshot!.gutterNum);
    }

    this.renderer.removeClass(this.elRef.nativeElement, 'as-dragging');
    this.renderer.removeClass(
        this.gutterEls.toArray()[this.snapshot!.gutterNum - 1].nativeElement, 'as-dragged');
    this.snapshot = null;

    // Needed to let (click)="clickGutter(...)" event run and verify if mouse moved or not
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.startPoint = null;
        this.endPoint = null;
      });
    });
  }

  public notify(
      type: 'start'|'progress'|'end'|'click'|'dblclick'|'transitionEnd', gutterNum: number): void {
    const sizes = this.getVisibleAreaSizes();

    if (type === 'start') {
      this.dragStart.emit({gutterNum, sizes});
    } else if (type === 'end') {
      this.dragEnd.emit({gutterNum, sizes});
    } else if (type === 'click') {
      this.gutterClick.emit({gutterNum, sizes});
    } else if (type === 'dblclick') {
      this.gutterDblClick.emit({gutterNum, sizes});
    } else if (type === 'transitionEnd') {
      if (this.transitionEndSubscriber) {
        this.ngZone.run(() => this.transitionEndSubscriber.next(sizes));
      }
    } else if (type === 'progress') {
      // Stay outside zone to allow users do what they want about change detection mechanism.
      this.dragProgressSubject.next({gutterNum, sizes});
    }
  }

  public ngOnDestroy(): void {
    this.stopDragging();
  }
}
