<!--
# Getting started with service workers
-->
# 서비스 워커 추가하기

<!--
This document explains how to enable Angular service worker support in projects that you created with the [Angular CLI](cli). It then uses a simple example to show you a service worker in action, demonstrating loading and basic caching.
-->
이 문서는 [Angular CLI](cli)로 생성한 프로젝트에 Angular 서비스 워커를 어떻게 도입할 수 있는지 설명합니다.
간단한 예제를 다루면서 서비스 워커를 실제로 동작시켜보고, 로딩과 기본 캐싱 정책에 대해서도 알아봅시다.

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the information in [Introduction to Angular service workers](guide/service-worker-intro).
-->
이 문서의 내용을 제대로 이해하려면 [Angular 서비스 워커](guide/service-worker-intro)에서 설명하는 기본 내용을 미리 보는 것이 좋습니다.

<!--
## Adding a service worker to your project
-->
## 프로젝트에 서비스 워커 추가하기

<!--
To set up the Angular service worker in your project, use the CLI command `ng add @angular/pwa`. It takes care of configuring your app to use service workers by adding the `service-worker` package along
with setting up the necessary support files.
-->
프로젝트에 Angular 서비스 워커를 추기하려면 Angular CLI 명령 `ng add @angular/pwa`를 실행하면 됩니다.
그러면 Angular CLI가 프로젝트에 `service-worker` 패키지를 추가하고 서비스 워커가 동작하기 위해 필요한 환경을 자동으로 구성합니다.

```sh
ng add @angular/pwa --project *project-name*
```

<!--
The above command completes the following actions:

1. Adds the `@angular/service-worker` package to your project.
2. Enables service worker build support in the CLI.
3. Imports and registers the service worker in the app module.
4. Updates the `index.html` file:
    * Includes a link to add the `manifest.json` file.
    * Adds meta tags for `theme-color`.
5. Installs icon files to support the installed Progressive Web App (PWA).
6. Creates the service worker configuration file called [`ngsw-config.json`](/guide/service-worker-config), which specifies the caching behaviors and other settings.


 Now, build the project:
-->
이 명령은 다음과 같은 순서로 실행됩니다:

1. 프로젝트에 `@angular/service-worker` 패키지를 추가합니다.
2. Angular CLI로 빌드할 때 서비스 워커를 활성화하도록 설정합니다.
3. 서비스 워커를 앱 모듈에 등록합니다.
4. `index.html` 파일을 수정합니다:
    * `manifest.json` 파일에 대한 링크를 추가합니다.
    * `theme-color` 메타 태그를 추가합니다.
5. 프로그레시브 웹 앱(Progressive Web App, PWA)으로 설치되었을 때 필요한 아이콘 파일을 설치합니다.
6. 서비스 워커 환경설정 파일 [`ngsw-config.json`](/guide/service-worker-config)을 생성합니다. 이 파일은 캐싱 정책을 비롯한 서비스 워커의 동작을 정의하는 파일입니다.

그리고 프로젝트를 빌드해봅시다:

```sh
ng build --prod
```

<!--
The CLI project is now set up to use the Angular service worker.
-->
이제 Angular CLI로 만든 프로젝트에 Angular 서비스 워커를 사용할 준비는 끝났습니다.

<!--
## Service worker in action: a tour
-->
## 서비스 워커 사용하기

<!--
This section demonstrates a service worker in action,
using an example application.
-->
이번 섹션에서는 예제 애플리케이션에 서비스 워커를 사용해봅시다.

<!--
### Serving with `http-server`
-->
### `http-server`로 애플리케이션 띄우기

<!--
Because `ng serve` does not work with service workers, you must use a separate HTTP server to test your project locally. You can use any HTTP server. The example below uses the [http-server](https://www.npmjs.com/package/http-server) package from npm. To reduce the possibility of conflicts and avoid serving stale content, test on a dedicated port and disable caching.

To serve the directory containing your web files with `http-server`, run the following command:
-->
`ng serve` 명령으로는 서비스 워커가 실행되지 않기 때문에 서비스 워커를 사용하려면 Angular 애플리케이션을 다른 HTTP 서버로 띄워야 합니다.
그래서 이번 예제에서는 npm 패키지로 제공되는 [http-server](https://www.npmjs.com/package/http-server)를 사용해 봅시다.
HTTP 서버가 제공하는 파일을 모두 최신 버전으로 사용하기 위해 캐시는 비활성화한 채로 서버를 실행합니다.

```sh
http-server -p 8080 -c-1 dist/<project-name>
```

<!--
### Initial load
-->
### 초기 로드

<!--
With the server running, you can point your browser at http://localhost:8080/. Your application should load normally.

**Tip:** When testing Angular service workers, it's a good idea to use an incognito or private window in your browser to ensure the service worker doesn't end up reading from a previous leftover state, which can cause unexpected behavior.
-->
서버를 실행하고 나면 브라우저로 http://localhost:8080/ 에 접근해서 Angular 애플리케이션을 실행할 수 있습니다.

**팁:** Angular 서비스 워커를 사용할 때는 이전에 실행했던 서비스 워커의 영향을 배제하기 위해 브라우저를 시크릿 모드로 실행하는 것이 좋습니다.

<!--
### Simulating a network issue
-->
### 네트워크 오류 시뮬레이션하기

<!--
To simulate a network issue, disable network interaction for your application. In Chrome:

1. Select **Tools** > **Developer Tools** (from the Chrome menu located at the top right corner).
2. Go to the **Network tab**.
3. Check the **Offline box**.
-->
네트워크 오류를 시뮬레이션하려면 애플리케이션이 동작하는 네트워크 환경을 조작하면 됩니다. Chrome이라면 이렇게 합니다:

1. 오른쪽 위 메뉴에서 **도구 더보기** > **개발자 도구**를 선택합니다.
2. **Network 탭**으로 이동합니다.
3. **Offline 박스**를 체크합니다.

<!--
<figure>
  <img src="generated/images/guide/service-worker/offline-checkbox.png" alt="The offline checkbox in the Network tab is checked">
</figure>
-->
<figure>
  <img src="generated/images/guide/service-worker/offline-checkbox.png" alt="Network 탭의 Offline 체크박스가 체크된 모습">
</figure>

<!--
Now the app has no access to network interaction.

For applications that do not use the Angular service worker, refreshing now would display Chrome's Internet disconnected page that says "There is no Internet connection".

With the addition of an Angular service worker, the application behavior changes. On a refresh, the page loads normally.

If you look at the Network tab, you can verify that the service worker is active.
-->
이제는 애플리케이션이 네트워크를 사용할 수 없습니다.

서비스 워커를 사용하지 않는 Angular 애플리케이션이라면, 이 상태에서 화면을 새로고침 했을 때 인터넷이 연결되지 않았다는 메시지가 표시될 것입니다.

<figure>
  <img src="generated/images/guide/service-worker/sw-active.png" alt="Requests are marked as from ServiceWorker">
</figure>

<!--
Notice that under the "Size" column, the requests state is `(from ServiceWorker)`. This means that the resources are not being loaded from the network. Instead, they are being loaded from the service worker's cache.
-->
하지만 서비스 워커가 동작하는 Angular 애플리케이션이라면 애플리케이션 동작에 필요한 파일은 서비스 워커를 사용해서 가져올 수 있습니다.
그래서 네트워크 탭에서 Size 행을 확인해보면 `(from ServiceWorker)`라는 부분을 확인할 수 있습니다.
이 말은 애플리케이션 실행에 필요한 리소스를 네트워크를 사용하지 않고 로드했다는 의미입니다.
이 리소스들은 서비스 워커의 캐시에서 로드한 것입니다.

<!--
### What's being cached?
-->
### 캐시 안에는 어떤 것들이 있을까?

<!--
Notice that all of the files the browser needs to render this application are cached. The `ngsw-config.json` boilerplate configuration is set up to cache the specific resources used by the CLI:

* `index.html`.
* `favicon.ico`.
* Build artifacts (JS and CSS bundles).
* Anything under `assets`.
* Images and fonts directly under the configured `outputPath` (by default `./dist/<project-name>/`) or `resourcesOutputPath`. See [`ng build`](cli/build) for more information about these options.
-->
브라우저가 애플리케이션을 렌더링하기 위해 필요한 리소스들은 모두 캐싱됩니다. 그래서 Angular CLI가 생성한 `ngsw-config.json` 파일에는 다음과 같은 항목들이 캐싱되도록 설정되어 있습니다:

* `index.html`
* `favicon.ico`
* 빌드 결과물 (JS, CSS 번들 파일)
* `assets` 폴더에 있는 모든 파일
* `outputPath` (기본값은 `./dist/<project-name>/`)와 `resourcesOutputPath`로 지정된 폴더에 있는 이미지 파일과 폰트 파일. 자세한 내용은 [`ng build`](cli/build) 문서를 참고하세요.

<div class="alert is-helpful">
<!--
Pay attention to two key points:

1. The generated `ngsw-config.json` includes a limited list of cachable fonts and images extentions. In some cases, you might want to modify the glob pattern to suit your needs.

1. If `resourcesOutputPath` or `assets` paths are modified after the generation of configuration file, you need to change the paths manually in `ngsw-config.json`.
-->

다음 두가지를 주의해야 합니다:

1. `ngsw-config.json` 파일에서 캐싱하도록 설정한 폰트와 이미지 파일의 확장자는 모든 파일을 대상으로 하는 것이 아닙니다. 이 설정을 수정해야 하는 경우도 있습니다.

1. `resourcesOutputPath`나 `assets` 경로를 변경하고 나면 이 내용을 `ngsw-config.json` 파일에도 반영해야 합니다.

</div>

<!--
### Making changes to your application
-->
### 애플리케이션 코드 수정하기

<!--
Now that you've seen how service workers cache your application, the
next step is understanding how updates work.

1. If you're testing in an incognito window, open a second blank tab. This will keep the incognito and the cache state alive during your test.

2. Close the application tab, but not the window. This should also close the Developer Tools.

3. Shut down `http-server`.

4. Next, make a change to the application, and watch the service worker install the update.

5. Open `src/app/app.component.html` for editing.

6. Change the text `Welcome to {{title}}!` to `Bienvenue à {{title}}!`.

7. Build and run the server again:
-->
지금까지 서비스 워커가 애플리케이션을 어떻게 캐싱하는지 알아봤습니다.
이제 애플리케이션 코드를 수정하면 어떻게하면 되는지 알아봅시다.

1. 브라우저를 시크릿 모드로 실행한 상태에서 탭을 새로 엽니다. 그러면 이전에 사용하던 캐시 상태가 그대로 유지될 것입니다.

2. 윈도우창 말고 애플리케이션이 실행되고 있는 탭을 닫습니다. 이 때 닫은 탭과 연결된 개발자 도구도 함께 닫힙니다.

3. `http-server` 서버를 중지합니다.

4. 이제 애플리케이션 코드를 수정해서 서비스 워커가 새로 업데이트 된 내용으로 애플리케이션을 다시 캐싱하도록 해봅시다.

5. `src/app/app.component.html` 파일을 엽니다.

6. `Welcome to {{title}}!`를 `Bienvenue à {{title}}!`로 변경합니다.

7. 애플리케이션을 다시 빌드하고 서버를 실행합니다:

```sh
ng build --prod
http-server -p 8080 -c-1 dist/<project-name>
```

<!--
### Updating your application in the browser
-->
### 브라우저에 있는 애플리케이션 갱신하기

<!--
Now look at how the browser and service worker handle the updated application.

1. Open http://localhost:8080 again in the same window. What happens?
-->
이제 브라우저와 서비스 워커가 어떻게 동작하는지 확인해 봅시다.

1. 이전에 열었던 윈도우에서 http://localhost:8080로 접속합니다. 어떤 화면이 보이나요?

<!--
<figure>
  <img src="generated/images/guide/service-worker/welcome-msg-en.png" alt="It still says Welcome to Service Workers!">
</figure>
-->
<figure>
  <img src="generated/images/guide/service-worker/welcome-msg-en.png" alt="아직 Welcome to Service Workers!가 표시됩니다.">
</figure>

<!--
What went wrong? Nothing, actually. The Angular service worker is doing its job and serving the version of the application that it has **installed**, even though there is an update available. In the interest of speed, the service worker doesn't wait to check for updates before it serves the application that it has cached.

If you look at the `http-server` logs, you can see the service worker requesting `/ngsw.json`. This is how the service worker checks for updates.

2. Refresh the page.
-->
무언가 잘못된 걸까요? 아닙니다. Angular 서비스 워커는 이미 **설치된** 애플리케이션을 실행하는 원래 역할을 다하고 있을 뿐입니다. 애플리케이션을 빠르게 실행하기 위해서, 이미 애플리케이션을 실행하고 있는 상태라면 서비스 워커는 새로운 업데이트가 있는지 확인하지 않습니다.

`http-server`가 출력한 로그를 확인해보면 서비스 워커가 `ngsw.json` 파일을 요청한 것을 확인할 수 있습니다.
서비스 워커는 이 파일의 내용을 보고 업데이트를 해야 할지 판단합니다.

2. 페이지를 새로고침 해봅시다.

<!--
<figure>
  <img src="generated/images/guide/service-worker/welcome-msg-fr.png" alt="The text has changed to say Bienvenue à app!">
</figure>
-->
<figure>
  <img src="generated/images/guide/service-worker/welcome-msg-fr.png" alt="화면의 문구가 Bienvenue à app!로 변경되었습니다.">
</figure>

<!--
The service worker installed the updated version of your app *in the background*, and the next time the page is loaded or reloaded, the service worker switches to the latest version.
-->
서비스 워커는 애플리케이션을 *백그라운드에서* 설치하고 업데이트합니다.
그래서 페이지가 다시 로드되면 애플리케이션이 최신 버전으로 실행됩니다.

<hr />

<!--
## More on Angular service workers
-->
## 더 알아보기

<!--
You may also be interested in the following:
* [Communicating with service workers](guide/service-worker-communications).
-->
이제 다음 내용을 확인해 보세요:
* [서비스 워커로 통신하기](guide/service-worker-communications).
