# Background processing using web workers

[Web workers](https://developer.mozilla.org/docs/Web/API/Web_Workers_API) lets you run CPU-intensive computations in a background thread, freeing the main thread to update the user interface.
Application's performing a lot of computations, like generating Computer-Aided Design \(CAD\) drawings or doing heavy geometric calculations, can use web workers to increase performance.

<div class="alert is-helpful">

The Angular CLI does not support running itself in a web worker.

</div>

## Adding a web worker

To add a web worker to an existing project, use the Angular CLI `ng generate` command.

<code-example format="shell" language="shell">

ng generate web-worker &lt;location&gt;

</code-example>

You can add a web worker anywhere in your application.
For example, to add a web worker to the root component, `src/app/app.component.ts`, run the following command.

<code-example format="shell" language="shell">

ng generate web-worker app

</code-example>

The command performs the following actions.

1.  Configures your project to use web workers, if it isn't already.
1.  Adds the following scaffold code to `src/app/app.worker.ts` to  receive messages.

    <code-example language="typescript" header="src/app/app.worker.ts">

    addEventListener('message', ({ data }) =&gt; {
      const response = `worker response to &dollar;{data}`;
      postMessage(response);
    });

    </code-example>

1.  Adds the following scaffold code to `src/app/app.component.ts` to use the worker.

    <code-example language="typescript" header="src/app/app.component.ts">

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = ({ data }) =&gt; {
        console.log(`page got message: &dollar;{data}`);
      };
      worker.postMessage('hello');
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

    </code-example>

After you create this initial scaffold, you must refactor your code to use the web worker by sending messages to and from the worker.

<div class="alert is-important">

Some environments or platforms, such as `@angular/platform-server` used in [Server-side Rendering](guide/universal), don't support web workers.
To ensure that your application works in these environments, you must provide a fallback mechanism to perform the computations that the worker would otherwise perform.

</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
