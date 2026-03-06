# Резолверы данных {#data-resolvers}

Резолверы данных позволяют получать данные до перехода на маршрут, обеспечивая компонентам доступ к необходимым данным до отображения. Это помогает избежать состояний загрузки и улучшает пользовательский опыт за счёт предварительной загрузки важных данных.

## Что такое резолверы данных? {#what-are-data-resolvers}

Резолвер данных — это Сервис, реализующий функцию `ResolveFn`. Он выполняется до активации маршрута и может получать данные из API, баз данных или других источников. Разрешённые данные становятся доступны компоненту через `ActivatedRoute`.

Резолверы данных имеют доступ к [Сервисам, предоставляемым на уровне маршрута](guide/di/defining-dependency-providers#route-providers), а также к информации о конкретном маршруте через аргумент `route`.

## Зачем использовать резолверы данных? {#why-use-data-resolvers}

Резолверы данных решают распространённые проблемы маршрутизации:

- **Предотвращение пустых состояний**: Компоненты получают данные сразу при загрузке
- **Лучший пользовательский опыт**: Нет спиннеров загрузки для критически важных данных
- **Обработка ошибок**: Обработка ошибок получения данных до навигации
- **Согласованность данных**: Гарантия наличия необходимых данных до отображения, что важно для SSR

## Создание резолвера {#creating-a-resolver}

Резолвер создаётся как функция с типом `ResolveFn`.

Она получает `ActivatedRouteSnapshot` и `RouterStateSnapshot` в качестве параметров.

Вот резолвер, получающий информацию о пользователе перед отображением маршрута с помощью функции [`inject`](api/core/inject):

```ts
import {inject} from '@angular/core';
import {UserStore, SettingsStore} from './user-store';
import type {ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot} from '@angular/router';
import type {User, Settings} from './types';

export const userResolver: ResolveFn<User> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  return userStore.getUser(userId);
};

export const settingsResolver: ResolveFn<Settings> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const settingsStore = inject(SettingsStore);
  const userId = route.paramMap.get('id')!;
  return settingsStore.getUserSettings(userId);
};
```

## Настройка маршрутов с резолверами {#configuring-routes-with-resolvers}

Чтобы добавить один или несколько резолверов данных к маршруту, укажите их под ключом `resolve` в конфигурации маршрута. Тип `Routes` определяет структуру для конфигураций маршрутов:

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetail,
    resolve: {
      user: userResolver,
      settings: settingsResolver,
    },
  },
];
```

Подробнее о [конфигурации `resolve` в API-документации](api/router/Route#resolve).

## Доступ к разрешённым данным в компонентах {#accessing-resolved-data-in-components}

### Использование ActivatedRoute {#using-activatedroute}

Получить разрешённые данные в компоненте можно, обратившись к снимку данных через `ActivatedRoute` с помощью функции `signal`:

```angular-ts
import {Component, inject, computed} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import type {User, Settings} from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `,
})
export class UserDetail {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  user = computed(() => this.data().user as User);
  settings = computed(() => this.data().settings as Settings);
}
```

### Использование withComponentInputBinding {#using-withcomponentinputbinding}

Другой подход — использование `withComponentInputBinding()` при настройке Роутера с `provideRouter`. Это позволяет передавать разрешённые данные непосредственно как входные данные компонента:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding())],
});
```

С этой конфигурацией можно определять входные данные в компоненте, совпадающие с ключами резолвера, используя функцию `input` и `input.required` для обязательных входных данных:

```angular-ts
import {Component, input} from '@angular/core';
import type {User, Settings} from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `,
})
export class UserDetail {
  user = input.required<User>();
  settings = input.required<Settings>();
}
```

Этот подход обеспечивает лучшую типобезопасность и устраняет необходимость внедрять `ActivatedRoute` только для доступа к разрешённым данным.

## Обработка ошибок в резолверах {#error-handling-in-resolvers}

В случае ошибок навигации важно корректно обрабатывать ошибки в резолверах данных. В противном случае произойдёт `NavigationError`, навигация на текущий маршрут завершится неудачей, что ухудшит пользовательский опыт.

Существует три основных способа обработки ошибок с резолверами данных:

1. Централизованная обработка ошибок через `withNavigationErrorHandler`
2. Управление ошибками через подписку на события Роутера
3. Обработка ошибок непосредственно в резолвере

### Централизованная обработка ошибок через `withNavigationErrorHandler` {#centralize-error-handling-in-withnavigationerrorhandler}

Функция [`withNavigationErrorHandler`](api/router/withNavigationErrorHandler) предоставляет централизованный способ обработки всех ошибок навигации, включая ошибки из неудавшихся резолверов данных. Такой подход сосредотачивает логику обработки ошибок в одном месте и предотвращает дублирование кода обработки ошибок в разных резолверах.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withNavigationErrorHandler} from '@angular/router';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(
      routes,
      withNavigationErrorHandler((error) => {
        const router = inject(Router);

        if (error?.message) {
          console.error('Navigation error occurred:', error.message);
        }

        router.navigate(['/error']);
      }),
    ),
  ],
});
```

С этой конфигурацией резолверы могут сосредоточиться на получении данных, передавая управление ошибками централизованному обработчику:

```ts
export const userResolver: ResolveFn<User> = (route) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  // Не нужна явная обработка ошибок — ошибка всплывёт наверх
  return userStore.getUser(userId);
};
```

### Управление ошибками через подписку на события Роутера {#managing-errors-through-a-subscription-to-router-events}

Ошибки резолверов также можно обрабатывать, подписавшись на события Роутера и отслеживая события `NavigationError`. Этот подход даёт более детальный контроль над обработкой ошибок и позволяет реализовать пользовательскую логику восстановления.

```angular-ts
import {Component, inject, signal} from '@angular/core';
import {Router, NavigationError} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    @if (errorMessage()) {
      <div class="error-banner">
        {{ errorMessage() }}
        <button (click)="retryNavigation()">Retry</button>
      </div>
    }
    <router-outlet />
  `,
})
export class App {
  private router = inject(Router);
  private lastFailedUrl = signal('');

  private navigationErrors = toSignal(
    this.router.events.pipe(
      map((event) => {
        if (event instanceof NavigationError) {
          this.lastFailedUrl.set(event.url);

          if (event.error) {
            console.error('Navigation error', event.error);
          }

          return 'Navigation failed. Please try again.';
        }
        return '';
      }),
    ),
    {initialValue: ''},
  );

  errorMessage = this.navigationErrors;

  retryNavigation() {
    if (this.lastFailedUrl()) {
      this.router.navigateByUrl(this.lastFailedUrl());
    }
  }
}
```

Этот подход особенно полезен, когда нужно:

- Реализовать пользовательскую логику повторных попыток при неудавшейся навигации
- Показывать конкретные сообщения об ошибках в зависимости от типа сбоя
- Отслеживать сбои навигации в аналитических целях

### Обработка ошибок непосредственно в резолвере {#handling-errors-directly-in-the-resolver}

Вот обновлённый пример `userResolver`, который логирует ошибку и перенаправляет на общую страницу `/users` с помощью Сервиса `Router`:

```ts
import {inject} from '@angular/core';
import {ResolveFn, RedirectCommand, Router} from '@angular/router';
import {catchError, of, EMPTY} from 'rxjs';
import {UserStore} from './user-store';
import type {User} from './types';

export const userResolver: ResolveFn<User | RedirectCommand> = (route) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userStore.getUser(userId).pipe(
    catchError((error) => {
      console.error('Failed to load user:', error);
      return of(new RedirectCommand(router.parseUrl('/users')));
    }),
  );
};
```

## Аспекты UX при навигации с загрузкой данных {#navigation-loading-considerations}

Хотя резолверы данных предотвращают состояния загрузки внутри компонентов, они вводят другой аспект UX: навигация блокируется во время выполнения резолверов. Пользователи могут ощущать задержку между нажатием ссылки и отображением нового маршрута, особенно при медленных сетевых запросах.

### Предоставление обратной связи при навигации {#providing-navigation-feedback}

Для улучшения пользовательского опыта во время выполнения резолверов можно отслеживать события Роутера и показывать индикаторы загрузки:

```angular-ts
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    @if (isNavigating()) {
      <div class="loading-bar">Loading...</div>
    }
    <router-outlet />
  `,
})
export class App {
  private router = inject(Router);
  isNavigating = computed(() => !!this.router.currentNavigation());
}
```

Этот подход гарантирует, что пользователи получат визуальную обратную связь о том, что навигация выполняется, пока резолверы получают данные.

## Лучшие практики {#best-practices}

- **Держите резолверы лёгкими**: Резолверы должны получать только необходимые данные, а не всё, что может потребоваться странице
- **Обрабатывайте ошибки**: Всегда помните о корректной обработке ошибок для обеспечения наилучшего пользовательского опыта
- **Используйте кэширование**: Рассмотрите кэширование разрешённых данных для повышения производительности
- **Учитывайте UX при навигации**: Реализуйте индикаторы загрузки для выполнения резолверов, поскольку навигация блокируется во время получения данных
- **Устанавливайте разумные тайм-ауты**: Избегайте резолверов, которые могут зависнуть на неопределённое время и заблокировать навигацию
- **Типобезопасность**: Используйте TypeScript-интерфейсы для разрешённых данных

## Чтение разрешённых данных родительского маршрута в дочерних резолверах {#reading-parent-resolved-data-in-child-resolvers}

Резолверы выполняются от родительского к дочернему. Когда родительский маршрут определяет резолвер, его разрешённые данные доступны дочерним резолверам, выполняющимся позже.

```ts
import { inject } from '@angular/core';
import { provideRouter , ActivatedRouteSnapshot } from '@angular/router';
import { userResolver } from './resolvers';
import { UserPosts } from './pages';
import { PostService } from './services',
import type { User } from './types';

provideRouter([
  {
    path: 'users/:id',
    resolve: { user: userResolver }, // резолвер пользователя в родительском маршруте
    children: [
      {
        path: 'posts',
        component: UserPosts,
        // route.data.user доступен здесь во время выполнения этого резолвера
        resolve: {
          posts: (route: ActivatedRouteSnapshot) => {
            const postService = inject(PostService);
            const user = route.parent?.data['user'] as User; // данные родительского маршрута
            const userId = user.id;
            return postService.getPostByUser(userId);
          },
        },
      },
    ],
  },
]);
```
