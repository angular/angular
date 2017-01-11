import {
    Component,
    ViewEncapsulation,
    ContentChildren,
    ContentChild,
    QueryList,
    Directive,
    ElementRef,
    Renderer,
    AfterContentInit,
    NgModule,
    ModuleWithProviders,
} from '@angular/core';
import {MdLine, MdLineSetter, MdLineModule, DefaultStyleCompatibilityModeModule} from '../core';

@Directive({
  selector: 'md-divider, mat-divider'
})
export class MdListDivider {}

@Component({
  moduleId: module.id,
  selector: 'md-list, mat-list, md-nav-list, mat-nav-list',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdList {}

/* Need directive for a ContentChild query in list-item */
@Directive({ selector: '[md-list-avatar], [mat-list-avatar]' })
export class MdListAvatar {}

@Component({
  moduleId: module.id,
  selector: 'md-list-item, mat-list-item, a[md-list-item], a[mat-list-item]',
  host: {
    'role': 'listitem',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListItem implements AfterContentInit {
  _hasFocus: boolean = false;

  private _lineSetter: MdLineSetter;

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  @ContentChild(MdListAvatar)
  set _hasAvatar(avatar: MdListAvatar) {
    this._renderer.setElementClass(this._element.nativeElement, 'md-list-avatar', avatar != null);
  }

  constructor(private _renderer: Renderer, private _element: ElementRef) {}

  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  _handleFocus() {
    this._hasFocus = true;
  }

  _handleBlur() {
    this._hasFocus = false;
  }
}


@NgModule({
  imports: [MdLineModule, DefaultStyleCompatibilityModeModule],
  exports: [
    MdList,
    MdListItem,
    MdListDivider,
    MdListAvatar,
    MdLineModule,
    DefaultStyleCompatibilityModeModule,
  ],
  declarations: [MdList, MdListItem, MdListDivider, MdListAvatar],
})
export class MdListModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdListModule,
      providers: []
    };
  }
}
