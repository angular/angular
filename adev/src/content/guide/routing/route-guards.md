# Управление доступом к маршрутам с помощью guards

CRITICAL: Никогда не полагайтесь на client-side guards как на единственный источник контроля доступа. Весь JavaScript, выполняющийся в веб-браузере, может быть изменён пользователем. Всегда обеспечивайте авторизацию пользователя на стороне сервера в дополнение к любым client-side guards.

Route guards — это функции, которые контролируют, может ли пользователь перейти к маршруту или покинуть его. Это как контрольные точки, управляющие доступом к конкретным маршрутам. Типичные примеры использования route guards — аутентификация и контроль доступа.

## Создание route guard {#creating-a-route-guard}

Route guard можно сгенерировать с помощью Angular CLI:

```bash
ng generate guard CUSTOM_NAME
```

Вас попросят выбрать [тип route guard](#types-of-route-guards), после чего будет создан соответствующий файл `CUSTOM_NAME-guard.ts`.

TIP: Route guard также можно создать вручную, добавив отдельный TypeScript-файл в проект Angular. Обычно в имени файла используют суффикс `-guard.ts`, чтобы отличать его от других файлов.

## Типы возврата route guard {#route-guard-return-types}

Все route guards имеют одни и те же возможные типы возврата. Это даёт гибкость в управлении навигацией:

| Типы возврата                   | Описание                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `boolean`                       | `true` разрешает навигацию, `false` блокирует её (см. примечание для `CanMatch`) |
| `UrlTree` или `RedirectCommand` | Перенаправляет на другой маршрут вместо блокировки                                |
| `Promise<T>` или `Observable<T>` | Роутер использует первое испущенное значение и затем отписывается                |

NOTE: `CanMatch` ведёт себя иначе — когда возвращает `false`, Angular пробует другие совпадающие маршруты вместо полной блокировки навигации.

## Типы route guards {#types-of-route-guards}

Angular предоставляет четыре типа route guards, каждый со своей целью:

<docs-pill-row>
  <docs-pill href="#canactivate" title="CanActivate"/>
  <docs-pill href="#canactivatechild" title="CanActivateChild"/>
  <docs-pill href="#candeactivate" title="CanDeactivate"/>
  <docs-pill href="#canmatch" title="CanMatch"/>
</docs-pill-row>

Все guards имеют доступ к [сервисам, предоставленным на уровне маршрута](guide/di/defining-dependency-providers#route-providers), а также к информации, специфичной для маршрута, через аргумент `route`.

### CanActivate {#canactivate}

Guard `CanActivate` определяет, может ли пользователь получить доступ к маршруту. Чаще всего используется для аутентификации и авторизации.

Ему доступны следующие аргументы по умолчанию:

- `route`: `ActivatedRouteSnapshot` — информация о маршруте, который активируется
- `state`: `RouterStateSnapshot` — текущее состояние роутера

Может возвращать [стандартные типы возврата guard](#route-guard-return-types).

```ts
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

TIP: Если нужно перенаправить пользователя, верните [`URLTree`](api/router/UrlTree) или [`RedirectCommand`](api/router/RedirectCommand). **Не** возвращайте `false` и затем программно вызывайте `navigate`.

Подробнее см. [API docs для CanActivateFn](api/router/CanActivateFn).

### CanActivateChild {#canactivatechild}

Guard `CanActivateChild` определяет, может ли пользователь получить доступ к дочерним маршрутам конкретного родительского маршрута. Это полезно, когда нужно защитить целый раздел вложенных маршрутов. Иными словами, `canActivateChild` выполняется для _всех_ потомков. Если у дочернего компонента есть ещё один дочерний компонент под ним, `canActivateChild` выполнится один раз для обоих компонентов.

Ему доступны следующие аргументы по умолчанию:

- `childRoute`: `ActivatedRouteSnapshot` — информация о «будущем» снимке (то есть состоянии, к которому роутер пытается перейти) дочернего маршрута, который активируется
- `state`: `RouterStateSnapshot` — текущее состояние роутера

Может возвращать [стандартные типы возврата guard](#route-guard-return-types).

```ts
export const adminChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.hasRole('admin');
};
```

Подробнее см. [API docs для CanActivateChildFn](api/router/CanActivateChildFn).

### CanDeactivate {#candeactivate}

Guard `CanDeactivate` определяет, может ли пользователь покинуть маршрут. Типичный сценарий — предотвращение ухода с несохранённых форм.

Ему доступны следующие аргументы по умолчанию:

- `component`: `T` — экземпляр компонента, который деактивируется
- `currentRoute`: `ActivatedRouteSnapshot` — информация о текущем маршруте
- `currentState`: `RouterStateSnapshot` — текущее состояние роутера
- `nextState`: `RouterStateSnapshot` — следующее состояние роутера, к которому выполняется навигация

Может возвращать [стандартные типы возврата guard](#route-guard-return-types).

```ts
export const unsavedChangesGuard: CanDeactivateFn<Form> = (
  component: Form,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot,
) => {
  return component.hasUnsavedChanges()
    ? confirm('You have unsaved changes. Are you sure you want to leave?')
    : true;
};
```

Подробнее см. [API docs для CanDeactivateFn](api/router/CanDeactivateFn).

### CanMatch {#canmatch}

Guard `CanMatch` определяет, может ли маршрут совпасть во время сопоставления пути. В отличие от других guards, отклонение приводит к попытке других совпадающих маршрутов вместо полной блокировки навигации. Это полезно для feature flags, A/B-тестирования или условной загрузки маршрутов.

Ему доступны следующие аргументы по умолчанию:

- `route`: `Route` — конфигурация маршрута, которая оценивается
- `segments`: `UrlSegment[]` — сегменты URL, не потреблённые предыдущими оценками родительских маршрутов
- `currentSnapshot: PartialMatchRouteSnapshot` — текущий снимок маршрута до этой точки процесса сопоставления

Может возвращать [стандартные типы возврата guard](#route-guard-return-types), но когда возвращает `false`, Angular пробует другие совпадающие маршруты вместо полной блокировки навигации.

```ts
export const featureToggleGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[],
  currentSnapshot: PartialMatchRouteSnapshot,
) => {
  const featureService = inject(FeatureService);
  return featureService.isFeatureEnabled('newDashboard');
};
```

Также позволяет использовать разные компоненты для одного пути.

```ts
// 📄 routes.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboard,
    canMatch: [adminGuard],
  },
  {
    path: 'dashboard',
    component: UserDashboard,
    canMatch: [userGuard],
  },
];
```

В этом примере, когда пользователь посещает `/dashboard`, будет использован первый маршрут, для которого совпал корректный guard.

Подробнее см. [API docs для CanMatchFn](api/router/CanMatchFn).

## Применение guards к маршрутам {#applying-guards-to-routes}

После создания route guards их нужно настроить в определениях маршрутов.

Guards указываются как массивы в конфигурации маршрута, чтобы можно было применить несколько guards к одному маршруту. Они выполняются в порядке появления в массиве.

```ts
import {Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';
import {adminGuard} from './guards/admin.guard';
import {canDeactivateGuard} from './guards/can-deactivate.guard';
import {featureToggleGuard} from './guards/feature-toggle.guard';

const routes: Routes = [
  // Basic CanActivate - requires authentication
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },

  // Multiple CanActivate guards - requires authentication AND admin role
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, adminGuard],
  },

  // CanActivate + CanDeactivate - protected route with unsaved changes check
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
    canDeactivate: [canDeactivateGuard],
  },

  // CanActivateChild - protects all child routes
  {
    path: 'users', // /user - NOT protected
    canActivateChild: [authGuard],
    children: [
      // /users/list - PROTECTED
      {path: 'list', component: UserList},
      // /users/detail/:id - PROTECTED
      {path: 'detail/:id', component: UserDetail},
    ],
  },

  // CanMatch - conditionally matches route based on feature flag
  {
    path: 'beta-feature',
    component: BetaFeature,
    canMatch: [featureToggleGuard],
  },

  // Fallback route if beta feature is disabled
  {
    path: 'beta-feature',
    component: ComingSoon,
  },
];
```
