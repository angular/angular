import {Component, Directive, Input, signal} from '@angular/core';
import {MyAttrDirective} from './my-attr.directive';
import {MatListItemStub} from './mat-list-item.component';

@Directive({
  selector: '[routerLink]',
  standalone: true,
})
export class RouterLinkStub {
  @Input() routerLink: any;
}

@Directive({
  selector: '[routerLinkActive]',
  standalone: true,
})
export class RouterLinkActiveStub {
  @Input() routerLinkActive: any;
}

@Directive({
  selector: '[ngSrc]',
  standalone: true,
})
export class NgSrcStub {
  @Input() ngSrc: any;
  @Input() width: any;
  @Input() height: any;
}

@Component({
  selector: 'app-root',
  template: `
    <div>Hello {{ name }}</div>
    @for (route of routes; track $index) {
      <a
        mat-list-item
        routerLink="{{ route.path }}"
        routerLinkActive="active"
        (click)="isSidenavOpen.set(false)"
      >
        <div class="nav-item-with-image">
          <img [ngSrc]="route?.data?.['icon']" width="100" height="60" />
          <span style="padding-left: 16px" mat-line> {{ route.title }} </span>
        </div>
      </a>
    }
    <div mat-list-item id="outside-for">Test outside for</div>
    <my-dir-elem></my-dir-elem>
    <div myAttr></div>
  `,
  standalone: true,
  imports: [
    RouterLinkStub,
    RouterLinkActiveStub,
    NgSrcStub,
    MyDirElemComponent,
    MyAttrDirective,
    MatListItemStub,
  ],
})
export class AppComponent {
  name = 'Angular LS Test';
  isSidenavOpen = signal(true);
  routes = [{path: 'home', title: 'Home', data: {icon: 'home'}}];
}

@Component({
  selector: 'my-dir-elem',
  standalone: true,
  template: `<div>My Dir Elem</div>`,
})
export class MyDirElemComponent {}

@Component({
  selector: 'app-external',
  templateUrl: './external.html',
  standalone: true,
})
export class ExternalComponent {
  externalTitle = 'External Template Works!';
}
