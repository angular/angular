/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  input,
  linkedSignal,
  OnDestroy,
  output,
  QueryList,
  Renderer2,
  untracked,
  ViewChildren,
} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';
import {Observable, Subject, Subscriber} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {
  Direction,
  IArea,
  IAreaSnapshot,
  IOutputAreaSizes,
  IOutputData,
  IPoint,
  ISplitSnapshot,
  Unit,
} from './interface';
import {SplitAreaDirective} from './splitArea.directive';
import {
  getAreaMaxSize,
  getAreaMinSize,
  getElementPixelSize,
  getGutterSideAbsorptionCapacity,
  getInputPositiveNumber,
  getPointFromEvent,
  isUserSizesValid,
  updateAreaSize,
} from './utils';

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
  template: `<ng-content></ng-content>
    @for (_ of displayedAreas; track $index) { 
      @if ($last === false) {
        <div
          #gutterEls
          class="as-split-gutter"
          [style.flex-basis.px]="gutterSize()"
          [style.order]="$index * 2 + 1"
          (mousedown)="startDragging($event, $index * 2 + 1, $index + 1)"
          (touchstart)="startDragging($event, $index * 2 + 1, $index + 1)"
          (mouseup)="clickGutter($event, $index + 1)"
          (touchend)="clickGutter($event, $index + 1)"
        >
          <div class="as-split-gutter-icon"></div>
        </div>
      } 
    }`,
  host: {
    '[class.as-disabled]': 'disabled()',
    '[class.as-transition]': 'useTransition()',
    '[class.as-horizontal]': 'this.direction() === "horizontal"',
    '[class.as-vertical]': 'this.direction() === "vertical"',
    '[attr.dir]': 'dir()',
  },
})
export class SplitComponent implements OnDestroy {
  directionInput = input<Direction>('horizontal', {alias: 'direction'});
  // This allows the direction to be writable from the outside
  direction = linkedSignal(this.directionInput);

  unit = input<Unit>('percent');

  gutterSize = input(11, {transform: (v: unknown) => getInputPositiveNumber(v, 11)});
  gutterStep = input(1, {transform: (v: unknown) => getInputPositiveNumber(v, 1)});
  restrictMove = input(false, {transform: booleanAttribute});
  useTransition = input(false, {transform: booleanAttribute});
  disabled = input(false, {transform: booleanAttribute});
  dir = input<'ltr' | 'rtl'>('ltr');

  gutterDblClickDuration = input(0, {transform: (v: unknown) => getInputPositiveNumber(v, 0)});

  ////

  dragStart = output<IOutputData>();
  dragEnd = output<IOutputData>();
  gutterClick = output<IOutputData>();
  gutterDblClick = output<IOutputData>();

  private transitionEndSubscriber: Subscriber<IOutputAreaSizes> | null = null;
  transitionEnd = outputFromObservable<IOutputAreaSizes>(
    new Observable((subscriber) => (this.transitionEndSubscriber = subscriber)).pipe(
      debounceTime<any>(20),
    ),
  );
  private dragProgressSubject: Subject<IOutputData> = new Subject();
  dragProgress$: Observable<IOutputData> = this.dragProgressSubject.asObservable();

  private isDragging: boolean = false;
  private dragListeners: Array<Function> = [];
  private snapshot: ISplitSnapshot | null = null;
  private startPoint: IPoint | null = null;
  private endPoint: IPoint | null = null;

  public readonly displayedAreas: Array<IArea> = [];
  private readonly hidedAreas: Array<IArea> = [];

  @ViewChildren('gutterEls') private gutterEls!: QueryList<ElementRef>;

  constructor(
    private elRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2,
  ) {
    // To avoid transition at first rendering
    afterNextRender({
      write: () => this.renderer.addClass(this.elRef.nativeElement, 'as-init'),
    });

    effect(() => {
      this.unit();
      // If unit changes, rebuild areas sizes
      this.build(false, true);
    });

    effect(() => {
      this.direction();
      // If direction changes, rebuild areas sizes
      this.build(false, false);
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

    if (component.visible) {
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

  public updateArea(
    component: SplitAreaDirective,
    resetOrders: boolean,
    resetSizes: boolean,
  ): void {
    if (component.visible) {
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

    const formattedSizes = sizes.map((s) => getInputPositiveNumber(s, null));
    const isValid = isUserSizesValid(untracked(this.unit), formattedSizes);

    if (isValid === false) {
      return false;
    }

    // @ts-ignore
    this.displayedAreas.forEach((area, i) => (area.component._size = formattedSizes[i]));

    this.build(false, true);
    return true;
  }

  private build(resetOrders: boolean, resetSizes: boolean): void {
    this.stopDragging();

    // ¤ AREAS ORDER

    if (resetOrders) {
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

    const unit = untracked(this.unit);
    if (resetSizes) {
      const useUserSizes = isUserSizesValid(
        unit,
        this.displayedAreas.map((a) => a.component.size),
      );

      switch (unit) {
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
            // More than one wildcard area > Need to keep only one arbitrarily > first
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

    this.refreshStyleSizes(unit);
    this.cdRef.markForCheck();
  }

  private refreshStyleSizes(unit: 'percent' | 'pixel'): void {
    ///////////////////////////////////////////
    // PERCENT MODE
    if (unit === 'percent') {
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
            0,
            0,
            `calc( ${area.size}% - ${(<number>area.size / 100) * sumGutterSize}px )`,
            area.minSize !== null && area.minSize === area.size ? true : false,
            area.maxSize !== null && area.maxSize === area.size ? true : false,
          );
        });
      }
    }
    ///////////////////////////////////////////
    // PIXEL MODE
    else if (unit === 'pixel') {
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
              0,
              0,
              `${area.size}px`,
              area.minSize !== null && area.minSize === area.size ? true : false,
              area.maxSize !== null && area.maxSize === area.size ? true : false,
            );
          }
        }
      });
    }
  }

  private clickTimeout: number | null = null;

  public clickGutter(event: MouseEvent | TouchEvent, gutterNum: number): void {
    const tempPoint = getPointFromEvent(event);

    // Be sure mouseup/touchend happened at same point as mousedown/touchstart to trigger
    // click/dblclick
    if (
      this.startPoint &&
      this.startPoint.x === tempPoint!.x &&
      this.startPoint.y === tempPoint!.y
    ) {
      // If timeout in progress and new click > clearTimeout & dblClickEvent
      if (this.clickTimeout !== null) {
        window.clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
        this.notify('dblclick', gutterNum);
        this.stopDragging();
      }
      // Else start timeout to call clickEvent at end
      else {
        this.clickTimeout = window.setTimeout(() => {
          this.clickTimeout = null;
          this.notify('click', gutterNum);
          this.stopDragging();
        }, untracked(this.gutterDblClickDuration));
      }
    }
  }

  public startDragging(
    event: MouseEvent | TouchEvent,
    gutterOrder: number,
    gutterNum: number,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    const direction = untracked(this.direction);

    this.startPoint = getPointFromEvent(event);
    if (this.startPoint === null || untracked(this.disabled)) {
      return;
    }

    this.snapshot = {
      gutterNum,
      lastSteppedOffset: 0,
      allAreasSizePixel:
        getElementPixelSize(this.elRef, direction) -
        this.getNbGutters() * untracked(this.gutterSize),
      allInvolvedAreasSizePercent: 100,
      areasBeforeGutter: [],
      areasAfterGutter: [],
    };

    this.displayedAreas.forEach((area) => {
      const areaSnapshot: IAreaSnapshot = {
        area,
        sizePixelAtStart: getElementPixelSize(area.component.elRef, direction),
        sizePercentAtStart: (untracked(this.unit) === 'percent' ? area.size : -1) as number, // If pixel mode, anyway, will not be used.
      };

      if (area.order < gutterOrder) {
        if (untracked(this.restrictMove)) {
          this.snapshot!.areasBeforeGutter = [areaSnapshot];
        } else {
          this.snapshot!.areasBeforeGutter.unshift(areaSnapshot);
        }
      } else if (area.order > gutterOrder) {
        if (untracked(this.restrictMove)) {
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

    if (
      this.snapshot.areasBeforeGutter.length === 0 ||
      this.snapshot.areasAfterGutter.length === 0
    ) {
      return;
    }

    this.dragListeners.push(
      this.renderer.listen('document', 'mouseup', this.stopDragging.bind(this)),
    );
    this.dragListeners.push(
      this.renderer.listen('document', 'touchend', this.stopDragging.bind(this)),
    );
    this.dragListeners.push(
      this.renderer.listen('document', 'touchcancel', this.stopDragging.bind(this)),
    );

    this.dragListeners.push(
      this.renderer.listen('document', 'mousemove', this.dragEvent.bind(this)),
    );
    this.dragListeners.push(
      this.renderer.listen('document', 'touchmove', this.dragEvent.bind(this)),
    );

    this.displayedAreas.forEach((area) => area.component.lockEvents());

    this.isDragging = true;
    this.renderer.addClass(this.elRef.nativeElement, 'as-dragging');
    this.renderer.addClass(
      this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement,
      'as-dragged',
    );

    this.notify('start', this.snapshot.gutterNum);
  }

  private dragEvent(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.clickTimeout !== null) {
      window.clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    if (this.isDragging === false) {
      return;
    }

    this.endPoint = getPointFromEvent(event);
    if (this.endPoint === null) {
      return;
    }

    // Calculate steppedOffset

    let offset =
      untracked(this.direction) === 'horizontal'
        ? this.startPoint!.x - this.endPoint.x
        : this.startPoint!.y - this.endPoint.y;
    if (untracked(this.dir) === 'rtl') {
      offset = -offset;
    }

    const gutterStep = untracked(this.gutterStep);
    const steppedOffset = Math.round(offset / gutterStep) * gutterStep;

    if (steppedOffset === this.snapshot!.lastSteppedOffset) {
      return;
    }

    this.snapshot!.lastSteppedOffset = steppedOffset;

    // Need to know if each gutter side areas could reacts to steppedOffset

    const unit = untracked(this.unit);
    let areasBefore = getGutterSideAbsorptionCapacity(
      unit,
      this.snapshot!.areasBeforeGutter,
      -steppedOffset,
      this.snapshot!.allAreasSizePixel,
    );
    let areasAfter = getGutterSideAbsorptionCapacity(
      unit,
      this.snapshot!.areasAfterGutter,
      steppedOffset,
      this.snapshot!.allAreasSizePixel,
    );

    // Each gutter side areas can't absorb all offset
    if (areasBefore.remain !== 0 && areasAfter.remain !== 0) {
      if (Math.abs(areasBefore.remain) === Math.abs(areasAfter.remain)) {
      } else if (Math.abs(areasBefore.remain) > Math.abs(areasAfter.remain)) {
        areasAfter = getGutterSideAbsorptionCapacity(
          unit,
          this.snapshot!.areasAfterGutter,
          steppedOffset + areasBefore.remain,
          this.snapshot!.allAreasSizePixel,
        );
      } else {
        areasBefore = getGutterSideAbsorptionCapacity(
          unit,
          this.snapshot!.areasBeforeGutter,
          -(steppedOffset - areasAfter.remain),
          this.snapshot!.allAreasSizePixel,
        );
      }
    }
    // Areas before gutter can't absorbs all offset > need to recalculate sizes for areas after
    // gutter.
    else if (areasBefore.remain !== 0) {
      areasAfter = getGutterSideAbsorptionCapacity(
        unit,
        this.snapshot!.areasAfterGutter,
        steppedOffset + areasBefore.remain,
        this.snapshot!.allAreasSizePixel,
      );
    }
    // Areas after gutter can't absorbs all offset > need to recalculate sizes for areas before
    // gutter.
    else if (areasAfter.remain !== 0) {
      areasBefore = getGutterSideAbsorptionCapacity(
        unit,
        this.snapshot!.areasBeforeGutter,
        -(steppedOffset - areasAfter.remain),
        this.snapshot!.allAreasSizePixel,
      );
    }

    if (unit === 'percent') {
      // Hack because of browser messing up with sizes using calc(X% - Ypx) ->
      // el.getBoundingClientRect() If not there, playing with gutters makes total going down
      // to 99.99875% then 99.99286%, 99.98986%,..
      const all = [...areasBefore.list, ...areasAfter.list];
      const areaToReset = all.find(
        (a) =>
          a.percentAfterAbsorption !== 0 &&
          a.percentAfterAbsorption !== a.areaSnapshot.area.minSize &&
          a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize,
      );

      if (areaToReset) {
        areaToReset.percentAfterAbsorption =
          this.snapshot!.allInvolvedAreasSizePercent -
          all
            .filter((a) => a !== areaToReset)
            .reduce((total, a) => total + a.percentAfterAbsorption, 0);
      }
    }

    // Now we know areas could absorb steppedOffset, time to really update sizes
    areasBefore.list.forEach((item) => updateAreaSize(unit, item));
    areasAfter.list.forEach((item) => updateAreaSize(unit, item));

    this.refreshStyleSizes(unit);
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
    if (
      this.endPoint &&
      (this.startPoint!.x !== this.endPoint.x || this.startPoint!.y !== this.endPoint.y)
    ) {
      this.notify('end', this.snapshot!.gutterNum);
    }

    this.renderer.removeClass(this.elRef.nativeElement, 'as-dragging');
    this.renderer.removeClass(
      this.gutterEls.toArray()[this.snapshot!.gutterNum - 1].nativeElement,
      'as-dragged',
    );
    this.snapshot = null;

    // Needed to let (click)="clickGutter(...)" event run and verify if mouse moved or not
    setTimeout(() => {
      this.startPoint = null;
      this.endPoint = null;
    });
  }

  public notify(
    type: 'start' | 'progress' | 'end' | 'click' | 'dblclick' | 'transitionEnd',
    gutterNum: number,
  ): void {
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
        this.transitionEndSubscriber?.next(sizes);
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
