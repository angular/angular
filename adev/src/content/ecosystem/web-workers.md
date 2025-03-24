# Background processing using web workers

[Web workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) let you run CPU-intensive computations in a background thread, freeing the main thread to update the user interface.
Application's performing a lot of computations, like generating Computer-Aided Design \(CAD\) drawings or doing heavy geometric calculations, can use web workers to increase performance.

HELPFUL: The Angular CLI does not support running itself in a web worker.

## Adding a web worker

To add a web worker to an existing project, use the Angular CLI `ng generate` command.

<docs-code language="shell">

ng generate web-worker <location>

</docs-code>

You can add a web worker anywhere in your application.
For example, to add a web worker to the root component, `src/app/app.component.ts`, run the following command.

<docs-code language="shell">

ng generate web-worker app

</docs-code>

The command performs the following actions.

1. Configures your project to use web workers, if it isn't already.
1. Adds the following scaffold code to `src/app/app.worker.ts` to  receive messages.

    <docs-code language="typescript" header="src/app/app.worker.ts">

    addEventListener('message', ({ data }) => {
      const response = `worker response to ${data}`;
      postMessage(response);
    });

    </docs-code>

1. Adds the following scaffold code to `src/app/app.component.ts` to use the worker.

    <docs-code language="typescript" header="src/app/app.component.ts">

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        console.log(`page got message: ${data}`);
      };
      worker.postMessage('hello');
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

    </docs-code>

After you create this initial scaffold, you must refactor your code to use the web worker by sending messages to and from the worker.

IMPORTANT: Some environments or platforms, such as `@angular/platform-server` used in [Server-side Rendering](guide/ssr), don't support web workers.

To ensure that your application works in these environments, you must provide a fallback mechanism to perform the computations that the worker would otherwise perform.
