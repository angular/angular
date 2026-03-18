# Определение маршрутов

Маршруты являются фундаментальными строительными блоками навигации в приложении Angular.

## Что такое маршруты? {#what-are-routes}

В Angular **маршрут** — это объект, который определяет, какой компонент должен отображаться для определённого URL-пути или шаблона, а также дополнительные параметры конфигурации того, что происходит при переходе пользователя на этот URL.

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

В большинстве проектов маршруты определяются в отдельном файле, в имени которого содержится слово `routes`.

Коллекция маршрутов выглядит следующим образом:

```ts
import {Routes} from '@angular/router';
import {HomePage} from './home-page';
import {AdminPage} from './about-page';

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

Совет: если вы создали проект с помощью Angular CLI, маршруты определены в файле `src/app/app.routes.ts`.

### Добавление маршрутизатора в приложение {#adding-the-router-to-your-application}

При начальной загрузке приложения Angular без Angular CLI можно передать объект конфигурации, содержащий массив `providers`.

В массив `providers` можно добавить Angular-маршрутизатор, вызвав функцию `provideRouter` с вашими маршрутами.

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

Статические URL-пути — это маршруты с заранее определёнными путями, которые не меняются в зависимости от динамических параметров. Это маршруты, которые точно совпадают со строкой `path` и имеют фиксированный результат.

Примеры:

- "/admin"
- "/blog"
- "/settings/account"

### Определение URL-путей с параметрами маршрута {#define-url-paths-with-route-parameters}

Параметризованные URL позволяют определять динамические пути, предоставляющие доступ к одному компоненту через несколько URL при динамическом отображении данных на основе параметров в URL.

Можно определить такой тип шаблона, добавив параметры в строку `path` маршрута и предварив каждый параметр символом двоеточия (`:`).

IMPORTANT: Параметры отличаются от информации в [строке запроса](https://en.wikipedia.org/wiki/Query_string) URL.
Подробнее о [параметрах запроса в Angular читайте в этом руководстве](guide/routing/read-route-state#query-parameters).

В следующем примере компонент профиля пользователя отображается на основе идентификатора пользователя, переданного через URL.

```ts
import {Routes} from '@angular/router';
import {UserProfile} from './user-profile/user-profile';

const routes: Routes = [{path: 'user/:id', component: UserProfile}];
```

В этом примере URL вида `/user/leeroy` и `/user/jenkins` отображают компонент `UserProfile`. Этот компонент может затем считать параметр `id` и использовать его для выполнения дополнительной работы, например для получения данных. Подробности о чтении параметров маршрута см. в [руководстве по чтению состояния маршрута](guide/routing/read-route-state).

Допустимые имена параметров маршрута должны начинаться с буквы (a-z, A-Z) и могут содержать только:

- Буквы (a-z, A-Z)
- Цифры (0-9)
- Знак подчёркивания (\_)
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

С новым путём пользователи могут посещать `/user/leeroy/youtube` и `/user/leeroy/bluesky` и видеть соответствующие ленты социальных сетей на основе параметра для пользователя leeroy.

Подробности о чтении параметров маршрута см. в [руководстве по чтению состояния маршрута](guide/routing/read-route-state).

### Символы подстановки (wildcards) {#wildcards}

Когда нужно перехватить все маршруты для определённого пути, решением является маршрут с подстановочным знаком, определяемый двойной звёздочкой (`**`).

Распространённый пример — определение компонента «Страница не найдена».

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

В этом массиве маршрутов приложение отображает компонент `NotFound`, когда пользователь посещает любой путь за пределами `home` и `user/:id`.

Совет: маршруты с подстановочными знаками обычно размещаются в конце массива маршрутов.

## Как Angular сопоставляет URL {#how-angular-matches-urls}

При определении маршрутов порядок важен, поскольку Angular использует стратегию «первого совпадения». Это означает, что как только Angular сопоставит URL с `path` маршрута, он прекращает проверку остальных маршрутов. В результате всегда размещайте более конкретные маршруты перед менее конкретными.

В следующем примере маршруты определены от наиболее конкретного к наименее конкретному:

```ts
const routes: Routes = [
  {path: '', component: Home}, // Empty path
  {path: 'users/new', component: NewUser}, // Static, most specific
  {path: 'users/:id', component: UserDetail}, // Dynamic
  {path: 'users', component: Users}, // Static, less specific
  {path: '**', component: NotFound}, // Wildcard - always last
];
```

Если пользователь посещает `/users/new`, Angular-маршрутизатор выполнит следующие шаги:

1. Проверяет `''` — не совпадает
1. Проверяет `users/new` — совпадает! Останавливается здесь
1. Никогда не достигает `users/:id`, хотя мог бы совпасть
1. Никогда не достигает `users`
1. Никогда не достигает `**`

## Перенаправления {#redirects}

Можно определить маршрут, который перенаправляет на другой маршрут вместо отображения компонента:

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

Если вы изменили или удалили маршрут, некоторые пользователи могут по-прежнему переходить по устаревшим ссылкам или закладкам на этот маршрут. Можно добавить перенаправление, чтобы направить этих пользователей на подходящий альтернативный маршрут вместо страницы «не найдено».

## Заголовки страниц {#page-titles}

Каждому маршруту можно сопоставить **заголовок**. Angular автоматически обновляет [заголовок страницы](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title) при активации маршрута. Всегда определяйте подходящие заголовки страниц для своего приложения, так как они необходимы для обеспечения доступности.

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

Свойство `title` страницы может быть динамически задано через функцию resolver с использованием [`ResolveFn`](/api/router/ResolveFn).

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

Заголовки маршрутов также можно задавать через сервис, расширяющий абстрактный класс [`TitleStrategy`](/api/router/TitleStrategy). По умолчанию Angular использует [`DefaultTitleStrategy`](/api/router/DefaultTitleStrategy).

### Использование TitleStrategy для заголовков страниц {#using-titlestrategy-for-page-titles}

Для сценариев, где требуется централизованное управление тем, как формируется заголовок документа, реализуйте `TitleStrategy`.

`TitleStrategy` — это токен, который можно предоставить для переопределения стратегии заголовков по умолчанию, используемой Angular. Можно предоставить собственный `TitleStrategy` для реализации соглашений, таких как добавление суффикса приложения, форматирование заголовков из хлебных крошек или динамическая генерация заголовков из данных маршрута.

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

Чтобы использовать пользовательскую стратегию, предоставьте её через токен `TitleStrategy` на уровне приложения:

```ts
import {provideRouter, TitleStrategy} from '@angular/router';
import {AppTitleStrategy} from './app-title.strategy';

export const appConfig = {
  providers: [provideRouter(routes), {provide: TitleStrategy, useClass: AppTitleStrategy}],
};
```

## Провайдеры на уровне маршрута для внедрения зависимостей {#route-level-providers-for-dependency-injection}

Каждый маршрут имеет свойство `providers`, которое позволяет предоставлять зависимости содержимому этого маршрута через [внедрение зависимостей](/guide/di).

Распространённые сценарии, где это полезно, включают приложения с различными сервисами в зависимости от того, является ли пользователь администратором или нет.

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

В этом примере кода путь `admin` содержит защищённое свойство данных `ADMIN_API_KEY`, доступное только дочерним элементам в его разделе. В результате никакие другие пути не смогут получить доступ к данным, предоставленным через `ADMIN_API_KEY`.

Дополнительные сведения о провайдерах и внедрении в Angular см. в [руководстве по внедрению зависимостей](/guide/di).

## Связывание данных с маршрутами {#associating-data-with-routes}

Данные маршрута позволяют прикреплять дополнительную информацию к маршрутам. Можно настраивать поведение компонентов на основе этих данных.

Существуют два способа работы с данными маршрута: статические данные, которые остаются неизменными, и динамические данные, которые могут изменяться в зависимости от условий выполнения.

### Статические данные {#static-data}

Произвольные статические данные можно связать с маршрутом через свойство `data`, чтобы централизовать такие вещи, как метаданные конкретного маршрута (например, отслеживание аналитики, права доступа и т.д.):

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

В этом примере кода главная страница и страница «О нас» настроены с конкретным `analyticsId`, который затем используется в соответствующих компонентах для аналитики просмотров страниц.

Прочитать эти статические данные можно путём внедрения `ActivatedRoute`. Подробности см. в [руководстве по чтению состояния маршрута](guide/routing/read-route-state).

### Динамические данные с помощью Resolver-ов данных {#dynamic-data-with-data-resolvers}

Когда нужно предоставить динамические данные маршруту, ознакомьтесь с [руководством по Resolver-ам данных маршрута](guide/routing/data-resolvers).

## Вложенные маршруты {#nested-routes}

Вложенные маршруты, также известные как дочерние маршруты, — это распространённый способ управления более сложными маршрутами навигации, когда компонент имеет подпредставление, изменяющееся в зависимости от URL.

<img alt="Diagram to illustrate nested routes" src="assets/images/guide/router/nested-routing-diagram.svg">

Можно добавить дочерние маршруты к любому определению маршрута с помощью свойства `children`:

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

Приведённый пример определяет маршрут для страницы продукта, который позволяет пользователю переключаться между отображением информации о продукте или отзывов в зависимости от URL.

Свойство `children` принимает массив объектов `Route`.

Для отображения дочерних маршрутов родительский компонент (`Product` в примере выше) включает собственный `<router-outlet>`.

```angular-html
<!-- Product -->
<article>
  <h1>Product {{ id }}</h1>
  <router-outlet />
</article>
```

После добавления дочерних маршрутов в конфигурацию и добавления `<router-outlet>` в компонент навигация между URL-адресами, соответствующими дочерним маршрутам, обновляет только вложенный outlet.

## Следующие шаги {#next-steps}

<docs-pill-row>
  <docs-pill href="guide/routing/loading-strategies" title="Стратегии загрузки маршрутов"/>
  <docs-pill href="guide/routing/show-routes-with-outlets" title="Отображение содержимого маршрутов с помощью Outlet-ов"/>
</docs-pill-row>
