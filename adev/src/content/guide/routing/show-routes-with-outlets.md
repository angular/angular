# Отображение маршрутов с помощью Outlet {#show-routes-with-outlets}

Директива `RouterOutlet` — это заполнитель, обозначающий место, куда Роутер должен отображать компонент для текущего URL.

```html
<app-header />
<!-- Angular вставляет содержимое маршрута сюда -->
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

Когда пользователь переходит на `/products`, Angular отображает следующее:

```angular-html
<app-header />
<app-products />
<app-footer />
```

Если пользователь возвращается на главную страницу, Angular отображает:

```angular-html
<app-header />
<app-home />
<app-footer />
```

При отображении маршрута элемент `<router-outlet>` остаётся в DOM как точка отсчёта для последующих навигаций. Angular вставляет отображаемое содержимое маршрута сразу после элемента outlet как соседний элемент.

```angular-html
<!-- Содержимое шаблона компонента -->
<app-header />
<router-outlet />
<app-footer />
```

```angular-html
<!-- Содержимое, отображаемое на странице, когда пользователь переходит на /admin -->
<app-header />
<router-outlet />
<app-admin-page />
<app-footer />
```

## Вложение маршрутов с дочерними маршрутами {#nesting-routes-with-child-routes}

По мере усложнения приложения может возникнуть необходимость создания маршрутов, относящихся к компоненту, отличному от корневого. Это позволяет создавать интерфейсы, где при изменении URL меняется только часть приложения, а не вся страница целиком.

Такие вложенные маршруты называются дочерними. Это означает добавление второго `<router-outlet>` в приложение в дополнение к `<router-outlet>` в AppComponent.

В этом примере Компонент `Settings` будет отображать нужную панель в зависимости от выбора пользователя. Одна из отличительных особенностей дочерних маршрутов — компонент часто имеет собственный `<nav>` и `<router-outlet>`.

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

Дочерний маршрут похож на любой другой маршрут: ему нужны и `path`, и `component`. Единственное отличие — дочерние маршруты размещаются в массиве `children` родительского маршрута.

```ts
const routes: Routes = [
  {
    path: 'settings',
    component: Settings, // это компонент с <router-outlet> в шаблоне
    children: [
      {
        path: 'profile', // путь дочернего маршрута
        component: Profile, // Компонент дочернего маршрута, отображаемый Роутером
      },
      {
        path: 'security',
        component: Security, // ещё один Компонент дочернего маршрута
      },
    ],
  },
];
```

После правильной настройки как `routes`, так и `<router-outlet>`, приложение использует вложенные маршруты!

## Вторичные маршруты с именованными Outlet {#secondary-routes-with-named-outlets}

Страницы могут иметь несколько Outlet — каждому можно назначить имя для указания, какое содержимое к какому Outlet относится.

```angular-html
<app-header />
<router-outlet />
<router-outlet name="read-more" />
<router-outlet name="additional-actions" />
<app-footer />
```

Каждый Outlet должен иметь уникальное имя. Имя нельзя задавать или изменять динамически. По умолчанию имя равно `'primary'`.

Angular сопоставляет имя Outlet со свойством `outlet`, определённым в каждом маршруте:

```ts
{
  path: 'user/:id',
  component: UserDetails,
  outlet: 'additional-actions'
}
```

## События жизненного цикла Outlet {#outlet-lifecycle-events}

Router outlet может генерировать четыре события жизненного цикла:

| Событие      | Описание                                                                               |
| ------------ | -------------------------------------------------------------------------------------- |
| `activate`   | При создании нового экземпляра компонента                                              |
| `deactivate` | При уничтожении компонента                                                             |
| `attach`     | Когда `RouteReuseStrategy` указывает Outlet присоединить поддерево                     |
| `detach`     | Когда `RouteReuseStrategy` указывает Outlet отсоединить поддерево                      |

Добавить обработчики событий можно с помощью стандартного синтаксиса привязки событий:

```angular-html
<router-outlet
  (activate)="onActivate($event)"
  (deactivate)="onDeactivate($event)"
  (attach)="onAttach($event)"
  (detach)="onDetach($event)"
/>
```

Подробнее — в [API-документации RouterOutlet](/api/router/RouterOutlet?tab=api).

## Передача контекстных данных в компоненты маршрутов {#passing-contextual-data-to-routed-components}

Передача контекстных данных в компоненты маршрутов часто требует глобального состояния или сложных конфигураций маршрутов. Для упрощения каждый `RouterOutlet` поддерживает входные данные `routerOutletData`. Компоненты маршрутов и их дочерние элементы могут читать эти данные как Сигнал с помощью токена внедрения зависимостей `ROUTER_OUTLET_DATA`, что обеспечивает конфигурацию, специфичную для Outlet, без изменения определений маршрутов.

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

Компонент маршрута может внедрить предоставленные данные Outlet с помощью `ROUTER_OUTLET_DATA`:

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

Когда Angular активирует `Stats` в этом Outlet, он получает `{ layout: 'sidebar' }` как внедрённые данные.

NOTE: Когда входные данные `routerOutletData` не заданы, внедрённое значение по умолчанию равно null.

---

## Следующие шаги {#next-steps}

Узнайте, как [переходить на маршруты](/guide/routing/navigate-to-routes) с помощью Angular Router.
