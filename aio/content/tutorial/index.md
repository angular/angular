<h1 class="no-toc">Tour of Heroes App and Tutorial</h1>


<div class="callout is-helpful">
<header>Getting Started Tutorial</header>


If you're new to Angular, see the [**Getting Started tutorial.**](start) 
The Getting Started tutorial covers the same major topics as this Tour of Heroes&mdash;components, template syntax, routing, services, and accessing data via HTTP&mdash;in a condensed format, following the most current best practices. 

**This Tour of Heroes tutorial** is the conceptual basis for many examples in this documentation set. Reading this introduction page provides sufficient context for working with those examples. You do not need to do this tutorial to understand those other examples. The Tour of Heroes tutorial is maintained here for context and continuity. 

</div> 

This _Tour of Heroes_ tutorial provides an introduction to the fundamentals of Angular. 
It shows you how to set up your local development environment and develop an app using the [Angular CLI tool](cli "CLI command reference"). 

In this _Tour of Heroes_ tutorial, you will build an app that helps a staffing agency manage its stable of heroes.

This app has many of the features you'd expect to find in a data-driven application.
It acquires and displays a list of heroes, edits a selected hero's detail, and navigates among different views of heroic data.

<!--
By the end of this tutorial you will be able to do the following:
-->
튜토리얼을 마지막까지 진행하면 다음 내용에 대해 알게 될 것입니다.

<!--
* Use built-in Angular directives to show and hide elements and display lists of hero data.
* Create Angular components to display hero details and show an array of heroes.
* Use one-way data binding for read-only data.
* Add editable fields to update a model with two-way data binding.
* Bind component methods to user events, like keystrokes and clicks.
* Enable users to select a hero from a master list and edit that hero in the details view. 
* Format data with pipes.
* Create a shared service to assemble the heroes.
* Use routing to navigate among different views and their components.
-->
* Angular가 제공하는 디렉티브를 활용해서 전체 히어로 목록을 표시할 수 있으며, 특정 히어로의 데이터를 표시하거나 표시하지 않을 수 있습니다.
* 히어로들의 목록과 상세 정보를 표시하는 Angular 컴포넌트를 생성할 수 있습니다.
* 단방향 데이터 바인딩을 사용해서 읽기전용 데이터를 표시합니다.
* 양방향 데이터 바인딩을 사용하면 입력 필드와 모델을 동기화할 수 있습니다.
* 키보드 입력이나 마우스 클릭과 같은 사용자 이벤트를 컴포넌트 메소드와 바인딩할 수 있습니다.
* 사용자가 목록에서 히어로을 선택하면 상세 화면으로 전환하고, 이 화면에서 해당 히어로의 정보를 편집할 수 있습니다.
* 파이프를 사용하면 데이터가 화면에 표시되는 형식을 지정할 수 있습니다.
* 서비스를 사용하면 여러 컴포넌트에서 히어로의 정보를 함께 사용할 수 있습니다.
* 뷰와 컴포넌트는 라우터로 전환합니다.

<!--
You'll learn enough Angular to get started and gain confidence that
Angular can do whatever you need it to do. 
-->
이 내용들을 구현하면서 Angular가 제공하는 기능을 다양하게 살펴보기 때문에, 튜토리얼을 끝낼때 쯤이면 Angular로 새로운 프로젝트를 시작하는 것에 어려움을 느끼지 않을 것입니다.

<div class="callout is-helpful">
<header>Solution</header>

<!--
After completing all tutorial steps, the final app will look like this: <live-example name="toh-pt6"></live-example>.
-->
완성된 튜토리얼은 <live-example name="toh-pt6"></live-example> 에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


<!--
## What you'll build
-->
## 앞으로 개발할 앱

<!--
Here's a visual idea of where this tutorial leads, beginning with the "Dashboard"
view and the most heroic heroes:
-->
튜토리얼 앱을 시작하면 최고의 히어로를 표시하는 대시보드 화면을 표시합니다:

<figure>
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Output of heroes dashboard">
</figure>

<!--
You can click the two links above the dashboard ("Dashboard" and "Heroes")
to navigate between this Dashboard view and a Heroes view.
-->
대시보드 위쪽의 두 링크("Dashboard"와 "Heroes")를 클릭하면 Dashboard 뷰와 Heroes 뷰를 전환합니다.

<!--
If you click the dashboard hero "Magneta," the router opens a "Hero Details" view
where you can change the hero's name.
-->
그리고 대시보드에서 "Magneta" 히어로를 선택하면 해당 히어로의 이름을 변경할 수 있는 히어로 상세 정보 화면을 표시합니다.

<figure>
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Details of hero in app">
</figure>

<!--
Clicking the "Back" button returns you to the Dashboard.
Links at the top take you to either of the main views.
If you click "Heroes," the app displays the "Heroes" master list view.
-->
히어로 상세 정보 화면에서 "Back" 버튼을 클릭하면 대시보드 화면으로 돌아갑니다.
그리고 뷰 위쪽에 있는 링크를 사용해도 대시보드 화면으로 돌아갈 수 있으며, "Heroes" 링크를 클릭하면 히어로의 목록을 표시하는 뷰로 전환합니다.


<figure>
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Output of heroes list app">
</figure>

<!--
When you click a different hero name, the read-only mini detail beneath the list reflects the new choice.
-->
히어로 목록 화면에서 히어로를 한 명 선택하면, 목록 아래에 히어로의 이름을 표시하기만 하는 뷰를 표시합니다.

<!--
You can click the "View Details" button to drill into the
editable details of the selected hero.
-->
그리고 "View Details" 버튼을 선택하면 히어로의 이름을 수정하는 뷰를 표시합니다.

<!--
The following diagram captures all of the navigation options.
-->
아래 다이어그램을 보면서 이 앱의 페이지 구성을 확인해 보세요.

<figure>
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</figure>

<!--
Here's the app in action:
-->
앱을 실제로 실행하면 다음과 같이 동작합니다:

<figure>
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour of Heroes in Action">
</figure>
