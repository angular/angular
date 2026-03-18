# Фоновая обработка с помощью Web Worker {#background-processing-using-web-workers}

[Web Worker-ы](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) позволяют запускать ресурсоёмкие вычисления в фоновом потоке, освобождая основной поток для обновления пользовательского интерфейса.
Приложения, выполняющие много вычислений, например генерирующие чертежи CAD (Computer-Aided Design) или выполняющие сложные геометрические расчёты, могут использовать Web Worker-ы для повышения производительности.

HELPFUL: Angular CLI не поддерживает запуск самого себя в Web Worker.

## Добавление Web Worker {#adding-a-web-worker}

Чтобы добавить Web Worker в существующий проект, используйте команду Angular CLI `ng generate`.

```shell
ng generate web-worker <location>
```

Web Worker можно добавить в любое место приложения.
Например, чтобы добавить Web Worker в корневой компонент `src/app/app.component.ts`, выполните следующую команду.

```shell
ng generate web-worker app
```

Команда выполняет следующие действия.

1. Настраивает проект для использования Web Worker-ов, если это ещё не сделано.
1. Добавляет следующий каркасный код в `src/app/app.worker.ts` для получения сообщений.

   ```ts {header:"src/app/app.worker.ts"}
   addEventListener('message', ({data}) => {
     const response = `worker response to ${data}`;
     postMessage(response);
   });
   ```

1. Добавляет следующий каркасный код в `src/app/app.component.ts` для использования Worker.

   ```ts {header:"src/app/app.component.ts"}
   if (typeof Worker !== 'undefined') {
     // Create a new
     const worker = new Worker(new URL('./app.worker', import.meta.url));
     worker.onmessage = ({data}) => {
       console.log(`page got message: ${data}`);
     };
     worker.postMessage('hello');
   } else {
     // Web workers are not supported in this environment.
     // You should add a fallback so that your program still executes correctly.
   }
   ```

После создания этого начального каркаса необходимо провести рефакторинг кода для использования Web Worker, отправляя сообщения в Worker и получая их от него.

IMPORTANT: Некоторые среды или платформы, такие как `@angular/platform-server`, используемый в [Server-side Rendering](guide/ssr), не поддерживают Web Worker-ы.

Чтобы гарантировать работу приложения в этих средах, необходимо предоставить резервный механизм для выполнения вычислений, которые в противном случае выполнял бы Worker.
