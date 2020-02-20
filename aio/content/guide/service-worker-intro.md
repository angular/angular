<!--
# Angular service worker introduction
-->
# 서비스 워커

<!--
Service workers augment the traditional web deployment model and empower applications to deliver a user experience with the reliability and performance on par with natively-installed code. Adding a service worker to an Angular application is one of the steps for turning an application into a [Progressive Web App](https://developers.google.com/web/progressive-web-apps/) (also known as a PWA).

At its simplest, a service worker is a script that runs in the web browser and manages caching for an application.

Service workers function as a network proxy. They intercept all outgoing HTTP requests made by the application and can choose how to respond to them. For example, they can query a local cache and deliver a cached response if one is available. Proxying isn't limited to requests made through programmatic APIs, such as `fetch`; it also includes resources referenced in HTML and even the initial request to `index.html`. Service worker-based caching is thus completely programmable and doesn't rely on server-specified caching headers.

Unlike the other scripts that make up an application, such as the Angular app bundle, the service worker is preserved after the user closes the tab. The next time that browser loads the application, the service worker loads first, and can intercept every request for resources to load the application. If the service worker is designed to do so, it can *completely satisfy the loading of the application, without the need for the network*.

Even across a fast reliable network, round-trip delays can introduce significant latency when loading the application. Using a service worker to reduce dependency on the network can significantly improve the user experience.
-->
서비스 워커(Service workers)는 웹 애플리케이션을 네이티브 앱처럼 로컬에 설치해서 안정성과 실행 성능을 향상시키는 역할을 하며, 전통적인 웹 개발 모델을 확장하는 개념으로 사용됩니다.
그래서 Angular 애플리케이션에 서비스 워커를 추가하는 것은 애플리케이션을 [Progressive Web App(PWA)](https://developers.google.com/web/progressive-web-apps/)으로 전환하는 과정 중 한 단계라고 볼 수 있습니다.

간단하게 이야기하면, 서비스 워커는 애플리케이션의 캐시를 관리하기 위해 웹 브라우저에서 실행되는 스크립트입니다.

서비스 워커는 네트워크 프록시 역할도 합니다. 서비스 워커는 애플케이션에서 보내는 HTTP 요청을 모두 인터셉트해서 이 요청에 대한 응답을 직접 보낼 수 있습니다. 그래서 이미 응답으로 받은 요청이 있다면 이 응답을 로컬에 캐싱해뒀다가 재사용할 수도 있습니다. 프록시 기능은 애플리케이션 코드로 실행하는 `fetch`와 같은 API뿐 아니라, HTML 파일이 참조하는 리소스에도 적용할 수 있으며, 심지어 애플리케이션을 실행하면서 처음 요청하는 `index.html` 파일 요청에도 적용할 수 있습니다. 서비스 워커를 활용하면 서버의 캐싱 로직과 관계없이 모든 캐시를 클라이언트 안에서 코드로 조작할 수 있습니다.

Angular 애플리케이션 번들과 같이 애플리케이션에서 실행되는 보통 스크립트와 다르게, 서비스 워커는 사용자가 탭을 닫아도 그대로 유지됩니다. 그래서 이후에 브라우저에서 애플리케이션이 다시 실행되면 서비스 워커가 먼저 로드되기 때문에 애플리케이션이 로드하는 모든 요청을 인터셉트할 수 있습니다. 서비스 워커는 처음부터 이렇게 동작하도록 설계되었습니다. 그래서 *네트워크가 연결되지 않은 상태에서도 웹 애플리케이션을 온전히 실행할 수 있습니다.*

아무리 빠른 네트워크라도 실제로 요청을 보내고 받을 때까지 애플리케이션은 로딩상태로 기다려야 합니다. 이 때 서비스 워커를 사용하면 애플리케이션이 실행되는 시간을 크게 단축시킬 수 있기 때문에 사용자의 UX도 대폭 개선할 수 있습니다.

<!--
## Service workers in Angular
-->
## Angular가 제공하는 서비스 워커

<!--
Angular applications, as single-page applications, are in a prime position to benefit from the advantages of service workers. Starting with version 5.0.0, Angular ships with a service worker implementation. Angular developers can take advantage of this service worker and benefit from the increased reliability and performance it provides, without needing to code against low-level APIs.

Angular's service worker is designed to optimize the end user experience of using an application over a slow or unreliable network connection, while also minimizing the risks of serving outdated content.

The Angular service worker's behavior follows that design goal:

* Caching an application is like installing a native application. The application is cached as one unit, and all files update together.
* A running application continues to run with the same version of all files. It does not suddenly start receiving cached files from a newer version, which are likely incompatible.
* When users refresh the application, they see the latest fully cached version. New tabs load the latest cached code.
* Updates happen in the background, relatively quickly after changes are published. The previous version of the application is served until an update is installed and ready.
* The service worker conserves bandwidth when possible. Resources are only downloaded if they've changed.

To support these behaviors, the Angular service worker loads a *manifest* file from the server. The manifest describes the resources to cache and includes hashes of every file's contents. When an update to the application is deployed, the contents of the manifest change, informing the service worker that a new version of the application should be downloaded and cached. This manifest is generated from a CLI-generated configuration file called `ngsw-config.json`.

Installing the Angular service worker is as simple as including an `NgModule`. In addition to registering the Angular service worker with the browser, this also makes a few services available for injection which interact with the service worker and can be used to control it. For example, an application can ask to be notified when a new update becomes available, or an application can ask the service worker to check the server for available updates.
-->
Angular 애플리케이션은 단일 페이지 애플리케이션(Single-page application, SPA)이기 때문에 서비스 워커의 효율을 극대화할 수 있습니다. Angular는 5.0.0 버전부터 서비스 워커를 도입했습니다. Angular 개발자라면 언제든 이 서비스 워커를 도입할 수 있으며, 별다른 코드 변경 없이도 애플리케이션의 안정성과 실행 성능을 개선할 수 있습니다.

Angular가 제공하는 서비스 워커는 느리거나 불안정한 네트워크로 접속한 사용자에게도 최적화된 UX를 제공하는 것을 최우선 목표로 설계되었습니다. 그리고 이 때 캐싱된 데이터가 갱신되지 않아서 생길 수 있는 리스크도 최소화하려고 노력하고 있습니다.

Angular가 제공하는 서비스 워커가 지향하는 방향은 이렇습니다:

* 애플리케이션을 캐싱하는 것은 네이티브 애플리케이션을 설치하는 것과 비슷합니다. 애플리케이션은 개별 파일 단위로 캐싱할 수 있으며 애플리케이션 전체를 한번에 캐싱할 수도 있습니다.

* 애플리케이션을 실행하면 모든 파일은 같은 버전으로 동작합니다. 캐싱한 파일 대신 새로운 버전의 파일을 갑자기 가져와서 애플리케이션이 제대로 동작하지 않는 상황은 발생하지 않아야 합니다.

* 사용자가 애플리케이션을 새로고침하면 마지막에 캐싱된 애플리케이션 코드를 사용해서 화면을 다시 표시합니다. 새로운 탭을 여는 경우도 마찬가지입니다.

* 애플리케이션 코드 업데이트는 백그라운드에서 실행되며, 이 업데이트는 최신 코드가 배포된 것을 확인하는 즉시 실행됩니다. 이 때 애플리케이션의 최신 버전이 설치되고 완전히 준비되기 전까지는 이전 버전이 그대로 실행됩니다.

* 서비스 워커는 네트워크 대역폭을 최소한으로 사용합니다. 애플리케이션이 사용하는 리소스는 변경되었을 때만 다시 다운로드됩니다.

이런 동작을 지원하기 위해 Angular 서비스 워커는 서버에서 *매니페스트(manifest)* 파일을 받아옵니다. 이 매니페스트 파일에는 캐싱해야할 리소스의 목록과 모든 파일의 내용과 관련된 해시값이 저장되어 있습니다. 그래서 애플리케이션의 새로운 버전이 배포되면 이 매니페스트 파일의 내용도 바뀌기 때문에, 자연스럽게 서비스 워커는 애플리케이션의 새로운 버전이 배포되었으니 새로 다운로드 받고 캐싱해야 한다는 것을 알 수 있습니다. Angular CLI를 사용해서 생성한 프로젝트에 존재하는 기본 매니페스트 파일의 이름은 `ngsw-config.json`입니다.

Angular 애플리케이션에 Angular 서비스 워커를 적용하는 것은 `NgModule`을 로드하는 것만큼이나 아주 간단합니다. 그리고 Angular 서비스 워커를 브라우저에 등록하면 애플리케이션에 몇가지 서비스가 자동으로 등록되기 때문에, 이 서비스를 활용하면 개발자가 서비스 워커를 직접 조작할 수 있습니다. 이 방식을 활용하면 애플리케이션의 새로운 버전이 배포되었을 때 알림을 받도록 할 수도 있고, 원하는 시점에 서비스 워커를 사용해서 새로운 업데이트가 있는지 직접 확인할 수도 있습니다.

<!--
## Prerequisites
-->
## 동작 환경

To make use of all the features of Angular service worker, use the latest versions of Angular and the Angular CLI.

In order for service workers to be registered, the app must be accessed over HTTPS, not HTTP.
Browsers ignore service workers on pages that are served over an insecure connection.
The reason is that service workers are quite powerful, so extra care needs to be taken to ensure the service worker script has not been tampered with.

There is one exception to this rule: to make local development easier, browsers do _not_ require a secure connection when accessing an app on `localhost`.

### Browser support

To benefit from the Angular service worker, your app must run in a web browser that supports service workers in general.
Currently, service workers are supported in the latest versions of Chrome, Firefox, Edge, Safari, Opera, UC Browser (Android version) and Samsung Internet.
Browsers like IE and Opera Mini do not support service workers.

If the user is accessing your app via a browser that does not support service workers, the service worker is not registered and related behavior such as offline cache management and push notifications does not happen.
More specifically:

* The browser does not download the service worker script and `ngsw.json` manifest file.
* Active attempts to interact with the service worker, such as calling `SwUpdate.checkForUpdate()`, return rejected promises.
* The observable events of related services, such as `SwUpdate.available`, are not triggered.

It is highly recommended that you ensure that your app works even without service worker support in the browser.
Although an unsupported browser ignores service worker caching, it will still report errors if the app attempts to interact with the service worker.
For example, calling `SwUpdate.checkForUpdate()` will return rejected promises.
To avoid such an error, you can check whether the Angular service worker is enabled using `SwUpdate.isEnabled()`.

To learn more about other browsers that are service worker ready, see the [Can I Use](https://caniuse.com/#feat=serviceworkers) page and [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).


<!--
## Related resources
-->
## 관련 자료

The rest of the articles in this section specifically address the Angular implementation of service workers.

* [App Shell](guide/app-shell)
* [Service Worker Communication](guide/service-worker-communications)
* [Service Worker in Production](guide/service-worker-devops)
* [Service Worker Configuration](guide/service-worker-config)

For more information about service workers in general, see [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers/).

For more information about browser support, see the [browser support](https://developers.google.com/web/fundamentals/primers/service-workers/#browser_support) section of [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers/), Jake Archibald's [Is Serviceworker ready?](https://jakearchibald.github.io/isserviceworkerready/), and
[Can I Use](http://caniuse.com/#feat=serviceworkers).

For additional recommendations and examples, see:

* [Precaching with Angular Service Worker](https://web.dev/precaching-with-the-angular-service-worker/)
* [Creating a PWA with Angular CLI](https://web.dev/creating-pwa-with-angular-cli/)

## Next steps

To begin using Angular service workers, see [Getting Started with service workers](guide/service-worker-getting-started).
