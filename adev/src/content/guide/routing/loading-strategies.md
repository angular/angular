# Стратегии загрузки маршрутов

Понимание того, как и когда загружаются маршруты и компоненты в Angular-маршрутизации, имеет решающее значение для создания отзывчивых веб-приложений. Angular предлагает две основные стратегии управления поведением загрузки:

1. **Eagerly loaded (энергичная загрузка)**: маршруты и компоненты, загружаемые немедленно
2. **Lazily loaded (ленивая загрузка)**: маршруты и компоненты, загружаемые только по необходимости

Каждый подход предлагает очевидные преимущества для различных сценариев.

## Компоненты с энергичной загрузкой {#eagerly-loaded-components}

Когда вы определяете маршрут со свойством [`component`](api/router/Route#component), указанный компонент загружается энергично как часть того же JavaScript-бандла, что и конфигурация маршрута.

```ts
import {Routes} from '@angular/router';
import {HomePage} from './components/home/home-page';
import {LoginPage} from './components/auth/login-page';

export const routes: Routes = [
  // HomePage and LoginPage are both directly referenced in this config,
  // so their code is eagerly included in the same JavaScript bundle as this file.
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
];
```

Энергичная загрузка компонентов маршрутов означает, что браузер должен скачать и разобрать весь JavaScript для этих компонентов при первоначальной загрузке страницы, но компоненты сразу доступны Angular.

Хотя включение большего количества JavaScript в первоначальную загрузку страницы приводит к более медленной начальной загрузке, это может обеспечить более плавные переходы при навигации пользователя по приложению.

## Компоненты и маршруты с ленивой загрузкой {#lazily-loaded-components-and-routes}

Свойство [`loadComponent`](api/router/Route#loadComponent) позволяет лениво загружать JavaScript для компонента в момент активации соответствующего маршрута. Свойство [`loadChildren`](api/router/Route#loadChildren) лениво загружает дочерние маршруты в процессе сопоставления маршрутов.

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-page'),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component'),
    loadChildren: () => import('./admin/admin.routes'),
  },
];
```

Свойства [`loadComponent`](/api/router/Route#loadComponent) и [`loadChildren`](/api/router/Route#loadChildren) принимают функцию-загрузчик, возвращающую Promise, который разрешается до Angular-компонента или набора маршрутов соответственно. В большинстве случаев эта функция использует стандартный [JavaScript API динамического импорта](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import). Однако можно использовать любую произвольную асинхронную функцию-загрузчик.

Если лениво загружаемый файл использует экспорт по умолчанию (`default`), можно вернуть промис `import()` напрямую без дополнительного вызова `.then` для выбора экспортируемого класса.

Ленивая загрузка маршрутов может значительно улучшить скорость загрузки приложения Angular, удалив большие части JavaScript из первоначального бандла. Эти части кода компилируются в отдельные JavaScript «чанки», которые маршрутизатор запрашивает только тогда, когда пользователь посещает соответствующий маршрут.

## Ленивая загрузка в контексте внедрения {#injection-context-lazy-loading}

Маршрутизатор выполняет [`loadComponent`](/api/router/Route#loadComponent) и [`loadChildren`](/api/router/Route#loadChildren) в **контексте внедрения текущего маршрута**, позволяя вызывать [`inject`](/api/core/inject) внутри этих функций-загрузчиков для доступа к провайдерам, объявленным в этом маршруте, унаследованным от родительских маршрутов через иерархическое внедрение зависимостей или доступным глобально. Это обеспечивает контекстно-зависимую ленивую загрузку.

```ts
import {Routes} from '@angular/router';
import {inject} from '@angular/core';
import {FeatureFlags} from './feature-flags';

export const routes: Routes = [
  {
    path: 'dashboard',
    // Runs inside the route's injection context
    loadComponent: () => {
      const flags = inject(FeatureFlags);
      return flags.isPremium
        ? import('./dashboard/premium-dashboard')
        : import('./dashboard/basic-dashboard');
    },
  },
];
```

## Использовать энергичный или ленивый маршрут? {#should-i-use-an-eager-or-a-lazy-route}

При выборе между энергичным и ленивым маршрутом есть много факторов для рассмотрения.

В целом, энергичная загрузка рекомендуется для основных целевых страниц, тогда как остальные страницы следует загружать лениво.

NOTE: Хотя ленивые маршруты имеют преимущество в начальной производительности за счёт уменьшения объёма данных, первоначально запрашиваемых пользователем, они добавляют будущие запросы данных, которые могут быть нежелательны. Это особенно актуально при работе с вложенной ленивой загрузкой на нескольких уровнях, что может существенно повлиять на производительность.

## Следующие шаги {#next-steps}

Узнайте, как [отображать содержимое маршрутов с помощью Outlet-ов](guide/routing/show-routes-with-outlets).
