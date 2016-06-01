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
} from '@angular/core';
import { MdLine, MdLineSetter } from '@angular2-material/core/line/line';

@Component({
  moduleId: module.id,
  selector: 'md-list, md-nav-list',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdList {}

/* Need directive for a ContentChild query in list-item */
@Directive({ selector: '[md-list-avatar]' })
export class MdListAvatar {}

@Component({
  moduleId: module.id,
  selector: 'md-list-item, a[md-list-item]',
  host: {
    'role': 'listitem',
    '(focus)': 'handleFocus()',
    '(blur)': 'handleBlur()',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListItem implements AfterContentInit {
  /** @internal */
  hasFocus: boolean = false;

  _lineSetter: MdLineSetter;

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  @ContentChild(MdListAvatar)
  private set _hasAvatar(avatar: MdListAvatar) {
    this._renderer.setElementClass(this._element.nativeElement, 'md-list-avatar', avatar != null);
  }

  constructor(private _renderer: Renderer, private _element: ElementRef) {}

  /** TODO: internal */
  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  /** @internal */
  handleFocus() {
    this.hasFocus = true;
  }

  /** @internal */
  handleBlur() {
    this.hasFocus = false;
  }
}

export const MD_LIST_DIRECTIVES = [MdList, MdListItem, MdLine, MdListAvatar];
