<!--
# Practical observable usage
-->
# 옵저버블 실전 예제

<!--
Here are some examples of domains in which observables are particularly useful.
-->
이 문서는 옵저버블을 사용하는 것이 좀 더 효율적인 분야를 소개합니다.

<!--
## Type-ahead suggestions
-->
## 코드 자동완성

<!--
Observables can simplify the implementation of type-ahead suggestions. Typically, a type-ahead has to do a series of separate tasks:
-->
옵저버블을 사용하면 코드 자동완성 기능을 간단하게 구현할 수 있습니다. 일반적으로 이 기능은 다음 순서로 구현합니다:

<!--
* Listen for data from an input.
* Trim the value (remove whitespace) and make sure it’s a minimum length.
* Debounce (so as not to send off API requests for every keystroke, but instead wait for a break in keystrokes).
* Don’t send a request if the value stays the same (rapidly hit a character, then backspace, for instance).
* Cancel ongoing AJAX requests if their results will be invalidated by the updated results.
-->
* 입력 필드의 데이터가 변하는 것를 감지합니다.
* 공백문자를 제거한 후에 최소 길이 조건을 만족하는지 확인합니다.
* 딜레이를 줍니다. 모든 키 입력마다 API를 요청하는 것보다 키 입력을 지연시키는 것이 나은 경우도 있습니다.
* 입력된 값이 변하지 않았으면 요청을 보내지 않습니다. 한 글자를 계속 눌렀거나, 백스페이스를 누른 경우도 감지할 수 있습니다.
* 이전 요청 결과와 다르면 AJAX 요청을 취소하고 새로운 요청을 보냅니다.

<!--
Writing this in full JavaScript can be quite involved. With observables, you can use a simple series of RxJS operators:
-->
이 내용을 모두 JavaScript로 구현하는 것은 상당히 번거로운 일입니다. 하지만 옵저버블과 RxJS 연산자를 활용하면 다음과 같이 간단하게 구현할 수 있습니다:

<!--
<code-example path="practical-observable-usage/src/typeahead.ts" title="Typeahead"></code-example>
-->
<code-example path="practical-observable-usage/src/typeahead.ts" title="코드 자동완성"></code-example>

## Exponential backoff

<!--
Exponential backoff is a technique in which you retry an API after failure, making the time in between retries longer after each consecutive failure, with a maximum number of retries after which the request is considered to have failed. This can be quite complex to implement with promises and other methods of tracking AJAX calls. With observables, it is very easy:
-->
지수 백오프(Exponential backoff)는 API 요청을 실패했을 때 사용하는 테크닉입니다. 이 테크닉은 요청이 계속 실패할 때마다 점점 긴 시간 간격을 두고 재시도하며, 정해진 재시도 횟수를 넘어가면 최종 실패한 것으로 판단합니다. 이 기능은 AJAX 요청을 계속 추적해야 하기 때문에 Promise나 JavaScript로 구현하기는 조금 복잡합니다. 하지만 옵저버블을 사용하면 아주 간단합니다:

<code-example path="practical-observable-usage/src/backoff.ts" title="Exponential backoff"></code-example>
