# Ленивая загрузка сервисов

IMPORTANT: Чтобы ленивая загрузка работала, сервис должен быть зарегистрирован автоматически. Используйте декоратор `@Injectable({providedIn: 'root'})` или [`@Service()`](guide/di/creating-and-using-services#using-the-service-vs-injectable-decorator). Без автоматической регистрации Angular не сможет создать сервис после загрузки.

Функция Angular `injectAsync` позволяет загружать сервис по требованию — только когда он действительно нужен. Это полезно, если сервис зависит от большой библиотеки или редко используемой функции, и вы не хотите платить за неё при начальной загрузке страницы.

При использовании `injectAsync` код сервиса бандлер выносит в отдельный JavaScript-чанк и скачивает при первом запросе экземпляра. После загрузки Angular разрешает сервис через обычную систему DI, поэтому он по-прежнему может зависеть от других injectable и ведёт себя как любой другой синглтон.

## Ленивое внедрение сервиса {#lazily-injecting-a-service}

Представьте `ReportExporter`, зависящий от тяжёлой библиотеки для таблиц. Большинство пользователей открывают отчёт; экспорт нажимают лишь немногие. Загрузите экспортёр по требованию:

```angular-ts
import {Component, injectAsync} from '@angular/core';

@Component({
  selector: 'app-report',
  template: `<button (click)="export()">Export</button>`,
})
export class Report {
  private exporter = injectAsync(() => import('./report-exporter').then((m) => m.ReportExporter));

  async export() {
    const exporter = await this.exporter();
    exporter.export();
  }
}
```

Первый вызов `this.exporter()` запускает динамический импорт и разрешает сервис из DI. Последующие вызовы переиспользуют тот же promise, поэтому чанк загружается только один раз.

Если лениво загружаемый сервис — [default export](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export), передайте динамический импорт напрямую: Angular сам развернёт `default`:

```ts {header: report-exporter.ts}
@Service()
export default class ReportExporter {
  /* … */
}
```

```ts {header: report.ts}
private exporter = injectAsync(() => import('./report-exporter'));
```

## Prefetch зависимости {#prefetching-the-dependency}

По умолчанию ленивый чанк загружается только при вызове возвращённой функции. Скачивание можно начать раньше, передав в опциях триггер `prefetch`. Триггер — любая функция, возвращающая `Promise`: когда он разрешится, Angular запускает загрузчик.

Angular поставляет встроенный триггер `onIdle`, который ждёт, пока браузер станет простаивать:

```ts
import {Component, injectAsync, onIdle} from '@angular/core';

@Component({
  /* … */
})
export class Report {
  private exporter = injectAsync(() => import('./report-exporter').then((m) => m.ReportExporter), {
    prefetch: onIdle,
  });
}
```

`onIdle` также можно настроить с максимальным временем ожидания, чтобы prefetch всегда происходил в известном окне, даже на загруженных страницах:

```ts
injectAsync(loader, {prefetch: () => onIdle({timeout: 1_000})});
```

NOTE: Prefetch — оппортунистический. Если пользователь вызовет функцию до срабатывания prefetch, Angular всё равно сразу загрузит зависимость и разрешит ваш `await`, как только она будет готова.

## Пользовательский триггер prefetch {#provide-a-custom-prefetch-trigger}

`PrefetchTrigger` — просто функция, возвращающая promise: загрузчик запускается, как только promise разрешится. Так можно согласовать prefetch с собственными сигналами — например, hover или тик планировщика:

```ts
import {PrefetchTrigger} from '@angular/core';

export function onHover(target: HTMLElement): PrefetchTrigger {
  return () =>
    new Promise<void>((resolve) => {
      target.addEventListener('pointerenter', () => resolve(), {once: true});
    });
}
```
