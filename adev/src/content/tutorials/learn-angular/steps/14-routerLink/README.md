# Использование RouterLink для навигации

В текущем состоянии приложения вся страница перезагружается при клике на внутреннюю ссылку, существующую в приложении.
Хотя в небольшом приложении это может показаться незначительным, для крупных страниц с большим количеством контента это
может иметь последствия для производительности, так как пользователям приходится заново загружать ресурсы и повторно
выполнять вычисления.

Примечание: Узнайте больше
о [добавлении маршрутов в ваше приложение в подробном руководстве](/guide/routing/common-router-tasks#add-your-routes-to-your-application).

В этом задании вы узнаете, как задействовать директиву `RouterLink`, чтобы максимально эффективно использовать Angular
Router.

<hr>

<docs-workflow>

<docs-step title="Import `RouterLink` directive">

В файле `app.ts` добавьте импорт директивы `RouterLink` к существующему импорту из `@angular/router` и добавьте её в
массив `imports` декоратора вашего компонента.

```ts
...
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  ...
})
```

</docs-step>

<docs-step title="Add a `routerLink` to template">

Чтобы использовать директиву `RouterLink`, замените атрибуты `href` на `routerLink`. Обновите шаблон, внеся это
изменение.

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

Теперь при клике на ссылки в навигации вы не должны видеть никакого мерцания, меняться должно только содержимое самой
страницы (то есть `router-outlet`) 🎉

Отличная работа по изучению маршрутизации в Angular. Это лишь вершина айсберга API `Router`. Чтобы узнать больше,
ознакомьтесь с [документацией Angular Router](guide/routing).
