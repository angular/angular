# Использование RouterLink для навигации {#use-routerlink-for-navigation}

В текущем состоянии приложения вся страница перезагружается при нажатии на внутреннюю ссылку в приложении. Для небольшого приложения это может не казаться существенным, однако для более крупных страниц с большим количеством содержимого это может негативно сказаться на производительности, поскольку пользователям приходится заново загружать ресурсы и выполнять вычисления.

NOTE: Подробнее о [добавлении маршрутов в приложение в подробном руководстве](/guide/routing/define-routes#adding-the-router-to-your-application).

В этом упражнении вы научитесь использовать директиву `RouterLink` для максимально эффективного применения Angular Router.

<hr>

<docs-workflow>

<docs-step title="Импортируйте директиву `RouterLink`">

В `app.ts` добавьте импорт директивы `RouterLink` в существующую инструкцию импорта из `@angular/router` и добавьте его в массив `imports` декоратора Компонента.

```ts
...
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  ...
})
```

</docs-step>

<docs-step title="Добавьте `routerLink` в Шаблон">

Чтобы использовать директиву `RouterLink`, замените атрибуты `href` на `routerLink`. Обновите Шаблон с этим изменением.

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

При нажатии на ссылки в навигации теперь не должно быть мерцания, а изменяется только содержимое самой страницы (то есть `router-outlet`).

Отличная работа по изучению маршрутизации с Angular! Это лишь поверхность API `Router`. Для получения дополнительной информации изучите [документацию Angular Router](guide/routing).
