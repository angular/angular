# Фоновая обработка с использованием Web Workers

[Web Workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) позволяют выполнять ресурсоемкие вычисления в
фоновом потоке, освобождая основной поток для обновления пользовательского интерфейса.
Приложения, выполняющие множество вычислений, например, генерацию чертежей в системах автоматизированного
проектирования (САПР) или сложные геометрические расчеты, могут использовать Web Workers для повышения
производительности.

HELPFUL: Angular CLI не поддерживает запуск самого себя внутри Web Worker.

## Добавление Web Worker

Чтобы добавить Web Worker в существующий проект, используйте команду Angular CLI `ng generate`.

```shell
ng generate web-worker <location>
```

Вы можете добавить Web Worker в любое место вашего приложения.
Например, чтобы добавить Web Worker к корневому компоненту `src/app/app.component.ts`, выполните следующую команду:

```shell
ng generate web-worker app
```

Эта команда выполняет следующие действия:

1. Настраивает ваш проект для использования Web Workers, если это еще не сделано.
1. Добавляет следующий шаблонный код в файл `src/app/app.worker.ts` для приема сообщений.

   ```ts {header:"src/app/app.worker.ts"}

     addEventListener('message', ({ data }) => {
        const response = `worker response to ${data}`;
        postMessage(response);
     });

   ```

1. Добавляет следующий шаблонный код в файл `src/app/app.component.ts` для использования воркера.

   ```ts {header:"src/app/app.component.ts"}

     if (typeof Worker !== 'undefined') {
        // Create a new
        const worker = new Worker(new URL('./app.worker', import.meta.url));
        worker.onmessage = ({ data }) => {
           console.log(`page got message: ${data}`);
        };
        worker.postMessage('hello');
     } else {
        // Web Workers не поддерживаются в этой среде.
        // Вам следует добавить запасной вариант, чтобы программа продолжала работать корректно.
     }
   ```

После создания этого начального шаблона необходимо переработать код для использования Web Worker, организовав отправку
сообщений в воркер и получение ответов от него.

IMPORTANT: Некоторые среды или платформы, такие как `@angular/platform-server`, используемый
при [рендеринге на стороне сервера (SSR)](guide/ssr), не поддерживают Web Workers.

Чтобы гарантировать работу приложения в таких средах, необходимо предусмотреть резервный механизм для выполнения
вычислений, которые в противном случае выполнял бы воркер.
