<!--
# Angular Versioning and Releases 
-->
# Angular의 버전 정책과 릴리즈

<!--
We recognize that you need stability from the Angular framework. Stability ensures that reusable components and libraries, tutorials, tools, and learned practices don't become obsolete unexpectedly. Stability is essential for the ecosystem around Angular to thrive.

We also share with you the desire for Angular to keep evolving. We strive to ensure that the foundation on top of which you are building is continuously improving and enabling you to stay up-to-date with the rest of the web ecosystem and your user needs.

This document contains the practices that we follow to provide you with a leading-edge app development platform, balanced with stability. We strive to ensure that future changes are always introduced in a predictable way. We want everyone who depends on Angular to know when and how new features are added, and to be well-prepared when obsolete ones are removed.
-->
여러 프레임워크 중에서 Angular를 선택하는 이유 중 하나는 안정성(stability)일 것입니다.
프레임워크가 안정적이어야 재사용할 수 있는 컴포넌트나 라이브러리를 만들고, 튜토리얼을 확인하거나 툴을 활용할 때, 예제 코드를 확인할 때도 예상치 못한 오류가 발생하지 않는 것을 보장할 수 있습니다.
그래서 안정성은 Angular 생태계가 계속 발전하기 위해 꼭 필요한 기준입니다.

그리고 Angular는 끊임없이 진화하고 있습니다.
Angular 코어 팀은 개발자들이 만드는 애플리케이션의 토대가 되는 프레임워크를 지속적으로 개선하고 있으며, 웹 생태계와 개발자의 요구에 부응하기 위해 최신 기술을 계속 반영하고 있습니다.

이 문서에서는 최신 기술을 제공하는 앱 개발 플랫폼으로써의 역할과 안정성을 보장해야 하는 프레임워크로써 역할 사이의 균형을 Angular 코어 팀이 어떻게 조정하고 있는지 소개합니다.
Angular 코어 팀은 앞으로 Angular 프레임워크에 일어날 변화가 항상 예측 가능한 것이기를 보장하고 싶습니다. Angular를 활용하는 개발자들이라면 어떤 기능이 언제 도입될지, 어떤 기능은 지원이 중단될지 미리 알고 준비할 수 있기를 원합니다.


<div class="alert is-helpful">

<!--
The practices described in this document apply to Angular 2.0 and later. If you are currently using AngularJS, see [Upgrading from AngularJS](guide/upgrade "Upgrading from Angular JS"). _AngularJS_ is the name for all v1.x versions of Angular.
-->
이 문서에서 다루는 예제 코드는 Angular 2.0 이후 버전에 대한 것입니다.
지금 사용하는 Angular의 버전이 AngularJS라면 [AngularJS에서 업그레이드하기](guide/upgrade "Upgrading from Angular JS") 문서를 참고하세요. _AngularJS_ 는 Angular v1.x 버전을 의미합니다.

</div>


{@a versioning}
<!--
## Angular versioning
-->
## Angular의 버전 정책

Angular version numbers indicate the level of changes that are introduced by the release. This use of [semantic versioning](https://semver.org/ "Semantic Versioning Specification") helps you understand the potential impact of updating to a new version. 

Angular version numbers have three parts: `major.minor.patch`. For example, version 7.2.11 indicates major version 7, minor version 2, and patch level 11. 

The version number is incremented based on the level of change included in the release. 

* **Major releases** contain significant new features, some but minimal developer assistance is expected during the update. When updating to a new major release, you may need to run update scripts, refactor code, run additional tests, and learn new APIs. 


* **Minor releases** contain new smaller features. Minor releases are fully backward-compatible; no developer assistance is expected during update, but you can optionally modify your apps and libraries to begin using new APIs, features, and capabilities that were added in the release. We update peer dependencies in minor versions by expanding the supported versions, but we do not require projects to update these dependencies. 


* **Patch releases** are low risk, bug fix releases. No developer assistance is expected during update.


{@a updating}
### Supported update paths

In alignment with the versioning scheme described above, we commit to support the following update paths:

* If you are updating within the **same major version,** then you can skip any intermediate versions and update directly to the targeted version. For example, you can update directly from 7.0.0 to 7.2.11.


* If you are updating from **one major version to another,** then we recommend that you **don't skip major versions.** Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 6.x.x to version 8.x.x, we recommend that you update to the latest 7.x.x release first. After successfully updating to 7.x.x, you can then update to 8.x.x. 


See [Keeping Up-to-Date](guide/updating "Updating your projects") for more information about updating your Angular projects to the most recent version. 


{@a previews}
### Preview releases

We let you preview what's coming by providing Beta releases and Release Candidates (`rc`) for each major and minor release: 

<!-- 
* **Next:** The release that is under active development. The next release is indicated by a release tag appended with the  `next` identifier, such as  `8.1.0-next.0`. For the next version of the documentation, see [next.angular.io](https://next.angular.io). 
-->

* **Beta:** A release that is under active development and testing. A Beta release is indicated by a release tag appended with the  `beta` identifier, such as  `8.0.0-beta.0`. 

* **Release candidate:** A release that is feature complete and in final testing. A release candidate is indicated by a release tag appended with the `rc` identifier, such as version `8.1.0-rc`.

The next version of the documentation is available at [next.angular.io](https://next.angular.io). This includes any documentation for Beta or Release Candidate features and APIs. 


{@a frequency}
<!--
## Release frequency
-->
## 릴리즈 주기

<!--
We work toward a regular schedule of releases, so that you can plan and coordinate your updates with the continuing evolution of Angular.

In general, you can expect the following release cycle:

* A major release every 6 months

* 1-3 minor releases for each major release

* A patch release almost every week

This cadence of releases gives you access to new beta features as soon as they are ready, while maintaining the stability and reliability of the platform for production users.
-->
Angular는 일정한 주기로 릴리즈됩니다. 많은 개발자들이 버전 업데이트를 미리 대비해서 Angular의 발전에 함께 하기를 바랍니다.

일반적으로 릴리즈 주기는 이렇습니다:

* 메이저 버전은 6개월마다 한 번씩 발표됩니다.

* 새로운 메이저 버전이 나올 때까지 1-3번 마이너 릴리즈가 있을 수 있습니다.

* 패치 버전은 거의 매주 발표됩니다.

Angular는 릴리즈 버전의 안정성을 보장하기 위해 메이저 릴리즈와 마이너 릴리즈에 대해서는 베타 릴리즈와 릴리즈 후보(RC) 릴리즈를 먼저 진행합니다.
새로 추가되는 기능은 새로운 메이저 버전이 안정되는 동안 베타 버전을 통해 미리 확인해 볼 수 있습니다.


{@a schedule}
<!--
## Release schedule
-->
## 릴리즈 스케쥴

<div class="alert is-helpful">

<!--
Disclaimer: The dates are offered as general guidance and may be adjusted by us when necessary to ensure delivery of a high-quality platform. 
-->
주의: 이 섹션에서 안내하는 일정은 일반적인 계획일 뿐입니다. 플랫폼의 안정성을 확실하게 보장하기 위해 약간 조정될 수 있습니다.

</div>

<!--
The following table contains our current target release dates for the next two major versions of Angular: 

 Date                   | Stable Release | Compatibility 
 ---------------------- | -------------- | -------------
 October/November 2019  | 9.0.0          | ^8.0.0
 May 2020               | 10.0.0         | ^9.0.0
 
 Compatibility note: The primary goal of the backward compatibility promise is to ensure that changes in the core framework and tooling don't break the existing ecosystem of components and applications and don't put undue upgrade/migration burden on Angular application and component authors.
-->
Angular의 메이저 릴리즈 중 앞으로 있을 2개의 메이저 버전은 다음과 같은 일정으로 배포될 예정입니다:

 일자                   | 안전버전 릴리즈 | 호환되는 버전 표기
 ---------------------- | -------------- | -------------
 2019. 10~11월  | 9.0.0          | ^8.0.0
 2020. 5월               | 10.0.0         | ^9.0.0

호환성 지원 계획: Angular의 하위호환성 보장에 대한 목표는 이렇습니다. 코어 프레임워크와 툴이 변경되었다고 해서 지금까지 동작하고 있는 컴포넌트나 애플리케이션이 동작하지 않는 것은 안되며, Angular 애플리케이션이나 컴포넌트 개발자에게 업그레이드/마이그레이션에 대해 과도한 부담을 주지 않아야 합니다.



{@a lts}
{@a support}
<!--
## Support policy and schedule
-->
## 관리 정책과 일정

<!--
All of our major releases are supported for 18 months. 

* 6 months of *active support*, during which regularly-scheduled updates and patches are released.

* 12 months of *long-term support (LTS)*, during which only critical fixes and security patches are released. 

The following table provides the status for Angular versions under support. 


Version | Status | Released     | Active Ends  | LTS Ends
------- | ------ | ------------ | ------------ | ------------ 
^8.0.0  | Active | May 28, 2019 | Nov 28, 2019 | Nov 28, 2020
^7.0.0  | LTS    | Oct 18, 2018 | Apr 18, 2019 | Apr 18, 2020
^6.0.0  | LTS    | May 3, 2018  | Nov 3, 2018  | Nov 3, 2019

Angular versions ^4.0.0 and ^5.0.0 are no longer under support. 
-->
메이저 버전은 18개월동안 관리됩니다.

* 첫 6개월은 *적극적인 지원(active support)* 기간입니다. 이 기간중에는 정기적으로 업데이트되고 패치도 배포됩니다.

* 다음 12개월은 *장기 지원(long-term support, LTS)* 기간입니다. 이 기간 중에는 꼭 수정되어야 하는 버그나 보안에 대한 패치만 배포됩니다.

그래서 Angular 5.0.0 이후 버전은 다음과 같은 일정으로 관리되고 있습니다.

버전 | 단계 | 릴리즈     | 적극적인 지원 종료  | LTS 종료
------- | ------ | ------------ | ------------ | ------------ 
^8.0.0  | Active | 2019. 5. 28 | 2019. 11. 28 | 2020. 11. 28
^7.0.0  | LTS    | 2018. 10. 18 | 2019. 4. 18 | 2020. 4. 18
^6.0.0  | LTS    | 2018. 5. 3  | 2018. 11. 3  | 2019. 11. 3

Angular ^4.0.0 버전과 ^5.0.0 버전에 대한 지원은 종료되었습니다.

{@a deprecation}
<!--
## Deprecation practices
-->
## 지원이 중단되는 기능

<!--
Sometimes &quot;breaking changes&quot;, such as the removal of support for select APIs and features, are necessary to innovate and stay current with new best practices, changing dependencies, or changes in the (web) platform itself. 

To make these transitions as easy as possible, we make these commitments to you:

* We work hard to minimize the number of breaking changes and to provide migration tools when possible. 

* We follow the deprecation policy described here, so you have time to update your apps to the latest APIs and best practices.

To help ensure that you have sufficient time and a clear path to update, this is our deprecation policy:

* **Announcement:** We announce deprecated APIs and features in the [change log](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log"). Deprecated APIs appear in the [documentation](api?status=deprecated) with ~~strikethrough.~~ When we announce a deprecation, we also announce a recommended update path. For convenience,  [Deprecations](guide/deprecations) contains a summary of deprecated APIs and features. 


* **Deprecation period:** When an API or a feature is deprecated, it will still be present in the [next two major releases](#schedule). After that, deprecated APIs and features will be candidates for removal. A deprecation can be announced in any release, but the removal of a deprecated API or feature will happen only in major release. Until a deprecated API or feature is removed, it will be maintained according to the LTS support policy, meaning that only critical and security issues will be fixed. 


* **npm dependencies:** We only make npm dependency updates that require changes to your apps in a major release. 
In minor releases, we update peer dependencies by expanding the supported versions, but we do not require projects to update these dependencies until a future major version. This means that during minor Angular releases, npm dependency updates within Angular applications and libraries are optional.
-->
API나 기능이 크게 변하는(breaking changes) 릴리즈를 사용하려면 코드를 수정하거나, 의존성 패키지를 변경해야 할 수도 있고, 플랫폼 자체를 바꿔야 할 수도 있습니다.

이런 변화는 의외로 쉽게 발생할 수 있지만 이 경우에 몇 가지는 약속합니다:

* Angular 팀은 큰 변화(breaking changes)를 최소화하기 위해 노력하고 있습니다. 가능하다면 마이그레이션 툴도 제공하겠습니다.

* 지원이 중단되는 기능에 대해서는 사전에 미리 안내하겠습니다. 최신 API를 사용해서 효율적인 코드로 변경할 수 있는 시간을 충분히 제공하겠습니다.

이 두가지를 약속하려면 업데이트에 필요한 시간이 충분히 제공되어야 하고 이후 버전이 어떻게 변경되는지 명확하게 안내해야 합니다. 그래서 우리는 다음과 같은 정책을 마련했습니다:

* **공지:** 사용이 중단되는 기능은 [체인지 로그](https://github.com/angular/angular/blob/master/CHANGELOG.md "Angular change log")에 안내하겠습니다. 사용이 중단되는 기능은 [문서](api?status=deprecated)에 ~~취소선~~ 으로 표시하겠습니다. 그리고 이 기능들에 대해서는 업데이트할 수 있는 방법도 안내하겠습니다. 사용이 중단되는 기능은 [Deprecations](guide/deprecations) 문서에 요약된 내용으로도 제공됩니다.

* **지원 중단 기간:** 사용이 중단되는 API는 [최소한 2개 메이저 릴리즈](#schedule)동안 유지하겠습니다. 사용이 중단되는 API나 기능이 지정되는 것은 어떤 릴리즈라도 상관없지만, 이 기능이 실제로 제거되는 것은 메이저 릴리즈에만 적용하겠습니다. 그리고 이렇게 중단된 API와 기능이라도 LTS 정책을 따르기 때문에, 심각한 결함이나 보안 이슈가 있으면 수정될 수 있습니다.

* **npm 의존성:** npm 패키지 버전이 변경되는 것은 메이저 릴리즈가 변경되면서 꼭 필요할 때만 반영하겠습니다. 마이너 버전이 릴리즈되면서 npm 패키지 버전이 변경되더라도 이것은 지원하는 버전을 더 다양하게 하기 위한 것입니다. 다음 메이저 버전이 있기 전까지는 npm 패키지 버전을 변경하지 않아도 됩니다.

{@a public-api}
<!--
## Public API surface
-->
## 퍼블릭 API 진입점

<!--
Angular is a collection of many packages, sub-projects, and tools. To prevent accidental use of private APIs&mdash;and so that you can clearly understand what is covered by the practices described here&mdash;we document what is and is not considered our public API surface. For details, see [Supported Public API Surface of Angular](https://github.com/angular/angular/blob/master/docs/PUBLIC_API.md "Supported Public API Surface of Angular").

Any changes to the public API surface will be done using the versioning, support, and depreciation policies describe above.
-->
Angular는 수많은 패키지와 서브 프로젝트, 툴의 집합체입니다.
갑작스럽게 아무도 모르는 API가 사용되는 것을 방지하기 위해 퍼블릭 API로 제공되는 목록을 문서화하고 있습니다. 자세한 내용은 [Supported Public API Surface of Angular](https://github.com/angular/angular/blob/master/docs/PUBLIC_API.md "Supported Public API Surface of Angular") 문서를 참고하세요.

퍼블릭 API 진입점이 변경되는 과정은 이 문서에서 설명한 버전 정책, 지원 정책, 지원 중단 정책을 그대로 따릅니다.

{@a labs}
<!--
## Angular Labs
-->
## Angular Labs

<!--
Angular Labs is an initiative to cultivate new features and iterate on them quickly. Angular Labs provides a safe place for exploration and experimentation by the Angular team.

Angular Labs projects are not ready for production use, and no commitment is made to bring them to production. The policies and practices that are described in this document do not apply to Angular Labs projects.
-->
Angular Labs는 새로운 기능을 빠르게 개발하고 확인하기 위해 도입되었습니다.
그리고 이 Angular Labs는 공식 릴리즈와는 다른 곳에서 Angular 팀에 의해 안전하게 관리되고 있습니다.

Angular Labs에서 진행하는 프로젝트들은 아직 운영용으로 활용할 단계까지 준비되지 않았으며, 운영용 코드에 아무것도 반영되지 않았습니다. 이 문서에서 다룬 정책은 Angular Labs 프로젝트에 적용되지 않습니다.