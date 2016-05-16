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



@Component({
  selector: 'md-list, md-nav-list',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['./components/list/list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdList {}

/* Need directive for a ContentChildren query in list-item */
@Directive({ selector: '[md-line]' })
export class MdLine {}

/* Need directive for a ContentChild query in list-item */
@Directive({ selector: '[md-list-avatar]' })
export class MdListAvatar {}

@Component({
  selector: 'md-list-item, a[md-list-item]',
  host: {'role': 'listitem'},
  templateUrl: './components/list/list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListItem implements AfterContentInit {
  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  /** @internal */
  ngAfterContentInit() {
    this._setLineClass(this._lines.length);

    this._lines.changes.subscribe(() => {
      this._setLineClass(this._lines.length);
    });
  }

  @ContentChild(MdListAvatar)
  private set _hasAvatar(avatar: MdListAvatar) {
    this._setClass('md-list-avatar', avatar != null);
  }

  constructor(private _renderer: Renderer, private _element: ElementRef) {}

  private _setLineClass(count: number): void {
    this._resetClasses();
    if (count === 2 || count === 3) {
      this._setClass(`md-${count}-line`, true);
    }
  }

  private _resetClasses(): void {
    this._setClass('md-2-line', false);
    this._setClass('md-3-line', false);
  }

  private _setClass(className: string, bool: boolean): void {
    this._renderer.setElementClass(this._element.nativeElement, className, bool);
  }
}

export const MD_LIST_DIRECTIVES: any[] = [MdList, MdListItem, MdLine, MdListAvatar];
