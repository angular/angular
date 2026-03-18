# Отображение маршрутов с помощью Outlet-ов

Директива `RouterOutlet` — это заполнитель, отмечающий место, куда маршрутизатор должен отрисовывать компонент для текущего URL.

```html
<app-header />
<!-- Angular inserts your route content here -->
<router-outlet />
<app-footer />
```

```ts
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
```

В этом примере, если в приложении определены следующие маршруты:

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {Products} from './products';

const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home Page',
  },
  {
    path: 'products',
    component: Products,
    title: 'Our Products',
  },
];
```

Когда пользователь посещает `/products`, Angular отрисовывает следующее:

```angular-html
<app-header />
<app-products />
<app-footer />
```

Если пользователь возвращается на главную страницу, Angular отрисовывает:

```angular-html
<app-header />
<app-home />
<app-footer />
```

При отображении маршрута элемент `<router-outlet>` остаётся в DOM как точка отсчёта для будущих навигаций. Angular вставляет содержимое маршрута сразу после элемента outlet как соседний элемент.

```angular-html
<!-- Contents of the component's template -->
<app-header />
<router-outlet />
<app-footer />
```

```angular-html
<!-- Content rendered on the page when the user visits /admin -->
<app-header />
<router-outlet />
<app-admin-page />
<app-footer />
```

## Вложенные маршруты с дочерними маршрутами {#nesting-routes-with-child-routes}

По мере усложнения приложения может возникнуть необходимость создавать маршруты, относительные к компоненту, отличному от корневого. Это позволяет создавать интерфейсы, в которых при изменении URL меняется только часть приложения, а не вся страница целиком.

Такие типы вложенных маршрутов называются дочерними маршрутами. Это означает добавление второго `<router-outlet>` в приложение, дополнительного к `<router-outlet>` в AppComponent.

В этом примере компонент `Settings` будет отображать нужную панель в зависимости от того, что выберет пользователь. Одна из уникальных особенностей дочерних маршрутов — компонент часто имеет собственный `<nav>` и `<router-outlet>`.

```angular-html
<h1>Settings</h1>
<nav>
  <ul>
    <li><a routerLink="profile">Profile</a></li>
    <li><a routerLink="security">Security</a></li>
  </ul>
</nav>
<router-outlet />
```

Дочерний маршрут похож на любой другой маршрут — ему нужны `path` и `component`. Отличие в том, что дочерние маршруты размещаются в массиве `children` внутри родительского маршрута.

```ts
const routes: Routes = [
  {
    path: 'settings',
    component: Settings, // this is the component with the <router-outlet> in the template
    children: [
      {
        path: 'profile', // child route path
        component: Profile, // child route component that the router renders
      },
      {
        path: 'security',
        component: Security, // another child route component that the router renders
      },
    ],
  },
];
```

После правильной настройки как `routes`, так и `<router-outlet>`, приложение использует вложенные маршруты!

## Вторичные маршруты с именованными Outlet-ами {#secondary-routes-with-named-outlets}

Страницы могут иметь несколько Outlet-ов — каждому из них можно присвоить имя, чтобы указать, какое содержимое относится к какому Outlet-у.

```angular-html
<app-header />
<router-outlet />
<router-outlet name="read-more" />
<router-outlet name="additional-actions" />
<app-footer />
```

Каждый Outlet должен иметь уникальное имя. Имя нельзя задать или изменить динамически. По умолчанию имя равно `'primary'`.

Angular сопоставляет имя Outlet-а со свойством `outlet`, определённым в каждом маршруте:

```ts
{
  path: 'user/:id',
  component: UserDetails,
  outlet: 'additional-actions'
}
```

## События жизненного цикла Outlet-а {#outlet-lifecycle-events}

Существует четыре события жизненного цикла, которые может генерировать Router outlet:

| Событие      | Описание                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------- |
| `activate`   | Когда создаётся новый экземпляр компонента                                                   |
| `deactivate` | Когда компонент уничтожается                                                                 |
| `attach`     | Когда `RouteReuseStrategy` инструктирует Outlet прикрепить поддерево                        |
| `detach`     | Когда `RouteReuseStrategy` инструктирует Outlet отсоединить поддерево                       |

Можно добавлять обработчики событий с помощью стандартного синтаксиса привязки событий:

```angular-html
<router-outlet
  (activate)="onActivate($event)"
  (deactivate)="onDeactivate($event)"
  (attach)="onAttach($event)"
  (detach)="onDetach($event)"
/>
```

Дополнительные сведения см. в [документации API RouterOutlet](/api/router/RouterOutlet?tab=api).

## Передача контекстных данных в компоненты маршрутов {#passing-contextual-data-to-routed-components}

Передача контекстных данных в компоненты маршрутов часто требует глобального состояния или сложных конфигураций маршрутов. Чтобы упростить это, каждый `RouterOutlet` поддерживает входной параметр `routerOutletData`. Компоненты маршрутов и их дочерние элементы могут читать эти данные как сигнал с помощью токена внедрения `ROUTER_OUTLET_DATA`, позволяя выполнять конфигурацию, специфичную для Outlet-а, без изменения определений маршрутов.

```angular-ts
import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  template: `
    <h2>Dashboard</h2>
    <router-outlet [routerOutletData]="{layout: 'sidebar'}" />
  `,
})
export class Dashboard {}
```

Компонент маршрута может внедрить предоставленные данные Outlet-а с помощью `ROUTER_OUTLET_DATA`:

```angular-ts
import {Component, inject} from '@angular/core';
import {ROUTER_OUTLET_DATA} from '@angular/router';

@Component({
  selector: 'app-stats',
  template: `<p>Stats view (layout: {{ outletData().layout }})</p>`,
})
export class Stats {
  outletData = inject(ROUTER_OUTLET_DATA) as Signal<{layout: string}>;
}
```

Когда Angular активирует `Stats` в этом Outlet-е, он получает `{ layout: 'sidebar' }` как внедрённые данные.

NOTE: Когда входной параметр `routerOutletData` не задан, внедрённое значение по умолчанию равно `null`.

---

## Следующие шаги {#next-steps}

Узнайте, как [переходить к маршрутам](guide/routing/navigate-to-routes) с помощью Angular Router.
