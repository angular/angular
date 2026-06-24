# Перенаправление маршрутов

Перенаправление маршрутов (Route redirects) позволяет автоматически переводить пользователей с одного маршрута на
другой. Представьте это как переадресацию почты, когда письма, предназначенные для одного адреса, отправляются на
другой. Это полезно для обработки устаревших URL, реализации маршрутов по умолчанию или управления контролем доступа.

## Как настроить перенаправления

Вы можете определить перенаправления в конфигурации маршрута с помощью свойства `redirectTo`. Это свойство принимает
строку.

```ts
import { Routes } from '@angular/router';

const routes: Routes = [
  // Simple redirect
  { path: 'marketing', redirectTo: 'newsletter' },

  // Redirect with path parameters
  { path: 'legacy-user/:id', redirectTo: 'users/:id' },

  // Redirect any other URLs that don’t match
  // (also known as a "wildcard" redirect)
  { path: '**', redirectTo: '/login' }
];
```

В этом примере есть три перенаправления:

1. Когда пользователь посещает путь `/marketing`, он перенаправляется на `/newsletter`.
2. Когда пользователь посещает любой путь `/legacy-user/:id`, он перенаправляется на соответствующий путь `/users/:id`.
3. Когда пользователь посещает любой путь, не определенный в роутере, он перенаправляется на страницу входа из-за
   определения wildcard-пути `**`.

## Понимание `pathMatch`

Свойство `pathMatch` в маршрутах позволяет разработчикам контролировать, как Angular сопоставляет URL с маршрутами.

Свойство `pathMatch` принимает два значения:

| Значение   | Описание                                 |
| ---------- | ---------------------------------------- |
| `'full'`   | Весь путь URL должен совпадать полностью |
| `'prefix'` | Должно совпадать только начало URL       |

По умолчанию все перенаправления используют стратегию `prefix`.

### `pathMatch: 'prefix'`

`pathMatch: 'prefix'` — это стратегия по умолчанию, идеально подходящая, когда вы хотите, чтобы роутер Angular
сопоставлял все последующие маршруты при запуске перенаправления.

```ts
export const routes: Routes = [
  // This redirect route is equivalent to…
  { path: 'news', redirectTo: 'blog },

  // This explicitly defined route redirect pathMatch
  { path: 'news', redirectTo: 'blog', pathMatch: 'prefix' },
];
```

В этом примере все маршруты, начинающиеся с `news`, перенаправляются на их эквиваленты в `/blog`. Вот несколько примеров
того, куда перенаправляются пользователи при посещении старого префикса `news`:

- `/news` перенаправляется на `/blog`
- `/news/article` перенаправляется на `/blog/article`
- `/news/article/:id` перенаправляется на `/blog/article/:id`

### `pathMatch: 'full'`

С другой стороны, `pathMatch: 'full'` полезен, когда вы хотите, чтобы роутер Angular перенаправлял только конкретный
путь.

```ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
```

В этом примере каждый раз, когда пользователь посещает корневой URL (т.е. `''`), роутер перенаправляет его на страницу
`'/dashboard'`.

Любые последующие страницы (например, `/login`, `/about`, `/product/id` и т.д.) игнорируются и не вызывают
перенаправления.

СОВЕТ: Будьте осторожны при настройке перенаправления на корневой странице (т.е. `"/"` или `""`). Если вы не установите
`pathMatch: 'full'`, роутер будет перенаправлять все URL.

Чтобы проиллюстрировать это подробнее: если бы в примере с `news` из предыдущего раздела использовался
`pathMatch: 'full'`:

```ts
export const routes: Routes = [
  { path: 'news', redirectTo: '/blog', pathMatch: 'full' },
];
```

Это означает, что:

1. Только путь `/news` будет перенаправлен на `/blog`.
2. Любые последующие сегменты, такие как `/news/articles` или `/news/articles/1`, не будут перенаправлены с новым
   префиксом `/blog`.

## Условные перенаправления

Свойство `redirectTo` также может принимать функцию для добавления логики в процесс перенаправления пользователей.

[Функция](api/router/RedirectFunction) имеет доступ только к части данных [
`ActivatedRouteSnapshot`](api/router/ActivatedRouteSnapshot), так как некоторые данные еще не известны точно на этапе
сопоставления маршрутов. Примеры включают: разрешенные заголовки (resolved titles), лениво загружаемые компоненты и т.д.

Обычно она возвращает строку или [`URLTree`](api/router/UrlTree), но также может возвращать Observable или Promise.

Вот пример, где пользователь перенаправляется в разное меню в зависимости от времени суток:

```ts
import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

export const routes: Routes = [
  {
    path: 'restaurant/:location/menu',
    redirectTo: (activatedRouteSnapshot) => {
      const location = activatedRouteSnapshot.params['location'];
      const currentHour = new Date().getHours();

      // Check if user requested a specific meal via query parameter
      if (activatedRouteSnapshot.queryParams['meal']) {
        return `/restaurant/${location}/menu/${queryParams['meal']}`;
      }

      // Auto-redirect based on time of day
      if (currentHour >= 5 && currentHour < 11) {
        return `/restaurant/${location}/menu/breakfast`;
      } else if (currentHour >= 11 && currentHour < 17) {
        return `/restaurant/${location}/menu/lunch`;
      } else {
        return `/restaurant/${location}/menu/dinner`;
      }
    }
  },

  // Destination routes
  { path: 'restaurant/:location/menu/breakfast', component: MenuComponent },
  { path: 'restaurant/:location/menu/lunch', component: MenuComponent },
  { path: 'restaurant/:location/menu/dinner', component: MenuComponent },

  // Default redirect
  { path: '', redirectTo: '/restaurant/downtown/menu', pathMatch: 'full' }
];
```

Чтобы узнать больше, ознакомьтесь с [документацией API для RedirectFunction](api/router/RedirectFunction).

## Дальнейшие действия

Для получения дополнительной информации о свойстве `redirectTo` ознакомьтесь
с [документацией API](api/router/Route#redirectTo).
