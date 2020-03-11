# Background processing using web workers

[Web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) allow you to run CPU-intensive computations in a background thread,
freeing the main thread to update the user interface.

If you find your application becomes unresponsive while processing data, using web workers can help.
The Angular CLI `ng generate` command supports adding a web worker to an existing project.

<div class="alert is-helpful>

The CLI does not support running Angular itself in a web worker.

</div>

## Adding a web worker

You can add a web worker anywhere in your application.
If the file that contains your expensive computation is `src/app/app.component.ts`, for example, you can add a web worker using `ng generate web-worker app`.

The command performs the following actions.

- Configures your project to use web workers, if it isn't already.
- Adds the following scaffold code to `src/app/app.worker.ts` to  receive messages.

  <code-example language="typescript" header="src/app/app.worker.ts">
  addEventListener('message', ({ data }) => {
    const response = `worker response to ${data}`;
    postMessage(response);
  });
 </code-example>

- Adds the following scaffold code to `src/app/app.component.ts` to use the worker.

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

After you generate this initial scaffold, you must refactor your code to use the web worker by sending messages to and from the worker.

<div class="alert is-important>

Some environments or platforms, such as `@angular/platform-server` used in [Server-side Rendering](guide/universal), don't support web workers. You must provide a fallback mechanism to perform the computations that the worker would otherwise perform, in order to ensure that your application will work in these environments.

</div>
