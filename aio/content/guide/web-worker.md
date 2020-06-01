<!--
# Using web workers with Angular CLI
-->
# Angular CLI로 웹 워커 사용하기

<!--
[Web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) allow you to run CPU intensive computations in a background thread, freeing the main thread to update the user interface.

If you find your application becomes unresponsive while processing data, using web workers can help.
-->
[웹 워커(Web workers)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)를 사용하면 CPU 연산이 많은 작업을 백그라운드 스레드에서 실행할 수 있습니다.
따라서 사용자가 머무는 메인 스레드는 이 연산의 영향을 받지 않고 제 성능을 유지할 수 있습니다.

데이터를 처리하느라 애플리케이션이 멈추는 현상이 있으면 웹 워커를 사용하는 것을 검토해 보세요.


<!--
## Adding a web worker
-->
## 웹 워커 추가하기

<!--
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
-->
웹 워커는 애플리케이션 아래 어디든 둘 수 있습니다.
예를 들면, 복잡한 작업을 하는 파일이 `src/app/app.component.ts` 파일이라면 `ng generate web-worker app` 명령을 실행해서 추가할 수 있습니다.

이 명령을 실행하면:

- 프로젝트에 웹 워커 설정이 추가됩니다. 이미 설정되어 있다면 변경하지 않습니다.
- `src/app/app.worker.ts` 파일이 생성됩니다. 이 파일의 내용은 이렇습니다:

  <code-example language="typescript" header="src/app/app.worker.ts">
  addEventListener('message', ({ data }) => {
    const response = `worker response to ${data}`;
    postMessage(response);
  });
 </code-example>

- 이 코드는 `src/app/app.component.ts` 파일이 다음과 같이 로드해서 실행합니다:

  <code-example language="typescript" header="src/app/app.component.ts">
  if (typeof Worker !== 'undefined') {
    // 웹 워커를 새로 만듭니다.
    const worker = new Worker('./app.worker', { type: 'module' });
    worker.onmessage = ({ data }) => {
      console.log(`page got message: ${data}`);
    };
    worker.postMessage('hello');
  } else {
    // 웹워커를 지원하지 않는 환경에서 실행할 로직을 작성합니다.
  }
  </code-example>

기본 코드가 이렇게 구성되고 나면 이제부터 애플리케이션 코드와 웹 워커가 메시지를 주고 받는 방식으로 원하는 로직을 구현하면 됩니다.


<!--
## Caveats
-->
## 주의할 점

<!--
There are two important things to keep in mind when using web workers in Angular projects:

- Some environments or platforms, like `@angular/platform-server` used in [Server-side Rendering](guide/universal), don't support web workers. You have to provide a fallback mechanism to perform the computations that the worker would perform to ensure your application will work in these environments.
- Running Angular itself in a web worker via [**@angular/platform-webworker**](api/platform-webworker) is not yet supported in Angular CLI.
-->
Angular 프로젝트에서 웹 워커를 사용할 때 주의할 점이 두 가지 있습니다:

- 일부 실행환경이나 플랫폼은 웹 워커를 지원하지 않습니다. [서버-사이드 렌더링](guide/universal) 할 때 사용하는`@angular/platform-server`도 그렇습니다. 이런 환경에서도 애플리케이션이 제대로 동작할 수 있도록 웹 워커를 사용하지 않는 로직을 준비해야 합니다.

- [**@angular/platform-webworker**](api/platform-webworker)를 사용해서 웹 워커 안에 다시 Angular를 실행하는 방식은 아직 지원하지 않습니다.
