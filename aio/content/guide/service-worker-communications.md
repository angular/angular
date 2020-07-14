<!--
# Service worker communication
-->
# 서비스 워커 통신

<!--
Importing `ServiceWorkerModule` into your `AppModule` doesn't just register the service worker, it also provides a few services you can use to interact with the service worker and control the caching of your app.
-->
`AppModule`에 `ServiceWorkerModule`을 로드하는 것만으로는 서비스 워커를 제대로 등록했다고 할 수 없습니다. 서비스 워커를 제대로 사용하려면 애플리케이션의 데이터를 캐싱할 수 있도록 서비스 워커가 제공하는 서비스를 활용해서 어떤 동작을 실행하도록 해야 합니다.

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following:
* [Getting Started with Service Workers](guide/service-worker-getting-started).
-->
이 문서의 내용을 제대로 이해하려면 다음 내용을 먼저 보는 것이 좋습니다:
* [서비스 워커 시작하기](guide/service-worker-getting-started)

<hr />


<!--
## `SwUpdate` service
-->
## `SwUpdate` 서비스

<!--
The `SwUpdate` service gives you access to events that indicate when the service worker has discovered an available update for your app or when it has activated such an update&mdash;meaning it is now serving content from that update to your app.

The `SwUpdate` service supports four separate operations:
* Getting notified of *available* updates. These are new versions of the app to be loaded if the page is refreshed.
* Getting notified of update *activation*. This is when the service worker starts serving a new version of the app immediately.
* Asking the service worker to check the server for new updates.
* Asking the service worker to activate the latest version of the app for the current tab.
-->
`SwUpdate` 서비스를 사용하면 서비스 워커가 애플리케이션의 새로운 버전을 발견했거나 애플리케이션이 최신버전으로 업데이트된 시점을 알려주는 이벤트를 활용할 수 있습니다.


`SwUpdate` 서비스는 다음과 같은 용도로 사용합니다:
* 앱을 업데이트 *할 수 있을 때* 알림을 받을 수 있습니다. 앱을 새로운 버전으로 실행하려면 먼저 애플리케이션을 업데이트한 후에 페이지를 새로고침해야 합니다.
* 업데이트된 앱이 *활성화(activation)되었을 때* 알림을 받을 수 있습니다. 이 알림은 서비스 워커가 업데이트를 끝내고 새로운 버전의 앱을 실행했을 때 전달됩니다.
* 서비스 워커를 사용해서 서버에 새 업데이트가 있는지 확인할 수 있습니다.
* 서비스 워커를 사용해서 현재 탭에 최신 버전의 앱을 활성화할 수 있습니다.

<!--
### Available and activated updates
-->
### `available`, `activated` 이벤트

<!--
The two update events, `available` and `activated`, are `Observable` properties of `SwUpdate`:
-->
업데이트와 관련된 이벤트 중 `available` 이벤트와 `activated` 이벤트는 `SwUpdate`의 프로퍼티로 제공되며, 모두 `Observable` 타입입니다:

<code-example path="service-worker-getting-started/src/app/log-update.service.ts" header="log-update.service.ts" region="sw-update"></code-example>

<!--
You can use these events to notify the user of a pending update or to refresh their pages when the code they are running is out of date.
-->
이 이벤트들을 활용하면 사용자가 현재 최신 버전의 앱을 사용하지 않고 있으며, 최신 버전으로 업데이트할 수 있고, 새로운 버전을 실행하려면 페이지를 새로고침해야 한다는 알림을 제공할 수 있습니다.

<!--
### Checking for updates
-->
### 업데이트 확인하기

<!--
It's possible to ask the service worker to check if any updates have been deployed to the server.
The service worker checks for updates during initialization and on each navigation request&mdash;that is, when the user navigates from a different address to your app.
However, you might choose to manually check for updates if you have a site that changes frequently or want updates to happen on a schedule.

Do this with the `checkForUpdate()` method:

<code-example path="service-worker-getting-started/src/app/check-for-update.service.ts" header="check-for-update.service.ts"></code-example>

This method returns a `Promise` which indicates that the update check has completed successfully, though it does not indicate whether an update was discovered as a result of the check. Even if one is found, the service worker must still successfully download the changed files, which can fail. If successful, the `available` event will indicate availability of a new version of the app.

<div class="alert is-important">

In order to avoid negatively affecting the initial rendering of the page, `ServiceWorkerModule` waits for up to 30 seconds by default for the app to stabilize, before registering the ServiceWorker script.
Constantly polling for updates, for example, with [setInterval()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) or RxJS' [interval()](https://rxjs.dev/api/index/function/interval), will prevent the app from stabilizing and the ServiceWorker script will not be registered with the browser until the 30 seconds upper limit is reached.

Note that this is true for any kind of polling done by your application.
Check the {@link ApplicationRef#isStable isStable} documentation for more information.

You can avoid that delay by waiting for the app to stabilize first, before starting to poll for updates, as shown in the example above.
Alternatively, you might want to define a different {@link SwRegistrationOptions#registrationStrategy registration strategy} for the ServiceWorker.

</div>
-->
서버에 새로운 애플리케이션이 배포되었는지 서비스 워커로 확인할 수 있습니다.
The service worker checks for updates during initialization and on each navigation request&mdash;that is, when the user navigates from a different address to your app.
However, you might choose to manually check for updates if you have a site that changes frequently or want updates to happen on a schedule.

Do this with the `checkForUpdate()` method:

<code-example path="service-worker-getting-started/src/app/check-for-update.service.ts" header="check-for-update.service.ts"></code-example>

업데이트 체크가 성공적으로 끝나면 이 메소드는 `Promise` 타입을 반환하는데, 이 반환값에 업데이트와 관련된 내용이 담겨있지는 않습니다. 이 메소드를 실행하고 업데이트할 수 있는 애플리케이션 최신 버전을 발견하면 서비스 워커가 자동으로 최신 버전을 다운받으며, 앱이 최신버전으로 준비된 이후에 `available` 이벤트를 보냅니다.

<div class="alert is-important">

In order to avoid negatively affecting the initial rendering of the page, `ServiceWorkerModule` waits for up to 30 seconds by default for the app to stabilize, before registering the ServiceWorker script.
Constantly polling for updates, for example, with [setInterval()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval) or RxJS' [interval()](https://rxjs.dev/api/index/function/interval), will prevent the app from stabilizing and the ServiceWorker script will not be registered with the browser until the 30 seconds upper limit is reached.

애플리케이션에서 사용하는 폴링 로직은 모두 이런 방식으로 작성되어야 합니다.
더 자세한 내용은 {@link ApplicationRef#isStable isStable} 문서를 참고하세요.

You can avoid that delay by waiting for the app to stabilize first, before starting to poll for updates, as shown in the example above.
Alternatively, you might want to define a different {@link SwRegistrationOptions#registrationStrategy registration strategy} for the ServiceWorker.

</div>


<!--
### Forcing update activation
-->
### 최신버전으로 직접 전환하기

<!--
If the current tab needs to be updated to the latest app version immediately, it can ask to do so with the `activateUpdate()` method:
-->
현재 탭에서 실행하고 있는 앱을 최신 버전으로 즉시 전환하려면 `activateUpdate()` 메소드를 실행하면 됩니다:

<code-example path="service-worker-getting-started/src/app/prompt-update.service.ts" header="prompt-update.service.ts" region="sw-activate"></code-example>

<div class="alert is-important">

Calling `activateUpdate()` without reloading the page could break lazy-loading in a currently running app, especially if the lazy-loaded chunks use filenames with hashes, which change every version.
Therefore, it is recommended to reload the page once the promise returned by `activateUpdate()` is resolved.

</div>


<!--
## More on Angular service workers
-->
## 서비스 워커 더 알아보기

<!--
You may also be interested in the following:
* [Service Worker in Production](guide/service-worker-devops).
-->
다음 내용도 확인해 보세요:
* [운영 환경에 서비스 워커 활용하기](guide/service-worker-devops)
