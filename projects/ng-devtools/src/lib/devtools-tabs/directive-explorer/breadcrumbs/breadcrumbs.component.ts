import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FlatNode } from '../directive-forest/component-data-source';

@Component({
  selector: 'ng-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() parents: FlatNode[];
  @Output() handleSelect = new EventEmitter();
  @Output() mouseOverNode = new EventEmitter();
  @Output() mouseLeaveNode = new EventEmitter();

  @ViewChild('breadcrumbs') breadcrumbsScrollContent: ElementRef;

  showScrollLeftButton = false;
  showScrollRightButton = false;

  updateScrollButtonVisibility$ = new Subject<void>();

  ngOnInit(): void {
    this.updateScrollButtonVisibility$
      .asObservable()
      .pipe(debounceTime(100))
      .subscribe((_) => this._updateScrollButtonVisibility());
  }

  ngAfterViewInit(): void {
    this.updateScrollButtonVisibility$.next();
  }

  ngOnChanges(): void {
    this.updateScrollButtonVisibility$.next();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateScrollButtonVisibility$.next();
  }

  scroll(pixels: number): void {
    this.breadcrumbsScrollContent.nativeElement.scrollLeft += pixels;
    this.updateScrollButtonVisibility$.next();
  }

  private _updateScrollButtonVisibility(): void {
    const { clientWidth, scrollWidth } = this.breadcrumbsScrollContent.nativeElement;
    const hasOverflowX = scrollWidth > clientWidth;

    if (hasOverflowX) {
      const scrollLeft = this.breadcrumbsScrollContent.nativeElement.scrollLeft;

      if (scrollLeft > 0 && scrollLeft + clientWidth < scrollWidth) {
        this.showScrollLeftButton = true;
        this.showScrollRightButton = true;
      } else if (scrollLeft === 0) {
        this.showScrollLeftButton = false;
        this.showScrollRightButton = true;
      } else if (scrollLeft + clientWidth === scrollWidth) {
        this.showScrollLeftButton = true;
        this.showScrollRightButton = false;
      }

      return;
    }

    this.showScrollLeftButton = false;
    this.showScrollRightButton = false;
  }
}
