<!--
# Security
-->
# 보안

<!--
This page describes Angular's built-in
protections against common web-application vulnerabilities and attacks such as cross-site
scripting attacks. It doesn't cover application-level security, such as authentication (_Who is
this user?_) and authorization (_What can this user do?_).

For more information about the attacks and mitigations described below, see [OWASP Guide Project](https://www.owasp.org/index.php/Category:OWASP_Guide_Project).

You can run the <live-example></live-example> in Stackblitz and download the code from there.
-->
이 문서는 일반적인 웹 애플리케이션에 존재하는 취약점이나 크로스-사이트 스크립트 공격과 같은 악성 공격을 Angular가 어떻게 방어하는지 소개합니다.
인증(_이 사용자는 누구인가?_)이나 권한(_이 사용자는 무엇을 할 수 있나?_)과 같은 애플리케이션 레벨의 보안에 대해서는 다루지 않습니다.

이 문서에서 다루는 공격 방법에 대해 자세하게 알아보려면 [OWASP Guide Project](https://www.owasp.org/index.php/Category:OWASP_Guide_Project)를 참고하세요.

이 문서에서 다루는 예제 코드는 <live-example></live-example>에서 직접 실행하거나 다운받아 확인할 수 있습니다.

<h2 id='report-issues'>
  <!--
  Reporting vulnerabilities
  -->
  취약점 제보하기
</h2>


<!--
To report vulnerabilities in Angular itself, email us at [security@angular.io](mailto:security@angular.io).

For more information about how Google handles security issues, see [Google's security
philosophy](https://www.google.com/about/appsecurity/).
-->
Angular에 존재하는 취약점을 제보하려면 [security@angular.io](mailto:security@angular.io)로 메일을 보내주세요.

Google이 처리하는 보안 이슈에 대해 더 알아보려면 [Google의 보안 철학](https://www.google.com/about/appsecurity/) 문서를 참고하세요.


<h2 id='best-practices'>
  <!--
  Best practices
  -->
  권장사항
</h2>


<!--
* **Keep current with the latest Angular library releases.**
We regularly update the Angular libraries, and these updates may fix security defects discovered in
previous versions. Check the Angular [change
log](https://github.com/angular/angular/blob/master/CHANGELOG.md) for security-related updates.

* **Don't modify your copy of Angular.**
Private, customized versions of Angular tend to fall behind the current version and may not include
important security fixes and enhancements. Instead, share your Angular improvements with the
community and make a pull request.

* **Avoid Angular APIs marked in the documentation as “_Security Risk_.”**
For more information, see the [Trusting safe values](guide/security#bypass-security-apis) section of this page.
-->
* **Angular 라이브러리는 최신 버전으로 유지하세요.**
Angular 팀은 주기적으로 Angular 라이브러리를 업데이트하면서 이전 버전에 발견된 보안 문제를 함께 수정하고 있습니다.
[체인지 로그](https://github.com/angular/angular/blob/master/CHANGELOG.md)에서 보안과 관련된 업데이트 내용을 확인해 보세요.

* **Angular 코드를 직접 수정하지 마세요.**
Angular 코드를 직접 수정해서 사용하면 해당 버전의 기능이 일부 동작하지 않을 수 있는데, 이 때 중요한 보안 패치나 방어 로직이 동작하지 않을 수 있습니다.
Angular를 직접 수정하기 보다는 커뮤니티에 수정을 요청하거나 풀 리퀘스트를 활용하세요.

* **문서에 "_Security Risk_" 라고 표시된 API는 되도록 사용하지 마세요.**
더 자세한 내용은 이 문서의 [안전한 값으로 간주하기](guide/security#bypass-security-apis) 섹션에서 설명합니다.


<h2 id='xss'>
  <!--
  Preventing cross-site scripting (XSS)
  -->
  크로스 사이트 스크립트 공격(cross-site scripting, XSS) 방어하기
</h2>


<!--
[Cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) enables attackers
to inject malicious code into web pages. Such code can then, for example, steal user data (in
particular, login data) or perform actions to impersonate the user. This is one of the most
common attacks on the web.

To block XSS attacks, you must prevent malicious code from entering the DOM (Document Object Model). For example, if
attackers can trick you into inserting a `<script>` tag in the DOM, they can run arbitrary code on
your website. The attack isn't limited to `<script>` tags&mdash;many elements and properties in the
DOM allow code execution, for example, `<img onerror="...">` and `<a href="javascript:...">`. If
attacker-controlled data enters the DOM, expect security vulnerabilities.
-->
[크로스-사이트 스크립트 공격(cross-site scripting, XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting)은 공격자가 웹 페이지 안에 악성 코드를 주입해서 실행하는 것을 의미합니다.
이런 공격은 웹에서 가장 흔한 공격 방식 중 하나인데, 보통 로그인 데이터와 같은 사용자의 정보를 탈취하거나 비정상적인 동작을 실행하는 방식으로 동작합니다.

XSS 공격을 방어하려면 DOM(Document Object Model)에 악성 코드가 추가되는 것을 막아야 합니다.
공격자가 DOM 안에 `<script>` 태그를 심을 수 있다면, 이 태그를 통해 악성 코드를 실행할 수 있습니다.
하지만 XSS 공격이 꼭 `<script>` 태그에만 한정된 것은 아닙니다.
`<img onerror="...">`나 `<a href="javascript:...">`와 같은 코드도 XSS 공격에 활용될 수 있습니다.
그래서 공격자가 DOM에 데이터를 추가할 수 있다면 보안 취약점이 존재한다고 볼 수 있습니다.


<!--
### Angular’s cross-site scripting security model
-->
### Angular의 XSS 방어 모델

<!--
To systematically block XSS bugs, Angular treats all values as untrusted by default. When a value
is inserted into the DOM from a template, via property, attribute, style, class binding, or interpolation,
Angular sanitizes and escapes untrusted values.

_Angular templates are the same as executable code_: HTML, attributes, and binding expressions
(but not the values bound) in templates are trusted to be safe. This means that applications must
prevent values that an attacker can control from ever making it into the source code of a
template. Never generate template source code by concatenating user input and templates.
To prevent these vulnerabilities, use
the [offline template compiler](guide/security#offline-template-compiler), also known as _template injection_.
-->
프레임워크 계층에서 XSS 공격을 방어하기 위해 기본적으로 Angular는 모든 값을 신뢰할 수 없는 것으로 간주합니다.
그래서 템플릿 DOM에 추가되는 값이나 프로퍼티, 어트리뷰트, 스타일, 클래스 바인딩, 문자열 바인딩은 모두 Angular가 안전성을 검사하고 보안에 위배되는 값을 제거합니다.

_Angular 템플릿은 실행되는 코드라고 볼 수 있습니다_: 그래서 템플릿에 존재하는 HTML이나 어트리뷰트, 바인딩 표현식은 모두 안전한 코드가 되어야 하며, 애플리케이션은 XSS 공격자가 템플릿에 소스 코드를 추가할 수 없도록 해야 합니다.
사용자가 입력한 내용으로 템플릿을 구성하는 방식은 절대로 사용하면 안됩니다.
이 기능이 꼭 필요하다면 [오프라인 템플릿 컴파일러](guide/security#offline-template-compiler)를 사용해야 합니다. 이 방식은 _템플릿 주입(template injection)_ 이라고도 합니다.

<!--
### Sanitization and security contexts
-->
### 코드 안전성 검사와 보안 영역

<!--
_Sanitization_ is the inspection of an untrusted value, turning it into a value that's safe to insert into
the DOM. In many cases, sanitization doesn't change a value at all. Sanitization depends on context:
a value that's harmless in CSS is potentially dangerous in a URL.

Angular defines the following security contexts:

* **HTML** is used when interpreting a value as HTML, for example, when binding to `innerHtml`.
* **Style** is used when binding CSS into the `style` property.
* **URL** is used for URL properties, such as `<a href>`.
* **Resource URL** is a URL that will be loaded and executed as code, for example, in `<script src>`.

Angular sanitizes untrusted values for HTML, styles, and URLs; sanitizing resource URLs isn't
possible because they contain arbitrary code. In development mode, Angular prints a console warning
when it has to change a value during sanitization.
-->
_코드 안전성 검사(Sanitization)_ 란 안전성이 확인되지 않은 값을 검사해서 DOM에 적용할 수 있는 안전한 값으로 변환하는 것을 의미합니다.
일반적으로 코드 안전성 검사를 실행했을 때 값 전체를 한번에 처리하지는 않습니다.
코드 안전성 검사는 해당 컨텍스트에 필요한 부분만 처리됩니다.
그래서 CSS에는 위험하지 않은 코드라도 URL에 사용되면 위험할 수 있는 경우도 있습니다.

Angular는 다음과 같은 보안 영역(security context)을 구성합니다:

* 어떤 값이 HTML로 변환되는 경우에는 **HTML** 보안 영역이 구성됩니다. `innerHtml`로 바인딩되는 경우가 해당됩니다.
* `style` 프로퍼티로 CSS 코드가 바인딩되는 경우에는 **스타일** 보안 영역이 구성됩니다.
* `<a href>`와 같은 엘리먼트에 URL 프로퍼티가 사용되면 **URL** 보안 영역이 구성됩니다.
* `<script src>`와 같이 외부 코드를 로드해서 실행하는 경우에는 **리소스 URL** 보안 영역이 구성됩니다.

Angular는 HTML이나 스타일, URL로 사용되는 값에 모두 안전성 검사를 실행하지만, 리소스 URL에는 미처 처리되지 않은 악성 코드가 포함되어 있을 수도 있습니다.
그래서 개발 모드에서는 추가 안전성 검사가 필요하다고 판단하는 경우에 콘솔로 경고 메시지를 출력합니다.

<!--
### Sanitization example
-->
### 안전성 검사 예제

<!--
The following template binds the value of `htmlSnippet`, once by interpolating it into an element's
content, and once by binding it to the `innerHTML` property of an element:
-->
아래 템플릿 코드에서 `htmlSnippet`는 엘리먼트의 내용에 문자열 바인딩되면서 한 번, 엘리먼트의 `innerHTML` 프로퍼티에 바인딩되면서 한 번 실행됩니다:

<code-example path="security/src/app/inner-html-binding.component.html" header="src/app/inner-html-binding.component.html"></code-example>


<!--
Interpolated content is always escaped&mdash;the HTML isn't interpreted and the browser displays
angle brackets in the element's text content.

For the HTML to be interpreted, bind it to an HTML property such as `innerHTML`. But binding
a value that an attacker might control into `innerHTML` normally causes an XSS
vulnerability. For example, code contained in a `<script>` tag is executed:
-->
문자열 바인딩되는 내용은 언제나 안전하게 처리됩니다. 이 내용이 HTML 코드라면 이 코드는 HTML로 처리되지 않고 일반 문자열로 표시될 것입니다.

HTML 코드를 그대로 사용하려면 이 코드는 `innerHTML`과 같은 HTML 프로퍼티에 바인딩되어야 합니다.
하지만 이 코드를 아무 처리없이 바인딩하는 것은 공격자가 XSS 취약점을 사용하도록 하는 것과 같습니다.
예를 들어 `htmlSnippet`의 내용 안에 `<script>` 태그가 포함되어 있다고 합시다:

<<<<<<< HEAD
<!--
<code-example path="security/src/app/inner-html-binding.component.ts" linenums="false" header="src/app/inner-html-binding.component.ts (class)" region="class">
-->
<code-example path="security/src/app/inner-html-binding.component.ts" linenums="false" header="src/app/inner-html-binding.component.ts (클래스)" region="class">

</code-example>
=======
<code-example path="security/src/app/inner-html-binding.component.ts" header="src/app/inner-html-binding.component.ts (class)" region="class"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<!--
Angular recognizes the value as unsafe and automatically sanitizes it, which removes the `<script>`
tag but keeps safe content such as the `<b>` element.
-->
Angular는 이 코드에서 `<script>`와 같이 위험한 부분을 자동으로 제거하지만 `<b>` 엘리먼트와 같이 안전한 코드는 그대로 둡니다.


<div class="lightbox">
  <img src='generated/images/guide/security/binding-inner-html.png' alt='A screenshot showing interpolated and bound HTML values'>
</div>


<!--
### Direct use of the DOM APIs and explicit sanitization calls
-->
### DOM API를 직접 사용하는 경우와 명시적으로 안전성 검사를 실행하는 경우

<!--
The built-in browser DOM APIs don't automatically protect you from security vulnerabilities.
For example, `document`, the node available through `ElementRef`, and many third-party APIs
contain unsafe methods. In the same way, if you interact with other libraries that manipulate
the DOM, you likely won't have the same automatic sanitization as with Angular interpolations.
Avoid directly interacting with the DOM and instead use Angular templates where possible.

For cases where this is unavoidable, use the built-in Angular sanitization functions.
Sanitize untrusted values with the [DomSanitizer.sanitize](api/platform-browser/DomSanitizer#sanitize)
method and the appropriate `SecurityContext`. That function also accepts values that were
marked as trusted using the `bypassSecurityTrust`... functions, and will not sanitize them,
as [described below](#bypass-security-apis).
-->
브라우저가 제공하는 DOM API는 기본적으로 보안 취약점을 검사하지 않습니다.
그래서 `ElementRef`로 참조할 수 있는 `document` 노드나 서드 파티 API에는 보안에 취약한 메소드가 존재할 수 있습니다.
그런데 노드와 라이브러리가 제공하는 API를 사용해서 DOM을 조작하면 Angular가 자동으로 처리했던 것과 같은 안전성 검사도 자동으로 실행되지 않습니다.
따라서 DOM을 직접 조작하지 말고 Angular의 템플릿을 최대한 활용하는 것이 좋습니다.

하지만 DOM을 직접 조작해야만 할 때는 Angular가 제공하는 안전성 검사 함수를 활용할 수도 있습니다.
안전이 확인되지 않은 코드에 [DomSanitizer.sanitize](api/platform-browser/DomSanitizer#sanitize) 메소드를 사용하면 Angular가 자동으로 구성하는 것과 같은 `SecurityContext`를 구성할 수 있습니다.
그리고 [아래에서 자세하게 설명하겠지만](#bypass-security-apis), 이미 `bypassSecurityTrust...`와 같은 함수가 실행된 코드는 안전성 검사의 대상이 되지 않습니다.

<!--
### Content security policy
-->
### 컨텐츠 보안 정책

<!--
Content Security Policy (CSP) is a defense-in-depth
technique to prevent XSS. To enable CSP, configure your web server to return an appropriate
`Content-Security-Policy` HTTP header. Read more about content security policy at
[An Introduction to Content Security Policy](http://www.html5rocks.com/en/tutorials/security/content-security-policy/)
on the HTML5Rocks website.
-->
컨텐츠 보안 정책(Content Security Policy, CSP)은 XSS 공격을 근본적으로 방지하는 테크닉 중 하나입니다.
CSP를 활성화하려면 웹서버가 응답을 반환할 때 HTTP 헤더에 `Content-Security-Policy`를 붙이도록 서버 설정을 변경해야 합니다.
더 자세한 내용은 HTML5Rocks 웹사이트에서 제공하는 [An Introduction to Content Security Policy](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) 문서를 참고하세요.

{@a offline-template-compiler}

<!--
### Use the offline template compiler
-->
### 오프라인 템플릿 컴파일러를 사용하세요.

<!--
The offline template compiler prevents a whole class of vulnerabilities called template injection,
and greatly improves application performance. Use the offline template compiler in production
deployments; don't dynamically generate templates. Angular trusts template code, so generating
templates, in particular templates containing user data, circumvents Angular's built-in protections.
For information about dynamically constructing forms in a safe way, see the
[Dynamic Forms](guide/dynamic-form) guide page.
-->
오프라인 템플릿 컴파일러를 사용하면 템플릿 인젝션이라고 부르는 취약점 공격을 근본적으로 방어할 수 있으며, 애플리케이션 실행 성능도 크게 개선할 수 있습니다.
오프라인 템플릿 컴파일러는 템플릿을 동적으로 구성하지 않기 때문에 운영 모드에 사용하기도 좋습니다.
오프라인 템플릿 컴파일러를 사용하면 템플릿 코드를 모두 안전한 코드인 것으로 간주하기 때문에 Angular가 자동으로 실행하는 보안 기능도 실행되지 않습니다.
안전하게 동적 폼을 구성하는 방법에 대해 더 자세하게 알아보려면 [동적 폼](guide/dynamic-form) 가이드 문서를 참고하세요.

<!--
### Server-side XSS protection
-->
### 서버에서 XSS 공격 방어하기

<!--
HTML constructed on the server is vulnerable to injection attacks. Injecting template code into an
Angular application is the same as injecting executable code into the
application: it gives the attacker full control over the application. To prevent this,
use a templating language that automatically escapes values to prevent XSS vulnerabilities on
the server. Don't generate Angular templates on the server side using a templating language; doing this
carries a high risk of introducing template-injection vulnerabilities.
-->
서버에서 HTML을 구성하는 경우에도 템플릿 인젝션 공격에 대한 취약점이 존재합니다.
템플릿 코드를 Angular 애플리케이션에 주입할 수 있다는 것은 이 애플리케이션에서 실행되는 코드를 애플리케이션 외부에서 주입할 수 있다는 것과 같습니다.
이런 공격이 성공하면 공격자가 애플리케이션을 자유롭게 조작할 수 있습니다.
그래서 이 공격을 막기 위해 서버에서도 XSS 취약점을 노리는 위험한 코드들을 제거해야 합니다.
템플릿 인젝션 취약점을 근본적으로 방어하려면 서버에서 Angular 템플릿을 생성하지 않는 것이 좋습니다.


<h2 id='bypass-security-apis'>
  <!--
  Trusting safe values
  -->
  안전한 값으로 간주하기
</h2>


<!--
Sometimes applications genuinely need to include executable code, display an `<iframe>` from some
URL, or construct potentially dangerous URLs. To prevent automatic sanitization in any of these
situations, you can tell Angular that you inspected a value, checked how it was generated, and made
sure it will always be secure. But *be careful*. If you trust a value that might be malicious, you
are introducing a security vulnerability into your application. If in doubt, find a professional
security reviewer.

To mark a value as trusted, inject `DomSanitizer` and call one of the
following methods:
-->
때로는 외부에서 실행할 수 있는 코드를 가져와서 애플리케이션에 사용해야 하는 경우가 있습니다.
URL을 사용해서 `<iframe>`을 표시하거나 URL을 조합해서 활용하는 경우가 그렇습니다.
이런 경우에는 이 코드가 정상적으로 생성되었고, 안전한 것으로 확인되었다고 처리해서 Angular가 자동으로 실행하는 안전성 검사를 우회해야 합니다.
하지만 *조심하세요*.
악성 코드를 안전한 것으로 간주하면 애플리케이션에 보안 취약점을 열어놓는 것이 됩니다.
코드가 안전한 것인지 확실하지 않으면 보안 전문가에게 꼭 확인을 받으세요.

코드를 안전한 것으로 간주하려면 `DomSanitizer`를 의존성으로 주입해서 다음 메소드 중 하나를 실행하면 됩니다.

* `bypassSecurityTrustHtml`
* `bypassSecurityTrustScript`
* `bypassSecurityTrustStyle`
* `bypassSecurityTrustUrl`
* `bypassSecurityTrustResourceUrl`

<!--
Remember, whether a value is safe depends on context, so choose the right context for
your intended use of the value. Imagine that the following template needs to bind a URL to a
`javascript:alert(...)` call:
-->
코드를 안전한 것으로 간주하려면 해당 컨텍스트에 어울리는 메소드를 실행해야 합니다.
아래 템플릿 코드에서는 URL을 바인딩하는 부분이 있는데 이 URL에 `javaScript:alert(...)`과 같은 코드가 사용된다고 합시다.

<code-example path="security/src/app/bypass-security.component.html" header="src/app/bypass-security.component.html (URL)" region="URL"></code-example>


<!--
Normally, Angular automatically sanitizes the URL, disables the dangerous code, and
in development mode, logs this action to the console. To prevent
this, mark the URL value as a trusted URL using the `bypassSecurityTrustUrl` call:
-->
일반적으로 Angular는 URL을 대상으로 안전성 검사를 실행하기 때문에 `javascript:alert(...)`과 같이 위험한 코드는 자동으로 제거되며, 개발모드라면 콘솔에 경고 메시지가 출력됩니다.
하지만 이 동작을 우회하려면 `bypassSecurityTrustUrl`을 실행해서 URL로 사용되는 코드가 안전하다는 것으로 체크하면 됩니다.

<code-example path="security/src/app/bypass-security.component.ts" header="src/app/bypass-security.component.ts (trust-url)" region="trust-url"></code-example>



<div class="lightbox">
  <img src='generated/images/guide/security/bypass-security-component.png' alt='A screenshot showing an alert box created from a trusted URL'>
</div>


<!--
If you need to convert user input into a trusted value, use a
controller method. The following template allows users to enter a YouTube video ID and load the
corresponding video in an `<iframe>`. The `<iframe src>` attribute is a resource URL security
context, because an untrusted source can, for example, smuggle in file downloads that unsuspecting users
could execute. So call a method on the controller to construct a trusted video URL, which causes
Angular to allow binding into `<iframe src>`:
-->
사용자가 입력한 내용을 안전한 코드로 처리하려면 클래스 코드에 메소드를 정의해서 우회하면 됩니다.
아래 코드에서는 사용자에게 YouTube 영상 ID를 입력받고 이 ID에 해당하는 영상을 `<iframe>`에 로드합니다.
이 때 사용자가 입력하는 URL은 `<iframe src>` 어트리뷰트에 바인딩되어 실행되기 때문에, Angular는 이 URL이 위험할 수 있다고 판단하고 URL 컨텍스트로 안전성 검사를 실행합니다.
안전성 검사를 실행하지 않으면 영상을 표시하지 않고 파일을 다운로드하게 할 수도 있기 때문에 위험합니다.
이 때 사용자가 입력하는 영상의 URL이 언제나 안전하다고 생각하면 이 코드를 안전한 값으로 처리하는 메소드를 정의하고, 이 메소드가 처리한 URL을 `<iframe src>`에 활용할 수 있습니다.


<code-example path="security/src/app/bypass-security.component.html" header="src/app/bypass-security.component.html (iframe)" region="iframe"></code-example>



<code-example path="security/src/app/bypass-security.component.ts" header="src/app/bypass-security.component.ts (trust-video-url)" region="trust-video-url"></code-example>




<h2 id='http'>
  <!--
  HTTP-level vulnerabilities
  -->
  HTTP 계층의 취약점
</h2>


<!--
Angular has built-in support to help prevent two common HTTP vulnerabilities, cross-site request
forgery (CSRF or XSRF) and cross-site script inclusion (XSSI). Both of these must be mitigated primarily
on the server side, but Angular provides helpers to make integration on the client side easier.
-->
Angular는 크로스 사이트 요청 위조(cross-site request forgery, CSRF, XSRF)나 크로스 사이트 스크립트 주입(cross-site script inclusion, XSSI)과 같은 HTTP 취약점을 자동으로 방어합니다.
하지만 Angular가 제공하는 헬퍼는 클라이언트만을 위한 것이기 때문에 서버쪽에서도 반드시 취약점을 방어하는 설정을 추가해야 합니다.

<h3 id='xsrf'>
  <!--
  Cross-site request forgery
  -->
  크로스 사이트 요청 위조
</h3>


<!--
In a cross-site request forgery (CSRF or XSRF), an attacker tricks the user into visiting
a different web page (such as `evil.com`) with malignant code that secretly sends a malicious request
to the application's web server (such as `example-bank.com`).

Assume the user is logged into the application at `example-bank.com`.
The user opens an email and clicks a link to `evil.com`, which opens in a new tab.

The `evil.com` page immediately sends a malicious request to `example-bank.com`.
Perhaps it's a request to transfer money from the user's account to the attacker's account.
The browser automatically sends the `example-bank.com` cookies (including the authentication cookie) with this request.

If the `example-bank.com` server lacks XSRF protection, it can't tell the difference between a legitimate
request from the application and the forged request from `evil.com`.

To prevent this, the application must ensure that a user request originates from the real
application, not from a different site.
The server and client must cooperate to thwart this attack.
-->
크로스 사이트 요청 위조(cross-site request forgery, CSRF, XSRF)는 애플리케이션이 웹 서버(ex. `example-bank.com`)로 보내는 요청을 가로채서 다른 웹 페이지(ex. `evil.com`)로 보내거나 이 과정에 악성 코드를 실행하게 하는 공격 방식입니다.

사용자가 `example-bank.com`에서 제공하는 애플리케이션에 로그인한 상태라고 합시다.
이 때 사용자가 이메일을 열어서 `evil.com`로 향하는 링크를 클릭하면 새 탭에서 `evil.com` 페이지가 열릴 수 있습니다.

이 때 `evil.com` 페이지는 즉시 `example-bank.com`으로 악성 요청을 보낸다고 합시다.
이 요청은 사용자의 계좌에서 공격자의 계좌로 돈을 보내라는 요청이 될 수도 있습니다.
브라우저 쿠키에 저장된 인증정보는 악의적으로 활용될 수 있습니다.

만약 `example-bank.com` 서버가 XSRF 공격을 방어하지 않는다면 정상적인 애플리케이션에서 보낸 정상 요청인지, `evil.com`에서 요청한 악성 요청인지 구분할 수 없습니다.

그래서 애플리케이션은 사용자가 보낸 요청이 정상 애플리케이션에서 보낸 것인지 꼭 확인해야 합니다.
이런 공격은 서버와 클라이언트가 모두 대응해야 방어할 수 있습니다.

<!--
In a common anti-XSRF technique, the application server sends a randomly
generated authentication token in a cookie.
The client code reads the cookie and adds a custom request header with the token in all subsequent requests.
The server compares the received cookie value to the request header value and rejects the request if the values are missing or don't match.

This technique is effective because all browsers implement the _same origin policy_. Only code from the website
on which cookies are set can read the cookies from that site and set custom headers on requests to that site.
That means only your application can read this cookie token and set the custom header. The malicious code on `evil.com` can't.

Angular's `HttpClient` has built-in support for the client-side half of this technique. Read about it more in the [HttpClient guide](/guide/http#security-xsrf-protection).

For information about CSRF at the Open Web Application Security Project (OWASP), see
<a href="https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29">Cross-Site Request Forgery (CSRF)</a> and
<a href="https://www.owasp.org/index.php/CSRF_Prevention_Cheat_Sheet">Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet</a>.
The Stanford University paper
<a href="https://seclab.stanford.edu/websec/csrf/csrf.pdf">Robust Defenses for Cross-Site Request Forgery</a> is a rich source of detail.

See also Dave Smith's easy-to-understand
<a href="https://www.youtube.com/watch?v=9inczw6qtpY" title="Cross Site Request Funkery Securing Your Angular Apps From Evil Doers">talk on XSRF at AngularConnect 2016</a>.
-->
일반적으로 XSRF 공격을 방어하려면 애플리케이션 서버가 무작위로 생성한 인증 토큰을 쿠키에 저장해두고, 이후에 요청을 보낼 때 이 토큰을 헤더에 포함하도록 하면 됩니다.
그리고 서버는 클라이언트가 보낸 요청을 받았을 때 이 토큰이 존재하는지, 정상적으로 생성된 토큰인지 확인해야 합니다.

브라우저는 모두 _동일 근원 정책(same origin policy)_ 을 준수하기 때문에 이 방법을 사용할 수 있습니다.
왜냐하면 쿠키를 저장한 웹사이트에서만 이 쿠키를 읽을 수 있고, 요청 헤더에 커스텀 헤더로 추가할 수 있기 때문입니다.
따라서 쿠키를 저장한 애플리케이션만 이 쿠키를 읽을 수 있고 커스텀 헤더를 추가할 수 있습니다.
`evil.com`가 실행하는 악성 코드는 이 쿠키에 접근할 수 없습니다.

Angular가 제공하는 `HttpClient`도 이 방식을 활용합니다.
자세한 내용은 [HttpClient 가이드 문서](/guide/http)를 참고하세요.

Open Web Application Security Project (OWASP)에서 제공하는 CSRF 방어 방법에 대해 알아보려면 <a href="https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29">Cross-Site Request Forgery (CSRF)</a>나 <a href="https://www.owasp.org/index.php/CSRF_Prevention_Cheat_Sheet">Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet</a> 문서를 참고하세요.
<a href="https://seclab.stanford.edu/websec/csrf/csrf.pdf">Robust Defenses for Cross-Site Request Forgery</a>에도 자세하게 설명되어 있습니다.

<a href="https://www.youtube.com/watch?v=9inczw6qtpY" title="Cross Site Request Funkery Securing Your Angular Apps From Evil Doers">Dave Smith가 AngularConnect 2016에서 발표한 XSRF에 대한 이야기</a>도 도움이 될 것입니다.


<h3 id='xssi'>
  <!--
  Cross-site script inclusion (XSSI)
  -->
  크로스 사이트 스크립트 주입
</h3>


<!--
Cross-site script inclusion, also known as JSON vulnerability, can allow an attacker's website to
read data from a JSON API. The attack works on older browsers by overriding native JavaScript
object constructors, and then including an API URL using a `<script>` tag.

This attack is only successful if the returned JSON is executable as JavaScript. Servers can
prevent an attack by prefixing all JSON responses to make them non-executable, by convention, using the
well-known string `")]}',\n"`.

Angular's `HttpClient` library recognizes this convention and automatically strips the string
`")]}',\n"` from all responses before further parsing.

For more information, see the XSSI section of this [Google web security blog
post](https://security.googleblog.com/2011/05/website-security-for-webmasters.html).
-->
크로스 사이트 스크립트 주입, JSON 취약점이라고도 알려져 있는 이 취약점을 활용하면 공격자가 JSON API를 활용해서 데이터를 탈취할 수 있습니다.
이 공격은 오래된 브라우저에서 JavaScript 객체 생성자를 오버라이드한 다음 `<script>` 태그를 활용하는 방식으로 동작합니다.

이 공격은 응답으로 받은 JSON 객체가 JavaScript로 실행될 때만 가능합니다.
그래서 서버는 JSON 응답을 보낼 때 반드시 실행되지 않도록 처리해야 하는데, 이 때 보통 `")]}',\n"`라는 문자열을 활용합니다.

Angular가 제공하는 `HttpClient` 라이브러리도 이 방식을 사용하며, 응답을 파싱한 뒤에는 `")]}',\n"` 문자열을 자동으로 제거합니다.

더 자세한 내용은 [Google web security blog
post](https://security.googleblog.com/2011/05/website-security-for-webmasters.html)의 XSSI 섹션을 참고하세요.


<h2 id='code-review'>
  <!--
  Auditing Angular applications
  -->
  Angular 애플리케이션 검증하기
</h2>


<!--
Angular applications must follow the same security principles as regular web applications, and
must be audited as such. Angular-specific APIs that should be audited in a security review,
such as the [_bypassSecurityTrust_](guide/security#bypass-security-apis) methods, are marked in the documentation
as security sensitive.
-->
Angular 애플리케이션은 반드시 일반적인 웹 애플리케이션이 준수하는 보안 정책을 준수해야 하며, 애플리케이션을 검증할 때도 이 정책을 기준으로 해야 합니다.
그래서 [_bypassSecurityTrust_](guide/security#bypass-security-apis) 메소드와 같이 Angular에서만 제공하는 API라면 반드시 보안 취약점을 확인해야 하며, API 문서에도 보안 취약점이 존재할 수 있다고 경고하고 있습니다.
