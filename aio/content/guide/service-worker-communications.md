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

<code-example path="service-worker-getting-started/src/app/log-update.service.ts" linenums="false" header="log-update.service.ts" region="sw-update"> </code-example>

<!--
You can use these events to notify the user of a pending update or to refresh their pages when the code they are running is out of date.
-->
이 이벤트들을 활용하면 사용자가 현재 최신 버전의 앱을 사용하지 않고 있으며, 최신 버전으로 업데이트할 수 있고, 새로운 버전을 실행하려면 페이지를 새로고침해야 한다는 알림을 제공할 수 있습니다.

<!--
### Checking for updates
-->
### 업데이트 확인하기

<!--
It's possible to ask the service worker to check if any updates have been deployed to the server. You might choose to do this if you have a site that changes frequently or want updates to happen on a schedule.

Do this with the `checkForUpdate()` method:
-->
서버에 새로운 애플리케이션이 배포되었는지 서비스 워커가 확인하게 할 수 있습니다. 이 동작은 사이트를 업데이트하는 주기에 따라 매번 실행되게 할 수도 있고, 일정 주기로 실행하게 할 수도 있습니다.

새로운 앱 버전이 있는지 확인하려면 `checkForUpdate()` 메소드를 실행하면 됩니다:

<code-example path="service-worker-getting-started/src/app/check-for-update.service.ts" linenums="false" header="check-for-update.service.ts"> </code-example>

<!--
This method returns a `Promise` which indicates that the update check has completed successfully, though it does not indicate whether an update was discovered as a result of the check. Even if one is found, the service worker must still successfully download the changed files, which can fail. If successful, the `available` event will indicate availability of a new version of the app.
-->
업데이트 체크가 성공적으로 끝나면 이 메소드는 `Promise` 타입을 반환하는데, 이 반환값에 업데이트와 관련된 내용이 담겨있지는 않습니다. 이 메소드를 실행하고 업데이트할 수 있는 애플리케이션 최신 버전을 발견하면 서비스 워커가 자동으로 최신 버전을 다운받으며, 앱이 최신버전으로 준비된 이후에 `available` 이벤트를 보냅니다.

<div class="alert is-important">

<!--
In order to avoid negatively affecting the initial rendering, `ServiceWorkerModule` will by default
wait for the app to stabilize, before registering the ServiceWorker script. Constantly polling for
updates, e.g. with `interval()`, will prevent the app from stabilizing and the ServiceWorker
script will never be registered with the browser.

You can avoid that by waiting for the app to stabilize first, before starting to poll for updates
(as shown in the example above).
-->
서비스 워커가 애플리케이션 초기 렌더링에 영향을 주지 않으려면 `ServiceWorkerModule`은 애플리케이션이 안정화된 이후에 로드되고 실행되어야 합니다.
왜냐하면 `interval()`과 같은 함수를 사용해서 업데이트가 있는지 지속적으로 폴링하면 애플리케이션이 안정화되지 않기 때문에 서비스 워커 스크립트도 브라우저에 등록되지 않습니다.

그래서 업데이트를 폴링하는 로직은 반드시 애플리케이션이 안정화된 이후에 시작되어야 합니다.

Note that this is true for any kind of polling done by your application.
Check the {@link ApplicationRef#isStable isStable} documentation for more information. 

</div>

<!--
### Forcing update activation
-->
### 최신버전으로 직접 전환하기

<!--
If the current tab needs to be updated to the latest app version immediately, it can ask to do so with the `activateUpdate()` method:
-->
현재 탭에서 실행하고 있는 앱을 최신 버전으로 즉시 전환하려면 `activateUpdate()` 메소드를 실행하면 됩니다:

<code-example path="service-worker-getting-started/src/app/prompt-update.service.ts" linenums="false" header="prompt-update.service.ts" region="sw-activate"> </code-example>

<!--
Doing this could break lazy-loading into currently running apps, especially if the lazy-loaded chunks use filenames with hashes, which change every version.
-->
이 메소드를 실행하면 현재 실행되고 있는 앱의 지연로딩이 중단되며, 지연로딩되는 청크 파일의 이름에 해시가 사용되었다면 이 내용도 모두 변경됩니다.

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
