<!--
<h1 class="no-toc">Tutorial: Tour of Heroes</h1>
-->
<h1 class="no-toc">튜토리얼: 히어로들의 여행</h1>

<!--
The _Tour of Heroes_ tutorial covers the fundamentals of Angular.  
In this tutorial you will build an app that helps a staffing agency manage its stable of heroes.
-->
_히어로들의 여행_ 튜토리얼은 Angular의 기본 기능을 다룹니다.

<!--
This basic app has many of the features you'd expect to find in a data-driven application.
It acquires and displays a list of heroes, edits a selected hero's detail, and navigates among different views of heroic data.
-->
이 튜토리얼에서는 히어로 인력 회사에서 히어로들을 안정적으로 관리할 때 사용하는 앱을 만들 것입니다.

히어로 관리 앱은 데이터 드리븐 애플리케이션에서 활용할 수 있는 다양한 기능을 제공합니다.
히어로들의 목록을 가져와 표시하고, 히어로의 정보를 편집하며, 히어로의 데이터를 다양한 방식으로 표시합니다.

<!--
By the end of the tutorial you will be able to do the following:
-->
튜토리얼을 마지막까지 진행하면 다음 내용에 대해 알게 될것입니다.

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
* Angular에서 기본으로 제공하는 디렉티브를 활용해서 전체 히어로 목록을 표시하며, 특정 히어로의 데이터를 표시하거나 표시하지 않을 수 있습니다.
* 히어로들의 목록과 상세 정보를 표시하는 Angular 컴포넌트를 생성할 수 있습니다.
* 단방향 데이터 바인딩을 사용해서 읽기전용 데이터를 표시합니다.
* 양방향 데이터 바인딩을 사용하면 입력 필드와 모델을 동기화할 수 있습니다.
* 키보드 입력이나 마우스 클릭과 같은 사용자 이벤트를 컴포넌트 메서드와 바인딩할 수 있습니다.
* 사용자가 목록에서 히어로을 선택하면 상세 화면으로 전환하고, 이 화면에서 해당 히어로의 정보를 편집할 수 있습니다.
* 파이프를 사용하면 데이터가 화면에 표시되는 형식을 지정할 수 있습니다.
* 히어로의 정보를 여러 뷰에서 사용하려면 서비스를 사용합니다.
* 뷰와 컴포넌트는 라우터로 전환합니다.

<!--
You'll learn enough Angular to get started and gain confidence that
Angular can do whatever you need it to do.
-->
위 내용을 구현하면서 Angular가 제공하는 기능을 다양하게 살펴보기 때문에, 튜토리얼을 끝낼 쯤이면 Angular로 새로운 프로젝트를 시작하는 것에 어려움을 느끼지 않을 것입니다.

<!--
After completing all tutorial steps, the final app will look like this <live-example name="toh-pt6"></live-example>.
-->
완성된 튜토리얼은 <live-example name="toh-pt6"></live-example> 에서 확인하거나 다운받을 수 있습니다.


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
실제 앱은 다음과 같이 동작합니다:

<figure>
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour of Heroes in Action">
</figure>
