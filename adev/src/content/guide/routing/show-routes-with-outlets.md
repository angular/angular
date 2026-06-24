# Отображение маршрутов с помощью outlet

Директива `RouterOutlet` служит заполнителем, указывающим место, где маршрутизатор должен отобразить компонент для
текущего URL.

```angular-html
<app-header />
<router-outlet />  <!-- Angular вставляет контент вашего маршрута здесь -->
<app-footer />
```

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
```

В этом примере, если в приложении определены следующие маршруты:

```ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Our Products'
  }
];
```

Когда пользователь переходит по адресу `/products`, Angular рендерит следующее:

```angular-html
<app-header />
<app-products />
<app-footer />
```

Если пользователь возвращается на главную страницу, Angular рендерит:

```angular-html
<app-header />
<app-home />
<app-footer />
```

При отображении маршрута элемент `<router-outlet>` остается в DOM в качестве опорной точки для будущих навигаций.
Angular вставляет контент маршрута сразу после элемента outlet в качестве соседнего узла.

```angular-html
<!-- Содержимое шаблона компонента -->
<app-header />
<router-outlet />
<app-footer />
```

```angular-html
<!-- Контент, отображаемый на странице, когда пользователь посещает /admin -->
<app-header>...</app-header>
<router-outlet></router-outlet>
<app-admin-page>...</app-admin-page>
<app-footer>...</app-footer>
```

## Вложенные маршруты и дочерние маршруты

По мере усложнения приложения может потребоваться создание маршрутов, относительных не к корневому, а к другому
компоненту. Это позволяет создавать интерфейсы, где при изменении URL меняется только часть приложения, и у пользователя
не возникает ощущения полной перезагрузки страницы.

Такие типы вложенных маршрутов называются дочерними маршрутами. Это означает, что вы добавляете второй `<router-outlet>`
в приложение в дополнение к `<router-outlet>` в `AppComponent`.

В этом примере компонент `Settings` будет отображать нужную панель в зависимости от выбора пользователя. Одной из
особенностей дочерних маршрутов является то, что компонент часто имеет свои собственные `<nav>` и `<router-outlet>`.

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

Дочерний маршрут похож на любой другой маршрут тем, что ему требуются `path` и `component`. Единственное отличие
заключается в том, что дочерние маршруты помещаются в массив `children` внутри родительского маршрута.

```ts
const routes: Routes = [
  {
    path: 'settings-component',
    component: SettingsComponent, // это компонент с <router-outlet> в шаблоне
    children: [
      {
        path: 'profile', // путь дочернего маршрута
        component: ProfileComponent, // компонент дочернего маршрута, который рендерит роутер
      },
      {
        path: 'security',
        component: SecurityComponent, // еще один компонент дочернего маршрута, который рендерит роутер
      },
    ],
  },
];
```

Как только `routes` и `<router-outlet>` настроены правильно, ваше приложение начинает использовать вложенные маршруты!

## Вторичные маршруты с именованными outlet

Страницы могут иметь несколько outlet — вы можете назначить имя каждому из них, чтобы указать, какой контент к какому
outlet относится.

```angular-html
<app-header />
<router-outlet />
<router-outlet name='read-more' />
<router-outlet name='additional-actions' />
<app-footer />
```

Каждый outlet должен иметь уникальное имя. Имя нельзя задать или изменить динамически. По умолчанию используется имя
`'primary'`.

Angular сопоставляет имя outlet со свойством `outlet`, определенным в каждом маршруте:

```ts
{
  path: 'user/:id',
  component: UserDetails,
  outlet: 'additional-actions'
}
```

## События жизненного цикла outlet

Существует четыре события жизненного цикла, которые может генерировать router outlet:

| Событие      | Описание                                                               |
| ------------ | ---------------------------------------------------------------------- |
| `activate`   | Когда создается экземпляр нового компонента                            |
| `deactivate` | Когда компонент уничтожается                                           |
| `attach`     | Когда `RouteReuseStrategy` дает указание outlet присоединить поддерево |
| `detach`     | Когда `RouteReuseStrategy` дает указание outlet отсоединить поддерево  |

Вы можете добавить слушатели событий, используя стандартный синтаксис привязки событий:

```angular-html
<router-outlet
  (activate)='onActivate($event)'
  (deactivate)='onDeactivate($event)'
  (attach)='onAttach($event)'
  (detach)='onDetach($event)'
/>
```

Ознакомьтесь с [API-документацией для RouterOutlet](/api/router/RouterOutlet?tab=api), если хотите узнать больше.

## Передача контекстных данных в маршрутизируемые компоненты

Передача контекстных данных в маршрутизируемые компоненты часто требует глобального состояния или сложных конфигураций
маршрутов. Чтобы упростить эту задачу, каждый `RouterOutlet` поддерживает входное свойство `routerOutletData`.
Маршрутизируемые компоненты и их потомки могут считывать эти данные как сигнал, используя токен внедрения
`ROUTER_OUTLET_DATA`, что позволяет настраивать конкретный outlet без изменения определений маршрутов.

```angular-ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  template: `
    <h2>Dashboard</h2>
    <router-outlet [routerOutletData]="{ layout: 'sidebar' }" />
  `,
})
export class DashboardComponent {}
```

Маршрутизируемый компонент может внедрить предоставленные данные outlet с помощью `ROUTER_OUTLET_DATA`:

```angular-ts
import { Component, inject } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';

@Component({
  selector: 'app-stats',
  template: `<p>Stats view (layout: {{ outletData().layout }})</p>`,
})
export class StatsComponent {
  outletData = inject(ROUTER_OUTLET_DATA) as Signal<{ layout: string }>;
}
```

Когда Angular активирует `StatsComponent` в этом outlet, он получает `{ layout: 'sidebar' }` в качестве внедренных
данных.

ПРИМЕЧАНИЕ: Если входное свойство `routerOutletData` не задано, внедряемое значение по умолчанию равно null.

---

## Следующие шаги

Узнайте, как [выполнять навигацию по маршрутам](/guide/routing/navigate-to-routes) с помощью Angular Router.
