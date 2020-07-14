<!--
<h1 class="no-toc">Tour of Heroes app and tutorial</h1>
-->
<h1 class="no-toc">히어로들의 여행 튜토리얼</h1>

<div class="callout is-helpful">
<!--
<header>Getting Started</header>

In this tutorial, you build your own app from the ground up, providing experience with the typical development process, as well as an introduction to basic app-design concepts, tools, and terminology.

If you're completely new to Angular, you might want to try the [**Try it now**](start) quick-start app first.
It is based on a ready-made  partially-completed project, which you can examine and modify in the StacBlitz interactive development environment, where you can see the results in real time.

The "Try it" tutorial covers the same major topics&mdash;components, template syntax, routing, services, and accessing data via HTTP&mdash;in a condensed format, following the most current best practices.
-->
<header>튜토리얼 시작하기</header>

In this tutorial, you build your own app from the ground up, providing experience with the typical development process, as well as an introduction to basic app-design concepts, tools, and terminology.

아직 Angular에 익숙하지 않다면 [**시작하기 튜토리얼**](start) 문서를 먼저 보는 것을 권장합니다.
It is based on a ready-made  partially-completed project, which you can examine and modify in the StacBlitz interactive development environment, where you can see the results in real time.

It is based on a ready-made  partially-completed project, which you can examine and modify in the StacBlitz interactive development environment, where you can see the results in real time.

The "Try it" tutorial covers the same major topics&mdash;components, template syntax, routing, services, and accessing data via HTTP&mdash;in a condensed format, following the most current best practices.
</div>

<!--
This _Tour of Heroes_ tutorial shows you how to set up your local development environment and develop an app using the [Angular CLI tool](cli "CLI command reference"), and provides an introduction to the fundamentals of Angular.

The _Tour of Heroes_ app that you build helps a staffing agency manage its stable of heroes.
The app has many of the features you'd expect to find in any data-driven application.
The finished app acquires and displays a list of heroes, edits a selected hero's detail, and navigates among different views of heroic data.

You will find references to and expansions of this app domain in many of the examples used throughout the Angular documentation, but you don't necessarily need to work through this tutorial to understand those examples.

By the end of this tutorial you will be able to do the following:

* Use built-in Angular [directives](guide/glossary#directive "Directives definition") to show and hide elements and display lists of hero data.
* Create Angular [components](guide/glossary#component "Components definition") to display hero details and show an array of heroes.
* Use one-way [data binding](guide/glossary#data-binding "Data binding definition") for read-only data.
* Add editable fields to update a model with two-way data binding.
* Bind component methods to user events, like keystrokes and clicks.
* Enable users to select a hero from a master list and edit that hero in the details view.
* Format data with [pipes](guide/glossary#pipe "Pipe definition").
* Create a shared [service](guide/glossary#service "Service definition") to assemble the heroes.
* Use [routing](guide/glossary#router "Router definition") to navigate among different views and their components.

You'll learn enough Angular to get started and gain confidence that
Angular can do whatever you need it to do.

<div class="callout is-helpful">
<header>Solution</header>

After completing all tutorial steps, the final app will look like this: <live-example name="toh-pt6"></live-example>.

</div>
-->
This _Tour of Heroes_ tutorial shows you how to set up your local development environment and develop an app using the [Angular CLI tool](cli "CLI command reference"), and provides an introduction to the fundamentals of Angular.

The _Tour of Heroes_ app that you build helps a staffing agency manage its stable of heroes.
The app has many of the features you'd expect to find in any data-driven application.
The finished app acquires and displays a list of heroes, edits a selected hero's detail, and navigates among different views of heroic data.

You will find references to and expansions of this app domain in many of the examples used throughout the Angular documentation, but you don't necessarily need to work through this tutorial to understand those examples.

튜토리얼을 마지막까지 진행하면 다음 내용에 대해 알게 될 것입니다.

* Angular가 제공하는 [디렉티브](guide/glossary#directive "Directives definition")를 활용해서 전체 히어로 목록을 표시할 수 있으며, 특정 히어로의 데이터를 표시하거나 표시하지 않을 수 있습니다.
* 히어로들의 목록과 상세 정보를 표시하는 Angular [컴포넌트](guide/glossary#component "Components definition")를 생성할 수 있습니다.
* 단방향 [데이터 바인딩](guide/glossary#data-binding "Data binding definition")을 사용해서 읽기전용 데이터를 표시합니다.
* 양방향 데이터 바인딩을 사용하면 입력 필드와 모델을 동기화할 수 있습니다.
* 키보드 입력이나 마우스 클릭과 같은 사용자 이벤트를 컴포넌트 메소드와 바인딩할 수 있습니다.
* 사용자가 목록에서 히어로을 선택하면 상세 화면으로 전환하고, 이 화면에서 해당 히어로의 정보를 편집할 수 있습니다.
* [파이프](guide/glossary#pipe "Pipe definition")를 사용하면 데이터가 화면에 표시되는 형식을 지정할 수 있습니다.
* [서비스][service](guide/glossary#service "Service definition")를 사용하면 여러 컴포넌트에서 히어로의 정보를 함께 사용할 수 있습니다.
* 뷰와 컴포넌트는 [라우터](guide/glossary#router "Router definition")로 전환합니다.

이 내용들을 구현하면서 Angular가 제공하는 기능을 다양하게 살펴보기 때문에, 튜토리얼을 끝낼때 쯤이면 Angular로 새로운 프로젝트를 시작하는 것에 어려움을 느끼지 않을 것입니다.

<div class="callout is-helpful">
<header>솔루션</header>

완성된 튜토리얼은 <live-example name="toh-pt6"></live-example> 에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


<!--
## What you'll build
-->
## 앞으로 개발할 앱

<!--
Here's a visual idea of where this tutorial leads, beginning with the "Dashboard"
view and the most heroic heroes:

<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Output of heroes dashboard">
</div>

You can click the two links above the dashboard ("Dashboard" and "Heroes")
to navigate between this Dashboard view and a Heroes view.

If you click the dashboard hero "Magneta," the router opens a "Hero Details" view
where you can change the hero's name.

<div class="lightbox">
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Details of hero in app">
</div>

Clicking the "Back" button returns you to the Dashboard.
Links at the top take you to either of the main views.
If you click "Heroes," the app displays the "Heroes" master list view.


<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Output of heroes list app">
</div>

When you click a different hero name, the read-only mini detail beneath the list reflects the new choice.

You can click the "View Details" button to drill into the
editable details of the selected hero.

The following diagram captures all of the navigation options.

<div class="lightbox">
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</div>

Here's the app in action:

<div class="lightbox">
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour of Heroes in Action">
</div>
-->
튜토리얼 앱을 시작하면 최고의 히어로를 표시하는 대시보드 화면을 표시합니다:

<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Output of heroes dashboard">
</div>

대시보드 위쪽의 두 링크("Dashboard"와 "Heroes")를 클릭하면 Dashboard 뷰와 Heroes 뷰를 전환합니다.

그리고 대시보드에서 "Magneta" 히어로를 선택하면 해당 히어로의 이름을 변경할 수 있는 히어로 상세 정보 화면을 표시합니다.

<div class="lightbox">
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Details of hero in app">
</div>

히어로 상세 정보 화면에서 "Back" 버튼을 클릭하면 대시보드 화면으로 돌아갑니다.
그리고 뷰 위쪽에 있는 링크를 사용해도 대시보드 화면으로 돌아갈 수 있으며, "Heroes" 링크를 클릭하면 히어로의 목록을 표시하는 뷰로 전환합니다.


<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Output of heroes list app">
</div>

히어로 목록 화면에서 히어로를 한 명 선택하면, 목록 아래에 히어로의 이름을 표시하기만 하는 뷰를 표시합니다.

그리고 "View Details" 버튼을 선택하면 히어로의 이름을 수정하는 뷰를 표시합니다.

아래 다이어그램을 보면서 이 앱의 페이지 구성을 확인해 보세요.

<div class="lightbox">
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</div>

앱을 실제로 실행하면 다음과 같이 동작합니다:

<div class="lightbox">
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour of Heroes in Action">
</div>