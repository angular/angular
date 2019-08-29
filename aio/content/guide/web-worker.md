# Using Web Workers with Angular CLI

[Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) allow you to run CPU intensive computations in a background thread, freeing the main thread to update the user interface.

If you find your application becomes unresponsive while processing data, using Web Workers can help.

## Adding a Web Worker

You can add a web worker anywhere in your application. If the file that contains your expensive computation is `src/app/app.component.ts`, you can add a Web Worker using `ng generate web-worker app`.

Running this command will:

- configure your project to use Web Workers, if it isn't already.
- add `src/app/app.worker.ts` with scaffolded code to receive messages:

  ```typescript
  addEventListener('message', ({ data }) => {
    const response = `worker response to ${data}`;
    postMessage(response);
  });
  ```

- add scaffolded code to `src/app/app.component.ts` to use the worker:

  ```typescript
  if (typeof Worker !== 'undefined') {
    // Create a new
    const worker = new Worker('./app.worker', { type: 'module' });
    worker.onmessage = ({ data }) => {
      console.log(`page got message: ${data}`);
    };
    worker.postMessage('hello');
  } else {
    // Web Workers are not supported in this environment.
    // You should add a fallback so that your program still executes correctly.
  }
  ```

After the initial scaffolding, you will need to refactor your code to use the Web Worker by sending messages to and from.

## Caveats

There are two important things to keep in mind when using Web Workers in Angular projects:

- Some environments or platforms, like `@angular/platform-server` used in [Server-side Rendering](guide/universal), don't support Web Workers. You have to provide a fallback mechanism to perform the computations that the worker would perform to ensure your application will work in these environments.
- Running Angular itself in a Web Worker via [**@angular/platform-webworker**](api/platform-webworker) is not yet supported in Angular CLI.
