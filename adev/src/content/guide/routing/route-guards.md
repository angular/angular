# Управление доступом к маршрутам с помощью Guard-ов

CRITICAL: Никогда не полагайтесь на клиентские Guard-ы как на единственный источник контроля доступа. Весь JavaScript, выполняемый в браузере, может быть изменён пользователем. Всегда применяйте авторизацию пользователей на стороне сервера в дополнение к любым клиентским Guard-ам.

Guard-ы маршрутов — это функции, управляющие тем, может ли пользователь переходить к определённому маршруту или покидать его. Они выполняют роль контрольных точек, управляющих доступом к конкретным маршрутам. Распространённые примеры использования Guard-ов маршрутов включают аутентификацию и контроль доступа.

## Создание Guard-а маршрута {#creating-a-route-guard}

Guard маршрута можно сгенерировать с помощью Angular CLI:

```bash
ng generate guard CUSTOM_NAME
```

Это предложит выбрать [тип Guard-а маршрута](#types-of-route-guards), а затем создаст соответствующий файл `CUSTOM_NAME-guard.ts`.

TIP: Также можно создать Guard маршрута вручную, создав отдельный файл TypeScript в проекте Angular. Разработчики обычно добавляют суффикс `-guard.ts` в имя файла для его отличия от других файлов.

## Возвращаемые типы Guard-ов маршрутов {#route-guard-return-types}

Все Guard-ы маршрутов имеют одинаковые возможные возвращаемые типы. Это даёт гибкость в управлении навигацией:

| Возвращаемые типы               | Описание                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `boolean`                       | `true` разрешает навигацию, `false` блокирует её (см. примечание для Guard-а `CanMatch`)       |
| `UrlTree` или `RedirectCommand` | Перенаправляет на другой маршрут вместо блокировки                                             |
| `Promise<T>` или `Observable<T>`| Маршрутизатор использует первое сгенерированное значение, затем отписывается                   |

NOTE: `CanMatch` ведёт себя иначе — когда он возвращает `false`, Angular пробует другие подходящие маршруты вместо полной блокировки навигации.

## Типы Guard-ов маршрутов {#types-of-route-guards}

Angular предоставляет четыре типа Guard-ов маршрутов, каждый из которых служит разным целям:

<docs-pill-row>
  <docs-pill href="#canactivate" title="CanActivate"/>
  <docs-pill href="#canactivatechild" title="CanActivateChild"/>
  <docs-pill href="#candeactivate" title="CanDeactivate"/>
  <docs-pill href="#canmatch" title="CanMatch"/>
</docs-pill-row>

Все Guard-ы имеют доступ к [сервисам, предоставляемым на уровне маршрута](guide/di/defining-dependency-providers#route-providers), а также к специфичной для маршрута информации через аргумент `route`.

### CanActivate {#canactivate}

Guard `CanActivate` определяет, может ли пользователь получить доступ к маршруту. Чаще всего используется для аутентификации и авторизации.

Имеет доступ к следующим аргументам по умолчанию:

- `route`: `ActivatedRouteSnapshot` — содержит информацию об активируемом маршруте
- `state`: `RouterStateSnapshot` — содержит текущее состояние маршрутизатора

Может возвращать [стандартные возвращаемые типы Guard-ов](#route-guard-return-types).

```ts
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

Tip: Если нужно перенаправить пользователя, верните [`URLTree`](api/router/UrlTree) или [`RedirectCommand`](api/router/RedirectCommand). **Не** возвращайте `false` и затем программно выполняйте `navigate`.

Дополнительные сведения см. в [документации API CanActivateFn](api/router/CanActivateFn).

### CanActivateChild {#canactivatechild}

Guard `CanActivateChild` определяет, может ли пользователь получить доступ к дочерним маршрутам конкретного родительского маршрута. Это полезно, когда нужно защитить весь раздел вложенных маршрутов. Иными словами, `canActivateChild` выполняется для _всех_ дочерних элементов. Если есть дочерний компонент с другим дочерним компонентом под ним, `canActivateChild` выполнится один раз для обоих компонентов.

Имеет доступ к следующим аргументам по умолчанию:

- `childRoute`: `ActivatedRouteSnapshot` — содержит информацию о «будущем» снимке (т.е. состоянии, к которому маршрутизатор пытается перейти) активируемого дочернего маршрута
- `state`: `RouterStateSnapshot` — содержит текущее состояние маршрутизатора

Может возвращать [стандартные возвращаемые типы Guard-ов](#route-guard-return-types).

```ts
export const adminChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.hasRole('admin');
};
```

Дополнительные сведения см. в [документации API CanActivateChildFn](api/router/CanActivateChildFn).

### CanDeactivate {#candeactivate}

Guard `CanDeactivate` определяет, может ли пользователь покинуть маршрут. Распространённый сценарий — предотвращение ухода с несохранённых форм.

Имеет доступ к следующим аргументам по умолчанию:

- `component`: `T` — экземпляр деактивируемого компонента
- `currentRoute`: `ActivatedRouteSnapshot` — содержит информацию о текущем маршруте
- `currentState`: `RouterStateSnapshot` — содержит текущее состояние маршрутизатора
- `nextState`: `RouterStateSnapshot` — содержит следующее состояние маршрутизатора, к которому выполняется переход

Может возвращать [стандартные возвращаемые типы Guard-ов](#route-guard-return-types).

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

Дополнительные сведения см. в [документации API CanDeactivateFn](api/router/CanDeactivateFn).

### CanMatch {#canmatch}

Guard `CanMatch` определяет, может ли маршрут быть сопоставлен в процессе сопоставления путей. В отличие от других Guard-ов, при отклонении происходит попытка сопоставления с другими маршрутами, а не полная блокировка навигации. Это может быть полезно для флагов функций, A/B-тестирования или условной загрузки маршрутов.

Имеет доступ к следующим аргументам по умолчанию:

- `route`: `Route` — оцениваемая конфигурация маршрута
- `segments`: `UrlSegment[]` — сегменты URL, не использованные предыдущими оценками родительских маршрутов

Может возвращать [стандартные возвращаемые типы Guard-ов](#route-guard-return-types), но когда он возвращает `false`, Angular пробует другие подходящие маршруты вместо полной блокировки навигации.

```ts
export const featureToggleGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const featureService = inject(FeatureService);
  return featureService.isFeatureEnabled('newDashboard');
};
```

Это также позволяет использовать разные компоненты для одного пути.

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

В этом примере при посещении `/dashboard` будет использован первый маршрут, Guard которого даёт совпадение.

Дополнительные сведения см. в [документации API CanMatchFn](api/router/CanMatchFn).

## Применение Guard-ов к маршрутам {#applying-guards-to-routes}

После создания Guard-ов маршрутов их необходимо настроить в определениях маршрутов.

Guard-ы указываются как массивы в конфигурации маршрута, что позволяет применять несколько Guard-ов к одному маршруту. Они выполняются в порядке, в котором указаны в массиве.

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
