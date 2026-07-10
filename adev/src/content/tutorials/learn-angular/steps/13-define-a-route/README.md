# Определение маршрута

Теперь, когда вы настроили приложение для использования Angular Router, вам нужно определить маршруты.

Примечание: Подробнее
об [определении базового маршрута читайте в подробном руководстве](/guide/routing/common-router-tasks#defining-a-basic-route).

В этом уроке вы узнаете, как добавлять и настраивать маршруты в вашем приложении.

<hr>

<docs-workflow>

<docs-step title="Define a route in `app.routes.ts`">

В вашем приложении есть две страницы для отображения: (1) Домашняя страница (Home Page) и (2) Страница пользователя (
User Page).

Чтобы определить маршрут, добавьте объект маршрута в массив `routes` в файле `app.routes.ts`, который содержит:

- `path` маршрута (который автоматически начинается от корневого пути (т.е. `/`))
- `component`, который вы хотите отобразить для этого маршрута

```ts
import {Routes} from '@angular/router';
import {Home} from './home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
];
```

Код выше — это пример того, как `Home` может быть добавлен в качестве маршрута. Теперь переходите к реализации этого
примера вместе с `User` в песочнице.

Используйте `'user'` для пути компонента `User`.

</docs-step>

<docs-step title="Add title to route definition">

Помимо правильного определения маршрутов, Angular Router также позволяет устанавливать заголовок страницы при навигации
пользователей, добавляя свойство `title` к каждому маршруту.

В `app.routes.ts` добавьте свойство `title` к маршруту по умолчанию (`path: ''`) и маршруту `user`. Вот пример:

<docs-code language="ts" highlight="[8]">
import {Routes} from '@angular/router';
import {Home} from './home/home';

export const routes: Routes = [
{
path: '',
title: 'App Home Page',
component: Home,
},
];
</docs-code>

</docs-step>

</docs-workflow>

В этом уроке вы научились определять и настраивать маршруты в вашем Angular-приложении. Отличная работа. 🙌

Путь к полной настройке маршрутизации в вашем приложении почти завершен, продолжайте в том же духе.
