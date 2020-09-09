<!--
# Transforming Data Using Pipes
-->
# 파이프로 데이터 표시형식 변환하기

<!--
Use [pipes](guide/glossary#pipe "Definition of a pipe") to transform strings, currency amounts, dates, and other data for display.
Pipes are simple functions you can use in [template expressions](/guide/glossary#template-expression "Definition of template expression") to accept an input value and return a transformed value. Pipes are useful because you can use them throughout your application, while only declaring each pipe once.
For example, you would use a pipe to show a date as **April 15, 1988** rather than the raw string format.

<div class="alert is-helpful">

  For the sample app used in this topic, see the <live-example></live-example>.

</div>

Angular provides built-in pipes for typical data transformations, including transformations for internationalization (i18n), which use locale information to format data.
The following are commonly used built-in pipes for data formatting:

* [`DatePipe`](api/common/DatePipe): Formats a date value according to locale rules.
* [`UpperCasePipe`](api/common/UpperCasePipe): Transforms text to all upper case.
* [`LowerCasePipe`](api/common/LowerCasePipe): Transforms text to all lower case.
* [`CurrencyPipe`](api/common/CurrencyPipe): Transforms a number to a currency string, formatted according to locale rules.
* [`DecimalPipe`](/api/common/DecimalPipe): Transforms a number into a string with a decimal point, formatted according to locale rules.
* [`PercentPipe`](api/common/PercentPipe): Transforms a number to a percentage string, formatted according to locale rules.

<div class="alert is-helpful">

* For a complete list of built-in pipes, see the [pipes API documentation](/api/common#pipes "Pipes API reference summary").
* To learn more about using pipes for internationalization (i18n) efforts, see [formatting data based on locale](/guide/i18n#i18n-pipes "Formatting data based on locale").

</div>

You can also create pipes to encapsulate custom transformations and use your custom pipes in template expressions.
-->
[파이프](guide/glossary#pipe "Definition of a pipe")를 사용하면 문자열, 통화, 일자와 같은 데이터를 원하는 형태로 변환해서 표시할 수 있습니다.
파이프는 [템플릿 표현식](/guide/glossary#template-expression "Definition of template expression")과 마찬가지로 어떤 값을 입력받아서 변환된 데이터를 반환하는 함수입니다.
특히 파이프는 한번만 선언해두면 애플리케이션 어느곳이든 자유롭게 사용할 수 있기 때문에 특히 유용합니다.
문자열을 `toString()`으로 변환해서 화면에 표시하는 것보다는 *April 15, 1988* 이라고 표시하는 것이 사용자가 알아보기 편하며, 이런 경우에 파이프를 사용합니다.

<div class="alert is-helpful">

이 문서에서 설명하는 내용은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

Angular는 일반적인 데이터 변환 용도로 사용할 수 있는 기본 파이프를 몇가지 지원하며, 이 때 지역이나 국가에서 자주 사용하는 형식에 맞는 국제화(internationalization, i18n)도 지원합니다.
자주 사용하는 기본 파이프는 이런 것들이 있습니다:

* [`DatePipe`](api/common/DatePipe): 날짜 데이터를 원하는 형식으로 변환합니다.
* [`UpperCasePipe`](api/common/UpperCasePipe): 문자열을 모두 대문자로 변환합니다.
* [`LowerCasePipe`](api/common/LowerCasePipe): 문자열을 모두 소문자로 변환합니다.
* [`CurrencyPipe`](api/common/CurrencyPipe): 숫자를 통화 단위로 변환합니다. 이 때 지역에 맞는 표시 형식도 자동으로 지정됩니다.
* [`DecimalPipe`](/api/common/DecimalPipe): 숫자가 표시되는 자릿수를 지정합니다. 지역에 맞는 표시 형식도 적용할 수 있습니다.
* [`PercentPipe`](api/common/PercentPipe): 숫자를 백분율로 변환합니다. 지역에 맞는 표시 형식도 적용할 수 있습니다.

<div class="alert is-helpful">

* Angular가 제공하는 모든 파이프를 살펴보려면 [파이프 API 문서](/api/common#pipes "Pipes API reference summary")를 참고하세요.
* 파이프에 국제화(internationalization, i18n)가 적용되는 과정을 자세하게 확인하려면 [지역에 맞게 데이터 변환하기](/guide/i18n#i18n-pipes "Formatting data based on locale") 문서를 참고하세요.

</div>

데이터를 변환하는 로직이 별도로 필요하면 커스텀 파이프를 만들어서 템플릿 표현식에 활용할 수 있습니다.


<!--
## Prerequisites
-->
## 사전지식

<!--
To use pipes you should have a basic understanding of the following:

* [Typescript](guide/glossary#typescript "Definition of Typescript") and HTML5 programming
* [Templates](guide/glossary#template "Definition of a template") in HTML with CSS styles
* [Components](guide/glossary#component "Definition of a component")
-->
파이프에 대해 이해하려면 다음 내용들을 먼저 이해하고 있는 것이 좋습니다:

* [Typescript](guide/glossary#typescript "Definition of Typescript")와 HTML5 문법
* [템플릿](guide/glossary#template "Definition of a template")에서 HTML과 CSS 스타일을 구성하는 방법
* [컴포넌트](guide/glossary#component "Definition of a component")


<!--
## Using a pipe in a template
-->
## 템플릿에 파이프 사용하기

<!--
To apply a pipe, use the pipe operator (`|`) within a template expression as shown in the following code example, along with the *name* of the pipe, which is `date` for the built-in [`DatePipe`](api/common/DatePipe).
The tabs in the example show the following:

* `app.component.html` uses `date` in a separate template to display a birthday.
* `hero-birthday1.component.ts` uses the same pipe as part of an in-line template in a component that also sets the birthday value.

<code-tabs>
  <code-pane
    header="src/app/app.component.html"
    region="hero-birthday-template"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday1.component.ts"
    path="pipes/src/app/hero-birthday1.component.ts">
  </code-pane>
</code-tabs>

The component's `birthday` value flows through the
[pipe operator](guide/template-expression-operators#pipe) ( | ) to the [`date`](api/common/DatePipe)
function.
-->
파이프를 사용하려면 템플릿 표현식에 파이프 연산자(`|`)를 사용하고 파이프 *이름*을 붙이면 됩니다.
`date` 프로퍼티에 [`DatePipe`](api/common/DatePipe)를 적용해 봅시다:

* `app.component.html`에 있는 `date` 프로퍼티는 템플릿에 생일을 표시할 때 사용하는 프로퍼티입니다.
* `hero-birthday1.component.ts` 파일에서도 인라인 템플릿에 날짜 파이프를 사용해서 생일이 표시되는 형식을 변환합니다.

<code-tabs>
  <code-pane
    header="src/app/app.component.html"
    region="hero-birthday-template"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday1.component.ts"
    path="pipes/src/app/hero-birthday1.component.ts">
  </code-pane>
</code-tabs>

컴포넌트 `birthday` 값은 [파이프 연산자 (`|`)](guide/template-expression-operators#pipe)를 거쳐 [DatePipe](api/common/DatePipe)로 전달됩니다.


{@a parameterizing-a-pipe}

<!--
## Transforming data with parameters and chained pipes
-->
## 추가 형식 지정하기, 체이닝하기

<!--
Use optional parameters to fine-tune a pipe's output.
For example, you can use the [`CurrencyPipe`](api/common/CurrencyPipe "API reference") with a country code such as EUR as a parameter.
The template expression `{{ amount | currency:'EUR' }}` transforms the `amount` to currency in euros.
Follow the pipe name (`currency`) with a colon (`:`) and the parameter value (`'EUR'`).

If the pipe accepts multiple parameters, separate the values with colons.
For example, `{{ amount | currency:'EUR':'Euros '}}` adds the second parameter, the string literal `'Euros '`, to the output string. You can use any valid template expression as a parameter, such as a string literal or a component property.

Some pipes require at least one parameter and allow more optional parameters, such as [`SlicePipe`](/api/common/SlicePipe "API reference for SlicePipe"). For example, `{{ slice:1:5 }}` creates a new array or string containing a subset of the elements starting with element `1` and ending with element `5`.
-->
파이프에는 추가 형식을 인자로 전달할 수도 있습니다.
그래서 [`CurrencyPipe`](api/common/CurrencyPipe "API reference")를 사용할 때 EUR 같은 통화 단위를 직접 지정할 수도 있습니다.
템플릿 표현식에  `{{ amount | currency:'EUR' }}` 라고 사용하면 `amount`에 있는 숫자가 유로 단위로 표시됩니다.
파이프 이름(`current`) 뒤에 붙은 콜론(`:`) 다음에 전달하는 것이 추가 형식 인자(`'EUR'`) 입니다.

파이프에 인자를 여러개 전달할 수 있다면 이 인자들은 콜론으로 구분합니다.
그래서 `{{ amount | currency:'EUR':'Euros '}}` 와 같이 사용하면 두번째 인자로 전달한 `'Euros '`가 문자열 뒤에 붙습니다.
템플릿 표현식 문법에 맞기만 하면 템플릿에 선언한 문자열 리터럴이나 컴포넌트 프로퍼티에 모두 파이프를 적용할 수 있습니다.

파이프 중에는 인자 하나는 최소한 지정해야 하는 경우가 있습니다.
[`SlicePipe`](/api/common/SlicePipe "API reference for SlicePipe")가 그런데, `{{ slice:1:5 }}`라고 사용하면 배열이나 문자열에서 `1`번째 엘리먼트부터 `5`번째 엘리먼트까지를 반환합니다.


<!--
### Example: Formatting a date
-->
### 예제: 날짜 형식 지정하기

<!--
The tabs in the following example demonstrates toggling between two different formats (`'shortDate'` and `'fullDate'`):

* The `app.component.html` template uses a format parameter for the [`DatePipe`](api/common/DatePipe) (named `date`) to show the date as **04/15/88**.
* The `hero-birthday2.component.ts` component binds the pipe's format parameter to the component's `format` property in the `template` section, and adds a button for a click event bound to the component's `toggleFormat()` method.
* The `hero-birthday2.component.ts` component's `toggleFormat()` method toggles the component's `format` property between a short form
(`'shortDate'`) and a longer form (`'fullDate'`).

<code-tabs>
  <code-pane
    header="src/app/app.component.html"
    region="format-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday2.component.ts (template)"
    region="template"
    path="pipes/src/app/hero-birthday2.component.ts">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday2.component.ts (class)"
    region="class"
    path="pipes/src/app/hero-birthday2.component.ts">
  </code-pane>
</code-tabs>

Clicking the **Toggle Format** button alternates the date format between **04/15/1988** and **Friday, April 15, 1988** as shown in Figure 1.

<div class="lightbox">
  <img src='generated/images/guide/pipes/date-format-toggle-anim.gif' alt="Date Format Toggle">
</div>

**Figure 1.** Clicking the button toggles the date format

<div class="alert is-helpful">

For `date` pipe format options, see [DatePipe](api/common/DatePipe "DatePipe API Reference page").

</div>
-->
아래 예제에서 탭을 변경해보면 두 종류 형식(`'shortDate'`, `'fullDate'`)으로 날짜 형식을 지정한 것을 확인할 수 있습니다.

* `app.component.html` 템플릿에는 **04/15/88**이라는 형식으로 표시하기 위해 [`DatePipe`](api/common/DatePipe)를 사용했습니다.
* `hero-birthday2.componen.ts`에는 컴포넌트에 있는 `format` 프로퍼티를 사용해서 파이프의 날짜 형식을 지정합니다. 그리고 화면에서 버튼을 클릭하면 `toggleFormat()` 메소드가 실행되면서 날짜 형식을 변경합니다.
* `hero-birthday2.component.ts`에 정의된 `toggleFormat()`는 컴포넌트 `format` 프로퍼티를 두 종류 날짜 형식(`'shortDate'`, `'fullDate'`)으로 변경합니다.

<code-tabs>
  <code-pane
    header="src/app/app.component.html"
    region="format-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday2.component.ts (템플릿)"
    region="template"
    path="pipes/src/app/hero-birthday2.component.ts">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday2.component.ts (클래스)"
    region="class"
    path="pipes/src/app/hero-birthday2.component.ts">
  </code-pane>
</code-tabs>

이제 화면에서 **Toggle Format** 버튼을 클릭하면 날짜 형식이 **04/15/1988**이라고 표시되거나 **Friday, April 15, 1988**라고 표시되는 것을 확인할 수 있습니다.

<div class="lightbox">
  <img src='generated/images/guide/pipes/date-format-toggle-anim.gif' alt="Date Format Toggle">
</div>

**그림 1.** 날짜 형식을 변경하는 모습

<div class="alert is-helpful">

`date` 파이프에 사용할 수 있는 형식에 대해 알아보려면 [DatePipe](api/common/DatePipe "DatePipe API Reference page") 문서를 참고하세요.

</div>


<!--
### Example: Applying two formats by chaining pipes
-->
### 예제: 파이프 체이닝

<!--
You can chain pipes so that the output of one pipe becomes the input to the next.

In the following example, chained pipes first apply a format to a date value, then convert the formatted date to uppercase characters.
The first tab for the `src/app/app.component.html` template chains `DatePipe` and `UpperCasePipe` to display the birthday as **APR 15, 1988**.
The second tab for the `src/app/app.component.html` template passes the `fullDate` parameter to `date` before chaining to `uppercase`, which produces **FRIDAY, APRIL 15, 1988**.

<code-tabs>
  <code-pane
    header="src/app/app.component.html (1)"
    region="chained-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/app.component.html (2)"
    region="chained-parameter-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
</code-tabs>
-->
파이프는 하나를 통과한 결과를 다른 파이프로 전달하는 방식으로 체이닝할 수 있습니다.

아래 예제는 첫번째 파이프로 날짜 데이터의 형식을 지정한 후에, 이렇게 변환된 문자열을 다른 파이프로 전달해서 대문자로 변환하는 예제입니다.
첫번째 탭은 `src/app/app.component.html` 템플릿 파일에서 `DatePipe`와 `UpperCasePipe`를 사용해서 **APR 15, 1988**이라고 표시하는 코드입니다.
그리고 두번째 탭은 `src/app/app.component.html` 템플릿 파일에서 `date` 프로퍼티를 `fullDate` 형식으로 변환한 후에 `uppercase` 파이프를 한 번 더 사용해서 **FRIDAY, APRIL 15, 1988**이라고 표시하는 코드입니다.

<code-tabs>
  <code-pane
    header="src/app/app.component.html (1)"
    region="chained-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/app.component.html (2)"
    region="chained-parameter-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
</code-tabs>


{@a Custom-pipes}

## Creating pipes for custom data transformations

Create custom pipes to encapsulate transformations that are not provided with the built-in pipes.
You can then use your custom pipe in template expressions, the same way you use built-in pipes—to transform input values to output values for display.

### Marking a class as a pipe

To mark a class as a pipe and supply configuration metadata, apply the [`@Pipe`](/api/core/Pipe "API reference for Pipe") [decorator](/guide/glossary#decorator--decoration "Definition for decorator") to the class.
Use [UpperCamelCase](guide/glossary#case-types "Definition of case types") (the general convention for class names) for the pipe class name, and [camelCase](guide/glossary#case-types "Definition of case types") for the corresponding `name` string.
Do not use hyphens in the `name`.
For details and more examples, see [Pipe names](guide/styleguide#pipe-names "Pipe names in the Angular coding style guide").

Use `name` in template expressions as you would for a built-in pipe.

<div class="alert is-important">

* Include your pipe in the `declarations` field of the `NgModule` metadata in order for it to be available to a template. See the `app.module.ts` file in the example app (<live-example></live-example>). For details, see [NgModules](guide/ngmodules "NgModules introduction").
* Register your custom pipes. The [Angular CLI](cli "CLI Overview and Command Reference") [`ng generate pipe`](cli/generate#pipe "ng generate pipe in the CLI Command Reference") command registers the pipe automatically.

</div>

### Using the PipeTransform interface

Implement the [`PipeTransform`](/api/core/PipeTransform "API reference for PipeTransform") interface in your custom pipe class to perform the transformation.

Angular invokes the `transform` method with the value of a binding as the first argument, and any parameters as the second argument in list form, and returns the transformed value.

### Example: Transforming a value exponentially

In a game, you may want to implement a transformation that raises a value exponentially to increase a hero's power.
For example, if the hero's score is 2, boosting the hero's power exponentially by 10 produces a score of 1024.
You can use a custom pipe for this transformation.

The following code example shows two component definitions:

* The `exponential-strength.pipe.ts` component defines a custom pipe named `exponentialStrength` with the `transform` method that performs the transformation.
It defines an argument to the `transform` method (`exponent`) for a parameter passed to the pipe.

* The `power-booster.component.ts` component demonstrates how to use the pipe, specifying a value (`2`) and the exponent parameter (`10`).
Figure 2 shows the output.

<code-tabs>
  <code-pane
    header="src/app/exponential-strength.pipe.ts"
    path="pipes/src/app/exponential-strength.pipe.ts">
  </code-pane>
  <code-pane
    header="src/app/power-booster.component.ts"
    path="pipes/src/app/power-booster.component.ts">
  </code-pane>
</code-tabs>

<div class="lightbox">
  <img src='generated/images/guide/pipes/power-booster.png' alt="Power Booster">
</div>

**Figure 2.** Output from the `exponentialStrength` pipe

<div class="alert is-helpful">

To examine the behavior the `exponentialStrength` pipe in the <live-example></live-example>, change the value and optional exponent in the template.

</div>

{@a change-detection}

## Detecting changes with data binding in pipes

You use [data binding](/guide/glossary#data-binding "Definition of data binding") with a  pipe to display values and respond to user actions.
If the data is a primitive input value, such as `String` or `Number`, or an object reference as input, such as `Date` or `Array`, Angular executes the pipe whenever it detects a change for the input value or reference.

For example, you could change the previous custom pipe example to use two-way data binding with `ngModel` to input the amount and boost factor, as shown in the following code example.

<code-example path="pipes/src/app/power-boost-calculator.component.ts" header="src/app/power-boost-calculator.component.ts">

</code-example>

The `exponentialStrength` pipe executes every time the user changes the "normal power" value or the "boost factor", as shown in Figure 3.

<div class="lightbox">
  <img src='generated/images/guide/pipes/power-boost-calculator-anim.gif' alt="Power Boost Calculator">
</div>

**Figure 3.** Changing the amount and boost factor for the `exponentialStrength` pipe

Angular detects each change and immediately runs the pipe.
This is fine for primitive input values.
However, if you change something *inside* a composite object (such as the month of a date, an element of an array, or an object property), you need to understand how change detection works, and how to use an `impure` pipe.

### How change detection works

Angular looks for changes to data-bound values in a [change detection](guide/glossary#change-detection "Definition of change detection") process that runs after every DOM event: every keystroke, mouse move, timer tick, and server response.
The following example, which doesn't use a pipe, demonstrates how Angular uses its default change detection strategy to monitor and update its display of every hero in the `heroes` array.
The example tabs show the following:

* In the `flying-heroes.component.html (v1)` template, the `*ngFor` repeater displays the hero names.
* Its companion component class `flying-heroes.component.ts (v1)` provides heroes, adds heroes into the array, and resets the array.

<code-tabs>
  <code-pane
    header="src/app/flying-heroes.component.html (v1)"
    region="template-1"
    path="pipes/src/app/flying-heroes.component.html">
  </code-pane>
  <code-pane
    header="src/app/flying-heroes.component.ts (v1)"
    region="v1"
    path="pipes/src/app/flying-heroes.component.ts">
  </code-pane>
</code-tabs>

Angular updates the display every time the user adds a hero.
If the user clicks the **Reset** button, Angular replaces `heroes` with a new array of the original heroes and updates the display.
If you add the ability to remove or change a hero, Angular would detect those changes and update the display as well.

However, executing a pipe to update the display with every change would slow down your app's performance.
So Angular uses a faster change-detection algorithm for executing a pipe, as described in the next section.

{@a pure-and-impure-pipes}

### Detecting pure changes to primitives and object references

By default, pipes are defined as *pure* so that Angular executes the pipe only when it detects a *pure change* to the input value.
A pure change is either a change to a primitive input value (such as `String`, `Number`, `Boolean`, or `Symbol`), or a changed object reference (such as `Date`, `Array`, `Function`, or `Object`).

{@a pure-pipe-pure-fn}

A pure pipe must use a pure function, which is one that processes inputs and returns values without side effects.
In other words, given the same input, a pure function should always return the same output.

With a pure pipe, Angular ignores changes within composite objects, such as a newly added element of an existing array, because checking a primitive value or object reference is much faster than performing a deep check for differences within objects.
Angular can quickly determine if it can skip executing the pipe and updating the view.

However, a pure pipe with an array as input may not work the way you want.
To demonstrate this issue, change the previous example to filter the list of heroes to just those heroes who can fly.
Use the `FlyingHeroesPipe` in the `*ngFor` repeater as shown in the following code.
The tabs for the example show the following:

* The template (`flying-heroes.component.html (flyers)`) with the new pipe.
* The `FlyingHeroesPipe` custom pipe implementation (`flying-heroes.pipe.ts`).

<code-tabs>
  <code-pane
    header="src/app/flying-heroes.component.html (flyers)"
    region="template-flying-heroes"
    path="pipes/src/app/flying-heroes.component.html">
  </code-pane>
  <code-pane
    header="src/app/flying-heroes.pipe.ts"
    region="pure"
    path="pipes/src/app/flying-heroes.pipe.ts">
  </code-pane>
</code-tabs>

The app now shows unexpected behavior: When the user adds flying heroes, none of them appear under "Heroes who fly."
This happens because the code that adds a hero does so by pushing it onto the `heroes` array:

<code-example path="pipes/src/app/flying-heroes.component.ts" region="push" header="src/app/flying-heroes.component.ts"></code-example>

The change detector ignores changes to elements of an array, so the pipe doesn't run.

The reason Angular ignores the changed array element is that the *reference* to the array hasn't changed.
Since the array is the same, Angular does not update the display.

One way to get the behavior you want is to change the object reference itself.
You can replace the array with a new array containing the newly changed elements, and then input the new array to the pipe.
In the above example, you can create an array with the new hero appended, and assign that to `heroes`. Angular detects the change in the array reference and executes the pipe.

To summarize, if you mutate the input array, the pure pipe doesn't execute.
If you *replace* the input array, the pipe executes and the display is updated, as shown in Figure 4.

<div class="lightbox">
  <img src='generated/images/guide/pipes/flying-heroes-anim.gif' alt="Flying Heroes">
</div>

**Figure 4.** The `flyingHeroes` pipe filtering the display to flying heroes

The above example demonstrates changing a component's code to accommodate a pipe.

To keep your component simpler and independent of HTML templates that use pipes, you can, as an alternative, use an *impure* pipe to detect changes within composite objects such as arrays, as described in the next section.

{@a impure-flying-heroes}

### Detecting impure changes within composite objects

To execute a custom pipe after a change *within* a composite object, such as a change to an element of an array, you need to define your pipe as `impure` to detect impure changes.
Angular executes an impure pipe every time it detects a change with every keystroke or mouse movement.

<div class="alert is-important">

While an impure pipe can be useful, be careful using one. A long-running impure pipe could dramatically slow down your app.

</div>

Make a pipe impure by setting its `pure` flag to `false`:

<code-example path="pipes/src/app/flying-heroes.pipe.ts" region="pipe-decorator" header="src/app/flying-heroes.pipe.ts"></code-example>

The following code shows the complete implementation of `FlyingHeroesImpurePipe`, which extends `FlyingHeroesPipe` to inherit its characteristics.
The example shows that you don't have to change anything else—the only difference is setting the `pure` flag as `false` in the pipe metadata.

<code-tabs>
  <code-pane
    header="src/app/flying-heroes.pipe.ts (FlyingHeroesImpurePipe)"
    region="impure"
    path="pipes/src/app/flying-heroes.pipe.ts">
  </code-pane>
  <code-pane
    header="src/app/flying-heroes.pipe.ts (FlyingHeroesPipe)"
    region="pure"
    path="pipes/src/app/flying-heroes.pipe.ts">
  </code-pane>
</code-tabs>

`FlyingHeroesImpurePipe` is a good candidate for an impure pipe because the `transform` function is trivial and fast:

<code-example path="pipes/src/app/flying-heroes.pipe.ts" header="src/app/flying-heroes.pipe.ts (filter)" region="filter"></code-example>

You can derive a `FlyingHeroesImpureComponent` from `FlyingHeroesComponent`.
As shown in the code below, only the pipe in the template changes.

<code-example path="pipes/src/app/flying-heroes-impure.component.html" header="src/app/flying-heroes-impure.component.html (excerpt)" region="template-flying-heroes"></code-example>

<div class="alert is-helpful">

  To confirm that the display updates as the user adds heroes, see the <live-example></live-example>.

</div>

{@a async-pipe}

## Unwrapping data from an observable

[Observables](/guide/glossary#observable "Definition of observable") let you pass messages between parts of your application.
Observables are recommended for event handling, asynchronous programming, and handling multiple values.
Observables can deliver single or multiple values of any type, either synchronously (as a function delivers a value to its caller) or asynchronously on a schedule.

<div class="alert is-helpful">

For details and examples of observables, see the [Observables Overview](/guide/observables#using-observables-to-pass-values "Using observables to pass values"").

</div>

Use the built-in [`AsyncPipe`](/api/common/AsyncPipe "API description of AsyncPipe") to accept an observable as input and subscribe to the input automatically.
Without this pipe, your component code would have to subscribe to the observable to consume its values, extract the resolved values, expose them for binding, and unsubscribe when the observable is destroyed in order to prevent memory leaks. `AsyncPipe` is an impure pipe that saves boilerplate code in your component to maintain the subscription and keep delivering values from that observable as they arrive.

The following code example binds an observable of message strings
(`message$`) to a view with the `async` pipe.

<code-example path="pipes/src/app/hero-async-message.component.ts" header="src/app/hero-async-message.component.ts">

</code-example>

{@a no-filter-pipe}

## Caching HTTP requests

To [communicate with backend services using HTTP](/guide/http "Communicating with backend services using HTTP"), the `HttpClient` service uses observables and offers the `HTTPClient.get()` method to fetch data from a server.
The aynchronous method sends an HTTP request, and returns an observable that emits the requested data for the response.

As shown in the previous section, you can use the impure `AsyncPipe` to accept an observable as input and subscribe to the input automatically.
You can also create an impure pipe to make and cache an HTTP request.

Impure pipes are called whenever change detection runs for a component, which could be every few milliseconds for `CheckAlways`.
To avoid performance problems, call the server only when the requested URL changes, as shown in the following example, and use the pipe to cache the server response.
The tabs show the following:

* The `fetch` pipe (`fetch-json.pipe.ts`).
* A harness component (`hero-list.component.ts`) for demonstrating the request, using a template that defines two bindings to the pipe requesting the heroes from the `heroes.json` file. The second binding chains the `fetch` pipe with the built-in `JsonPipe` to display the same hero data in JSON format.

<code-tabs>
  <code-pane
    header="src/app/fetch-json.pipe.ts"
    path="pipes/src/app/fetch-json.pipe.ts">
  </code-pane>
  <code-pane
    header="src/app/hero-list.component.ts"
    path="pipes/src/app/hero-list.component.ts">
  </code-pane>
</code-tabs>

In the above example, a breakpoint on the pipe's request for data shows the following:

* Each binding gets its own pipe instance.
* Each pipe instance caches its own URL and data and calls the server only once.

The `fetch` and `fetch-json` pipes display the heroes as shown in Figure 5.

<div class="lightbox">
  <img src='generated/images/guide/pipes/hero-list.png' alt="Hero List">
</div>

**Figure 5.** The `fetch` and `fetch-json` pipes displaying the heroes

<div class="alert is-helpful">

The built-in [JsonPipe](api/common/JsonPipe "API description for JsonPipe") provides a way to diagnose a mysteriously failing data binding or to inspect an object for future binding.

</div>
