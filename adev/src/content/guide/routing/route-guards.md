# Управление доступом к маршрутам с помощью Guard {#control-route-access-with-guards}

CRITICAL: Никогда не полагайтесь на клиентские Guard как на единственный источник контроля доступа. Любой JavaScript, выполняемый в браузере, может быть изменён пользователем. Всегда применяйте авторизацию пользователей на стороне сервера в дополнение к любым клиентским Guard.

Guard маршрутов — это функции, управляющие тем, может ли пользователь перейти на определённый маршрут или покинуть его. Они подобны контрольным точкам, управляющим доступом к конкретным маршрутам. Распространённые примеры использования Guard маршрутов включают аутентификацию и контроль доступа.

## Создание Guard маршрута {#creating-a-route-guard}

Guard маршрута можно сгенерировать с помощью Angular CLI:

```bash
ng generate guard CUSTOM_NAME
```

Команда предложит выбрать [тип Guard маршрута](#types-of-route-guards), а затем создаст соответствующий файл `CUSTOM_NAME-guard.ts`.

TIP: Guard маршрута также можно создать вручную, создав отдельный TypeScript-файл в Angular-проекте. Разработчики обычно добавляют суффикс `-guard.ts` к имени файла для отличия от других файлов.

## Возвращаемые типы Guard маршрута {#route-guard-return-types}

Все Guard маршрутов имеют одинаковые возможные возвращаемые типы. Это даёт гибкость в управлении навигацией:

| Возвращаемые типы               | Описание                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `boolean`                       | `true` разрешает навигацию, `false` блокирует её (см. примечание для Guard `CanMatch`) |
| `UrlTree` или `RedirectCommand` | Перенаправляет на другой маршрут вместо блокировки                                    |
| `Promise<T>` или `Observable<T>` | Роутер использует первое эмитированное значение и затем отписывается                 |

NOTE: `CanMatch` ведёт себя иначе — когда он возвращает `false`, Angular пробует другие совпадающие маршруты вместо полной блокировки навигации.

## Типы Guard маршрутов {#types-of-route-guards}

Angular предоставляет четыре типа Guard маршрутов, каждый из которых служит различным целям:

<docs-pill-row>
  <docs-pill href="#canactivate" title="CanActivate"/>
  <docs-pill href="#canactivatechild" title="CanActivateChild"/>
  <docs-pill href="#candeactivate" title="CanDeactivate"/>
  <docs-pill href="#canmatch" title="CanMatch"/>
</docs-pill-row>

Все Guard имеют доступ к [Сервисам, предоставляемым на уровне маршрута](guide/di/defining-dependency-providers#route-providers), а также к информации о конкретном маршруте через аргумент `route`.

### CanActivate {#canactivate}

Guard `CanActivate` определяет, может ли пользователь получить доступ к маршруту. Чаще всего используется для аутентификации и авторизации.

Имеет доступ к следующим аргументам по умолчанию:

- `route`: `ActivatedRouteSnapshot` — содержит информацию об активируемом маршруте
- `state`: `RouterStateSnapshot` — содержит текущее состояние Роутера

Может возвращать [стандартные возвращаемые типы Guard](#route-guard-return-types).

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

Подробнее — в [API-документации CanActivateFn](api/router/CanActivateFn).

### CanActivateChild {#canactivatechild}

Guard `CanActivateChild` определяет, может ли пользователь получить доступ к дочерним маршрутам конкретного родительского маршрута. Это полезно, когда нужно защитить целый раздел вложенных маршрутов. Иными словами, `canActivateChild` выполняется для _всех_ дочерних элементов. Если у дочернего компонента есть ещё один вложенный дочерний компонент, `canActivateChild` выполнится для обоих.

Имеет доступ к следующим аргументам по умолчанию:

- `childRoute`: `ActivatedRouteSnapshot` — содержит информацию о «будущем» снимке (то есть состоянии, к которому пытается перейти Роутер) активируемого дочернего маршрута
- `state`: `RouterStateSnapshot` — содержит текущее состояние Роутера

Может возвращать [стандартные возвращаемые типы Guard](#route-guard-return-types).

```ts
export const adminChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  return authService.hasRole('admin');
};
```

Подробнее — в [API-документации CanActivateChildFn](api/router/CanActivateChildFn).

### CanDeactivate {#candeactivate}

Guard `CanDeactivate` определяет, может ли пользователь покинуть маршрут. Распространённый сценарий — предотвращение навигации от форм с несохранёнными данными.

Имеет доступ к следующим аргументам по умолчанию:

- `component`: `T` — экземпляр деактивируемого компонента
- `currentRoute`: `ActivatedRouteSnapshot` — содержит информацию о текущем маршруте
- `currentState`: `RouterStateSnapshot` — содержит текущее состояние Роутера
- `nextState`: `RouterStateSnapshot` — содержит следующее состояние Роутера, к которому выполняется навигация

Может возвращать [стандартные возвращаемые типы Guard](#route-guard-return-types).

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

Подробнее — в [API-документации CanDeactivateFn](api/router/CanDeactivateFn).

### CanMatch {#canmatch}

Guard `CanMatch` определяет, может ли маршрут быть сопоставлен в процессе сопоставления путей. В отличие от других Guard, при отказе Angular пробует другие совпадающие маршруты вместо полной блокировки навигации. Это может быть полезно для флагов функций, A/B-тестирования или условной загрузки маршрутов.

Имеет доступ к следующим аргументам по умолчанию:

- `route`: `Route` — оцениваемая конфигурация маршрута
- `segments`: `UrlSegment[]` — сегменты URL, не потреблённые предыдущими оценками родительского маршрута

Может возвращать [стандартные возвращаемые типы Guard](#route-guard-return-types), но при возврате `false` Angular пробует другие совпадающие маршруты вместо полной блокировки навигации.

```ts
export const featureToggleGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const featureService = inject(FeatureService);
  return featureService.isFeatureEnabled('newDashboard');
};
```

Это также позволяет использовать разные компоненты для одного и того же пути.

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

В этом примере при посещении `/dashboard` будет использован первый маршрут, совпадающий с соответствующим Guard.

Подробнее — в [API-документации CanMatchFn](api/router/CanMatchFn).

## Применение Guard к маршрутам {#applying-guards-to-routes}

После создания Guard маршрутов их необходимо настроить в определениях маршрутов.

Guard задаются в виде массивов в конфигурации маршрута, что позволяет применять несколько Guard к одному маршруту. Они выполняются в том порядке, в котором указаны в массиве.

```ts
import {Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';
import {adminGuard} from './guards/admin.guard';
import {canDeactivateGuard} from './guards/can-deactivate.guard';
import {featureToggleGuard} from './guards/feature-toggle.guard';

const routes: Routes = [
  // Базовый CanActivate — требует аутентификации
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },

  // Несколько Guard CanActivate — требует аутентификации И роли администратора
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, adminGuard],
  },

  // CanActivate + CanDeactivate — защищённый маршрут с проверкой несохранённых изменений
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
    canDeactivate: [canDeactivateGuard],
  },

  // CanActivateChild — защищает все дочерние маршруты
  {
    path: 'users', // /user — НЕ защищён
    canActivateChild: [authGuard],
    children: [
      // /users/list — ЗАЩИЩЁН
      {path: 'list', component: UserList},
      // /users/detail/:id — ЗАЩИЩЁН
      {path: 'detail/:id', component: UserDetail},
    ],
  },

  // CanMatch — условное сопоставление маршрута по флагу функции
  {
    path: 'beta-feature',
    component: BetaFeature,
    canMatch: [featureToggleGuard],
  },

  // Резервный маршрут, если бета-функция отключена
  {
    path: 'beta-feature',
    component: ComingSoon,
  },
];
```
