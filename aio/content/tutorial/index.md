<h1 class="no-toc">튜토리얼: 히어로들의 여행</h1>

_히어로들의 여행_ 튜토리얼은 Angular의 기본을 다루고 있습니다.
이 튜토리얼에서는 히어로 인력 회사에서 히어로들을 안정적으로 관리하는데 도움이 되는 앱을 만들 것입니다.

이 기본 앱은 데이터 드리븐 애플리케이션에서 기대할 수 있는 다양한 기능을 가지고 있습니다.
히어로들의 목록을 얻어 표시하고, 선택된 히어로의 상세 내용을 편집하며, 히어로의 데이터를 표시하는 다양한 뷰들을 이동할 수 있습니다.

이 튜토리얼의 마지막까지 따라가신다면 여러분은 아래의 내용들을 하실 수 있게 될것입니다.

* Angular의 빌트인 디렉티브를 활용하여 히어로 데이터를 표시하고 숨기며 목록을 표시합니다.
* 히어로들의 리스트와 상세 화면을 표시하는 Angular 컴포넌트를 생성합니다.
* 읽기전용 데이터를 위해 단방향 데이터 바인딩을 사용합니다.
* 양방향 데이터 바인딩으로 모델을 갱신하기 위하여 편집 가능한 필드를 추가합니다.
* 키보드 입력이나 마우스 클릭과 같은 사용자 이벤트에 컴포넌트 메서드를 바인딩합니다.
* 사용자가 목록에서 히어로을 선택하고 상세 화면에서 해당 히어로의 정보를 편집할 수 있도록 합니다.
* 파이프를 통하여 데이터를 포맷합니다.
* 히어로을 조합하기 위한 공유 서비스를 생성합니다.
* 라우팅을 사용하여 서로 다른 뷰와 컴포넌트사이를 이동합니다.

여러분은 Angular를 통하여 충분히 개발을 시작할 수 있을 만큼 배우게 될 것이고, 그 개발에 필요한 모든 것을 Angular가 할 수 있다는 자심감을 얻을 것입니다.

모든 튜토리얼 스텝을 마치고 나면, 최종적인 앱은 <live-example name="toh-pt6"></live-example> 와 같습니다.


## 앞으로 개발할 앱은 아래와 같습니다.

가장 뛰어난 히어로들을 표시하는 대시보드 화면을 시작으로 한 이 튜토리얼의 화면 구성은 아래와 같습니다:

<figure>
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Output of heroes dashboard">
</figure>

대시보드 상단의 두 링크를 클릭("Dashboard"와 "Heroes")하여 대시보드 뷰와 히어로즈 뷰 사이를 이동할 수 있습니다.

예를들어 대시보드에서 "Magneta" 히어로을 선택할 경우, 라우터는 해당 히어로의 이름을 변경할 수 있는 "Hero Details" 화면을 표시합니다.

<figure>
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Details of hero in app">
</figure>

"Back"버튼을 클릭하면 대시보드 화면으로 돌아갑니다.
상단에 있는 링크들을 통해 각각의 메인뷰로 이동할 수 있습니다.
만약 "히어로"을 클릭하면, 앱은 히어로의 메인 리스트를 뷰를 보여줍니다.


<figure>
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Output of heroes list app">
</figure>


한 히어로의 이름을 클릭할 경우, 히어로들의 리스트 하단에 읽기만 가능한 작은 디테일 뷰가 표시가 됩니다.

"View Details"버튼을 선택할 경우 선택한 히어로의 대하여 수정이 가능한 디테일뷰가 표시됩니다.

아래의 다이어그램은 모든 네비게이션 경로에 대해 표시하고 있습니다.

<figure>
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</figure>

Here's the app in action:

실제 앱은 아래처럼 동작합니다.

<figure>
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour of Heroes in Action">
</figure>
