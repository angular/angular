# Резолверы данных

Резолверы данных (Data resolvers) позволяют получать данные перед переходом на маршрут, гарантируя, что ваши компоненты
получат необходимые данные перед рендерингом. Это помогает избежать необходимости в состояниях загрузки и улучшает
пользовательский опыт за счет предварительной загрузки важных данных.

## Что такое резолверы данных?

Резолвер данных — это сервис, реализующий функцию `ResolveFn`. Он запускается перед активацией маршрута и может получать
данные из API, баз данных или других источников. Разрешенные (полученные) данные становятся доступными компоненту через
`ActivatedRoute`.

## Зачем использовать резолверы данных?

Резолверы данных решают распространенные проблемы маршрутизации:

- **Предотвращение пустых состояний**: Компоненты получают данные сразу после загрузки.
- **Улучшение пользовательского опыта**: Отсутствие спиннеров загрузки для критически важных данных.
- **Обработка ошибок**: Обработка ошибок получения данных до навигации.
- **Согласованность данных**: Гарантия доступности необходимых данных перед рендерингом, что важно для SSR.

## Создание резолвера

Вы создаете резолвер, написав функцию с типом `ResolveFn`.

Она принимает `ActivatedRouteSnapshot` и `RouterStateSnapshot` в качестве параметров.

Вот пример резолвера, который получает информацию о пользователе перед рендерингом маршрута, используя функцию [
`inject`](api/core/inject):

```ts
import { inject } from '@angular/core';
import { UserStore, SettingsStore } from './user-store';
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import type { User, Settings } from './types';

export const userResolver: ResolveFn<User> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  return userStore.getUser(userId);
};

export const settingsResolver: ResolveFn<Settings> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const settingsStore = inject(SettingsStore);
  const userId = route.paramMap.get('id')!;
  return settingsStore.getUserSettings(userId);
};
```

## Настройка маршрутов с резолверами

Если вы хотите добавить один или несколько резолверов данных к маршруту, вы можете добавить их под ключом `resolve` в
конфигурации маршрута. Тип `Routes` определяет структуру конфигурации маршрутов:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'user/:id',
    component: UserDetail,
    resolve: {
      user: userResolver,
      settings: settingsResolver
    }
  }
];
```

Подробнее о [конфигурации `resolve` можно узнать в документации API](api/router/Route#resolve).

## Доступ к полученным данным в компонентах

### Использование ActivatedRoute

Вы можете получить доступ к данным в компоненте, обратившись к данным снимка (snapshot) из `ActivatedRoute` с помощью
функции `signal`:

```angular-ts
import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { User, Settings } from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `
})
export class UserDetail {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  user = computed(() => this.data().user as User);
  settings = computed(() => this.data().settings as Settings);
}
```

### Использование withComponentInputBinding

Другой подход к доступу к полученным данным — использование `withComponentInputBinding()` при настройке роутера с
помощью `provideRouter`. Это позволяет передавать полученные данные напрямую как входные параметры (inputs) компонента:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withComponentInputBinding())
  ]
});
```

С этой конфигурацией вы можете определить inputs в вашем компоненте, которые соответствуют ключам резолвера, используя
функцию `input` и `input.required` для обязательных входных параметров:

```angular-ts
import { Component, input } from '@angular/core';
import type { User, Settings } from './types';

@Component({
  template: `
    <h1>{{ user().name }}</h1>
    <p>{{ user().email }}</p>
    <div>Theme: {{ settings().theme }}</div>
  `
})
export class UserDetail {
  user = input.required<User>();
  settings = input.required<Settings>();
}
```

Этот подход обеспечивает лучшую типобезопасность и устраняет необходимость внедрять `ActivatedRoute` только для доступа
к полученным данным.

## Обработка ошибок в резолверах

В случае сбоев навигации важно корректно обрабатывать ошибки в ваших резолверах данных. В противном случае возникнет
`NavigationError`, и переход на текущий маршрут не удастся, что приведет к плохому опыту для ваших пользователей.

Существует три основных способа обработки ошибок с резолверами данных:

1. Централизованная обработка ошибок в `withNavigationErrorHandler`.
2. Управление ошибками через подписку на события роутера.
3. Обработка ошибок непосредственно в резолвере.

### Централизованная обработка ошибок в `withNavigationErrorHandler`

Функция [`withNavigationErrorHandler`](api/router/withNavigationErrorHandler) предоставляет централизованный способ
обработки всех ошибок навигации, включая ошибки от неудачных резолверов данных. Этот подход сохраняет логику обработки
ошибок в одном месте и предотвращает дублирование кода обработки ошибок в разных резолверах.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withNavigationErrorHandler((error) => {
      const router = inject(Router);

      if (error?.message) {
        console.error('Navigation error occurred:', error.message)
      }

      router.navigate(['/error']);
    }))
  ]
});
```

С такой конфигурацией ваши резолверы могут сосредоточиться на получении данных, позволяя централизованному обработчику
управлять сценариями ошибок:

```ts
export const userResolver: ResolveFn<User> = (route) => {
  const userStore = inject(UserStore);
  const userId = route.paramMap.get('id')!;
  // No need for explicit error handling - let it bubble up
  return userStore.getUser(userId);
};
```

### Управление ошибками через подписку на события роутера

Вы также можете обрабатывать ошибки резолвера, подписавшись на события роутера и отслеживая события `NavigationError`.
Этот подход дает более детальный контроль над обработкой ошибок и позволяет реализовать пользовательскую логику
восстановления после ошибок.

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { Router, NavigationError } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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
  `
})
export class App {
  private router = inject(Router);
  private lastFailedUrl = signal('');

  private navigationErrors = toSignal(
    this.router.events.pipe(
      map(event => {
        if (event instanceof NavigationError) {
          this.lastFailedUrl.set(event.url);

          if (event.error) {
            console.error('Navigation error', event.error)
          }

          return 'Navigation failed. Please try again.';
        }
        return '';
      })
    ),
    { initialValue: '' }
  );

  errorMessage = this.navigationErrors;

  retryNavigation() {
    if (this.lastFailedUrl()) {
      this.router.navigateByUrl(this.lastFailedUrl());
    }
  }
}
```

Этот подход особенно полезен, когда вам нужно:

- Реализовать пользовательскую логику повторной попытки для неудачной навигации.
- Показывать конкретные сообщения об ошибках в зависимости от типа сбоя.
- Отслеживать сбои навигации для целей аналитики.

### Обработка ошибок непосредственно в резолвере

Вот обновленный пример `userResolver`, который логирует ошибку и перенаправляет обратно на общую страницу `/users`,
используя сервис `Router`:

```ts
import { inject } from '@angular/core';
import { ResolveFn, RedirectCommand, Router } from '@angular/router';
import { catchError, of, EMPTY } from 'rxjs';
import { UserStore } from './user-store';
import type { User } from './types';

export const userResolver: ResolveFn<User | RedirectCommand> = (route) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  const userId = route.paramMap.get('id')!;

  return userStore.getUser(userId).pipe(
    catchError(error => {
      console.error('Failed to load user:', error);
      return of(new RedirectCommand(router.parseUrl('/users')));
    })
  );
};
```

## Особенности загрузки при навигации

Хотя резолверы данных предотвращают состояния загрузки внутри компонентов, они вводят другой аспект UX: навигация
блокируется во время выполнения резолверов. Пользователи могут заметить задержку между кликом по ссылке и отображением
нового маршрута, особенно при медленных сетевых запросах.

### Обеспечение обратной связи при навигации

Чтобы улучшить пользовательский опыт во время выполнения резолвера, вы можете слушать события роутера и показывать
индикаторы загрузки:

```angular-ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    @if (isNavigating()) {
      <div class="loading-bar">Loading...</div>
    }
    <router-outlet />
  `
})
export class App {
  private router = inject(Router);
  isNavigating = computed(() => !!this.router.currentNavigation());
}
```

Этот подход гарантирует, что пользователи получат визуальную обратную связь о том, что навигация выполняется, пока
резолверы получают данные.

## Лучшие практики

- **Делайте резолверы легковесными**: Резолверы должны получать только необходимые данные, а не всё, что может
  понадобиться странице.
- **Обрабатывайте ошибки**: Всегда помните о корректной обработке ошибок, чтобы обеспечить наилучший опыт для
  пользователей.
- **Используйте кэширование**: Рассмотрите возможность кэширования полученных данных для повышения производительности.
- **Учитывайте UX навигации**: Реализуйте индикаторы загрузки для выполнения резолвера, так как навигация блокируется во
  время получения данных.
- **Устанавливайте разумные тайм-ауты**: Избегайте резолверов, которые могут зависнуть на неопределенный срок и
  заблокировать навигацию.
- **Типобезопасность**: Используйте интерфейсы TypeScript для полученных данных.

## Чтение данных родительского резолвера в дочерних резолверах

Резолверы выполняются от родителя к потомку. Когда родительский маршрут определяет резолвер, его полученные данные
доступны дочерним резолверам, которые запускаются после него.

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
            const user = route.data['user'] as User; // parent data
            const userId = user.id;
            return postService.getPostByUser(userId);
          },
        },
      },
    ],
  },
]);
```
