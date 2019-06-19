<!--
# Service worker configuration
-->
# 서비스 워커 설정

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following:
* [Service Worker in Production](guide/service-worker-devops).
-->
이 문서의 내용을 제대로 이해하려면 다음 내용을 미리 확인하는 것이 좋습니다.
* [서비스 워커 활용](guide/service-worker-devops)

<hr />

<!--
The `src/ngsw-config.json` configuration file specifies which files and data URLs the Angular
service worker should cache and how it should update the cached files and data. The
[Angular CLI](cli) processes the configuration file during `ng build --prod`. Manually, you can process
it with the `ngsw-config` tool:
-->
Angular 서비스 워커 설정 파일인 `src/ngsw-config.json`에는 서비스 워커가 캐싱해야 할 파일과 데이터 URL, 그리고 이 리소스를 유지하는 정책을 설정합니다. 이 파일은 [Angular CLI](cli)로 `ng build --prod` 명령을 실행할 때 빌드 과정에 반영되며, `ngsw-config` 툴을 사용해서 직접 반영할 수도 있습니다:

```sh
ngsw-config dist src/ngsw-config.json /base/href
```

<!--
The configuration file uses the JSON format. All file paths must begin with `/`, which is the deployment directory&mdash;usually `dist` in CLI projects.
-->
이 설정 파일은 JSON 형식입니다. 이 파일에서 다른 파일의 위치를 가리킬 때는 반드시 `/`로 시작해야 하는데, 이 위치는 애플리케이션의 빌드 결과물이 위치하는 폴더를 의미하기 때문에 일반적으로 `dist` 폴더를 의미합니다.

{@a glob-patterns}
<!--
Unless otherwise noted, patterns use a limited glob format:

* `**` matches 0 or more path segments.
* `*` matches 0 or more characters excluding `/`.
* `?` matches exactly one character excluding `/`.
* The `!` prefix marks the pattern as being negative, meaning that only files that don't match the pattern will be included.

Example patterns:

* `/**/*.html` specifies all HTML files.
* `/*.html` specifies only HTML files in the root.
* `!/**/*.map` exclude all sourcemaps.

Each section of the configuration file is described below.
-->
설정 파일에는 다음과 같은 다중 파일 형식(glob)을 일부 사용할 수도 있습니다:

* `**`는 경로를 가리키는 세그먼트가 0개 이상인 것과 매칭됩니다.
* `*`는 `/`를 제외한 문자가 0개 이상인 것과 매칭됩니다.
* `?`는 `/`를 제외한 문자 하나와 매칭됩니다.
* `!` 접두사를 사용하면 패턴을 반대로 적용할 수 있습니다. 결국 패턴에 매칭되지 않는 파일이 선택됩니다.

그래서 다음과 같은 패턴을 사용할 수 있습니다:

* `/**/*.html`은 모든 HTML 파일과 매칭됩니다.
* `/*.html`은 루트 폴더에 존재하는 HTML 파일과 매칭됩니다.
* `!/**/*.map`은 소스맵 파일을 제외한 모든 파일과 매칭됩니다.

각각에 대해서는 설정 파일의 내용을 설명하면서 하나씩 알아봅시다.

## `appData`

<!--
This section enables you to pass any data you want that describes this particular version of the app.
The `SwUpdate` service includes that data in the update notifications. Many apps use this section to provide additional information for the display of UI popups, notifying users of the available update.
-->
애플리케이션에 필요한 데이터가 있다면 이 섹션을 사용해서 전달할 수 있습니다.
`SwUpdate` 서비스에도 업데이트 알림과 관련된 데이터가 필요할 수 있습니다. 그래서 보통 이 섹션은 업데이트 알림을 표시하는 팝업에 필요한 데이터를 지정하는 용도로 사용합니다.

{@a index-file}
## `index`

<!--
Specifies the file that serves as the index page to satisfy navigation requests. Usually this is `/index.html`.
-->
네비게이션 요청이 시작되는 인덱스 페이지를 지정합니다. 보통 `/index.html`을 지정합니다.

## `assetGroups`

<!--
*Assets* are resources that are part of the app version that update along with the app. They can include resources loaded from the page's origin as well as third-party resources loaded from CDNs and other external URLs. As not all such external URLs may be known at build time, URL patterns can be matched.

This field contains an array of asset groups, each of which defines a set of asset resources and the policy by which they are cached.
-->
*애셋(Assets)*은 앱 버전을 구성하는 리소스 파일을 의미하며, 앱이 업데이트될 때 함께 업데이트됩니다. 이 때 애셋은 페이지에 포함된 리소스이거나 CDN 등에서 다운받은 서드파티 리소스일 수 있습니다. 하지만 빌드 시점에 외부 리소스의 모든 URL을 정확히 지정할 수는 없기 때문에 패턴으로 URL을 매칭하는 방법을 사용하기도 합니다.

이 섹션에는 애셋 그룹을 배열 형태로 정의합니다. 이 때 애셋을 구성하는 파일을 모두 지정할 수 있으며, 애셋 그룹에 적용되는 캐싱 정책도 지정할 수 있습니다.

```json
{
  "assetGroups": [{
    ...
  }, {
    ...
  }]
}
```

<!--
Each asset group specifies both a group of resources and a policy that governs them. This policy determines when the resources are fetched and what happens when changes are detected.

Asset groups follow the Typescript interface shown here:
-->
각각의 애셋 그룹에는 그룹을 구성하는 리소스 파일들과 이 애셋 그룹에 적용될 정책을 함께 지정합니다. 리소스를 언제 다운받을 것인지, 새로운 버전을 발견하면 어떻게 할 것인지에 대한 정책도 이 때 적용합니다.

애셋 그룹은 TypeScript 인터페이스로 다음과 같이 정의되어 있습니다:

<!--
```typescript
interface AssetGroup {
  name: string;
  installMode?: 'prefetch' | 'lazy';
  updateMode?: 'prefetch' | 'lazy';
  resources: {
    files?: string[];
    /** @deprecated As of v6 `versionedFiles` and `files` options have the same behavior. Use `files` instead. */
    versionedFiles?: string[];
    urls?: string[];
  };
}
```
-->
```typescript
interface AssetGroup {
  name: string;
  installMode?: 'prefetch' | 'lazy';
  updateMode?: 'prefetch' | 'lazy';
  resources: {
    files?: string[];
    /** @deprecated v6 버전 부터는 `versionedFiles` 옵션과 `files` 옵션의 동작이 같습니다. `files`를 사용하세요. */
    versionedFiles?: string[];
    urls?: string[];
  };
}
```

### `name`

<!--
A `name` is mandatory. It identifies this particular group of assets between versions of the configuration.
-->
`name` 항목은 필수항목입니다. 이 항목은 애셋 그룹들 중에서 특정 애셋 그룹을 구별하기 위해 지정합니다.

### `installMode`

<!--
The `installMode` determines how these resources are initially cached. The `installMode` can be either of two values:

* `prefetch` tells the Angular service worker to fetch every single listed resource while it's caching the current version of the app. This is bandwidth-intensive but ensures resources are available whenever they're requested, even if the browser is currently offline.

* `lazy` does not cache any of the resources up front. Instead, the Angular service worker only caches resources for which it receives requests. This is an on-demand caching mode. Resources that are never requested will not be cached. This is useful for things like images at different resolutions, so the service worker only caches the correct assets for the particular screen and orientation.

Defaults to `prefetch`.
-->
`installMode` 항목을 지정하면 리소스 파일들의 초기 캐싱 동작을 지정할 수 있으며, 다음 값 중 하나를 사용할 수 있습니다:

* `prefetch` 방식을 지정하면 현재 앱 버전에 존재하는 모든 리소스 파일을 서비스 워커가 다운로드받아 캐싱합니다. 이 방식은 네트워크 대역폭을 많이 사용하지만 브라우저가 오프라인 상태일 때도 모든 리소스를 사용할 수 있습니다.

* `lazy` 방식을 지정하면 아무 리소스도 클라이언트에 캐싱하지 않습니다. 대신, Angular 서비스 워커는 요청을 보내고 응답으로 받은 리소스만 캐싱합니다. 그래서 이 방식을 필요한 것만 받아오는(on-demand) 캐싱 모드라고도 합니다. 요청하지 않은 리소스는 절대로 캐싱되지 않습니다. 이 방식은 이미지 파일을 해상도에 따라 여러벌 제공하는 경우에 유용합니다. 왜냐하면 여러벌로 만들어둔 이미지 파일 중에서 해당 스크린과 화면 비율에 맞는 이미지 파일만 캐싱되기 때문입니다.

기본값은 `prefetch`입니다.

### `updateMode`

<!--
For resources already in the cache, the `updateMode` determines the caching behavior when a new version of the app is discovered. Any resources in the group that have changed since the previous version are updated in accordance with `updateMode`.

* `prefetch` tells the service worker to download and cache the changed resources immediately.

* `lazy` tells the service worker to not cache those resources. Instead, it treats them as unrequested and waits until they're requested again before updating them. An `updateMode` of `lazy` is only valid if the `installMode` is also `lazy`.

Defaults to the value `installMode` is set to.
-->
`updateMode`를 지정하면 리소스 파일을 이미 캐싱한 상태에서 새로운 앱 버전을 발견했을 때 어떤 동작을 할 지 결정할 수 있습니다. 이전 버전에서 캐싱된 리소스들은 `updateMode`에서 지정한 방식으로 업데이트됩니다.

* `prefetch` 방식을 지정하면 변경된 리소스를 즉시 다운로드받고 캐싱합니다.

* `lazy` 방식을 지정하면 서비스 워커는 해당 리소스를 캐싱하지 않습니다. 대신, 다음에 다시 한 번 해당 리소스가 요청되었을 때 이 리소스가 캐싱되지 않은 것으로 간주하고 새로운 요청을 보냅니다. `updateMode`에 `lazy` 방식을 사용하려면 `installMode`도 `lazy`를 지정해야 합니다.

기본값은 `installMode`에서 지정한 값이 적용됩니다.

### `resources`

<!--
This section describes the resources to cache, broken up into three groups.

* `files` lists patterns that match files in the distribution directory. These can be single files or glob-like patterns that match a number of files.

* `versionedFiles` has been deprecated. As of v6 `versionedFiles` and `files` options have the same behavior. Use `files` instead.

* `urls` includes both URLs and URL patterns that will be matched at runtime. These resources are not fetched directly and do not have content hashes, but they will be cached according to their HTTP headers. This is most useful for CDNs such as the Google Fonts service.<br>
  _(Negative glob patterns are not supported and `?` will be matched literally; i.e. it will not match any character other than `?`.)_
-->
이 섹션에는 캐싱할 리소스 목록을 세가지 방식으로 지정합니다.

* `files`를 사용하면 빌드결과물이 생성된 폴더를 기준으로 패턴으로 파일을 매칭할 수 있습니다. 대상은 파일 하나가 될 수도 있고, glob 패턴으로 한 번에 여러 파일을 지정할 수도 있습니다.

* `versionedFiles`는 사용이 중단되었습니다. v6 버전부터는 `versionedFiles`와 `files` 옵션이 동일한 동작을 합니다. `files`를 사용하는 것을 권장합니다.

* `urls`에는 실행시점에 매칭될 URL이나 URL패턴을 지정합니다. 이 리소스들은 즉시 다운로드되지 않을 수 있고 해시값이 존재하지 않을 수 있지만, HTTP 헤더를 사용하는 방식으로 캐싱됩니다. 이 방식은 Google Fonts 서비스와 같이 CDN을 활용하는 부분에 적용하면 좋습니다.<br>
  _(이 방식에서는 glob 패턴을 반전하는 방식(`!`)이 동작하지 않으며, `?` 문자도 와일드카드로 동작하지 않습니다. `?` 문자는 `?` 문자 하나에만 매칭됩니다.)_

## `dataGroups`

<!--
Unlike asset resources, data requests are not versioned along with the app. They're cached according to manually-configured policies that are more useful for situations such as API requests and other data dependencies.

Data groups follow this Typescript interface:
-->
애셋 리소스와는 다르게 API로 보내는 데이터 요청은 앱 버전으로 관리되지 않습니다. 그래서 이런 요청은 자주 사용하는 API나 데이터 의존성 관계에 맞게 수동으로 캐싱하는 정책을 구성해야 합니다.

데이터 그룹은 TypeScript 인터페이스로 다음과 같이 정의되어 있습니다:

```typescript
export interface DataGroup {
  name: string;
  urls: string[];
  version?: number;
  cacheConfig: {
    maxSize: number;
    maxAge: string;
    timeout?: string;
    strategy?: 'freshness' | 'performance';
  };
}
```

### `name`
<!--
Similar to `assetGroups`, every data group has a `name` which uniquely identifies it.
-->
데이터 그룹을 구분하는 용도로 사용합니다. `assetGroups`에 있는 `name`과 비슷합니다.

### `urls`
<!--
A list of URL patterns. URLs that match these patterns will be cached according to this data group's policy.<br>
  _(Negative glob patterns are not supported and `?` will be matched literally; i.e. it will not match any character other than `?`.)_
-->
캐싱할 URL 패턴을 지정합니다. 이 URL 패턴에 해당하는 URL은 해당 데이터 그룹의 캐싱 정책을 따릅니다.<br>
  _(이 방식에서는 glob 패턴을 반전하는 방식(`!`)이 동작하지 않으며, `?` 문자도 와일드카드로 동작하지 않습니다. `?` 문자는 `?` 문자 하나에만 매칭됩니다.)_

### `version`
<!--
Occasionally APIs change formats in a way that is not backward-compatible. A new version of the app may not be compatible with the old API format and thus may not be compatible with existing cached resources from that API.

`version` provides a mechanism to indicate that the resources being cached have been updated in a backwards-incompatible way, and that the old cache entries&mdash;those from previous versions&mdash;should be discarded.

`version` is an integer field and defaults to `1`.
-->
API는 하위 호환성을 유지하지 못하면서 변경되기도 합니다. 그래서 새로운 버전의 앱에서 사용하는 API 형식이 이전에 사용했던 API 형식과 다르다면 캐싱된 API 리소스도 사용하지 못하게 됩니다.

이 때 하위호환성이 유지되는지, 이전에 캐싱했던 리소스를 사용할 수 있는지 판단하기 위해 `version` 필드를 지정합니다. 버전을 확인하고 이전 버전과 호환되지 않으면 캐싱된 리소스를 폐기합니다.

`version` 필드에는 정수값을 지정하며 기본값은 `1`입니다.

### `cacheConfig`
<!--
This section defines the policy by which matching requests will be cached.
-->
이 섹션에는 리소스를 캐싱하면서 적용할 정책을 지정합니다.

#### `maxSize`
<!--
(required) The maximum number of entries, or responses, in the cache. Open-ended caches can grow in unbounded ways and eventually exceed storage quotas, calling for eviction.
-->
(필수 항목) 리소스나 HTTP 요청을 얼마나 많이 캐싱할 것인지 지정합니다. 캐싱 한도를 설정하지 않으면 언젠가는 스토리지 용량을 넘어갈 수밖에 없기 때문에 꼭 지정해야 합니다.

#### `maxAge`
<!--
(required) The `maxAge` parameter indicates how long responses are allowed to remain in the cache before being considered invalid and evicted. `maxAge` is a duration string, using the following unit suffixes:

* `d`: days
* `h`: hours
* `m`: minutes
* `s`: seconds
* `u`: milliseconds

For example, the string `3d12h` will cache content for up to three and a half days.
-->
(필수 항목) `maxAge` 필드를 사용하면 캐싱하는 리소스가 언제 만료되는지 지정할 수 있습니다. `maxAge` 필드의 값은 다음 접미사를 사용해서 문자열로 지정합니다.

* `d`: 일자
* `h`: 시간
* `m`: 분
* `s`: 초
* `u`: 밀리초

그래서 `3d12h`라고 지정하면 캐싱된 리소스가 3.5일 이후에 만료됩니다.

#### `timeout`
<!--
This duration string specifies the network timeout. The network timeout is how long the Angular service worker will wait for the network to respond before using a cached response, if configured to do so. `timeout` is a duration string, using the following unit suffixes:

* `d`: days
* `h`: hours
* `m`: minutes
* `s`: seconds
* `u`: milliseconds

For example, the string `5s30u` will translate to five seconds and 30 milliseconds of network timeout.
-->
네트워크 타임아웃 기준시간을 설정합니다. Angular 서비스 워커는 이 필드로 지정된 만큼 네트워크 응답을 기다리며, 이 시간이 지나면 캐싱된 응답을 꺼내서 사용합니다. `timeout` 필드는 다음 접미사를 사용해서 문자열로 지정합니다.

* `d`: 일자
* `h`: 시간
* `m`: 분
* `s`: 초
* `u`: 밀리초

그래서 `5s30u`라고 지정하면 네트워크 요청을 보내고 5.3초가 지나면 타임아웃된 것으로 처리합니다.

#### `strategy`

<!--
The Angular service worker can use either of two caching strategies for data resources.

* `performance`, the default, optimizes for responses that are as fast as possible. If a resource exists in the cache, the cached version is used, and no network request is made. This allows for some staleness, depending on the `maxAge`, in exchange for better performance. This is suitable for resources that don't change often; for example, user avatar images.

* `freshness` optimizes for currency of data, preferentially fetching requested data from the network. Only if the network times out, according to `timeout`, does the request fall back to the cache. This is useful for resources that change frequently; for example, account balances.
-->
Angular 서비스 워커는 캐싱하는 데이터 리소스를 대상으로 두 가지 정책 중 하나를 사용할 수 있습니다.

* 기본 정책은 `performance`이며, 이 정책은 가장 빠르게 응답하도록 최적화된 정책입니다. 캐싱된 리소스가 있으면 그 리소스를 그대로 사용하며, `maxAge`와 같은 필드의 영향으로 만료되더라도 성능을 위해 만료된 데이터를 그대로 사용하기도 합니다. 이 정책은 사용자의 아바타 이미지와 같이 자주 변경되지 않는 리소스에 적합합니다.

* 네트워크를 통해 자주 요청되며 최신 데이터가 중요하다면 `freshness` 정책을 사용할 수 있습니다. 이 정책을 사용하면 `timeout` 필드의 영향으로 네트워크가 타임아웃 되어야만 캐싱된 데이터를 사용합니다. 이 정책은 자산의 잔액과 같이 자주 변경되는 리소스에 적합합니다.

## `navigationUrls`

<!--
This optional section enables you to specify a custom list of URLs that will be redirected to the index file.
-->
이 섹션은 옵션 항목입니다. 이 섹션을 사용하면 인덱스 파일로 리다이렉트되는 URL을 추가로 지정할 수 있습니다.

<!--
### Handling navigation requests
-->
### 네비게이션 요청 처리하기

<!--
The ServiceWorker will redirect navigation requests that don't match any `asset` or `data` group to the specified [index file](#index-file). A request is considered to be a navigation request if:

1. Its [mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode) is `navigation`.
2. It accepts a `text/html` response (as determined by the value of the `Accept` header).
3. Its URL matches certain criteria (see below).

By default, these criteria are:

1. The URL must not contain a file extension (i.e. a `.`) in the last path segment.
2. The URL must not contain `__`.
-->
서비스 워커는 애셋이나 데이터 그룹에 해당되지 않는 URL을 모두 [인덱스 파일로](#index-file) 리다이렉트합니다. 이 때 이 요청이 다음과 같은 조건이라면 네비게이션 요청으로 간주합니다:

1. [요청 모드](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode)가 `navigation`인 경우
2. `text/html` 응답을 받도록 헤더의 `Accept` 필드가 지정된 경우
3. URL이 특정 조건을 만족하는 경우 (아래 참고)

이 때 특정 조건이라는 것은 다음 조건을 의미합니다:

1. 마지막 URL 세그먼트가 파일 확장자(`.`)를 포함하지 않는 경우
2. URL에 `__`가 존재하지 않는 경우

<!--
### Matching navigation request URLs
-->
### 네비게이션 요청 URL 처리하기

<!--
While these default criteria are fine in most cases, it is sometimes desirable to configure different rules. For example, you may want to ignore specific routes (that are not part of the Angular app) and pass them through to the server.

This field contains an array of URLs and [glob-like](#glob-patterns) URL patterns that will be matched at runtime. It can contain both negative patterns (i.e. patterns starting with `!`) and non-negative patterns and URLs.

Only requests whose URLs match _any_ of the non-negative URLs/patterns and _none_ of the negative ones will be considered navigation requests. The URL query will be ignored when matching.

If the field is omitted, it defaults to:

```ts
[
  '/**',           // Include all URLs.
  '!/**/*.*',      // Exclude URLs to files.
  '!/**/*__*',     // Exclude URLs containing `__` in the last segment.
  '!/**/*__*/**',  // Exclude URLs containing `__` in any other segment.
]
```
-->
위에서 설명한 조건만으로도 대부분의 경우를 처리할 수 있지만, 추가로 다른 룰이 필요할 때가 있습니다. 특정 URL을 Angular 앱으로 전달하지 않고 서버로 바로 보내는 경우도 이런 경우에 해당됩니다.

이런 조건은 개별 URL로 구성된 배열일 수도 있고 [glob과 비슷하게 구성된](#glob-patterns) URL 패턴일수도 있습니다. `!` 문자로 시작하는 반전(negative) 패턴이 될수도 있습니다.

반전 패턴이 아닌 URL이나 패턴에 해당되는 요청이나, 반전 패턴에 아무것도 해당되지 않는 요청은 모두 네비게이션 요청으로 간주될 수 있습니다. 이미 지정된 URL 패턴과 매칭되는 URL은 모두 무시됩니다.

기본적으로 다음과 같은 요청은 네비게이션 요청으로 간주됩니다:
```ts
[
  '/**',           // 모든 URL
  '!/**/*.*',      // 파일 요청은 모두 제외
  '!/**/*__*',     // 마지막 URL 세그먼트에 `__` 를 포함하는 경우는 제외
  '!/**/*__*/**',  // 어디에라도 URL 세그먼트에 `__`를 포함하는 경우는 제외
]
```