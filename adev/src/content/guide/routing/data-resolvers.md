# Resolver-ы данных {#data-resolvers}

Resolver-ы данных позволяют получать данные до перехода к маршруту, обеспечивая компоненты необходимыми данными перед отрисовкой. Это помогает устранить необходимость в состояниях загрузки и улучшить пользовательский опыт за счёт предварительной загрузки необходимых данных.

## Что такое Resolver-ы данных? {#what-are-data-resolvers}

Resolver данных — это сервис, реализующий функцию `ResolveFn`. Он выполняется до активации маршрута и может получать данные из API, баз данных или других источников. Разрешённые данные становятся доступны компоненту через `ActivatedRoute`.

Resolver-ы данных имеют доступ к [сервисам, предоставляемым на уровне маршрута](guide/di/defining-dependency-providers#route-providers), а также к специфичной для маршрута информации через аргумент `route`.

## Зачем использовать Resolver-ы данных? {#why-use-data-resolvers}

Resolver-ы данных решают распространённые проблемы маршрутизации:

- **Предотвращение пустых состояний**: компоненты получают данные сразу при загрузке
- **Лучший пользовательский опыт**: нет индикаторов загрузки для критически важных данных
- **Обработка ошибок**: обработка ошибок получения данных до навигации
- **Согласованность данных**: гарантия доступности необходимых данных перед отрисовкой, что важно для SSR

## Создание Resolver-а {#creating-a-resolver}

Resolver создаётся путём написания функции с типом `ResolveFn`.

Она получает `ActivatedRouteSnapshot` и `RouterStateSnapshot` в качестве параметров.

Вот Resolver, который получает информацию о пользователе перед отрисовкой маршрута с использованием функции [`inject`](api/core/inject):

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

## Настройка маршрутов с Resolver-ами {#configuring-routes-with-resolvers}

Чтобы добавить один или несколько Resolver-ов данных к маршруту, их можно добавить в ключ `resolve` конфигурации маршрута. Тип `Routes` определяет структуру конфигураций маршрутов:

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

Подробнее о [конфигурации `resolve` в документации API](api/router/Route#resolve).

## Доступ к разрешённым данным в компонентах {#accessing-resolved-data-in-components}

### Использование ActivatedRoute {#using-activatedroute}

Получить доступ к разрешённым данным в компоненте можно, обратившись к данным снимка из `ActivatedRoute` с помощью функции `signal`:

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

Другой подход к доступу к разрешённым данным — использование `withComponentInputBinding()` при настройке маршрутизатора с `provideRouter`. Это позволяет передавать разрешённые данные непосредственно как входные параметры компонента:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding())],
});
```

С такой конфигурацией можно определить входные параметры в компоненте, совпадающие с ключами Resolver-ов, используя функцию `input` и `input.required` для обязательных входных параметров:

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

Этот подход обеспечивает лучшую типовую безопасность и устраняет необходимость внедрения `ActivatedRoute` только для доступа к разрешённым данным.

## Обработка ошибок в Resolver-ах {#error-handling-in-resolvers}

В случае сбоя навигации важно корректно обрабатывать ошибки в Resolver-ах данных. В противном случае произойдёт `NavigationError`, и навигация к текущему маршруту завершится неудачей, что приведёт к неудовлетворительному пользовательскому опыту.

Существует три основных способа обработки ошибок с Resolver-ами данных:

1. Централизованная обработка ошибок в `withNavigationErrorHandler`
2. Управление ошибками через подписку на события маршрутизатора
3. Обработка ошибок непосредственно в Resolver-е

### Централизованная обработка ошибок в `withNavigationErrorHandler` {#centralize-error-handling-in-withnavigationerrorhandler}

Функция [`withNavigationErrorHandler`](api/router/withNavigationErrorHandler) предоставляет централизованный способ обработки всех ошибок навигации, включая ошибки из неудачных Resolver-ов данных. Этот подход сосредотачивает логику обработки ошибок в одном месте и предотвращает дублирование кода обработки ошибок в Resolver-ах.

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

С такой конфигурацией Resolver-ы могут сосредоточиться на получении данных, а централизованный обработчик управляет сценариями ошибок:

```ts
export const userResolver: ResolveFn<User> = (route) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  // No need for explicit error handling - let it bubble up
  return userStore.getUser(userId);
};
```

### Управление ошибками через подписку на события маршрутизатора {#managing-errors-through-a-subscription-to-router-events}

Также можно обрабатывать ошибки Resolver-ов, подписавшись на события маршрутизатора и прослушивая события `NavigationError`. Этот подход даёт более детальный контроль над обработкой ошибок и позволяет реализовать пользовательскую логику восстановления после ошибок.

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

- Реализовать пользовательскую логику повторных попыток при неудачной навигации
- Показывать конкретные сообщения об ошибках в зависимости от типа сбоя
- Отслеживать сбои навигации в целях аналитики

### Обработка ошибок непосредственно в Resolver-е {#handling-errors-directly-in-the-resolver}

Вот обновлённый пример `userResolver`, который записывает ошибку в лог и перенаправляет на общую страницу `/users` с использованием сервиса `Router`:

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

## Особенности загрузки при навигации {#navigation-loading-considerations}

Хотя Resolver-ы данных предотвращают состояния загрузки внутри компонентов, они вводят другой аспект UX: навигация блокируется во время выполнения Resolver-ов. Пользователи могут испытывать задержки между нажатием на ссылку и появлением нового маршрута, особенно при медленных сетевых запросах.

### Предоставление обратной связи во время навигации {#providing-navigation-feedback}

Для улучшения пользовательского опыта во время выполнения Resolver-ов можно прослушивать события маршрутизатора и показывать индикаторы загрузки:

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

Такой подход обеспечивает визуальную обратную связь пользователям о том, что навигация выполняется, пока Resolver-ы получают данные.

## Лучшие практики {#best-practices}

- **Держите Resolver-ы лёгкими**: Resolver-ы должны получать только необходимые данные, а не всё, что может понадобиться странице
- **Обрабатывайте ошибки**: всегда помните об обработке ошибок для обеспечения наилучшего опыта пользователям
- **Используйте кэширование**: рассмотрите кэширование разрешённых данных для повышения производительности
- **Учитывайте UX навигации**: реализуйте индикаторы загрузки для выполнения Resolver-ов, поскольку навигация блокируется во время получения данных
- **Устанавливайте разумные тайм-ауты**: избегайте Resolver-ов, которые могут зависнуть на неопределённое время и заблокировать навигацию
- **Типовая безопасность**: используйте интерфейсы TypeScript для разрешённых данных

## Чтение разрешённых данных родителя в дочерних Resolver-ах {#reading-parent-resolved-data-in-child-resolvers}

Resolver-ы выполняются от родителя к дочернему элементу. Когда родительский маршрут определяет Resolver, его разрешённые данные доступны дочерним Resolver-ам, выполняющимся позже.

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
    resolve: { user: userResolver }, // user resolver in the parent route
    children: [
      {
        path: 'posts',
        component: UserPosts,
        // route.data.user is available here while this resolver runs
        resolve: {
          posts: (route: ActivatedRouteSnapshot) => {
            const postService = inject(PostService);
            const user = route.parent?.data['user'] as User; // parent data
            const userId = user.id;
            return postService.getPostByUser(userId);
          },
        },
      },
    ],
  },
]);
```
