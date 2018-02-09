<div class="breadcrumb">
    <a href="#">API<a> / <a href="#">@core<a>
</div>
<header class="api-header">
    <h1><label class="api-status-label experimental">experimental</label><label class="api-type-label class">class</label>Class Name</h1>
</header>
<div class="page-actions">
    <a href="#"><label class="raised page-label"><i class="material-icons">mode_edit</i>suggest edits</label></a>
    <a href="#"><label class="raised page-label"><i class="material-icons">code</i>view source</label></a>
</div>
<p>Class description goes here. This is a short and to the point one or two sentence description that easily introduces the reader to the class.</p>
<div class="api-body">
    <section>
        <h2>Overview</h2>
        <code-example language="ts" hidecopy="true" ng-version="5.2.0"><aio-code class="simple-code" ng-reflect-ng-class="[object Object]" ng-reflect-code="
    class <a href=&quot;api/core/Compi" ng-reflect-hide-copy="true" ng-reflect-language="ts" ng-reflect-linenums="" ng-reflect-path="" ng-reflect-region="" ng-reflect-title=""><pre class="prettyprint lang-ts">
        <code class="animated fadeIn"><span class="kwd">class</span><span class="pln"> </span><a href="api/core/Compiler" class="code-anchor"><span class="typ">Compiler</span></a><span class="pln"> </span><span class="pun">{</span><span class="pln">
    </span><a class="code-anchor" href="api/core/Compiler#compileModuleSync"><span class="pln">compileModuleSync</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;(</span><span class="pln">moduleType</span><span class="pun">:</span><span class="pln"> </span><span class="typ">Type</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;):</span><span class="pln"> </span><span class="typ">NgModuleFactory</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;</span></a><span class="pln">
    </span><a class="code-anchor" href="api/core/Compiler#compileModuleAsync"><span class="pln">compileModuleAsync</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;(</span><span class="pln">moduleType</span><span class="pun">:</span><span class="pln"> </span><span class="typ">Type</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;):</span><span class="pln"> </span><span class="typ">Promise</span><span class="pun">&lt;</span><span class="typ">NgModuleFactory</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;&gt;</span></a><span class="pln">
    </span><a class="code-anchor" href="api/core/Compiler#compileModuleAndAllComponentsSync"><span class="pln">compileModuleAndAllComponentsSync</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;(</span><span class="pln">moduleType</span><span class="pun">:</span><span class="pln"> </span><span class="typ">Type</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;):</span><span class="pln"> </span><span class="typ">ModuleWithComponentFactories</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;</span></a><span class="pln">
    </span><a class="code-anchor" href="api/core/Compiler#compileModuleAndAllComponentsAsync"><span class="pln">compileModuleAndAllComponentsAsync</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;(</span><span class="pln">moduleType</span><span class="pun">:</span><span class="pln"> </span><span class="typ">Type</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;):</span><span class="pln"> </span><span class="typ">Promise</span><span class="pun">&lt;</span><span class="typ">ModuleWithComponentFactories</span><span class="pun">&lt;</span><span class="pln">T</span><span class="pun">&gt;&gt;</span></a><span class="pln">
    </span><a class="code-anchor" href="api/core/Compiler#clearCache"><span class="pln">clearCache</span><span class="pun">():</span><span class="pln"> </span><span class="kwd">void</span></a><span class="pln">
    </span><a class="code-anchor" href="api/core/Compiler#clearCacheFor"><span class="pln">clearCacheFor</span><span class="pun">(</span><span class="pln">type</span><span class="pun">:</span><span class="pln"> </span><span class="typ">Type</span><span class="pun">&lt;</span><span class="pln">any</span><span class="pun">&gt;)</span></a><span class="pln">
    </span><span class="pun">}</span></code>
        </pre></aio-code></code-example>
    </section>
    <section>
        <h2>Description</h2>
        <p>The longer class description goes here which can include multiple paragraphs.</p>
        </p>Bacon ipsum dolor amet pork belly capicola sirloin venison alcatra ground round ham hock jowl turkey picanha bresaola pancetta brisket chicken fatback. Burgdoggen kevin salami jowl shoulder jerky leberkas meatball. Ham hock picanha burgdoggen pork belly rump bacon cupim. Bacon kielbasa sirloin shank strip steak ground round. Bresaola cow salami meatloaf pork chop leberkas flank turducken biltong meatball chuck pork tri-tip chicken. Ribeye corned beef shoulder, meatloaf strip steak jerky porchetta capicola alcatra ham.</p>
        <h3>Subclasses</h3>
        <ul>
            <li><a href="#">Subclass1</a></li>
            <li><a href="#">Subclass2</a></li>
            <li><a href="#">Subclass3</a></li>
        </ul>
        <h3>See Also</h3>
        <ul>
            <li><a href="#">Link1</a></li>
            <li><a href="#">Link2</a></li>
        </ul>
    </section>
    <section>
        <h2>Constructor</h2>
        <code-example hidecopy="true" class="no-box api-heading" ng-version="5.2.0">
        <aio-code class="simple-code"><pre class="prettyprint lang-">   
        <code class="animated fadeIn"><span class="kwd">constructor</span><span class="pun">(</span><span class="pln">element</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">,</span><span class="pln"> keyframes</span><span class="pun">:</span><span class="pln"> </span><span class="pun">{</span><span class="pln">
        </span><span class="pun">[</span><span class="pln">key</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">]:</span><span class="pln"> </span><span class="kwd">string</span><span class="pln"> </span><span class="pun">|</span><span class="pln"> number</span><span class="pun">;</span><span class="pln">
    </span><span class="pun">}[],</span><span class="pln"> duration</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> delay</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> easing</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">,</span><span class="pln"> previousPlayers</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">[])</span></code>
        </pre></aio-code></code-example>
    </section>
    <section>
        <h2>Properties</h2>
        <table class="is-full-width list-table">
        <thead>
        <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Description</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td>
            <code><strong>Property1</strong></code>
        </td>
        <td><label class="property-type-label type">Type</label></td>
        <td>Description goes here</td>
        </tr>
        <tr>
        <td>
            <code><strong>Property2</strong></code>
        </td>
        <td>Type</td>
        <td>Description goes here</td>
        </tr>
        <tr>
        <td>
            <code><strong>Property3</strong></code>
        </td>
        <td>Type</td>
        <td>Description goes here</td>
        </tr>
        </tbody>
    </table>
    </section>
    <section class="api-method">
        <h2>Methods</h2>
        <table class="is-full-width item-table">
        <thead>
        <tr>
        <th>Method1Name( )</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td>
            <p>Description goes here</p>
            <br>
            <p>Bacon ipsum dolor amet pork belly capicola sirloin venison alcatra ground round ham hock jowl turkey picanha bresaola pancetta brisket chicken fatback. Burgdoggen kevin salami jowl shoulder jerky leberkas meatball. Ham hock picanha burgdoggen pork belly rump bacon cupim. Bacon kielbasa sirloin shank strip steak ground round. Bresaola cow salami meatloaf pork chop leberkas flank turducken biltong meatball chuck pork tri-tip chicken. Ribeye corned beef shoulder, meatloaf strip steak jerky porchetta capicola alcatra ham.</p>
        </td>
        </tr>
        </tbody>
    </table>
    <table class="is-full-width api-method item-table">
        <thead>
        <tr>
        <th>Method2Name( )</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td>
            <p>Description goes here</p>
            <hr>
            <h5>Declaration</h5>
            <code-example language="ts" hidecopy="true" ng-version="5.2.0">
                <aio-code class="simple-code"><pre class="prettyprint lang-ts">
                    <code class="animated fadeIn"><span class="kwd">class</span><span class="pln"> </span><a href="api/animations/AnimationBuilder" class="code-anchor"><span class="typ">AnimationBuilder</span></a><span class="pln"> </span><span class="pun">{</span><span class="pln"></span><a class="code-anchor" href="api/animations/AnimationBuilder#build"><span class="pln">build</span><span class="pun">(</span><span class="pln">animation</span><span class="pun">:</span><span class="pln"> </span><span class="typ">AnimationMetadata</span><span class="pln"> </span><span class="pun">|</span><span class="pln"> </span><span class="typ">AnimationMetadata</span><span class="pun">[]):</span><span class="pln"> </span><span class="typ">AnimationFactory</span></a><span class="pln"></span><span class="pun">}</span></code></pre>
                </aio-code>
            </code-example>
            <h6>Parameters</h6>
            <h6>Returns</h6>
            <p>Returns information and results goes here.</p>
            <h6>Errors</h6>
            <p>Error information goes here</p>
            <hr>
            <p>Further details provided as needed. Bacon ipsum dolor amet pork belly capicola sirloin venison alcatra ground round ham hock jowl turkey picanha bresaola pancetta brisket chicken fatback. Burgdoggen kevin salami jowl shoulder jerky leberkas meatball.</p><hr>
            <h6>Overloads</h6>
                <table class="is-full-width">
                <tbody>
                <tr>
                <td>
                    <code-example hidecopy="true" class="no-box api-heading" ng-version="5.2.0">
        <aio-code class="simple-code"><pre class="prettyprint lang-">   
        <code class="animated fadeIn"><span class="kwd">constructor</span><span class="pun">(</span><span class="pln">element</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">,</span><span class="pln"> keyframes</span><span class="pun">:</span><span class="pln"> </span><span class="pun">{</span><span class="pln">
        </span><span class="pun">[</span><span class="pln">key</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">]:</span><span class="pln"> </span><span class="kwd">string</span><span class="pln"> </span><span class="pun">|</span><span class="pln"> number</span><span class="pun">;</span><span class="pln">
    </span><span class="pun">}[],</span><span class="pln"> duration</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> delay</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> easing</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">,</span><span class="pln"> previousPlayers</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">[])</span></code>
        </pre></aio-code></code-example>
                </td>
                <td>Description goes here</td>
                </tr>
                <tr>
                <td>
                    <code-example hidecopy="true" class="no-box api-heading" ng-version="5.2.0">
        <aio-code class="simple-code"><pre class="prettyprint lang-">   
        <code class="animated fadeIn"><span class="kwd">constructor</span><span class="pun">(</span><span class="pln">element</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">,</span><span class="pln"> keyframes</span><span class="pun">:</span><span class="pln"> </span><span class="pun">{</span><span class="pln">
        </span><span class="pun">[</span><span class="pln">key</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">]:</span><span class="pln"> </span><span class="kwd">string</span><span class="pln"> </span><span class="pun">|</span><span class="pln"> number</span><span class="pun">;</span><span class="pln">
    </span><span class="pun">}[],</span><span class="pln"> duration</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> delay</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> easing</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">,</span><span class="pln"> previousPlayers</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">[])</span></code>
        </pre></aio-code></code-example>
                </td>
                <td>Description goes here</td>
                </tr>
                </tbody>
            </table>
            <hr>
            <h5>Example: Descriptive Title of Method Example</h5>
            <p>Bacon ipsum dolor amet pork belly capicola sirloin venison alcatra ground round ham hock jowl turkey picanha bresaola pancetta brisket chicken fatback. Burgdoggen kevin salami jowl shoulder jerky leberkas meatball. Ham hock picanha burgdoggen pork belly rump bacon cupim. Bacon kielbasa sirloin shank strip steak ground round. Bresaola cow salami meatloaf pork chop leberkas flank turducken biltong meatball chuck pork tri-tip chicken. Ribeye corned beef shoulder, meatloaf strip steak jerky porchetta capicola alcatra ham.</p>
        </td>
        </tr>
        </tbody>
    </table>
    </section>
    <section>
        <h2>Example: Descriptive Title of Combined Example Goes Here</h2>
        <p>Intro description text about what the example is and how it can be used.</p>
            <code-example hidecopy="true" class="no-box api-heading" ng-version="5.2.0">
        <aio-code class="simple-code"><pre class="prettyprint lang-">   
        <code class="animated fadeIn"><span class="kwd">constructor</span><span class="pun">(</span><span class="pln">element</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">,</span><span class="pln"> keyframes</span><span class="pun">:</span><span class="pln"> </span><span class="pun">{</span><span class="pln">
        </span><span class="pun">[</span><span class="pln">key</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">]:</span><span class="pln"> </span><span class="kwd">string</span><span class="pln"> </span><span class="pun">|</span><span class="pln"> number</span><span class="pun">;</span><span class="pln">
    </span><span class="pun">}[],</span><span class="pln"> duration</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> delay</span><span class="pun">:</span><span class="pln"> number</span><span class="pun">,</span><span class="pln"> easing</span><span class="pun">:</span><span class="pln"> </span><span class="kwd">string</span><span class="pun">,</span><span class="pln"> previousPlayers</span><span class="pun">:</span><span class="pln"> any</span><span class="pun">[])</span></code>
        </pre></aio-code></code-example>
        <p>Further explanation provided as needed. Bacon ipsum dolor amet pork belly capicola sirloin venison alcatra ground round ham hock jowl turkey picanha bresaola pancetta brisket chicken fatback. Burgdoggen kevin salami jowl shoulder jerky leberkas meatball.</p>
    </section>
</div>