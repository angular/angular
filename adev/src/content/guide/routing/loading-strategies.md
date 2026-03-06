# Стратегии загрузки маршрутов {#route-loading-strategies}

Понимание того, как и когда маршруты и компоненты загружаются в Angular Router, имеет ключевое значение для создания отзывчивых веб-приложений. Angular предлагает две основные стратегии управления поведением загрузки:

1. **Жадная загрузка (Eager)**: Маршруты и компоненты загружаются немедленно
2. **Ленивая загрузка (Lazy)**: Маршруты и компоненты загружаются только по необходимости

Каждый подход имеет свои преимущества для разных сценариев.

## Компоненты с жадной загрузкой {#eagerly-loaded-components}

Когда вы определяете маршрут со свойством [`component`](api/router/Route#component), указанный компонент загружается жадно — как часть того же JavaScript-бандла, что и конфигурация маршрутов.

```ts
import {Routes} from '@angular/router';
import {HomePage} from './components/home/home-page';
import {LoginPage} from './components/auth/login-page';

export const routes: Routes = [
  // HomePage и LoginPage напрямую указаны в конфигурации,
  // поэтому их код жадно включается в тот же JavaScript-бандл, что и этот файл.
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

Жадная загрузка компонентов маршрутов означает, что браузер должен скачать и разобрать весь JavaScript для этих компонентов при начальной загрузке страницы, но компоненты сразу доступны Angular.

Хотя включение большего объёма JavaScript в начальную загрузку замедляет её, это может обеспечить более плавные переходы при навигации по приложению.

## Компоненты и маршруты с ленивой загрузкой {#lazily-loaded-components-and-routes}

Свойство [`loadComponent`](api/router/Route#loadComponent) позволяет лениво загружать JavaScript компонента в момент активации соответствующего маршрута. Свойство [`loadChildren`](api/router/Route#loadChildren) лениво загружает дочерние маршруты при сопоставлении маршрутов.

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

Свойства [`loadComponent`](/api/router/Route#loadComponent) и [`loadChildren`](/api/router/Route#loadChildren) принимают функцию-загрузчик, возвращающую Promise, который разрешается в Angular-компонент или набор маршрутов соответственно. В большинстве случаев эта функция использует стандартный [динамический импорт JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import). Однако можно использовать любую произвольную асинхронную функцию-загрузчик.

Если лениво загружаемый файл использует экспорт по умолчанию (`default`), можно возвращать промис `import()` напрямую, без дополнительного вызова `.then` для выбора экспортируемого класса.

Ленивая загрузка маршрутов может значительно улучшить скорость загрузки Angular-приложения за счёт исключения больших фрагментов JavaScript из начального бандла. Эти части кода компилируются в отдельные JavaScript-«чанки», которые Роутер запрашивает только тогда, когда пользователь переходит на соответствующий маршрут.

## Ленивая загрузка в контексте внедрения зависимостей {#injection-context-lazy-loading}

Роутер выполняет [`loadComponent`](/api/router/Route#loadComponent) и [`loadChildren`](/api/router/Route#loadChildren) в **контексте внедрения зависимостей текущего маршрута**, что позволяет вызывать [`inject`](/api/core/inject) внутри этих функций-загрузчиков для доступа к провайдерам, объявленным на этом маршруте, унаследованным от родительских маршрутов через иерархическое Внедрение зависимостей, или доступным глобально. Это позволяет реализовать контекстно-зависимую ленивую загрузку.

```ts
import {Routes} from '@angular/router';
import {inject} from '@angular/core';
import {FeatureFlags} from './feature-flags';

export const routes: Routes = [
  {
    path: 'dashboard',
    // Выполняется в контексте внедрения зависимостей маршрута
    loadComponent: () => {
      const flags = inject(FeatureFlags);
      return flags.isPremium
        ? import('./dashboard/premium-dashboard')
        : import('./dashboard/basic-dashboard');
    },
  },
];
```

## Когда использовать жадную, а когда ленивую загрузку? {#should-i-use-an-eager-or-a-lazy-route}

При выборе между жадной и ленивой загрузкой маршрута нужно учитывать множество факторов.

В целом, жадная загрузка рекомендуется для основных целевых страниц, тогда как остальные страницы следует загружать лениво.

NOTE: Хотя ленивые маршруты дают преимущество в производительности за счёт уменьшения объёма начальных данных, запрашиваемых пользователем, они добавляют будущие запросы данных, что может быть нежелательным. Особенно это проявляется при вложенной ленивой загрузке на нескольких уровнях, что может существенно влиять на производительность.

## Следующие шаги {#next-steps}

Узнайте, как [отображать содержимое маршрутов с помощью Outlet](/guide/routing/show-routes-with-outlets).
