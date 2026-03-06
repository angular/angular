# Фоновая обработка с использованием Web Worker {#background-processing-using-web-workers}

[Web Worker](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) позволяет выполнять ресурсоёмкие вычисления в фоновом потоке, освобождая основной поток для обновления пользовательского интерфейса.
Приложения, выполняющие большой объём вычислений, например генерацию чертежей CAD или сложные геометрические расчёты, могут использовать Web Worker для повышения производительности.

HELPFUL: Angular CLI не поддерживает запуск самого себя в Web Worker.

## Добавление Web Worker {#adding-a-web-worker}

Для добавления Web Worker в существующий проект используйте команду Angular CLI `ng generate`.

```shell
ng generate web-worker <location>
```

Web Worker можно добавить в любое место приложения.
Например, для добавления Web Worker к корневому компоненту `src/app/app.component.ts` выполните следующую команду.

```shell
ng generate web-worker app
```

Команда выполняет следующие действия.

1. Настраивает проект для использования Web Worker, если это ещё не сделано.
1. Добавляет следующий шаблонный код в `src/app/app.worker.ts` для получения сообщений.

   ```ts {header:"src/app/app.worker.ts"}
   addEventListener('message', ({data}) => {
     const response = `worker response to ${data}`;
     postMessage(response);
   });
   ```

1. Добавляет следующий шаблонный код в `src/app/app.component.ts` для использования Worker.

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

После создания этого начального шаблона необходимо выполнить рефакторинг кода для использования Web Worker путём отправки сообщений в Worker и получения сообщений от него.

IMPORTANT: Некоторые среды и платформы, например `@angular/platform-server`, используемый в [серверном рендеринге](guide/ssr), не поддерживают Web Worker.

Для обеспечения работы приложения в таких средах необходимо предусмотреть резервный механизм для выполнения вычислений, которые в противном случае выполнял бы Worker.
