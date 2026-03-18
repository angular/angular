# Использование RouterLink для навигации {#use-routerlink-for-navigation}

В текущем состоянии приложения при нажатии на внутреннюю ссылку страница перезагружается целиком. Для небольшого приложения это может быть незаметно, но для крупных страниц с большим объёмом контента это влечёт за собой проблемы с производительностью: пользователям приходится повторно загружать ресурсы и пересчитывать данные.

Примечание: Узнайте больше
о [добавлении маршрутов в приложение в углублённом руководстве](/guide/routing/define-routes#adding-the-router-to-your-application).

В этом упражнении вы узнаете, как использовать директиву `RouterLink`, чтобы получить максимум от Angular Router.

<hr>

<docs-workflow>

<docs-step title="Импортируйте директиву `RouterLink`">

В файле `app.ts` добавьте импорт `RouterLink` в существующий оператор импорта из `@angular/router` и добавьте его в массив `imports` декоратора компонента.

```ts
...
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  ...
})
```

</docs-step>

<docs-step title="Добавьте `routerLink` в шаблон">

Чтобы использовать директиву `RouterLink`, замените атрибуты `href` на `routerLink`. Обновите шаблон, внеся это изменение.

```angular-ts
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  ...
  template: `
    ...
    <a routerLink="/">Home</a>
    <a routerLink="/user">User</a>
    ...
  `,
  imports: [RouterLink, RouterOutlet],
})
```

</docs-step>

</docs-workflow>

Теперь при нажатии на ссылки в навигации не должно быть никакого мерцания, а изменяется только контент самой страницы (то есть `router-outlet`) 🎉

Отличная работа по изучению маршрутизации в Angular. Это лишь поверхность API `Router` — чтобы узнать больше, ознакомьтесь с [документацией по Angular Router](guide/routing).
