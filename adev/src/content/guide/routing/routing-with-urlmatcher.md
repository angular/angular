# Создание пользовательских сопоставлений маршрутов

Angular Router поддерживает мощную стратегию сопоставления, которую можно использовать для помощи пользователям в
навигации по приложению.
Эта стратегия поддерживает статические маршруты, переменные маршруты с параметрами, wildcard-маршруты и так далее.
Кроме того, вы можете создавать собственные шаблоны сопоставления для ситуаций, когда URL-адреса имеют более сложную
структуру.

В этом руководстве вы создадите пользовательский сопоставитель маршрутов (route matcher), используя `UrlMatcher` из
Angular.
Этот сопоставитель ищет в URL хендл (имя пользователя).

## Цели

Реализовать `UrlMatcher` из Angular для создания пользовательского сопоставителя маршрутов.

## Создание примера приложения

Используя Angular CLI, создайте новое приложение _angular-custom-route-match_.
Помимо стандартного каркаса приложения Angular, вы также создадите компонент _profile_.

1. Создайте новый проект Angular с именем _angular-custom-route-match_.

   ```shell
   ng new angular-custom-route-match
   ```

   Когда появится запрос `Would you like to add Angular routing?`, выберите `Y`.

   Когда появится запрос `Which stylesheet format would you like to use?`, выберите `CSS`.

   Через несколько минут новый проект `angular-custom-route-match` будет готов.

1. В терминале перейдите в директорию `angular-custom-route-match`.
1. Создайте компонент _profile_.

   ```shell
   ng generate component profile
   ```

1. В редакторе кода найдите файл `profile.component.html` и замените его содержимое следующим HTML-кодом.

   <docs-code header="profile/profile.component.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/profile/profile.component.html"/>

1. В редакторе кода найдите файл `app.component.html` и замените его содержимое следующим HTML-кодом.

   <docs-code header="app.component.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.component.html"/>

## Настройка маршрутов приложения

Теперь, когда каркас приложения готов, нужно добавить возможности маршрутизации в файл `app.config.ts`.
В рамках этого процесса вы создадите пользовательский сопоставитель URL, который ищет хендл в URL.
Этот хендл определяется по предшествующему символу `@`.

1. В редакторе кода откройте файл `app.config.ts`.
1. Добавьте `import` для `provideRouter` и `withComponentInputBinding` из Angular, а также маршруты приложения.

   ```ts
   import {provideRouter, withComponentInputBinding} from '@angular/router';

   import {routes} from './app.routes';
   ```

1. В массив `providers` добавьте выражение `provideRouter(routes, withComponentInputBinding())`.

1. Определите пользовательский сопоставитель маршрутов, добавив следующий код в маршруты приложения.

   <docs-code header="app.routes.ts" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.routes.ts" region="matcher"/>

Этот пользовательский сопоставитель представляет собой функцию, которая выполняет следующие задачи:

- Сопоставитель проверяет, что массив содержит только один сегмент.
- Сопоставитель использует регулярное выражение, чтобы убедиться, что формат имени пользователя совпадает.
- Если совпадение найдено, функция возвращает весь URL, определяя параметр маршрута `username` как подстроку пути.
- Если совпадение не найдено, функция возвращает `null`, и роутер продолжает искать другие маршруты, соответствующие
  URL.

HELPFUL: Пользовательский сопоставитель URL ведет себя так же, как и любое другое определение маршрута. Вы можете
определять дочерние маршруты или маршруты с ленивой загрузкой так же, как и для любого другого маршрута.

## Чтение параметров маршрута

Когда пользовательский сопоставитель готов, можно привязать параметр маршрута в компоненте `profile`.

В редакторе кода откройте файл `profile.component.ts` и создайте `input`, соответствующий параметру `username`.
Ранее мы добавили функцию `withComponentInputBinding` в `provideRouter`. Это позволяет `Router` привязывать информацию
непосредственно к компонентам маршрута.

```ts
username = input.required<string>();
```

## Проверка пользовательского сопоставителя URL

Теперь, когда код написан, можно протестировать пользовательский сопоставитель URL.

1. В окне терминала выполните команду `ng serve`.

   ```shell
   ng serve
   ```

1. Откройте браузер по адресу `http://localhost:4200`.

   Вы должны увидеть одну веб-страницу с предложением `Navigate to my profile`.

1. Нажмите на гиперссылку **my profile**.

   На странице появится новое предложение `Hello, Angular!`.

## Следующие шаги

Сопоставление шаблонов с помощью Angular Router дает большую гибкость при работе с динамическими URL-адресами в
приложении.
Чтобы узнать больше об Angular Router, ознакомьтесь со следующими темами:

<docs-pill-row>
  <docs-pill href="guide/routing/common-router-tasks" title="Маршрутизация и навигация в приложении"/>
  <docs-pill href="api/router/Router" title="API Роутера"/>
</docs-pill-row>

HELPFUL: Этот контент основан на
статье [Custom Route Matching with the Angular Router](https://medium.com/@brandontroberts/custom-route-matching-with-the-angular-router-fbdd48665483),
автор Brandon Roberts.
