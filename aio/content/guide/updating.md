<!--
# Keeping your Angular Projects Up-to-Date
-->
# Angular 프로젝트를 최신 버전으로 유지하기

<!--
Just like Web and the entire web ecosystem, Angular is continuously improving. Angular balances continuous improvement with a strong focus on stability and making updates easy. Keeping your Angular app up-to-date enables you to take advantage of leading-edge new features, as well as optimizations and bug fixes. 

This document contains information and resources to help you keep your Angular apps and libraries up-to-date. 

For information about our versioning policy and practices&mdash;including 
support and deprecation practices, as well as the release schedule&mdash;see [Angular versioning and releases](guide/releases "Angular versioning and releases"). 
-->
웹 생태계와 마찬가지로 Angular도 끊임없이 발전하고 있습니다.
그리고 Angular는 성능 향상과 안정성 향상 외에도 업데이트를 쉽게 할 수 있는 방법에 대해 계속 고민하고 있습니다.
Angular 애플리케이션을 최신버전으로 유지하면 Angular가 제공하는 최신 기술을 자연스럽게 사용할 수 있을 것입니다. 라이브러리가 최적화됨에 따라 애플리케이션도 최적화될 것이고, 이전 버전에 존재하는 버그도 함께 수정될 것입니다.

이 문서는 Angular 애플리케이션과 Angular 라이브러리를 최신버전으로 유지할 때 활용할 수 있는 정보와 리소스에 대해 다룹니다.

Angular의 버전 정책과 사용이 중단된 심볼, 릴리즈 일정에 대한 정보는 [Angular 버전 정책과 릴리즈](guide/releases "Angular versioning and releases") 문서를 참고하세요.


<div class="alert is-helpful">

<!--
If you are currently using AngularJS, see [Upgrading from AngularJS](guide/upgrade "Upgrading from Angular JS"). _AngularJS_ is the name for all v1.x versions of Angular.
-->
현재 사용하는 Angular 버전이 AngularJS라면 [AngularJS에서 업그레이드하기](guide/upgrade "Upgrading from Angular JS") 문서를 참고하세요.
_AngularJS_ 는 v1.x 버전의 Angular를 의미합니다.

</div>


{@a announce}
<!--
## Getting notified of new releases
-->
## 릴리즈 정보 얻기

<!--
To be notified when new releases are available, follow [@angular](https://twitter.com/angular "@angular on Twitter") on Twitter or subscribe to the [Angular blog](https://blog.angular.io "Angular blog"). 
-->
Angular 버전이 새로 나오는 정보를 얻으려면 Twitter에서 [@angular](https://twitter.com/angular "@angular on Twitter") 계정을 팔로우하거나 [Angular 블로그](https://blog.angular.io "Angular blog")를 구독하면 됩니다.

{@a learn}
<!--
## Learning about new features
-->
## 새로운 기능 확인하기

<!--
What's new? What's changed? We share the most important things you need to know on the Angular blog in [release announcements]( https://blog.angular.io/tagged/release%20notes "Angular blog - release announcements"). 

To review a complete list of changes, organized by version, see the [Angular change log](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log").
-->
어떤 기능이 추가되었을까? 변경된 내용은 어떤 것이 있나?
Angular 버전이 새로 나오면서 변경된 것 중 가장 중요한 내용은 Angular 블로그의 [릴리즈 공지](https://blog.angular.io/tagged/release%20notes "Angular blog - release announcements") 스레드로 제공됩니다.

그리고 해당 버전의 변경사항을 전부 알아보려면 [Angular 체인지 로그](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log")를 확인하면 됩니다.


{@a checking-version-app}
<!--
## Checking your version of Angular
-->
## 현재 사용하는 Angular 버전 확인하기

<!--
To check your app's version of Angular: From within your project directory, use the `ng version` command. 
-->
애플리케이션이 현재 사용하는 Angular 버전을 확인하려면 프로젝트 폴더에서 `ng version` 명령을 실행하면 됩니다.

{@a checking-version-angular}
<!--
## Finding the current version of Angular
-->
## Angular 최신버전 찾기

<!--
The most recent stable released version of Angular appears in the [Angular documentation](https://angular.io/docs "Angular documentation") at the bottom of the left side navigation. For example, `stable (v5.2.9)`.

You can also find the most current version of Angular by using the CLI command [`ng update`](cli/update). By default, `ng update` (without additional arguments) lists the updates that are available to you.  
-->
Angular 안정 버전 중에서 가장 최신 버전은 [Angular 가이드 문서](https://angular.io/docs "Angular documentation") 모든 페이지의 왼쪽에 있는 네비게이션에 `stable (v7.2.0)`과 같이 표시됩니다.

Angular 최신 버전은 Angular CLI 명령 [`ng update`](cli/update)를 실행해도 확인할 수 있습니다.
기본적으로 `ng update`를 옵션 없이 실행하면 현재 설치된 Angular 라이브러리 버전 중에서 업데이트할 수 있는 라이브러리 목록을 표시합니다.

{@a updating}
<!--
## Updating your environment and apps
-->
## Angular 버전 업데이트하기

<!--
To make updating easy, we provide complete instructions in the interactive [Angular Update Guide](https://update.angular.io/ "Angular Update Guide").

The Angular Update Guide provides customized update instructions, based on the current and target versions that you specify. It includes basic and advanced update paths, to match the complexity of your applications. It also includes troubleshooting information and any recommended manual changes to help you get the most out of the new release. 

For simple updates, the CLI command [`ng update`](cli/update) is all you need. Without additional arguments, `ng update` lists the updates that are available to you and provides recommended steps to update your application to the most current version. 

[Angular Versioning and Releases](guide/releases#versioning "Angular Release Practices, Versioning") describes the level of change that you can expect based a release's version number. It also describes supported update paths. 
-->
Angular는 라이브러리 업데이트를 쉽게 할 수 있도록 [Angular Update Guide](https://update.angular.io/ "Angular Update Guide") 툴을 제공합니다.

이 툴에서 현재 사용하는 Angular 버전과 업데이트하려고 하는 Angular 버전을 선택하면 어떤 단계로 업데이트하면 되는지 자세한 정보를 확인할 수 있습니다.
단순한 애플리케이션은 물론이고, 복잡한 애플리케이션에도 이 내용을 적용할 수 있습니다.
이 툴은 에러가 발생했을 때 처리할 수 있는 정보와 새로 도입된 기능을 활용하기 위해 수동으로 변경해야 하는 부분에 대한 정보도 제공합니다.

간단하게 생각하면 Angular 라이브러리의 버전을 올리는 것은 Angular CLI 명령 [`ng update`](cli/update) 하나면 됩니다.
이 명령을 옵션없이 실행하면 현재 사용하는 Angular 라이브러리 버전을 최신버전으로 올릴때 해야하는 과정을 안내합니다.

릴리즈 버전이 바뀌면서 변경되는 코드의 양은 [Angular의 버전 정책과 릴리즈](guide/releases#versioning "Angular Release Practices, Versioning")를 통해 예상해볼 수 있습니다.
이 문서는 업데이트 방법에 대해서도 안내합니다.

{@a resources}
<!--
## Resource summary
-->
## 활용할만한 리소스

<!--
* Release announcements: [Angular blog - release announcements](https://blog.angular.io/tagged/release%20notes "Angular blog announcements about recent releases")

* Release announcements (older): [Angular blog - announcements about releases prior to August 2017](https://blog.angularjs.org/search?q=available&by-date=true "Angular blog announcements about releases prior to August 2017")

* Release details: [Angular change log](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log")

* Update instructions: [Angular Update Guide](https://update.angular.io/ "Angular Update Guide")

* Update command reference: [Angular CLI `ng update` command reference](cli/update)

* Versioning, release, support, and deprecation practices: [Angular versioning and releases](guide/releases "Angular versioning and releases")

* Release schedule: [Angular versioning and releases](guide/releases#schedule "Angular versioning and releases")
-->
* 릴리즈 공지:  [Angular 블로그 - 릴리즈 공지](https://blog.angular.io/tagged/release%20notes "Angular blog announcements about recent releases")

* 릴리즈 공지 (이전 버전): [Angular 블로그 - 2017 이전의 릴리즈 공지](https://blog.angularjs.org/search?q=available&by-date=true "Angular blog announcements about releases prior to August 2017")

* 릴리즈 정보: [Angular 체인지 로그](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log")

* 업데이트 안내: [Angular Update Guide](https://update.angular.io/ "Angular Update Guide")

* 업데이트 커맨드 명령: [Angular CLI `ng update` 문서](cli/update)

* 버전 정책, 릴리즈, 버전 지원, 삿용이 중단된 심볼들: [Angular 버전 정책과 릴리즈](guide/releases "Angular versioning and releases")

* 릴리즈 일정: [Angular 버전 정책과 릴리즈](guide/releases#schedule "Angular versioning and releases")