# Создание пользовательских сопоставителей маршрутов {#creating-custom-route-matches}

Angular Router поддерживает мощную стратегию сопоставления, которую можно использовать для удобной навигации по приложению.
Эта стратегия поддерживает статические маршруты, переменные маршруты с параметрами, маршруты с подстановочными знаками и другие варианты.
Также можно создавать собственные пользовательские шаблоны сопоставления для ситуаций, когда URL более сложные.

В этом руководстве вы создадите пользовательский сопоставитель маршрутов с использованием `UrlMatcher` Angular.
Этот сопоставитель ищет имя пользователя Twitter в URL.

## Цели {#objectives}

Реализовать `UrlMatcher` Angular для создания пользовательского сопоставителя маршрутов.

## Создание примера приложения {#create-a-sample-application}

С помощью Angular CLI создайте новое приложение _angular-custom-route-match_.
Помимо стандартной структуры Angular-приложения, также будет создан компонент _profile_.

1. Создайте новый проект Angular _angular-custom-route-match_.

   ```shell
   ng new angular-custom-route-match
   ```

   На вопрос `Would you like to add Angular routing?` выберите `Y`.

   На вопрос `Which stylesheet format would you like to use?` выберите `CSS`.

   Через некоторое время новый проект `angular-custom-route-match` будет готов.

1. В терминале перейдите в директорию `angular-custom-route-match`.
1. Создайте компонент _profile_.

   ```shell
   ng generate component profile
   ```

1. В редакторе кода найдите файл `profile.html` и замените содержимое-заполнитель следующим HTML.

   <docs-code header="profile.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/profile/profile.html"/>

1. В редакторе кода найдите файл `app.html` и замените содержимое-заполнитель следующим HTML.

   <docs-code header="app.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.html"/>

## Настройка маршрутов приложения {#configure-your-routes-for-your-application}

Когда структура приложения готова, нужно добавить возможности маршрутизации в файл `app.config.ts`.
В рамках этого процесса будет создан пользовательский URL-сопоставитель, который ищет имя пользователя Twitter в URL.
Имя пользователя определяется предшествующим символом `@`.

1. В редакторе кода откройте файл `app.config.ts`.
1. Добавьте оператор `import` для `provideRouter` и `withComponentInputBinding` Angular, а также маршруты приложения.

   ```ts
   import {provideRouter, withComponentInputBinding} from '@angular/router';

   import {routes} from './app.routes';
   ```

1. В массив providers добавьте оператор `provideRouter(routes, withComponentInputBinding())`.

1. Определите пользовательский сопоставитель маршрутов, добавив следующий код в маршруты приложения.

   <docs-code header="app.routes.ts" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.routes.ts" region="matcher"/>

Этот пользовательский сопоставитель — функция, выполняющая следующие задачи:

- Сопоставитель проверяет, что массив содержит только один сегмент
- Сопоставитель использует регулярное выражение, чтобы убедиться, что формат имени пользователя совпадает
- Если совпадение есть, функция возвращает полный URL, определяя параметр маршрута `username` как подстроку пути
- Если совпадения нет, функция возвращает `null`, и маршрутизатор продолжает поиск других маршрутов, соответствующих URL

HELPFUL: Пользовательский URL-сопоставитель ведёт себя как любое другое определение маршрута. Дочерние маршруты или лениво загружаемые маршруты определяются так же, как и в любом другом маршруте.

## Чтение параметров маршрута {#reading-the-route-parameters}

После настройки пользовательского сопоставителя можно привязать параметр маршрута в компоненте `profile`.

В редакторе кода откройте файл `profile.ts` и создайте `input`, совпадающий с параметром `username`.
Ранее была добавлена функция `withComponentInputBinding` в `provideRouter`. Это позволяет маршрутизатору `Router` передавать информацию непосредственно в компоненты маршрутов.

```ts
username = input.required<string>();
```

## Тестирование пользовательского URL-сопоставителя {#test-your-custom-url-matcher}

Когда код готов, можно протестировать пользовательский URL-сопоставитель.

1. В окне терминала выполните команду `ng serve`.

   ```shell
   ng serve
   ```

1. Откройте браузер по адресу `http://localhost:4200`.

   Должна отобразиться веб-страница с одним предложением: `Navigate to my profile`.

1. Нажмите на ссылку **my profile**.

   На странице появится новое предложение: `Hello, Angular!`.

## Следующие шаги {#next-steps}

Сопоставление шаблонов с помощью Angular Router предоставляет большую гибкость при работе с динамическими URL в приложении.
Дополнительные сведения об Angular Router см. в следующих темах:

<docs-pill-row>
  <docs-pill href="guide/routing/common-router-tasks" title="Маршрутизация и навигация в приложении"/>
  <docs-pill href="api/router/Router" title="Router API"/>
</docs-pill-row>

HELPFUL: Этот контент основан на статье [Custom Route Matching with the Angular Router](https://medium.com/@brandontroberts/custom-route-matching-with-the-angular-router-fbdd48665483) автора [Brandon Roberts](https://twitter.com/brandontroberts).
