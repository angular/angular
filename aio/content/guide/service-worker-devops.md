<!--
# Service worker in production
-->
# 운영환경에 서비스 워커 활용하기

<!--
This page is a reference for deploying and supporting production apps that use the Angular service worker. It explains how the Angular service worker fits into the larger production environment, the service worker's behavior under various conditions, and available recourses and fail-safes.
-->
이 문서에서는 Angular 서비스 워커를 운영환경에서 활용할 때 필요한 내용에 대해 소개합니다.
복잡한 운영환경에 서비스 워커를 어떻게 적용할 수 있는지, 서로 다른 환경에서 서비스 워커의 동작이 어떻게 달라져야 하는지, 리소스를 준비하고 서비스 워커 실행에 실패했을 때 처리해야 하는 내용에 대해서 소개합니다.

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following:
* [Service Worker Communication](guide/service-worker-communications).
-->
이 문서의 내용을 제대로 이해하려면 다음 내용을 미리 확인하는 것이 좋습니다.
* [서비스 워커 통신](guide/service-worker-communications)

<hr />

<!--
## Service worker and caching of app resources
-->
## 서비스 워커와 앱 리소스 캐싱

<!--
Conceptually, you can imagine the Angular service worker as a forward cache or a CDN edge that is installed in the end user's web browser. The service worker's job is to satisfy requests made by the Angular app for resources or data from a local cache, without needing to wait for the network. Like any cache, it has rules for how content is expired and updated.
-->
개념으로 보면, Angular 서비스 워커는 사용자의 웹 브라우저에 설치된 캐싱 서버나 CDN 엣지(edge)라고 이해할 수도 있습니다. 서비스 워커의 역할은 Angular 앱이 요청한 리소스를 로컬 캐시에 저장해두었다가, 다음에 똑같은 리소스가 요청되면 네트워크 사용 없이 직접 리소스를 반환하는 것이기 때문입니다. 그리고 일반적인 캐싱 서버와 마찬가지로, 서비스 워커에도 리소스의 만료 시점을 지정하는 룰이 존재합니다.

{@a versions}

<!--
### App versions
-->
### 앱 버전

<!--
In the context of an Angular service worker, a "version" is a collection of resources that represent a specific build of the Angular app. Whenever a new build of the app is deployed, the service worker treats that build as a new version of the app. This is true even if only a single file is updated. At any given time, the service worker may have multiple versions of the app in its cache and it may be serving them simultaneously. For more information, see the [App tabs](guide/service-worker-devops#tabs) section below.

To preserve app integrity, the Angular service worker groups all files into a version together. The files grouped into a version usually include HTML, JS, and CSS files. Grouping of these files is essential for integrity because HTML, JS, and CSS files frequently refer to each other and depend on specific content. For example, an `index.html` file might have a `<script>` tag that references `bundle.js` and it might attempt to call a function `startApp()` from within that script. Any time this version of `index.html` is served, the corresponding `bundle.js` must be served with it. For example, assume that the `startApp()` function is renamed to `runApp()` in both files. In this scenario, it is not valid to serve the old `index.html`, which calls `startApp()`, along with the new bundle, which defines `runApp()`.
-->
서비스 워커에서 "버전(version)"이라는 용어는 특정 시점에 빌드된 Angular 앱에 존재하는 리소스 집합을 의미합니다. 그래서 애플리케이션이 새롭게 빌드되어 배포되면, 서비스 워커는 이것을 애플리케이션의 새로운 버전으로 간주합니다. 파일이 하나만 바뀌었더라도 마찬가지입니다. 서비스 워커는 캐시에 애플리케이션의 여러 버전을 동시에 보관하고 있을 수도 있습니다. 더 자세한 내용은 아래 [탭 단위로 실행되는 애플리케이션](guide/service-worker-devops#tabs) 섹션을 참고하세요.

애플리케이션을 안정적으로 조합하기 위해 Angular 서비스 워커는 특정 버전에 있는 모든 파일을 그룹으로 묶습니다. 이렇게 그룹으로 묶이는 파일은 보통 HTML, JS, CSS 파일들인데, 이 파일들은 어떤 목적에 따라 서로 연관되기 때문에 같은 그룹으로 묶이는 것이 중요합니다. 예를 들어 `index.html` 파일이 `<script>` 태그로 `bundle.js` 파일을 참조하고, 이 스크립트 파일에 정의된 `startApp()` 함수를 실행한다고 합시다. 그러면 `index.html` 파일이 사용되는 시점에 `bundle.js` 파일도 반드시 존재해야 합니다. 그리고 `bundle.js` 파일에 정의된 `startApp()` 함수의 이름이 `runApp()`으로 변경되면, 이 내용이 `index.html` 파일과 `bundle.js` 파일에 모두 반영되어야 합니다. `bundle.js` 파일에는 `runApp()`으로 변경되었지만 `index.html` 파일에서 `startApp()`을 실행한다면 제대로 동작하지 않을 것입니다.

<!--
This file integrity is especially important when lazy loading modules.
A JS bundle may reference many lazy chunks, and the filenames of the
lazy chunks are unique to the particular build of the app. If a running
app at version `X` attempts to load a lazy chunk, but the server has
updated to version `X + 1` already, the lazy loading operation will fail.

The version identifier of the app is determined by the contents of all
resources, and it changes if any of them change. In practice, the version
is determined by the contents of the `ngsw.json` file, which includes
hashes for all known content. If any of the cached files change, the file's
hash will change in `ngsw.json`, causing the Angular service worker to
treat the active set of files as a new version.

With the versioning behavior of the Angular service worker, an application
server can ensure that the Angular app always has a consistent set of files.
-->
지연로딩되는 모듈이 있다면 파일이 그룹으로 묶이는 과정이 조금 더 중요합니다. 애플리케이션은 JS 파일을 지연로딩해야 하는데, 지연로딩되는 파일의 이름은 해당 파일이 빌드될 때마다 달라집니다. 그래서 현재 실행되고 있는 앱 버전이 `X`이고 이 앱에서 파일을 지연로딩하려고 하지만, 서버가 제공하는 앱 버전은 `X + 1`이라면 클라이언트가 요청한 파일을 찾을 수 없기 때문에 지연로딩도 실패합니다.

애플리케이션의 버전을 나타내는 id는 해당 버전에 존재하는 모든 리소스를 바탕으로 결정되며, 리소스 중 하나라도 변경되면 id도 변경됩니다. 좀 더 자세하게 이야기하면, 애플리케이션의 버전은 `ngsw.json` 파일에 존재하는 각 리소스의 해시값을 사용해서 결정됩니다. 그래서 캐싱된 파일이 변경되면 `ngsw.json` 파일에서 해당 파일의 해시값이 변경되기 때문에 서비스 워커가 다른 버전으로 인식합니다.

결국 애플리케이션 버전이 서비스 워커로 관리되기 때문에 애플리케이션 서버는 애플리케이션 버전 하나만 확실하게 제공하면 됩니다.

<!--
#### Update checks
-->
#### 업데이트 확인

<!--
Every time the user opens or refreshes the application, the Angular service worker
checks for updates to the app by looking for updates to the `ngsw.json` manifest. If
an update is found, it is downloaded and cached automatically, and will be served
the next time the application is loaded.
-->
서비스 워커는 사용자가 Angular 애플리케이션을 새로 실행하나 브라우저를 새로고침할 때마다 `ngsw.json` 매니페스트에 있는 내용을 기준으로 애플리케이션이 최신버전인지 확인합니다. 이 때 서버에 존재하는 애플리케이션보다 버전이 낮다면, 자동으로 최신 버전을 다운로드하고 캐싱한 후에, 다음 애플리케이션이 실행될 때 최신 버전을 적용합니다.

<!--
### Resource integrity
-->
### 리소스 정합성 유지

<!--
One of the potential side effects of long caching is inadvertently
caching an invalid resource. In a normal HTTP cache, a hard refresh
or cache expiration limits the negative effects of caching an invalid
file. A service worker ignores such constraints and effectively long
caches the entire app. Consequently, it is essential that the service worker
gets the correct content.

To ensure resource integrity, the Angular service worker validates
the hashes of all resources for which it has a hash. Typically for
an app created with the [Angular CLI](cli), this is everything in the `dist` directory covered by
the user's `src/ngsw-config.json` configuration.
-->
캐싱을 오랫동안 유지하면 유효하지 않은 리소스를 참조하는 상황이 발생할 수 있습니다. 그래서 HTTP 캐시는 일반적으로 잘못된 파일을 참조하는 것을 방지하기 위해 만료 기한을 두고 캐시를 강제로 비우기도 합니다. 물론 변경되지 않는 리소스라면 오랫동안 캐싱해도 상관없습니다. 어디까지나 만료기한은 서비스 워커가 올바른 리소스를 제공하기 위한 용도로 사용합니다.

리소스가 올바르게 존재하는 것을 보장하려면 서비스 워커가 모든 리소스의 해시값을 검사하면 됩니다. [Angular CLI](cli)를 사용해서 만든 앱이라면 `dist` 폴더에 존재하는 모든 파일에는 `src/ngsw-config.json` 설정에 따라 해시값이 할당됩니다.

<!--
If a particular file fails validation, the Angular service worker
attempts to re-fetch the content using a "cache-busting" URL
parameter to eliminate the effects of browser or intermediate
caching. If that content also fails validation, the service worker
considers the entire version of the app to be invalid and it stops
serving the app. If necessary, the service worker enters a safe mode
where requests fall back on the network, opting not to use its cache
if the risk of serving invalid, broken, or outdated content is high.

Hash mismatches can occur for a variety of reasons:

* Caching layers in between the origin server and the end user could serve stale content.
* A non-atomic deployment could result in the Angular service worker having visibility of partially updated content.
* Errors during the build process could result in updated resources without `ngsw.json` being updated. The reverse could also happen resulting in an updated `ngsw.json` without updated resources.
-->
해시값을 검사하던 중에 유효하지 않은 파일을 발견하면 서비스 워커가 캐시를 무시하고 해당 파일을 다운받으려고 시도합니다. 그리고 새로 받은 파일도 유효성검사를 통과하지 못하면 애플리케이션 전체가 유효하지 않은 것으로 판단하고 애플리케이션을 중단합니다. 하지만 이 상태에서 안전모드로 앱을 실행할 수 있는데, 안전모드에서는 HTTP 요청이 실패할 수 있으며, 캐시가 제대로 동작하지 않고, 이미 캐싱하고 있는 내용의 유효성도 보장할 수 없습니다.

해시값은 다음과 같은 이유로 틀어질 수 있습니다:

* 앱을 제공하는 서버와 오래된 컨텐츠를 동기화하는 레이어
* 애플리케이션이 한번에 배포되지 않고 부분적으로 배포되어 갱신된 경우
* 빌드과정에서 에러가 발생하면 `ngsw.json` 파일이 업데이트되지 않을 수 있습니다. 아니면 `ngsw.json`만 업데이트되고 실제 리소스가 업데이트되지 않을 수 있습니다.

<!--
#### Unhashed content
-->
#### 해시값이 존재하지 않는 리소스

<!--
The only resources that have hashes in the `ngsw.json`
manifest are resources that were present in the `dist`
directory at the time the manifest was built. Other
resources, especially those loaded from CDNs, have
content that is unknown at build time or are updated
more frequently than the app is deployed.

If the Angular service worker does not have a hash to validate
a given resource, it still caches its contents but it honors
the HTTP caching headers by using a policy of "stale while
revalidate." That is, when HTTP caching headers for a cached
resource indicate that the resource has expired, the Angular
service worker continues to serve the content and it attempts
to refresh the resource in the background. This way, broken
unhashed resources do not remain in the cache beyond their
configured lifetimes.
-->
빌드하면서 `dist` 폴더에 생성된 리소스들의 해시값은 모두 `ngsw.json` 파일에 저장됩니다. 하지만 CDN에서 로드하거나 빌드 시점에 함께 빌드되지 않는 리소스들은 해시값이 존재하지 않거나 애플리케이션이 배포된 후에도 변경될 수 있습니다.

서비스 워커는 해시값이 없는 리소스를 발견해도 이 파일을 그대로 제공하지만, HTTP 헤더를 설정해서 이 파일을 잠재적으로 유효하지 않은 것으로 판단합니다. 그래서 이 파일은 캐싱기한이 만료된 것으로 판단하고 백그라운드에서 이 파일을 새로 받아오려고 합니다. 해시값이 존재하지 않는 리소스는 새롭게 받아오기 전까지만 유지되며, 리소스를 새로 받아온 후에는 HTTP 캐싱 정책을 활용합니다.

{@a tabs}

<!--
### App tabs
-->
### 탭 단위로 실행되는 애플리케이션

<!--
It can be problematic for an app if the version of resources
it's receiving changes suddenly or without warning. See the
[Versions](guide/service-worker-devops#versions) section above
for a description of such issues.

The Angular service worker provides a guarantee: a running app
will continue to run the same version of the app. If another
instance of the app is opened in a new web browser tab, then
the most current version of the app is served. As a result,
that new tab can be running a different version of the app
than the original tab.

It's important to note that this guarantee is **stronger**
than that provided by the normal web deployment model. Without
a service worker, there is no guarantee that code lazily loaded
later in a running app is from the same version as the initial
code for the app.
-->
애플리케이션을 사용하고 있는 도중에 아무런 알림없이 갑자기 앱 버전이 변경된다면 앱을 실행하고 있던 사용자가 굉장히 불편할 것입니다. [버전](guide/service-worker-devops#versions)에 대해서는 위에서 언급한 내용을 참고하세요.

Angular 서비스 워커는 완충장치를 제공합니다. 그래서 일단 실행하고 있던 앱은 사용자가 종료하기 전까지 계속 실행할 수 있습니다. 하지만 웹브라우저의 새로운 탭에 애플리케이션 인스턴스가 생성되면 , 이 애플리케이션은 최신버전으로 실행됩니다. 그래서 두 탭에 서로 다른 버전의 앱이 동작하게 됩니다.

이 방식은 일반적인 웹 배포 모델보다 더 **안전**합니다. 서비스 워커가 이런 완충장치를 제공하기 때문에, 먼저 실행되고 있던 앱에서 지연로딩하는 파일이 있으면 해당 버전의 리소스를 올바르게 로드할 수 있습니다.

<!--
There are a few limited reasons why the Angular service worker
might change the version of a running app. Some of them are
error conditions:

* The current version becomes invalid due to a failed hash.
* An unrelated error causes the service worker to enter safe mode; that is, temporary deactivation.

The Angular service worker is aware of which versions are in
use at any given moment and it cleans up versions when
no tab is using them.

Other reasons the Angular service worker might change the version
of a running app are normal events:

* The page is reloaded/refreshed.
* The page requests an update be immediately activated via the `SwUpdate` service.
-->
하지만 다음과 같은 에러가 발생하며 서비스 워커가 실행하던 앱을 종료합니다:

* 해시값 검사에 실패해서 애플리케이션의 현재 버전이 유효하지 않은 경우
* 에러가 발생해서 안전모드로도 실행하지 못한 경우. 이 경우에는 서비스 워커가 잠시 비활성화됩니다.

이런 경우에는 서비스 워커가 적절한 애플리케이션 버전을 찾고, 이 버전이 아닌 애플리케이션 코드는 모두 정리합니다.

그리고 에러가 발생하지 않더라도 다음과 같은 경우에는 서비스 워커가 애플리케이션 버전을 최신 버전으로 변경합니다:

* 페이지를 새로고침한 경우
* `SwUpdate` 서비스를 사용해서 애플리케이션의 최신 버전을 직접 활성화하는 경우

<!--
### Service worker updates
-->
### 서비스 워커 업데이트하기

<!--
The Angular service worker is a small script that runs in web browsers.
From time to time, the service worker will be updated with bug
fixes and feature improvements.

The Angular service worker is downloaded when the app is first opened
and when the app is accessed after a period of inactivity. If the
service worker has changed, the service worker will be updated in the background.

Most updates to the Angular service worker are transparent to the
app&mdash;the old caches are still valid and content is still served
normally. However, occasionally a bugfix or feature in the Angular
service worker requires the invalidation of old caches. In this case,
the app will be refreshed transparently from the network.
-->
Angular 서비스 워커는 사실 웹 브라우저에서 실행되는 간단한 스크립트입니다. 그래서 서비스 워커도 버그를 수정하거나 새로운 기능을 추가하기 위해 업데이트할 필요가 있습니다.

서비스 워커는 애플리케이션이 처음 실행될 때 다운로드되며 비활성화되어도 브라우저에 계속 남아있습니다. 그래서 서비스 워커는 보통 백그라운드에서 업데이트됩니다.

서비스 워커가 업데이트되더라도 이 과정은 애플리케이션에 영향을 주지 않습니다. 그래서 업데이트하기 이전에 캐싱한 리소스는 서비스 워커를 업데이트한 이후에도 여전히 유효합니다. 하지만 서비스 워커의 버그를 수정하거나 기능이 추가된 경우라면 이전에 있던 캐시를 폐기하고 새로 받아와야 하는 경우도 있습니다. 이 경우에는 앱 전체가 새로 실행될 수 있습니다.

## Debugging the Angular service worker

Occasionally, it may be necessary to examine the Angular service
worker in a running state to investigate issues or to ensure that
it is operating as designed. Browsers provide built-in tools for
debugging service workers and the Angular service worker itself
includes useful debugging features.

### Locating and analyzing debugging information

The Angular service worker exposes debugging information under
the `ngsw/` virtual directory. Currently, the single exposed URL
is `ngsw/state`. Here is an example of this debug page's contents:

```
NGSW Debug Info:

Driver state: NORMAL ((nominal))
Latest manifest hash: eea7f5f464f90789b621170af5a569d6be077e5c
Last update check: never

=== Version eea7f5f464f90789b621170af5a569d6be077e5c ===

Clients: 7b79a015-69af-4d3d-9ae6-95ba90c79486, 5bc08295-aaf2-42f3-a4cc-9e4ef9100f65

=== Idle Task Queue ===
Last update tick: 1s496u
Last update run: never
Task queue:
 * init post-load (update, cleanup)

Debug log:
```

#### Driver state

The first line indicates the driver state:

```
Driver state: NORMAL ((nominal))
```

`NORMAL` indicates that the service worker is operating normally and is not in a degraded state.

There are two possible degraded states:

* `EXISTING_CLIENTS_ONLY`: the service worker does not have a
clean copy of the latest known version of the app. Older cached
versions are safe to use, so existing tabs continue to run from
cache, but new loads of the app will be served from the network.

* `SAFE_MODE`: the service worker cannot guarantee the safety of
using cached data. Either an unexpected error occurred or all
cached versions are invalid. All traffic will be served from the
network, running as little service worker code as possible.

In both cases, the parenthetical annotation provides the
error that caused the service worker to enter the degraded state.


#### Latest manifest hash

```
Latest manifest hash: eea7f5f464f90789b621170af5a569d6be077e5c
```

This is the SHA1 hash of the most up-to-date version of the app that the service worker knows about.


#### Last update check

```
Last update check: never
```

This indicates the last time the service worker checked for a new version, or update, of the app. `never` indicates that the service worker has never checked for an update.

In this example debug file, the update check is currently scheduled, as explained the next section.

#### Version

```
=== Version eea7f5f464f90789b621170af5a569d6be077e5c ===

Clients: 7b79a015-69af-4d3d-9ae6-95ba90c79486, 5bc08295-aaf2-42f3-a4cc-9e4ef9100f65
```

In this example, the service worker has one version of the app cached and
being used to serve two different tabs. Note that this version hash
is the "latest manifest hash" listed above. Both clients are on the
latest version. Each client is listed by its ID from the `Clients`
API in the browser.


#### Idle task queue

```
=== Idle Task Queue ===
Last update tick: 1s496u
Last update run: never
Task queue:
 * init post-load (update, cleanup)
```

The Idle Task Queue is the queue of all pending tasks that happen
in the background in the service worker. If there are any tasks
in the queue, they are listed with a description. In this example,
the service worker has one such task scheduled, a post-initialization
operation involving an update check and cleanup of stale caches.

The last update tick/run counters give the time since specific
events happened related to the idle queue. The "Last update run"
counter shows the last time idle tasks were actually executed.
"Last update tick" shows the time since the last event after
which the queue might be processed.


#### Debug log

```
Debug log:
```

Errors that occur within the service worker will be logged here.


### Developer Tools

Browsers such as Chrome provide developer tools for interacting
with service workers. Such tools can be powerful when used properly,
but there are a few things to keep in mind.

* When using developer tools, the service worker is kept running
in the background and never restarts. This can cause behavior with Dev
Tools open to differ from behavior a user might experience.

* If you look in the Cache Storage viewer, the cache is frequently
out of date. Right click the Cache Storage title and refresh the caches.

Stopping and starting the service worker in the Service Worker
pane triggers a check for updates.

## Service Worker Safety

Like any complex system, bugs or broken configurations can cause
the Angular service worker to act in unforeseen ways. While its
design attempts to minimize the impact of such problems, the
Angular service worker contains several failsafe mechanisms in case
an administrator ever needs to deactivate the service worker quickly.

### Fail-safe

To deactivate the service worker, remove or rename the
`ngsw-config.json` file. When the service worker's request
for `ngsw.json` returns a `404`, then the service worker
removes all of its caches and de-registers itself,
essentially self-destructing.

### Safety Worker

Also included in the `@angular/service-worker` NPM package is a small
script `safety-worker.js`, which when loaded will unregister itself
from the browser. This script can be used as a last resort to get rid
of unwanted service workers already installed on client pages.

It's important to note that you cannot register this worker directly,
as old clients with cached state may not see a new `index.html` which
installs the different worker script. Instead, you must serve the
contents of `safety-worker.js` at the URL of the Service Worker script
you are trying to unregister, and must continue to do so until you are
certain all users have successfully unregistered the old worker. For
most sites, this means that you should serve the safety worker at the
old Service Worker URL forever.

This script can be used both to deactivate `@angular/service-worker`
as well as any other Service Workers which might have been served in
the past on your site.

## More on Angular service workers

You may also be interested in the following:
* [Service Worker Configuration](guide/service-worker-config).

