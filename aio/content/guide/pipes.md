<!--
# Pipes
-->
# 파이프

<!--
Every application starts out with what seems like a simple task: get data, transform them, and show them to users.
Getting data could be as simple as creating a local variable or as complex as streaming data over a WebSocket.
-->
애플리케이션이 수행하는 로직을 모두 동일합니다. 데이터를 가져와서, 적절하게 처리하고, 사용자에게 표시합니다.
이때 사용하는 데이터가 지역 변수인지 스트리밍 데이터나 웹소켓인지에 따라 데이터를 가져오는 로직은 달라질 수 있습니다.

<!--
Once data arrives, you could push their raw `toString` values directly to the view,
but that rarely makes for a good user experience.
For example, in most use cases, users prefer to see a date in a simple format like
<samp>April 15, 1988</samp> rather than the raw string format
<samp>Fri Apr 15 1988 00:00:00 GMT-0700 (Pacific Daylight Time)</samp>.
-->
가져온 데이터를 화면에 표시하려면 `toString` 을 바로 사용할 수도 있지만, 이렇게 표시하는 데이터는 사용자가 보기에 적합하지 않습니다.
사용자의 입장에서 생각해보면 <samp>Fri Apr 15 1988 00:00:00 GMT-0700 (Pacific Daylight Time)</samp>과 같이 날짜를 문자열로 바로 변환한 표현보다 <samp>April 15, 1988</samp>와 같은 표현이 사용자가 보기에 더 좋은 것이 당연합니다.

<!--
Clearly, some values benefit from a bit of editing. You may notice that you
desire many of the same transformations repeatedly, both within and across many applications.
You can almost think of them as styles.
In fact, you might like to apply them in your HTML templates as you do styles.
-->
그래서 화면에 표시되는 데이터는 사용자가 보기 편한 형식으로 변환하는 것이 좋습니다.
이 때 데이터를 변환하는 로직이 애플리케이션 전반에 필요하다면 이 로직을 어디에 작성하는 것이 좋은지 고민을 해볼 수 있습니다.
왜냐하면 화면에 표시되는 데이터의 종류가 같다면 일관된 형식으로 변환하는 것이 좋기 때문입니다.

<!--
Introducing Angular pipes, a way to write display-value transformations that you can declare in your HTML.
-->
Angular 파이프는 화면에 표시되는 데이터를 일관되게 변환할 때 사용합니다.

<!--
You can run the <live-example></live-example> in Stackblitz and download the code from there.
-->
이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<!--
## Using pipes
-->
## 파이프 사용하기

<!--
A pipe takes in data as input and transforms it to a desired output.
In this page, you'll use pipes to transform a component's birthday property into
a human-friendly date.
-->
파이프는 데이터를 입력으로 받고, 이 데이터를 특정 형식으로 변환해서 반환합니다.
다음 예제는 컴포넌트에 있는 날짜 데이터를 사용자에게 효율적으로 표시하기 위해 파이프를 어떻게 사용할 수 있는지 알아봅니다.

<code-example path="pipes/src/app/hero-birthday1.component.ts" header="src/app/hero-birthday1.component.ts" linenums="false">

</code-example>


<!--
Focus on the component's template.
-->
컴포넌트 템플릿을 자세히 봅시다.

<code-example path="pipes/src/app/app.component.html" region="hero-birthday-template" header="src/app/app.component.html" linenums="false">

</code-example>


<!--
Inside the interpolation expression, you flow the component's `birthday` value through the
[pipe operator](guide/template-syntax#pipe) ( | ) to the [Date pipe](api/common/DatePipe)
function on the right. All pipes work this way.
-->
문자열 삽입 표현식 안에 사용된 것을 보면, 순서대로 `birthday` 프로퍼티, [파이프 연산자](guide/template-syntax#pipe) (`|`), [Date 파이프](api/common/DatePipe) 입니다.
데이터는 파이프 연산자를 통해 특정 파이프로 전달되며, 모든 파이프가 이 방식으로 동작합니다.


<!--
## Built-in pipes
-->
## 기본 파이프
<!--
Angular comes with a stock of pipes such as
`DatePipe`, `UpperCasePipe`, `LowerCasePipe`, `CurrencyPipe`, and `PercentPipe`.
They are all available for use in any template.
-->
Angular는 `DatePipe`, `UpperCasePipe`, `LowerCasePipe`, `CurrencyPipe`, `PercentPipe`와 같은 파이프를 기본으로 제공합니다.
이 파이프들은 모든 템플릿에 자유롭게 사용할 수 있습니다.

<div class="alert is-helpful">


<!--
Read more about these and many other built-in pipes in the [pipes topics](api?type=pipe) of the
[API Reference](api); filter for entries that include the word "pipe".

Angular doesn't have a `FilterPipe` or an `OrderByPipe` for reasons explained in the [Appendix](guide/pipes#no-filter-pipe) of this page.
-->
각각의 파이프에 대해 알아보고 싶거나 기본 파이프에 대해 좀 더 알아보려면 [API 문서](api)에서 파이프를 검색해 보세요. [이 링크](api?type=pipe)는 검색 결과로 바로 이동합니다.

Angular에서 제공하는 기본 파이프 중에 `FilterPipe`나 `orderByPipe`는 없습니다. 그 이유에 대해서는 이 문서의 [부록](guide/pipes#no-filter-pipe) 부분을 참고하세요.

</div>



<!--
## Parameterizing a pipe
-->
## 파이프 인자 사용하기

<!--
A pipe can accept any number of optional parameters to fine-tune its output.
To add parameters to a pipe, follow the pipe name with a colon ( : ) and then the parameter value
(such as `currency:'EUR'`). If the pipe accepts multiple parameters, separate the values with colons (such as `slice:1:5`)
-->
파이프의 결과물을 특정 형식으로 지정하려면 인자를 전달할 수도 있습니다.
파이프 인자는 파이프 이름 뒤에 콜론(`:`)을 붙이고 지정합니다.
그래서 간단하게는 `currency:'EUR'`와 같이 사용할 수 있으며, 콜론을 여러개 사용하면 `slice:1:5`와 같이 여러 인자를 전달할 수도 있습니다.

<!--
Modify the birthday template to give the date pipe a format parameter.
After formatting the hero's April 15th birthday, it renders as **<samp>04/15/88</samp>**:
-->
템플릿에 생년월일을 표시할 때 특정 형식을 인자로 지정해 보겠습니다.
**<samp>04/15/88</samp>**과 같이 표시하려면 다음과 같이 작성합니다:

<code-example path="pipes/src/app/app.component.html" region="format-birthday" header="src/app/app.component.html" linenums="false">

</code-example>


<!--
The parameter value can be any valid template expression,
(see the [Template expressions](guide/template-syntax#template-expressions) section of the
[Template Syntax](guide/template-syntax) page)
such as a string literal or a component property.
In other words, you can control the format through a binding the same way you control the birthday value through a binding.
-->
파이프 인자는 [템플릿 표현식](guide/template-syntax#템플릿-표현식) 에 적합하다면 어떠한 형태로든 사용할 수 있습니다.
그래서 문자열은 물론이고 컴포넌트 프로퍼티도 사용할 수 있는데, 이 방법을 활용하면 파이프의 동작을 컴포넌트 클래스에서 지정할 수도 있습니다.

<!--
Write a second component that *binds* the pipe's format parameter
to the component's `format` property. Here's the template for that component:
-->
컴포넌트 클래스에 있는 `format` 프로퍼티를 파이프 인자로 *바인딩 하는* 컴포넌트를 작성해 봅시다.
이 컴포넌트의 템플릿은 다음과 같이 작성합니다:

<code-example path="pipes/src/app/hero-birthday2.component.ts" region="template" header="src/app/hero-birthday2.component.ts (template)" linenums="false">

</code-example>


<!--
You also added a button to the template and bound its click event to the component's `toggleFormat()` method.
That method toggles the component's `format` property between a short form
(`'shortDate'`) and a longer form (`'fullDate'`).
-->
그리고 템플릿에 버튼을 추가하는데, 이 버튼을 클릭할 때마다 `toggleFormat()` 함수를 실행합니다.
이 함수는 컴포넌트의 `format` 프로퍼티를 간단한 형식(`'shortDate'`)이나 자세한 형식(`'fullDate'`)으로 지정합니다.

<code-example path="pipes/src/app/hero-birthday2.component.ts" region="class" header="src/app/hero-birthday2.component.ts (class)" linenums="false">

</code-example>


<!--
As you click the button, the displayed date alternates between
"**<samp>04/15/1988</samp>**" and
"**<samp>Friday, April 15, 1988</samp>**".
-->
앱을 실행하고 버튼을 클릭하면 템플릿에 적용되는 파이프의 형식이 바뀌는 것을 확인할 수 있습니다.

<figure>
  <img src='generated/images/guide/pipes/date-format-toggle-anim.gif' alt="Date Format Toggle">
</figure>



<div class="alert is-helpful">


<!--
Read more about the `DatePipe` format options in the [Date Pipe](api/common/DatePipe)
API Reference page.
-->
`DatePipe`에 적용할 수 있는 옵션을 확인하려면 [Date Pipe](api/common/DatePipe) 문서를 참고하세요.

</div>


<!--
## Chaining pipes
-->
## 파이프 체이닝

<!--
You can chain pipes together in potentially useful combinations.
In the following example, to display the birthday in uppercase,
the birthday is chained to the `DatePipe` and on to the `UpperCasePipe`.
The birthday displays as **<samp>APR 15, 1988</samp>**.
-->
파이프는 체이닝해서 여러 파이프를 한 번에 적용할 수도 있습니다.
아래 예제는 생년월일을 `DatePipe`로 처리한 후에 `UpperasePipe`로 다시 한 번 처리해서 최종 결과를 대문자로 표시합니다.
화면에는 **<samp>APR 15, 1988</samp>**과 같이 표시됩니다.

<code-example path="pipes/src/app/app.component.html" region="chained-birthday" header="src/app/app.component.html" linenums="false">

</code-example>


<!--
This example&mdash;which displays **<samp>FRIDAY, APRIL 15, 1988</samp>**&mdash;chains
the same pipes as above, but passes in a parameter to `date` as well.
-->
같은 방식으로 파이프를 체이닝하면서 `date` 파이프에 인자를 지정하면 **<samp>FRIDAY, APRIL 15, 1988</samp>**과 같은 형식으로도 표현할 수 있습니다.

<code-example path="pipes/src/app/app.component.html" region="chained-parameter-birthday" header="src/app/app.component.html" linenums="false">

</code-example>



<!--
## Custom pipes
-->
## 커스텀 파이프

<!--
You can write your own custom pipes.
Here's a custom pipe named `ExponentialStrengthPipe` that can boost a hero's powers:
-->
기본 파이프 기능 외에 다른 기능이 필요하다면 커스텀 파이프를 만들어서 활용할 수도 있습니다.
이번에는 히어로의 파워를 증폭시키는 `ExponentialStrengthPipe` 를 만들어 봅시다.

<code-example path="pipes/src/app/exponential-strength.pipe.ts" header="src/app/exponential-strength.pipe.ts" linenums="false">

</code-example>


<!--
This pipe definition reveals the following key points:

* A pipe is a class decorated with pipe metadata.
* The pipe class implements the `PipeTransform` interface's `transform` method that
accepts an input value followed by optional parameters and returns the transformed value.
* There will be one additional argument to the `transform` method for each parameter passed to the pipe.
Your pipe has one such parameter: the `exponent`.
* To tell Angular that this is a pipe, you apply the
`@Pipe` decorator, which you import from the core Angular library.
* The `@Pipe` decorator allows you to define the
   pipe name that you'll use within template expressions. It must be a valid JavaScript identifier.
   Your pipe's name is `exponentialStrength`.
-->
커스텀 파이프를 정의하는 과정에는 다음과 같은 내용이 중요합니다.

* 파이프는 파이프 데코레이터와 메타데이터가 지정된 클래스입니다.
* 파이프 클래스는 `PipeTransform` 인터페이스를 활용해서 구현하며, 파이프의 동작은 이 인터페이스에 있는 `transform` 메소드 안에 구현합니다. 이 함수는 입력 값과 파이프 옵션을 인자로 받고 변환된 값을 반환합니다.
* 이 예제에서는 파이프 옵션으로 `exponent`를 받습니다.
* 커스텀 파이프를 Angular에 등록하려면 `@Pipe` 데코레이터를 사용합니다. 이 데코레이터는 Angular 코어 라이브러리에 있습니다.
* `@Pipe` 데코레이터에는 템플릿 표현식에 사용할 파이프 이름을 지정합니다. 파이프 이름은 JavaScript 문법에 적합하게 지정해야 하며, 이 예제에서는 `exponentialStrength`로 지정했습니다.

<div class="alert is-helpful">

<!--
## The *PipeTransform* interface
-->
## *PipeTransform* 인터페이스

<!--
The `transform` method is essential to a pipe.
The `PipeTransform` *interface* defines that method and guides both tooling and the compiler.
Technically, it's optional; Angular looks for and executes the `transform` method regardless.
-->
파이프는 `transform` 메소드가 중요합니다.
이 함수는 `PipeTransform` *인터페이스* 에서 정의하고 있으며, Angular가 해당 파이프를 제대로 동작시키기 위해서도 꼭 정의되어야 합니다.
문법적으로는 이 인터페이스를 사용하지 않더라도 Angular가 `transform` 메소드를 확인하면 파이프로 인식하고 실행합니다.

</div>

<!--
Now you need a component to demonstrate the pipe.
-->
이제 파이프를 테스트하기 위해 컴포넌트를 하나 만듭니다.

<code-example path="pipes/src/app/power-booster.component.ts" header="src/app/power-booster.component.ts" linenums="false">
</code-example>

<figure>
  <img src='generated/images/guide/pipes/power-booster.png' alt="Power Booster">
</figure>


<!--
Note the following:

* You use your custom pipe the same way you use built-in pipes.
* You must include your pipe in the `declarations` array of the `AppModule`.
-->
다음 내용을 확인해 보세요:

* 커스텀 파이프를 사용하는 방법은 기본 파이프를 사용하는 방법과 같습니다.
* 커스텀 파이프는 `AppModule`의 `declarations`에 등록해야 사용할 수 있습니다.

<div class="callout is-helpful">

<header>
  <!--
  Remember the declarations array
  -->
  declarations 배열에 꼭 등록하세요.
</header>

<!--
You must register custom pipes.
If you don't, Angular reports an error.
The [Angular CLI's](cli) generator registers the pipe automatically.
-->
커스텀 파이프는 `AppModule`에 등록해야 사용할 수 있으며, 등록하지 않은 파이프를 사용하면 Angular에서 에러가 발생합니다.
[Angular CLI](cli)를 사용해서 파이프를 생성하면, 이 파이프는 `AppModule`에 자동으로 등록됩니다.

</div>


<!--
To probe the behavior in the <live-example></live-example>,
change the value and optional exponent in the template.
-->
<live-example></live-example>에서 파이프가 동작하는 것을 직접 확인해 보세요.

<!--
## Power Boost Calculator
-->
## 파워 증폭 계산기

<!--
It's not much fun updating the template to test the custom pipe.
Upgrade the example to a "Power Boost Calculator" that combines
your pipe and two-way data binding with `ngModel`.
-->
그런데 커스텀 파이프를 테스트할 때마다 템플릿을 수정해야 하는 것은 좋은 방법이 아닙니다.
이전에 만들었던 예제에 양방향 데이터 바인딩을 추가해서 "파워 증폭 계산기"를 만들어 봅시다.

<code-example path="pipes/src/app/power-boost-calculator.component.ts" header="src/app/power-boost-calculator.component.ts">

</code-example>



<figure>
  <img src='generated/images/guide/pipes/power-boost-calculator-anim.gif' alt="Power Boost Calculator">
</figure>



<!--
{@a change-detection}
-->
{@a 변화-감지}

<!--
## Pipes and change detection
-->
## 파이프와 변화 감지

<!--
Angular looks for changes to data-bound values through a *change detection* process that runs after every DOM event:
every keystroke, mouse move, timer tick, and server response. This could be expensive.
Angular strives to lower the cost whenever possible and appropriate.

Angular picks a simpler, faster change detection algorithm when you use a pipe.
-->
Angular는 키보드 입력, 마우스 이동, 타이머 만료, 서버 응답 등 DOM에서 발생하는 이벤트를 확인하면 *변화 감지* 로직을 수행하고 바인딩된 값이 변경되었는지 확인합니다.
그래서 Angular 팀은 이 변화 감지 로직이 최대한 적은 리소스로 동작할 수 있도록 항상 신경쓰고 있습니다.

그리고 파이프를 사용할 때는 좀 더 간단하고 빠른 변화 감지 알고리즘을 활용합니다.

<!--
<h3 class="no-toc">No pipe</h3>
-->
<h3 class="no-toc">파이프 적용 전</h3>

<!--
In the next example, the component uses the default, aggressive change detection strategy to monitor and update
its display of every hero in the `heroes` array. Here's the template:
-->
이번에 다루는 예제는 컴포넌트의 기본 변화 감지 정책을 사용합니다. 이 예제에서는 `heroes` 배열에 있는 모든 히어로를 화면에 표시하며, 템플릿은 다음과 같이 정의합니다:

<code-example path="pipes/src/app/flying-heroes.component.html" region="template-1" header="src/app/flying-heroes.component.html (v1)" linenums="false">

</code-example>


<!--
The companion component class provides heroes, adds heroes into the array, and can reset the array.
-->
그리고 컴포넌트 클래스 코드에서는 히어로 목록에 히어로를 추가하거나 초기화하는 로직을 작성합니다.

<code-example path="pipes/src/app/flying-heroes.component.ts" region="v1" header="src/app/flying-heroes.component.ts (v1)" linenums="false">

</code-example>


<!--
You can add heroes and Angular updates the display when you do.
If you click the `reset` button, Angular replaces `heroes` with a new array of the original heroes and updates the display.
If you added the ability to remove or change a hero, Angular would detect those changes and update the display as well.
-->
이제 앱을 실행하면 히어로 목록에 히어로를 추가할 수 있으며, Angular는 이렇게 변경된 히어로 목록을 화면에 표시합니다.
그리고 `reset` 버튼을 클릭하면 `heroes` 프로퍼티의 값이 기본값으로 초기화되며 화면에 표시되는 히어로 목록도 갱신됩니다.
히어로 목록을 수정하거나, 히어로 목록에서 히어로를 제거하는 기능을 추가하더라도 Angular는 마찬가지로 컴포넌트 데이터를 기준으로 화면을 갱신할 것입니다.

<h3 class="no-toc"><i>FlyingHeroesPipe</i></h3>

<!--
Add a `FlyingHeroesPipe` to the `*ngFor` repeater that filters the list of heroes to just those heroes who can fly.
-->
이제 `<div>`에 적용된 `*ngFor`에 `FlyingHeroesPipe`를 적용합니다. 이 파이프를 적용하면 전체 히어로 목록에서 하늘을 날 수 있는 히어로만 `*ngFor`의 대상으로 필터링됩니다.

<code-example path="pipes/src/app/flying-heroes.component.html" region="template-flying-heroes" header="src/app/flying-heroes.component.html (flyers)" linenums="false">

</code-example>


<!--
Here's the `FlyingHeroesPipe` implementation, which follows the pattern for custom pipes described earlier.
-->
`FlyingHeroesPipe`는 다음과 같이 구현합니다.

<code-example path="pipes/src/app/flying-heroes.pipe.ts" region="pure" header="src/app/flying-heroes.pipe.ts" linenums="false">

</code-example>


<!--
Notice the odd behavior in the <live-example></live-example>:
when you add flying heroes, none of them are displayed under "Heroes who fly."

Although you're not getting the behavior you want, Angular isn't broken.
It's just using a different change-detection algorithm that ignores changes to the list or any of its items.

Notice how a hero is added:
-->
하지만 <live-example></live-example>에서 확인하면, 하늘을 날 수 있는 히어로를 추가해도 "Heroes who fly." 밑에 아무것도 표시되지 않습니다.

원하는 동작은 이것이 아니지만 Angular에서 에러가 발생하는 것도 아닙니다.
이 예제에서 사용하는 변화 감지 알고리즘은 배열에 반응하며, 배열을 참조하는 주소가 바뀌지 않고 항목만 추가되었을 때는 변화 감지 알고리즘이 동작하지 않습니다.

히어로를 추가하는 로직을 확인해 봅시다:

<code-example path="pipes/src/app/flying-heroes.component.ts" region="push" header="src/app/flying-heroes.component.ts" linenums="false">

</code-example>


<!--
You add the hero into the `heroes` array.  The reference to the array hasn't changed.
It's the same array. That's all Angular cares about. From its perspective, *same array, no change, no display update*.

To fix that, create an array with the new hero appended and assign that to `heroes`.
This time Angular detects that the array reference has changed.
It executes the pipe and updates the display with the new array, which includes the new flying hero.

If you *mutate* the array, no pipe is invoked and the display isn't updated;
if you *replace* the array, the pipe executes and the display is updated.
The Flying Heroes application extends the
code with checkbox switches and additional displays to help you experience these effects.
-->
새 히어로는 `heroes` 배열의 항목으로 추가됩니다. 하지만 이 로직이 실행되어도 배열의 주소 자체는 변경되지 않습니다. 그러면 Angular는 이렇게 판단합니다. *바인딩 된 객체가 바뀌지 않았으니, 뷰를 업데이트 할 필요는 없다*.

이 문제를 수정하려면 배열에 히어로를 추가할 때 기존에 있던 배열에 새 히어로를 추가해서 새로운 배열을 생성하고, 이 배열로 `heroes` 프로퍼티 값을 할당해야 합니다.
그러면 참조하던 배열이 바뀌었기 때문에 Angular의 동작 감지 로직이 제대로 동작합니다.
그래서 새로운 배열에 파이프가 적용되고, 하늘을 날 수 있는 히어로만 화면에 표시됩니다.

요약하자면, 배열 자체를 새로 할당하지 않으면 파이프도 적용되지 않고 화면도 갱신되지 않습니다.
이 문제를 수정하고 체크박스를 추가해서 사용자가 사용하기에 좀 더 편하게 개선하면 다음과 같은 구현할 수 있습니다.

<figure>
  <img src='generated/images/guide/pipes/flying-heroes-anim.gif' alt="Flying Heroes">
</figure>


<!--
Replacing the array is an efficient way to signal Angular to update the display.
When do you replace the array? When the data change.
That's an easy rule to follow in *this* example
where the only way to change the data is by adding a hero.

More often, you don't know when the data have changed,
especially in applications that mutate data in many ways,
perhaps in application locations far away.
A component in such an application usually can't know about those changes.
Moreover, it's unwise to distort the component design to accommodate a pipe.
Strive to keep the component class independent of the HTML.
The component should be unaware of pipes.

For filtering flying heroes, consider an *impure pipe*.
-->
뷰를 확실하게 갱신하려면 뷰에서 참조하는 배열을 새로운 배열로 교체하는 것이 좋습니다.
배열은 언제 교체해야 할까요? 물론 데이터가 변경되었을 때 교체해야 합니다.
그래서 이 예제는 히어로가 추가되어 데이터가 변경되었을 때만 배열을 교체합니다.

하지만 애플리케이션에서 다루는 데이터가 많아질수록, 이 데이터가 언제 변경되는지 일일이 추적하기는 어려워 집니다.
그리고 컴포넌트 단위에서 보면 데이터가 변경되는 것을 추적할 수 없는 경우도 있습니다.
그래서 파이프와 컴포넌트의 관계는 긴밀하지 연결하지 않는 것이 좋습니다.
컴포넌트 클래스는 HTML 템플릿과 최대한 분리하세요.
컴포넌트 자체는 파이프의 영향을 받지 않을 수록 좋습니다.

이런 내용을 염두에 두면, *순수하지 않은 파이프* 를 활용하는 것을 고려할 수도 있습니다.

{@a pure-impure-pipe}

<!--
## Pure and impure pipes
-->
## 순수한(pure) 파이프, 순수하지 않은(impure) 파이프

<!--
There are two categories of pipes: *pure* and *impure*.
Pipes are pure by default. Every pipe you've seen so far has been pure.
You make a pipe impure by setting its pure flag to false. You could make the `FlyingHeroesPipe`
impure like this:
-->
파이프는 *순수한* 파이프와 *순수하지 않은* 파이프가 있습니다.
따로 설정하지 않으면 순수한 파이프가 기본입니다. 지금까지 살펴본 파이프도 모두 순수한 파이프였습니다.
하지만 파이프 메타데이터의 `pure` 값을 `false`로 설정하면 순수하지 않은 파이프를 구현할 수 있습니다.
`FlyingHeroesPipe`를 순수하지 않은 파이프로 구현하려면 다음과 같이 적용합니다:

<code-example path="pipes/src/app/flying-heroes.pipe.ts" region="pipe-decorator" header="src/app/flying-heroes.pipe.ts" linenums="false">

</code-example>


<!--
Before doing that, understand the difference between pure and impure, starting with a pure pipe.
-->
순수하지 않은 파이프의 동작을 확인하기 전에, 순수한 파이프와 어떻게 다른지 알아보기 위해 순수한 파이프부터 알아봅시다.

<!--
<h3 class="no-toc">Pure pipes</h3>
-->
<h3 class="no-toc">순수한 파이프</h3>

<!--
Angular executes a *pure pipe* only when it detects a *pure change* to the input value.
A pure change is either a change to a primitive input value (`String`, `Number`, `Boolean`, `Symbol`)
or a changed object reference (`Date`, `Array`, `Function`, `Object`).

Angular ignores changes within (composite) objects.
It won't call a pure pipe if you change an input month, add to an input array, or update an input object property.

This may seem restrictive but it's also fast.
An object reference check is fast&mdash;much faster than a deep check for
differences&mdash;so Angular can quickly determine if it can skip both the
pipe execution and a view update.

For this reason, a pure pipe is preferable when you can live with the change detection strategy.
When you can't, you *can* use the impure pipe.
-->
*순수한 파이프*는 파이프에 전달되는 값이 *순수하게 바뀌었을* 때만 동작합니다.
이 때 값이 순수하게 바뀌었다는 것은 기본 자료형(`String`, `Number`, `Boolean`, `Symbol`)의 값이 바뀌었거나, 객체(`Date`, `Array`, `Function`, `Object`)를 참조하는 주소가 바뀐 것을 의미합니다.

그래서 이 모드에서는 객체 안에서 일어나는 변화를 감지하지 않습니다.
Date 객체의 일부 요소가 바뀐다던가, 배열에 항목이 추가된다던가, 객체의 프로퍼티값이 변경되는 것에는 반응하지 않습니다.

동작이 조금 이상해보이기도 하지만, 이 방식은 실행속도를 빠르게 하기 위해 필요합니다.
왜냐하면 객체를 내부까지 모두 검사하는 것보다 참조하는 객체가 바뀌었는지만 검사하는 것이 당연히 빠르기 때문입니다.
그래서 파이프를 실행하거나 뷰를 업데이트해야 할지 Angular가 판단할 때는 이 방식으로 동작합니다.

기본 변화 감지 정책으로도 원하는 변화를 감지할 수 있다면 순수한 파이프를 사용하는 것으로 충분합니다.
하지만 순수하지 않은 파이프를 사용해야만 하는 경우도 있습니다.

<div class="alert is-helpful">

<!--
Or you might not use a pipe at all.
It may be better to pursue the pipe's purpose with a property of the component,
a point that's discussed later in this page.
-->
파이프를 아예 사용하지 않는 방법을 택할 수도 있습니다.
때로는 컴포넌트의 프로퍼티를 직접 조작하는 것이 파이프를 사용하는 것보다 나은 경우도 있습니다.
이 내용은 이 문서 아래쪽에서 자세하게 알아봅니다.

</div>


<!--
<h3 class="no-toc">Impure pipes</h3>
-->
<h3 class="no-toc">순수하지 않은 파이프</h3>

<!--
Angular executes an *impure pipe*  during every component change detection cycle.
An impure pipe is called often, as often as every keystroke or mouse-move.

With that concern in mind, implement an impure pipe with great care.
An expensive, long-running pipe could destroy the user experience.
-->
*순수하지 않은 파이프*를 사용하면 컴포넌트의 변화 감지 싸이클마다 파이프 로직을 다시 실행합니다.
어쩌면 키 입력이 있을때마다, 마우스가 움직일 때마다 파이프 로직이 계속 실행될 수도 있습니다.

그렇기 때문에 순수하지 않은 파이프는 조심해서 사용해야 합니다.
파이프 로직을 실행하는 시간이 오래 걸리면 사용자가 체감하는 앱 성능이 저하될 수 있습니다.

{@a impure-flying-heroes}

<!--
<h3 class="no-toc">An impure <i>FlyingHeroesPipe</i></h3>
-->
<h3 class="no-toc">순수하지 않은 <i>FlyingHeroesPipe</i></h3>

<!--
A flip of the switch turns the `FlyingHeroesPipe` into a `FlyingHeroesImpurePipe`.
The complete implementation is as follows:
-->
`FlyingHeroesPipe`를 상속받아서 순수하지 않은 파이프로 동작하는 `FlyingHeroesImpurePipe`를 만들어 봅시다.
이 파이프는 다음과 같이 구현합니다.

<code-tabs>

  <code-pane header="FlyingHeroesImpurePipe" path="pipes/src/app/flying-heroes.pipe.ts" region="impure">

  </code-pane>

  <code-pane header="FlyingHeroesPipe" path="pipes/src/app/flying-heroes.pipe.ts" region="pure">

  </code-pane>

</code-tabs>


<!--
You inherit from `FlyingHeroesPipe` to prove the point that nothing changed internally.
The only difference is the `pure` flag in the pipe metadata.

This is a good candidate for an impure pipe because the `transform` function is trivial and fast.
-->
파이프의 동작은 다른 것이 없기 때문에 `FlyingHeroesPipe`를 그대로 상속받았습니다.
파이프 메타데이터에 `pure` 값을 지정했다는 것만 다릅니다.

이렇게 만든 `FlyingHeroesImpurePipe`는 순수하지 않은 파이프지만, `transform` 함수의 로직은 순수한 파이프일 때와 마찬가지로 아주 간단하기 때문에 위에서 설명한 성능 저하는 크게 신경쓰지 않아도 됩니다.

<code-example path="pipes/src/app/flying-heroes.pipe.ts" linenums="false" header="src/app/flying-heroes.pipe.ts (filter)" region="filter">

</code-example>


<!--
You can derive a `FlyingHeroesImpureComponent` from `FlyingHeroesComponent`.
-->
그리고 `FlyingHeroesImpureComponent` 의 템플릿은 `FlyingHeroesComponent` 와 비슷하게 다음과 같이 구현합니다.

<code-example path="pipes/src/app/flying-heroes-impure.component.html" linenums="false" header="src/app/flying-heroes-impure.component.html (excerpt)" region="template-flying-heroes">

</code-example>


<!--
The only substantive change is the pipe in the template.
You can confirm in the <live-example></live-example> that the _flying heroes_
display updates as you add heroes, even when you mutate the `heroes` array.
-->
유일하게 다른 점은 템플릿에 적용된 파이프가 다르다는 것 뿐입니다.
이 예제의 동작은 <live-example></live-example>에서 확인할 수 있습니다.
앱을 실행하고 히어로를 추가하면, `heroes` 배열 자체가 변경되지 않아도 파이프는 제대로 동작합니다.

{@a async-pipe}
<!--
<h3 class="no-toc">The impure <i>AsyncPipe</i></h3>
-->
<h3 class="no-toc">순수하지 않은 <i>AsyncPipe</i></h3>

<!--
The Angular `AsyncPipe` is an interesting example of an impure pipe.
The `AsyncPipe` accepts a `Promise` or `Observable` as input
and subscribes to the input automatically, eventually returning the emitted values.

The `AsyncPipe` is also stateful.
The pipe maintains a subscription to the input `Observable` and
keeps delivering values from that `Observable` as they arrive.

This next example binds an `Observable` of message strings
(`message$`) to a view with the `async` pipe.
-->
순수하지 않은 파이프 중에서도 `AsyncPipe`는 조금 더 흥미롭습니다.
`AsyncPipe`는 입력값으로 `Promise`나 `Observable` 타입을 받으며, 입력값을 자동으로 구독하면서 새로운 값이 입력될 때마다 파이프 로직을 실행하고 결과값을 반환합니다.

아래 예제는 `Observable` 형태로 전달되는 메시지 문자열(`message$`)을 `async` 파이프로 뷰에 표시하는 예제입니다.

<code-example path="pipes/src/app/hero-async-message.component.ts" header="src/app/hero-async-message.component.ts">

</code-example>


<!--
The Async pipe saves boilerplate in the component code.
The component doesn't have to subscribe to the async data source,
extract the resolved values and expose them for binding,
and have to unsubscribe when it's destroyed
(a potent source of memory leaks).
-->
`AsyncPipe`가 사용하는 문자열은 컴포넌트 코드 안에 미리 정의되어 있습니다.
이 컴포넌트는 데이터를 직접 구독하지는 않아 뷰에서 사용한 `async` 파이프가 데이터 스트림을 직접 가져오고, 각각의 문자열을 화면에 표시합니다.
이 파이프를 사용할 때는 메모리 누수를 방지하기 위해 컴포넌트 종료 전에 Observable 스트림 구독을 해제해야 합니다.

<!--
<h3 class="no-toc">An impure caching pipe</h3>
-->
<h3 class="no-toc">캐싱 파이프</h3>

<!--
Write one more impure pipe, a pipe that makes an HTTP request.

Remember that impure pipes are called every few milliseconds.
If you're not careful, this pipe will punish the server with requests.

In the following code, the pipe only calls the server when the request URL changes and it caches the server response.
The code uses the [Angular http](guide/http) client to retrieve data:
-->
순수하지 않은 파이프를 하나 더 살펴봅시다. 이 파이프는 HTTP 요청을 처리하는 파이프입니다.

이전에 설명한 것처럼, 순수하지 않은 파이프는 아주 짧은 시간에 의도치 않게 여러번 실행될 수 있습니다.
그래서 조심히 사용하지 않으면 순식간에 서버로 수많은 요청을 보낼 수 있습니다.

이번에 구현하는 파이프는 요청하는 서버의 주소가 다를 때만 서버로 요청을 보내고, 한 번 보낸 서버의 응답은 캐싱합니다.
이 코드는 [Angular http](guide/http) 클라이언트 예제에서도 활용하고 있으니 함께 확인해 보세요.

<code-example path="pipes/src/app/fetch-json.pipe.ts" header="src/app/fetch-json.pipe.ts">

</code-example>


<!--
Now demonstrate it in a harness component whose template defines two bindings to this pipe,
both requesting the heroes from the `heroes.json` file.
-->
이렇게 만든 파이프를 컴포넌트 템플릿에 적용해 봅시다. 파이프가 제대로 동작하는 것을 확인하기 위해 `heroes.json` 파일을 요청하는 부분을 템플릿에 총 2번 추가했습니다.

<code-example path="pipes/src/app/hero-list.component.ts" header="src/app/hero-list.component.ts">

</code-example>


<!--
The component renders as the following:
-->
이 컴포넌트는 다음 그림처럼 표시됩니다:

<figure>
  <img src='generated/images/guide/pipes/hero-list.png' alt="Hero List">
</figure>


<!--
A breakpoint on the pipe's request for data shows the following:

* Each binding gets its own pipe instance.
* Each pipe instance caches its own URL and data.
* Each pipe instance only calls the server once.
-->
이 파이프를 사용할 때 주의해야 할 점이 있습니다.

* 파이프 인스턴스는 각 바인딩마다 따로 생성됩니다.
* 파이프가 캐싱하는 URL과 데이터는 그 인스턴스에 저장됩니다.
* 파이프는 서버 요청을 인스턴스마다 한 번씩만 보냅니다.

<h3 class="no-toc"><i>JsonPipe</i></h3>

<!--
In the previous code sample, the second `fetch` pipe binding demonstrates more pipe chaining.
It displays the same hero data in JSON format by chaining through to the built-in `JsonPipe`.
-->
위 예제에서 두 번째 `fetch` 파이프는 다른 파이프와 체이닝하면서 함께 사용했습니다.
두 번째 파이프는 첫 번째 파이프와 같은 데이터를 사용하지만, 이 데이터는 Angular 내장 파이프인 `JsonPipe`를 한 번 더 거쳐서 JSON 형식으로 화면에 표시했습니다.

<div class="callout is-helpful">



<header>
  <!--
  Debugging with the json pipe
  -->
  JSON 파이프로 디버깅하기
</header>


<!--
The [JsonPipe](api/common/JsonPipe)
provides an easy way to diagnosis a mysteriously failing data binding or
inspect an object for future binding.
-->
[JsonPipe](api/common/JsonPipe)를 사용하면 템플릿에 어떤 데이터가 바인딩 되었는지, 바인딩하기 전에 데이터가 어떤 모양인지 간단하게 확인할 수 있습니다.

</div>



{@a pure-pipe-pure-fn}

<!--
<h3 class="no-toc">Pure pipes and pure functions</h3>
-->
<h3 class="no-toc">순수한 파이프와 순수한 함수</h3>

<!--
A pure pipe uses pure functions.
Pure functions process inputs and return values without detectable side effects.
Given the same input, they should always return the same output.

The pipes discussed earlier in this page are implemented with pure functions.
The built-in `DatePipe` is a pure pipe with a pure function implementation.
So are the `ExponentialStrengthPipe` and `FlyingHeroesPipe`.
A few steps back, you reviewed the `FlyingHeroesImpurePipe`&mdash;an impure pipe with a pure function.

But always implement a *pure pipe* with a *pure function*.
Otherwise, you'll see many console errors regarding expressions that changed after they were checked.
-->
순수한 파이프는 순수 함수(pure function)를 사용합니다.
이 때 순수 함수란, 입력값과 출력값이 일관된 것을 의미하며, 순수 함수라면 같은 값이 입력되었을 때 언제나 같은 결과를 반환합니다.

지금까지 살펴본 파이프는 모두 순수 함수를 사용해서 구현했습니다.
`DatePipe`만 봐도 이 파이프는 순수한 파이프이며, 순수 함수로 구현되었습니다.
`ExponentialStrengthPipe`와 `FlyingHeroesPipe`도 마찬가지입니다.
반면에 `FlyingHeroesImpurePipe`는 순수 함수를 사용했지만 순수하지 않은 파이프입니다.

순수하지 않은 파이프와 다르게, *순수한 파이프*는 반드시 *순수 함수*로 구현해야 합니다.
그렇지 않으면 파이프의 적용된 값이 바뀐  이후에 수많은 에러 로그를 확인할 수 있을 것입니다.

<!--
## Next steps
-->
## 다음 단계

<!--
Pipes are a great way to encapsulate and share common display-value
transformations. Use them like styles, dropping them
into your template's expressions to enrich the appeal and usability
of your views.

Explore Angular's inventory of built-in pipes in the [API Reference](api?type=pipe).
Try writing a custom pipe and perhaps contributing it to the community.
-->
뷰에 사용하는 데이터의 형식을 변환하는 로직이 다른 곳에서도 사용된다면 파이프를 사용하는 방법이 가장 효율적입니다. 그래서 파이프는 스타일처럼 간단하게 적용하면서도 템플릿 표현식의 복잡한 로직을 대체할 수 있습니다.

Angular에서 제공하는 기본 파이프는 [API Reference](api?type=pipe)에서 확인할 수 있습니다.
필요하다면 커스텀 파이프를 만드는 것도 자유로우며, 이렇게 만든 파이프를 Angular 커뮤니티에 공유해보는 것도 좋습니다.

{@a no-filter-pipe}


<!--
## Appendix: No *FilterPipe* or *OrderByPipe*
-->
## 부록 : *FilterPipe*와 *OrderByPipe*는 존재하지 않습니다.

<!--
Angular doesn't provide pipes for filtering or sorting lists.
Developers familiar with AngularJS know these as `filter` and `orderBy`.
There are no equivalents in Angular.
-->
Angular는 배열을 필터링하거나 정렬하는 파이프는 기본 파이프로 제공하지 않습니다.
AngularJS에 익숙한 개발자라면 `filter`와 `orderBy` 파이프를 떠올릴 수 있지만, 이와 같은 역할을 하는 파이프는 Angular에 없습니다.

<!--
This isn't an oversight. Angular doesn't offer such pipes because
they perform poorly and prevent aggressive minification.
Both `filter` and `orderBy` require parameters that reference object properties.
Earlier in this page, you learned that such pipes must be [impure](guide/pipes#pure-and-impure-pipes) and that
Angular calls impure pipes in almost every change-detection cycle.
-->
하지만 실수로 빼먹은 것은 아닙니다. Angular는 이 파이프들을 기본 파이프로 제공하는 것이 성능면에서 좋지 않다고 판단했습니다. 그리고 코드 난독화를 사용하는 경우에도 문제의 여지가 있습니다.

`filter`와 `orderBy` 파이프는 모두 객체 참조를 인자로 받습니다.
하지만 이전에 설명했듯이, Angular의 기본 변화 감지 정책에서는 객체의 참조가 바뀌지 않는 이상 파이프가 갱신되지 않기 때문에 두 파이프는 반드시 [순수하지 않은 파이프](guide/pipes#pure-impure-pipe)로 구현되어야 합니다.
그러면 이 파이프는 모든 변화 감지 싸이클마다 다시 실행될 것입니다.

<!--
Filtering and especially sorting are expensive operations.
The user experience can degrade severely for even moderate-sized lists when Angular calls these pipe methods many times per second.
`filter` and `orderBy` have often been abused in AngularJS apps, leading to complaints that Angular itself is slow.
That charge is fair in the indirect sense that AngularJS prepared this performance trap
by offering `filter` and `orderBy` in the first place.
-->
배열을 필터링하고 정렬하는 로직은 많은 연산이 필요합니다.
이 로직이 변화 감지 싸이클마다 매번 실행된다면 배열의 길이가 별로 길지 않더라도 사용자가 체감하는 앱 성능은 심각하게 저하될 수 있습니다.
그래서 AngularJS에서도 `filter`와 `orderBy` 파이프는 앱 성능을 저하시키는 원인으로 꼽히며 종종 기피 대상이 되었습니다.
결국 AngularJS에서는 `filter`와 `orderBy`의 성능을 따로 개선하면서 이 부담을 일부 해소하기도 했습니다.

<!--
The minification hazard is also compelling, if less obvious. Imagine a sorting pipe applied to a list of heroes.
The list might be sorted by hero `name` and `planet` of origin properties in the following way:
-->
코드 난독화를 사용하는 경우에도 문제가 생길 수 있습니다.
히어로 배열에 정렬 파이프를 적용한다고 가정해 봅시다.
이 배열을 히어로의 `name`이나 `planet` 프로퍼티로 정렬하려면 다음과 같이 구현하는 것을 생각해 볼 수 있습니다:

<!--
<code-example language="html">
  &lt;!-- NOT REAL CODE!
  &lt;div *ngFor="let hero of heroes | orderBy:'name,planet'">&lt;/div>
</code-example>
-->
<code-example language="html">
  &lt;!-- 실제로 동작하는 코드는 아닙니다! -->
  &lt;div *ngFor="let hero of heroes | orderBy:'name,planet'">&lt;/div>
</code-example>

<!--
You identify the sort fields by text strings, expecting the pipe to reference a property value by indexing
(such as `hero['name']`).
Unfortunately, aggressive minification manipulates the `Hero` property names so that `Hero.name` and `Hero.planet`
become something like `Hero.a` and `Hero.b`. Clearly `hero['name']` doesn't work.
-->
이 코드를 보면 `name`과 `planet` 필드를 기준으로 정렬할 것이고, 따라서 `hero['name']`으로 객체 내부 값에 접근할 수 있다고 생각할 것입니다.
하지만 코드 난독화를 거치고 나면 `Hero.name`이나 `Hero.planet`과 같은 프로퍼티 이름은 `Hero.a`나 `Hero.b`와 같이 변경될 수 있습니다. `hero['name']`으로 참조하는 로직은 더이상 유효하지 않습니다.

<!--
While some may not care to minify this aggressively,
the Angular product shouldn't prevent anyone from minifying aggressively.
Therefore, the Angular team decided that everything Angular provides will minify safely.
-->
그러면 코드 난독화를 적용하지 않는 경우에는 괜찮다고 생각할 수 있지만,
Angular 때문에 코드 난독화를 하지 못하는 것은 문제가 있습니다.
Angular 팀은 Angular 코드 전체가 코드 난독화에 지장이 있어서는 안된다고 최종 판단했습니다.

<!--
The Angular team and many experienced Angular developers strongly recommend moving
filtering and sorting logic into the component itself.
The component can expose a `filteredHeroes` or `sortedHeroes` property and take control
over when and how often to execute the supporting logic.
Any capabilities that you would have put in a pipe and shared across the app can be
written in a filtering/sorting service and injected into the component.
-->
Angular 팀과 Angular를 많이 다뤄본 개발자들은 배열을 필터링하거나 정렬하는 로직을 컴포넌트와 분리하도록 권장합니다.
꼭 필요하다면 컴포넌트에 `filteredHeroes`나 `sortedHeroes` 프로퍼티를 선언하고, 컴포넌트 클래스에 동작 로직을 구현하는 것도 고려해볼만 합니다. 이 방법을 사용하면 배열 필터링과 정렬 로직이 언제 어떻게 실행될지 개발자가 제어할 수 있습니다.
배열을 필터링하거나 정렬하는 로직을 서비스에 구현하고, 컴포넌트는 이 서비스를 주입받아 사용하는 방법도 있습니다.

<!--
If these performance and minification considerations don't apply to you, you can always create your own such pipes
(similar to the [FlyingHeroesPipe](guide/pipes#impure-flying-heroes)) or find them in the community.
-->
성능이나 코드 난독화의 문제가 항상 문제가 되는 것은 아닙니다.
로직을 파이프로 구현해도 별 문제가 없다면 파이프로 구현하는 것도 여전히 검토해볼만 합니다.