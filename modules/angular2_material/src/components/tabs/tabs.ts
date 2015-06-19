import {
  Component,
  Directive,
  View,
  Parent,
  Optional,
  ViewRef,
  ViewContainerRef,
  onDestroy,
  NgFor,
  NgIf,
  ProtoViewRef,
  ElementRef
} from 'angular2/angular2';

import {ListWrapper} from 'angular2/src/facade/collection';


// TODO(jelbourn): ink bar animation.
// TODO(jelbourn): dynamic height mode
// TODO(jelbourn): tab pagination
// TODO(jelbourn): centering tabs
// TODO(jelbourn): stretching tabs
// TODO(jelbourn): disabled tabs
// TODO(jelbourn): default active tab
// TODO(jelbourn): focus wrapping
// TODO(jelbourn): onSelect / onDeselect events
// TODO(jelbourn): a11y attributes
// TODO(jelbourn): Don't embed separate left and right background images.
// TODO(jelbourn): Failure when tab is missing a label or a content.


/**
 * Private helper that is used to render a tab's content or label in the appropriate location.
 */
@Directive({
  selector: '[md-tab-view-container]',
  properties: ['mdTabViewContainer']
})
class MdTabViewContainer {
  viewContainerRef: ViewContainerRef;

  // Keep track of the last content loaded into this view container so we don't unload and
  // then reload that same content.
  lastContent: MdTabPart;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
    this.lastContent = null;
  }

  set mdTabViewContainer(content: MdTabPart) {
    // Only create a view when we have a ProtoView to instantiate and when the content has
    // actually changed.
    if (content.protoViewRef != null && this.lastContent != content) {
      if (this.lastContent != null) {
        // Because we always remove any previous content, we know there can be at most
        // one view to remove here.
        this.viewContainerRef.remove(0);
      }

      this.viewContainerRef.create(content.protoViewRef, 0, content.elementRef);
      this.lastContent = content;
    }
  }
}


/**
 * Component for `md-tabs`. Contains one or more `md-tab` elements.
 */
@Component({selector: 'md-tabs'})
@View({
  templateUrl: 'angular2_material/src/components/tabs/tabs.html',
  directives: [MdTabViewContainer, NgFor, NgIf]
})
export class MdTabs {
  tabs: List<MdTab>;
  selectedTab: MdTab;

  constructor() {
    this.tabs = [];
    this.selectedTab = null;
  }

  /** Registers a child md-tab. */
  addTab(tab: MdTab) {
    this.tabs.push(tab);
  }

  /** Deregisters a child md-tab. */
  removeTab(tab: MdTab) {
    ListWrapper.remove(this.tabs, tab);

    if (this.selectedTab == tab) {
      this.selectedTab = this.tabs.length > 0 ? this.tabs[0] : null;
    }
  }

  /** Selects the given tab as active. */
  selectTab(tab: MdTab) {
    this.selectedTab = tab;
  }
}

/** Interface for a tab directive that can be rendered using MdTabViewContainer. */
interface MdTabPart {
  protoViewRef: ProtoViewRef;
  elementRef: ElementRef;
}


/** One tab inside of `md-tabs`. */
@Directive({
  selector: '[md-tab]',
  lifecycle: [onDestroy],
  properties: ['label'],
})
export class MdTab implements MdTabPart {
  // The ProtoView and ElementRef are stored in order to pass them to MdTabViewContainer
  // in cases when this `md-tab` does not contain an `md-tab-content`.
  protoViewRef: ProtoViewRef;
  elementRef: ElementRef;

  /** The parent MdTabs group that this tab belongs to. */
  group: MdTabs;

  /** The label for this tab. Mutually exclusive with `customLabel`. */
  label: string;

  /** Child directive for custom label. */
  customLabel: MdTabLabel;

  /** Child directive for content, used when a custom label is specified. */
  customContent: MdTabContent;

  constructor(@Parent() tabGroup: MdTabs, @Optional() protoViewRef: ProtoViewRef,
              elementRef: ElementRef) {
    this.protoViewRef = protoViewRef;
    this.elementRef = elementRef;

    this.customContent = null;
    this.customLabel = null;
    this.label = '';

    this.group = tabGroup;
    tabGroup.addTab(this);

    if (tabGroup.selectedTab == null) {
      tabGroup.selectedTab = this;
    }
  }

  /**
   * Get the content for this MdTab, whethe it be directly inside the `md-tab` element or in
   * a child `md-tab-content` element.
   */
  get content(): MdTabPart {
    return this.customContent != null ? this.customContent : this;
  }

  onDestroy() {
    this.group.removeTab(this);
  }
}


/** Custom label content for an `md-tab`. */
@Directive({selector: '[md-tab-label]'})
export class MdTabLabel implements MdTabPart {
  protoViewRef: ProtoViewRef;
  elementRef: ElementRef;

  constructor(@Parent() tab: MdTab, protoViewRef: ProtoViewRef, elementRef: ElementRef) {
    tab.customLabel = this;
    this.protoViewRef = protoViewRef;
    this.elementRef = elementRef;
  }
}


/** Content for a `md-tab` that uses `md-tab-label`. */
@Directive({selector: '[md-tab-content]'})
export class MdTabContent implements MdTabPart {
  protoViewRef: ProtoViewRef;
  elementRef: ElementRef;

  constructor(@Parent() tab: MdTab, protoViewRef: ProtoViewRef, elementRef: ElementRef) {
    tab.customContent = this;
    this.protoViewRef = protoViewRef;
    this.elementRef = elementRef;
  }
}
