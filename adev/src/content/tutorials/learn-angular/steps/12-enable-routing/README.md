# Обзор маршрутизации

Для большинства приложений наступает момент, когда требуется больше одной страницы. Когда это время неизбежно наступает,
маршрутизация становится важной частью производительности для пользователей.

Примечание: Узнайте больше о [маршрутизации в подробном руководстве](/guide/routing).

В этом упражнении вы узнаете, как настроить ваше приложение для использования Angular Router.

<hr>

<docs-workflow>

<docs-step title="Create an app.routes.ts file">

Внутри `app.routes.ts` внесите следующие изменения:

1. Импортируйте `Routes` из пакета `@angular/router`.
2. Экспортируйте константу с именем `routes` типа `Routes` и присвойте ей значение `[]`.

```ts
import {Routes} from '@angular/router';

export const routes: Routes = [];
```

</docs-step>

<docs-step title="Add routing to provider">

В `app.config.ts` настройте приложение для Angular Router, выполнив следующие шаги:

1. Импортируйте функцию `provideRouter` из `@angular/router`.
1. Импортируйте `routes` из `./app.routes.ts`.
1. Вызовите функцию `provideRouter`, передав `routes` в качестве аргумента, внутри массива `providers`.

<docs-code language="ts" highlight="[2,3,6]">
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
providers: [provideRouter(routes)],
};
</docs-code>

</docs-step>

<docs-step title="Import `RouterOutlet` in the component">

Наконец, чтобы убедиться, что ваше приложение готово к использованию Angular Router, нужно сообщить приложению, где
роутер должен отображать желаемый контент. Сделайте это с помощью директивы `RouterOutlet` из `@angular/router`.

Обновите шаблон для `App`, добавив `<router-outlet />`

<docs-code language="angular-ts" highlight="[11]">
import {RouterOutlet} from '@angular/router';

@Component({
...
template: `     <nav>
      <a href="/">Home</a>
      |
      <a href="/user">User</a>
    </nav>
    <router-outlet />
  `,
imports: [RouterOutlet],
})
export class App {}
</docs-code>

</docs-step>

</docs-workflow>

Теперь ваше приложение настроено для использования Angular Router. Отличная работа! 🙌

Продолжайте в том же духе, чтобы изучить следующий шаг — определение маршрутов для нашего приложения.
