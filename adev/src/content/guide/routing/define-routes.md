# Определение маршрутов

Маршруты служат фундаментальными строительными блоками навигации в приложении Angular.

## Что такое маршруты? {#what-are-routes}

В Angular **маршрут** — это объект, который определяет, какой компонент должен рендериться для конкретного URL-пути или паттерна, а также дополнительные опции конфигурации о том, что происходит, когда пользователь переходит по этому URL.

Вот базовый пример маршрута:

```ts
import {AdminPage} from './app-admin';

const adminPage = {
  path: 'admin',
  component: AdminPage,
};
```

Для этого маршрута, когда пользователь посещает путь `/admin`, приложение отобразит компонент `AdminPage`.

### Управление маршрутами в приложении {#managing-routes-in-your-application}

Большинство проектов определяют маршруты в отдельном файле, в имени которого есть `routes`.

Коллекция маршрутов выглядит так:

```ts
import {Routes} from '@angular/router';
import {HomePage} from './home-page';
import {AdminPage} from './admin-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'admin',
    component: AdminPage,
  },
];
```

TIP: Если вы сгенерировали проект с Angular CLI, ваши маршруты определены в `src/app/app.routes.ts`.

### Добавление router в приложение {#adding-the-router-to-your-application}

При bootstrap приложения Angular без Angular CLI можно передать объект конфигурации, включающий массив `providers`.

Внутри массива `providers` можно добавить Angular router в приложение, добавив вызов функции `provideRouter` с вашими маршрутами.

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...
  ],
};
```

## URL-пути маршрутов {#route-url-paths}

### Статические URL-пути {#static-url-paths}

Статические URL-пути относятся к маршрутам с предопределёнными путями, которые не меняются на основе динамических параметров. Это маршруты, которые точно соответствуют строке `path` и имеют фиксированный исход.

Примеры включают:

- "/admin"
- "/blog"
- "/settings/account"

### Определение URL-путей с параметрами маршрута {#define-url-paths-with-route-parameters}

Параметризованные URL позволяют определять динамические пути, которые допускают несколько URL к одному и тому же компоненту, динамически отображая данные на основе параметров в URL.

Можно определить такой паттерн, добавив параметры в строку `path` маршрута и предварив каждый параметр символом двоеточия (`:`).

IMPORTANT: Параметры отличаются от информации в [query string](https://en.wikipedia.org/wiki/Query_string) URL.
Узнайте больше о [query parameters в Angular в этом руководстве](/guide/routing/read-route-state#query-parameters).

Следующий пример отображает компонент профиля пользователя на основе user id, переданного через URL.

```ts
import {Routes} from '@angular/router';
import {UserProfile} from './user-profile/user-profile';

const routes: Routes = [{path: 'user/:id', component: UserProfile}];
```

В этом примере URL вроде `/user/leeroy` и `/user/jenkins` рендерят компонент `UserProfile`. Этот компонент затем может прочитать параметр `id` и использовать его для дополнительной работы, например получения данных. Подробности о чтении параметров маршрута см. в [руководстве по чтению состояния маршрута](/guide/routing/read-route-state).

Валидные имена параметров маршрута должны начинаться с буквы (a-z, A-Z) и могут содержать только:

- Буквы (a-z, A-Z)
- Цифры (0-9)
- Подчёркивание (\_)
- Дефис (-)

Также можно определять пути с несколькими параметрами:

```ts
import {Routes} from '@angular/router';
import {UserProfile} from './user-profile';
import {SocialMediaFeed} from './social-media-feed';

const routes: Routes = [
  {path: 'user/:id/:social-media', component: SocialMediaFeed},
  {path: 'user/:id/', component: UserProfile},
];
```

С этим новым путём пользователи могут посещать `/user/leeroy/youtube` и `/user/leeroy/bluesky` и видеть соответствующие ленты социальных сетей на основе параметра для пользователя leeroy.

Подробности о чтении параметров маршрута см. в [Чтение состояния маршрута](/guide/routing/read-route-state).

### Wildcards {#wildcards}

Когда нужно перехватить все маршруты для определённого пути, решением является wildcard-маршрут, который определяется двойной звёздочкой (`**`).

Распространённый пример — определение компонента Page Not Found.

```ts
import {Home} from './home/home';
import {UserProfile} from './user-profile';
import {NotFound} from './not-found';

const routes: Routes = [
  {path: 'home', component: Home},
  {path: 'user/:id', component: UserProfile},
  {path: '**', component: NotFound},
];
```

В этом массиве маршрутов приложение отображает компонент `NotFound`, когда пользователь посещает любой путь вне `home` и `user/:id`.

TIP: Wildcard-маршруты обычно размещают в конце массива маршрутов.

## Как Angular сопоставляет URL {#how-angular-matches-urls}

При определении маршрутов порядок важен, потому что Angular использует стратегию first-match wins. Это означает, что как только Angular сопоставляет URL с `path` маршрута, он прекращает проверять дальнейшие маршруты. В результате всегда помещайте более специфичные маршруты перед менее специфичными.

Следующий пример показывает маршруты, определённые от наиболее специфичных к наименее специфичным:

```ts
const routes: Routes = [
  {path: '', component: Home}, // Empty path
  {path: 'users/new', component: NewUser}, // Static, most specific
  {path: 'users/:id', component: UserDetail}, // Dynamic
  {path: 'users', component: Users}, // Static, less specific
  {path: '**', component: NotFound}, // Wildcard - always last
];
```

Если пользователь посещает `/users/new`, Angular router пройдёт следующие шаги:

1. Проверяет `''` — не совпадает
1. Проверяет `users/new` — совпадает! Останавливается здесь
1. Никогда не достигает `users/:id`, хотя он мог бы совпасть
1. Никогда не достигает `users`
1. Никогда не достигает `**`

## Redirects {#redirects}

Можно определить маршрут, который перенаправляет на другой маршрут вместо рендеринга компонента:

```ts
import {Blog} from './home/blog';

const routes: Routes = [
  {
    path: 'articles',
    redirectTo: '/blog',
  },
  {
    path: 'blog',
    component: Blog,
  },
];
```

Если вы изменяете или удаляете маршрут, некоторые пользователи всё ещё могут кликать по устаревшим ссылкам или закладкам на этот маршрут. Можно добавить redirect, чтобы направить этих пользователей на подходящий альтернативный маршрут вместо страницы «not found».

## Заголовки страниц {#page-titles}

Можно связать **title** с каждым маршрутом. Angular автоматически обновляет [заголовок страницы](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title), когда маршрут активируется. Всегда определяйте подходящие заголовки страниц для приложения, так как эти заголовки необходимы для создания доступного опыта.

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {About} from './about';
import {Products} from './products';

const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home Page',
  },
  {
    path: 'about',
    component: About,
    title: 'About Us',
  },
];
```

Свойство `title` страницы можно задать динамически функцией resolver с использованием [`ResolveFn`](/api/router/ResolveFn).

```ts
const titleResolver: ResolveFn<string> = (route) => route.queryParams['id'];
const routes: Routes = [
  ...{
    path: 'products',
    component: Products,
    title: titleResolver,
  },
];
```

Заголовки маршрутов также можно задать через сервис, расширяющий абстрактный класс [`TitleStrategy`](/api/router/TitleStrategy). По умолчанию Angular использует [`DefaultTitleStrategy`](/api/router/DefaultTitleStrategy).

### Использование TitleStrategy для заголовков страниц {#using-titlestrategy-for-page-titles}

Для продвинутых сценариев, где нужен централизованный контроль над тем, как составляется document title, реализуйте `TitleStrategy`.

`TitleStrategy` — это токен, который можно предоставить, чтобы переопределить стратегию заголовков по умолчанию, используемую Angular. Можно предоставить пользовательский `TitleStrategy` для реализации соглашений вроде добавления суффикса приложения, форматирования заголовков из breadcrumbs или динамической генерации заголовков из данных маршрута.

```ts
import {inject, Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TitleStrategy, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  updateTitle(snapshot: RouterStateSnapshot): void {
    // PageTitle is equal to the "Title" of a route if it's set
    // If its not set it will use the "title" given in index.html
    const pageTitle = this.buildTitle(snapshot) || this.title.getTitle();
    this.title.setTitle(`MyAwesomeApp - ${pageTitle}`);
  }
}
```

Чтобы использовать пользовательскую стратегию, предоставьте её с токеном `TitleStrategy` на уровне приложения:

```ts
import {provideRouter, TitleStrategy} from '@angular/router';
import {AppTitleStrategy} from './app-title.strategy';

export const appConfig = {
  providers: [provideRouter(routes), {provide: TitleStrategy, useClass: AppTitleStrategy}],
};
```

## Providers уровня маршрута для внедрения зависимостей {#route-level-providers-for-dependency-injection}

У каждого маршрута есть свойство `providers`, которое позволяет предоставлять зависимости содержимому этого маршрута через [внедрение зависимостей](/guide/di).

Распространённые сценарии, где это может быть полезно, включают приложения с разными сервисами в зависимости от того, является ли пользователь администратором или нет.

```ts
export const ROUTES: Route[] = [
  {
    path: 'admin',
    providers: [AdminService, {provide: ADMIN_API_KEY, useValue: '12345'}],
    children: [
      {path: 'users', component: AdminUsers},
      {path: 'teams', component: AdminTeams},
    ],
  },
  // ... other application routes that don't
  //     have access to ADMIN_API_KEY or AdminService.
];
```

В этом примере кода путь `admin` содержит защищённое свойство данных `ADMIN_API_KEY`, которое доступно только дочерним элементам внутри его секции. В результате никакие другие пути не смогут получить доступ к данным, предоставленным через `ADMIN_API_KEY`.

См. [руководство по внедрению зависимостей](/guide/di) для дополнительной информации о providers и injection в Angular.

## Связывание данных с маршрутами {#associating-data-with-routes}

Данные маршрута позволяют прикреплять дополнительную информацию к маршрутам. Можно настраивать поведение компонентов на основе этих данных.

Есть два способа работы с данными маршрута: статические данные, которые остаются постоянными, и динамические данные, которые могут меняться на основе условий runtime.

### Статические данные {#static-data}

Можно связать произвольные статические данные с маршрутом через свойство `data`, чтобы централизовать такие вещи, как метаданные, специфичные для маршрута (например, отслеживание аналитики, permissions и т.д.):

```ts
import {Routes} from '@angular/router';
import {Home} from './home';
import {About} from './about';
import {Products} from './products';

const routes: Routes = [
  {
    path: 'about',
    component: About,
    data: {analyticsId: '456'},
  },
  {
    path: '',
    component: Home,
    data: {analyticsId: '123'},
  },
];
```

В этом примере кода страницы home и about настроены с конкретным `analyticsId`, который затем использовался бы в соответствующих компонентах для аналитики отслеживания страниц.

Можно прочитать эти статические данные, внедрив `ActivatedRoute`. Подробности см. в [Чтение состояния маршрута](/guide/routing/read-route-state).

### Динамические данные с data resolvers {#dynamic-data-with-data-resolvers}

Когда нужно предоставить динамические данные маршруту, см. [руководство по route data resolvers](/guide/routing/data-resolvers).

## Вложенные маршруты {#nested-routes}

Вложенные маршруты, также известные как дочерние маршруты, — распространённая техника для управления более сложными маршрутами навигации, где у компонента есть sub-view, которая меняется на основе URL.

<img alt="Diagram to illustrate nested routes" src="assets/images/guide/router/nested-routing-diagram.svg">

Можно добавить дочерние маршруты к любому определению маршрута со свойством `children`:

```ts
const routes: Routes = [
  {
    path: 'product/:id',
    component: Product,
    children: [
      {
        path: 'info',
        component: ProductInfo,
      },
      {
        path: 'reviews',
        component: ProductReviews,
      },
    ],
  },
];
```

Пример выше определяет маршрут для страницы продукта, который позволяет пользователю менять, отображается ли информация о продукте или отзывы, на основе URL.

Свойство `children` принимает массив объектов `Route`.

Чтобы отображать дочерние маршруты, родительский компонент (`Product` в примере выше) включает свой собственный `<router-outlet>`.

```angular-html
<!-- Product -->
<article>
  <h1>Product {{ id }}</h1>
  <router-outlet />
</article>
```

После добавления дочерних маршрутов в конфигурацию и добавления `<router-outlet>` в компонент навигация между URL, соответствующими дочерним маршрутам, обновляет только вложенный outlet.

## Следующие шаги {#next-steps}

<docs-pill-row>
  <docs-pill href="/guide/routing/loading-strategies" title="Route Loading Strategies"/>
  <docs-pill href="/guide/routing/show-routes-with-outlets" title="Display the contents of your routes with Outlets"/>
</docs-pill-row>
