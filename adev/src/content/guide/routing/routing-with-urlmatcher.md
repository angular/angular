# Создание пользовательских сопоставителей маршрутов {#creating-custom-route-matches}

Angular Router поддерживает мощную стратегию сопоставления, которую можно использовать для помощи пользователям в навигации по приложению.
Эта стратегия поддерживает статические маршруты, переменные маршруты с параметрами, маршруты-подстановки и многое другое.
Также можно создавать собственные пользовательские шаблоны сопоставления для ситуаций, когда URL являются более сложными.

В этом руководстве вы создадите пользовательский сопоставитель маршрутов с помощью `UrlMatcher` Angular.
Этот сопоставитель ищет в URL дескриптор Twitter.

## Цели {#objectives}

Реализовать `UrlMatcher` Angular для создания пользовательского сопоставителя маршрутов.

## Создание примера приложения {#create-a-sample-application}

С помощью Angular CLI создайте новое приложение _angular-custom-route-match_.
В дополнение к стандартному фреймворку Angular-приложения создайте также Компонент _profile_.

1. Создайте новый Angular-проект _angular-custom-route-match_.

   ```shell
   ng new angular-custom-route-match
   ```

   При появлении запроса `Would you like to add Angular routing?` выберите `Y`.

   При появлении запроса `Which stylesheet format would you like to use?` выберите `CSS`.

   Через некоторое время новый проект `angular-custom-route-match` будет готов.

1. В терминале перейдите в директорию `angular-custom-route-match`.
1. Создайте Компонент _profile_.

   ```shell
   ng generate component profile
   ```

1. В редакторе кода откройте файл `profile.html` и замените содержимое-заполнитель следующим HTML.

   <docs-code header="profile.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/profile/profile.html"/>

1. В редакторе кода откройте файл `app.html` и замените содержимое-заполнитель следующим HTML.

   <docs-code header="app.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.html"/>

## Настройка маршрутов приложения {#configure-your-routes-for-your-application}

После настройки фреймворка приложения необходимо добавить возможности маршрутизации в файл `app.config.ts`.
В рамках этого процесса создайте пользовательский сопоставитель URL, который ищет дескриптор Twitter в URL.
Этот дескриптор определяется предшествующим символом `@`.

1. В редакторе кода откройте файл `app.config.ts`.
1. Добавьте оператор `import` для `provideRouter` и `withComponentInputBinding` из Angular, а также маршруты приложения.

   ```ts
   import {provideRouter, withComponentInputBinding} from '@angular/router';

   import {routes} from './app.routes';
   ```

1. В массиве providers добавьте оператор `provideRouter(routes, withComponentInputBinding())`.

1. Определите пользовательский сопоставитель маршрутов, добавив следующий код в маршруты приложения.

   <docs-code header="app.routes.ts" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.routes.ts" region="matcher"/>

Этот пользовательский сопоставитель — функция, выполняющая следующие задачи:

- Сопоставитель проверяет, что массив содержит только один сегмент
- Сопоставитель использует регулярное выражение для проверки, что формат имени пользователя совпадает
- При совпадении функция возвращает полный URL, определяя параметр маршрута `username` как подстроку пути
- При несовпадении функция возвращает null, и Роутер продолжает поиск других маршрутов, совпадающих с URL

HELPFUL: Пользовательский сопоставитель URL ведёт себя как любое другое определение маршрута. Дочерние маршруты или маршруты с ленивой загрузкой определяются так же, как и для любого другого маршрута.

## Чтение параметров маршрута {#reading-the-route-parameters}

После настройки пользовательского сопоставителя можно привязать параметр маршрута в Компоненте `profile`.

В редакторе кода откройте файл `profile.ts` и создайте `input`, совпадающий с параметром `username`.
Ранее мы добавили функцию `withComponentInputBinding` в `provideRouter`. Это позволяет `Router` привязывать информацию непосредственно к компонентам маршрутов.

```ts
username = input.required<string>();
```

## Тестирование пользовательского сопоставителя URL {#test-your-custom-url-matcher}

После подготовки кода можно протестировать пользовательский сопоставитель URL.

1. В терминале выполните команду `ng serve`.

   ```shell
   ng serve
   ```

1. Откройте браузер и перейдите на `http://localhost:4200`.

   Вы увидите одну веб-страницу с предложением `Navigate to my profile`.

1. Нажмите на ссылку **my profile**.

   На странице появится новое предложение `Hello, Angular!`.

## Следующие шаги {#next-steps}

Сопоставление шаблонов с Angular Router обеспечивает большую гибкость при работе с динамическими URL в приложении.
Для получения дополнительной информации об Angular Router изучите следующие темы:

<docs-pill-row>
  <docs-pill href="guide/routing/common-router-tasks" title="Маршрутизация и навигация в приложении"/>
  <docs-pill href="api/router/Router" title="Router API"/>
</docs-pill-row>

HELPFUL: Этот контент основан на статье [Custom Route Matching with the Angular Router](https://medium.com/@brandontroberts/custom-route-matching-with-the-angular-router-fbdd48665483), автор — [Brandon Roberts](https://twitter.com/brandontroberts).
