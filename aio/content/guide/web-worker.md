# Using web workers with Angular CLI

[Web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) allow you to run CPU intensive computations in a background thread, freeing the main thread to update the user interface.

If you find your application becomes unresponsive while processing data, using web workers can help.

## Adding a web worker

You can add a web worker anywhere in your application. If the file that contains your expensive computation is `src/app/app.component.ts`, you can add a web worker using `ng generate web-worker app`.

Running this command will:

- configure your project to use web workers, if it isn't already.
- add `src/app/app.worker.ts` with scaffolded code to receive messages:

  <code-example language="typescript" header="src/app/app.worker.ts">
  addEventListener('message', ({ data }) => {
    const response = `worker response to ${data}`;
    postMessage(response);
  });
 </code-example>

- add scaffolded code to `src/app/app.component.ts` to use the worker:

  <code-example language="typescript" header="src/app/app.component.ts">
  if (typeof Worker !== 'undefined') {
    // Create a new
    const worker = new Worker('./app.worker', { type: 'module' });
    worker.onmessage = ({ data }) => {
      console.log(`page got message: ${data}`);
    };
    worker.postMessage('hello');
  } else {
    // Web workers are not supported in this environment.
    // You should add a fallback so that your program still executes correctly.
  }
  </code-example>

After the initial scaffolding, you will need to refactor your code to use the web worker by sending messages to and from.

## Caveats

There are two important things to keep in mind when using web workers in Angular projects:

- Some environments or platforms, like `@angular/platform-server` used in [Server-side Rendering](guide/universal), don't support web workers. You have to provide a fallback mechanism to perform the computations that the worker would perform to ensure your application will work in these environments.
- Running Angular itself in a web worker via [**@angular/platform-webworker**](api/platform-webworker) is not yet supported in Angular CLI.
