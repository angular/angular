'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * Represents an Angular ProtoView in the Rendering Context.
 *
 * When you implement a custom {@link Renderer}, `RenderProtoViewRef` specifies what Render View
 * your renderer should create.
 *
 * `RenderProtoViewRef` is a counterpart to {@link ProtoViewRef} available in the Application
 * Context. But unlike `ProtoViewRef`, `RenderProtoViewRef` contains all static nested Proto Views
 * that are recursively merged into a single Render Proto View.

 *
 * <!-- TODO: this is created by Renderer#createProtoView in the new compiler -->
 */
var RenderProtoViewRef = (function () {
    function RenderProtoViewRef() {
    }
    return RenderProtoViewRef;
})();
exports.RenderProtoViewRef = RenderProtoViewRef;
/**
 * Represents a list of sibling Nodes that can be moved by the {@link Renderer} independently of
 * other Render Fragments.
 *
 * Any {@link RenderView} has one Render Fragment.
 *
 * Additionally any View with an Embedded View that contains a {@link NgContent View Projection}
 * results in additional Render Fragment.
 */
/*
  <div>foo</div>
  {{bar}}


  <div>foo</div> -> view 1 / fragment 1
  <ul>
    <template ng-for>
      <li>{{fg}}</li> -> view 2 / fragment 1
    </template>
  </ul>
  {{bar}}


  <div>foo</div> -> view 1 / fragment 1
  <ul>
    <template ng-if>
      <li><ng-content></></li> -> view 1 / fragment 2
    </template>
    <template ng-for>
      <li><ng-content></></li> ->
      <li></li>                -> view 1 / fragment 2 + view 2 / fragment 1..n-1
    </template>
  </ul>
  {{bar}}
 */
// TODO(i): refactor into an interface
var RenderFragmentRef = (function () {
    function RenderFragmentRef() {
    }
    return RenderFragmentRef;
})();
exports.RenderFragmentRef = RenderFragmentRef;
/**
 * Represents an Angular View in the Rendering Context.
 *
 * `RenderViewRef` specifies to the {@link Renderer} what View to update or destroy.
 *
 * Unlike a {@link ViewRef} available in the Application Context, Render View contains all the
 * static Component Views that have been recursively merged into a single Render View.
 *
 * Each `RenderViewRef` contains one or more {@link RenderFragmentRef Render Fragments}, these
 * Fragments are created, hydrated, dehydrated and destroyed as a single unit together with the
 * View.
 */
// TODO(i): refactor into an interface
var RenderViewRef = (function () {
    function RenderViewRef() {
    }
    return RenderViewRef;
})();
exports.RenderViewRef = RenderViewRef;
var RenderTemplateCmd = (function () {
    function RenderTemplateCmd() {
    }
    return RenderTemplateCmd;
})();
exports.RenderTemplateCmd = RenderTemplateCmd;
var RenderBeginCmd = (function (_super) {
    __extends(RenderBeginCmd, _super);
    function RenderBeginCmd() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(RenderBeginCmd.prototype, "ngContentIndex", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RenderBeginCmd.prototype, "isBound", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return RenderBeginCmd;
})(RenderTemplateCmd);
exports.RenderBeginCmd = RenderBeginCmd;
var RenderTextCmd = (function (_super) {
    __extends(RenderTextCmd, _super);
    function RenderTextCmd() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(RenderTextCmd.prototype, "value", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return RenderTextCmd;
})(RenderBeginCmd);
exports.RenderTextCmd = RenderTextCmd;
var RenderNgContentCmd = (function (_super) {
    __extends(RenderNgContentCmd, _super);
    function RenderNgContentCmd() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(RenderNgContentCmd.prototype, "index", {
        // The index of this NgContent element
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RenderNgContentCmd.prototype, "ngContentIndex", {
        // The index of the NgContent element into which this
        // NgContent element should be projected (if any)
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return RenderNgContentCmd;
})(RenderTemplateCmd);
exports.RenderNgContentCmd = RenderNgContentCmd;
var RenderBeginElementCmd = (function (_super) {
    __extends(RenderBeginElementCmd, _super);
    function RenderBeginElementCmd() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(RenderBeginElementCmd.prototype, "name", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RenderBeginElementCmd.prototype, "attrNameAndValues", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RenderBeginElementCmd.prototype, "eventTargetAndNames", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return RenderBeginElementCmd;
})(RenderBeginCmd);
exports.RenderBeginElementCmd = RenderBeginElementCmd;
var RenderBeginComponentCmd = (function (_super) {
    __extends(RenderBeginComponentCmd, _super);
    function RenderBeginComponentCmd() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(RenderBeginComponentCmd.prototype, "templateId", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return RenderBeginComponentCmd;
})(RenderBeginElementCmd);
exports.RenderBeginComponentCmd = RenderBeginComponentCmd;
var RenderEmbeddedTemplateCmd = (function (_super) {
    __extends(RenderEmbeddedTemplateCmd, _super);
    function RenderEmbeddedTemplateCmd() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(RenderEmbeddedTemplateCmd.prototype, "isMerged", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(RenderEmbeddedTemplateCmd.prototype, "children", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return RenderEmbeddedTemplateCmd;
})(RenderBeginElementCmd);
exports.RenderEmbeddedTemplateCmd = RenderEmbeddedTemplateCmd;
/**
 * Container class produced by a {@link Renderer} when creating a Render View.
 *
 * An instance of `RenderViewWithFragments` contains a {@link RenderViewRef} and an array of
 * {@link RenderFragmentRef}s belonging to this Render View.
 */
// TODO(i): refactor this by RenderViewWithFragments and adding fragments directly to RenderViewRef
var RenderViewWithFragments = (function () {
    function RenderViewWithFragments(
        /**
         * Reference to the {@link RenderViewRef}.
         */
        viewRef, 
        /**
         * Array of {@link RenderFragmentRef}s ordered in the depth-first order.
         */
        fragmentRefs) {
        this.viewRef = viewRef;
        this.fragmentRefs = fragmentRefs;
    }
    return RenderViewWithFragments;
})();
exports.RenderViewWithFragments = RenderViewWithFragments;
var RenderComponentTemplate = (function () {
    function RenderComponentTemplate(id, shortId, encapsulation, commands, styles) {
        this.id = id;
        this.shortId = shortId;
        this.encapsulation = encapsulation;
        this.commands = commands;
        this.styles = styles;
    }
    return RenderComponentTemplate;
})();
exports.RenderComponentTemplate = RenderComponentTemplate;
/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is {@link DomRenderer}. Also see {@link WebWorkerRenderer}.
 */
var Renderer = (function () {
    function Renderer() {
    }
    return Renderer;
})();
exports.Renderer = Renderer;
//# sourceMappingURL=api.js.map