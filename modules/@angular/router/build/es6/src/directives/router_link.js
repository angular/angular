var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, HostListener, HostBinding, Input } from '@angular/core';
import { Router } from '../router';
import { ActivatedRoute } from '../router_state';
export let RouterLink = class RouterLink {
    constructor(router, route) {
        this.router = router;
        this.route = route;
        this.commands = [];
    }
    set routerLink(data) {
        if (Array.isArray(data)) {
            this.commands = data;
        }
        else {
            this.commands = [data];
        }
        this.updateTargetUrlAndHref();
    }
    onClick() {
        if (!(typeof this.target === "string") || this.target == '_self') {
            this.router.navigate(this.commands, { relativeTo: this.route });
            return false;
        }
        return true;
    }
    updateTargetUrlAndHref() {
        const tree = this.router.createUrlTree(this.commands, { relativeTo: this.route });
        if (tree) {
            this.href = this.router.serializeUrl(tree);
        }
    }
};
__decorate([
    Input(), 
    __metadata('design:type', String)
], RouterLink.prototype, "target", void 0);
__decorate([
    HostBinding(), 
    __metadata('design:type', String)
], RouterLink.prototype, "href", void 0);
__decorate([
    Input(), 
    __metadata('design:type', Object), 
    __metadata('design:paramtypes', [Object])
], RouterLink.prototype, "routerLink", null);
__decorate([
    HostListener("click"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', Boolean)
], RouterLink.prototype, "onClick", null);
RouterLink = __decorate([
    Directive({ selector: '[routerLink]' }), 
    __metadata('design:paramtypes', [Router, ActivatedRoute])
], RouterLink);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZGlyZWN0aXZlcy9yb3V0ZXJfbGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLFNBQVMsRUFDVCxZQUFZLEVBQ1osV0FBVyxFQUNYLEtBQUssRUFDTixNQUFNLGVBQWU7T0FDZixFQUFDLE1BQU0sRUFBQyxNQUFNLFdBQVc7T0FDekIsRUFBQyxjQUFjLEVBQUMsTUFBTSxpQkFBaUI7QUE0QjlDO0lBT0UsWUFBb0IsTUFBYyxFQUFVLEtBQXFCO1FBQTdDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUx6RCxhQUFRLEdBQVUsRUFBRSxDQUFDO0lBS3VDLENBQUM7SUFHckUsSUFBSSxVQUFVLENBQUMsSUFBb0I7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDdkIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBSUQsT0FBTztRQUVMLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7WUFDOUQsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLHNCQUFzQjtRQUM1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ2hGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDVCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQW5DQztJQUFDLEtBQUssRUFBRTs7MENBQUE7QUFJUjtJQUFDLFdBQVcsRUFBRTs7d0NBQUE7QUFJZDtJQUFDLEtBQUssRUFBRTs7OzRDQUFBO0FBV1I7SUFBQyxZQUFZLENBQUMsT0FBTyxDQUFDOzs7O3lDQUFBO0FBckJ4QjtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUMsQ0FBQzs7Y0FBQTtBQXFDckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSG9zdEJpbmRpbmcsXG4gIElucHV0XG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJy4uL3JvdXRlcic7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlfSBmcm9tICcuLi9yb3V0ZXJfc3RhdGUnO1xuXG4vKipcbiAqIFRoZSBSb3V0ZXJMaW5rIGRpcmVjdGl2ZSBsZXRzIHlvdSBsaW5rIHRvIHNwZWNpZmljIHBhcnRzIG9mIHlvdXIgYXBwLlxuICpcbiAqIENvbnNpZGVyIHRoZSBmb2xsb3dpbmcgcm91dGUgY29uZmlndXJhdGlvbjpcblxuICogYGBgXG4gKiBbeyBwYXRoOiAnL3VzZXInLCBjb21wb25lbnQ6IFVzZXJDbXAgfV1cbiAqIGBgYFxuICpcbiAqIFdoZW4gbGlua2luZyB0byB0aGlzIGBVc2VyYCByb3V0ZSwgeW91IGNhbiB3cml0ZTpcbiAqXG4gKiBgYGBcbiAqIDxhIFtyb3V0ZXJMaW5rXT1cIlsnL3VzZXInXVwiPmxpbmsgdG8gdXNlciBjb21wb25lbnQ8L2E+XG4gKiBgYGBcbiAqXG4gKiBSb3V0ZXJMaW5rIGV4cGVjdHMgdGhlIHZhbHVlIHRvIGJlIGFuIGFycmF5IG9mIHBhdGggc2VnbWVudHMsIGZvbGxvd2VkIGJ5IHRoZSBwYXJhbXNcbiAqIGZvciB0aGF0IGxldmVsIG9mIHJvdXRpbmcuIEZvciBpbnN0YW5jZSBgWycvdGVhbScsIHt0ZWFtSWQ6IDF9LCAndXNlcicsIHt1c2VySWQ6IDJ9XWBcbiAqIG1lYW5zIHRoYXQgd2Ugd2FudCB0byBnZW5lcmF0ZSBhIGxpbmsgdG8gYC90ZWFtO3RlYW1JZD0xL3VzZXI7dXNlcklkPTJgLlxuICpcbiAqIFRoZSBmaXJzdCBzZWdtZW50IG5hbWUgY2FuIGJlIHByZXBlbmRlZCB3aXRoIGAvYCwgYC4vYCwgb3IgYC4uL2AuXG4gKiBJZiB0aGUgc2VnbWVudCBiZWdpbnMgd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBsb29rIHVwIHRoZSByb3V0ZSBmcm9tIHRoZSByb290IG9mIHRoZSBhcHAuXG4gKiBJZiB0aGUgc2VnbWVudCBiZWdpbnMgd2l0aCBgLi9gLCBvciBkb2Vzbid0IGJlZ2luIHdpdGggYSBzbGFzaCwgdGhlIHJvdXRlciB3aWxsXG4gKiBpbnN0ZWFkIGxvb2sgaW4gdGhlIGN1cnJlbnQgY29tcG9uZW50J3MgY2hpbGRyZW4gZm9yIHRoZSByb3V0ZS5cbiAqIEFuZCBpZiB0aGUgc2VnbWVudCBiZWdpbnMgd2l0aCBgLi4vYCwgdGhlIHJvdXRlciB3aWxsIGdvIHVwIG9uZSBsZXZlbC5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbcm91dGVyTGlua10nfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIHtcbiAgQElucHV0KCkgdGFyZ2V0OiBzdHJpbmc7XG4gIHByaXZhdGUgY29tbWFuZHM6IGFueVtdID0gW107XG5cbiAgLy8gdGhlIHVybCBkaXNwbGF5ZWQgb24gdGhlIGFuY2hvciBlbGVtZW50LlxuICBASG9zdEJpbmRpbmcoKSBocmVmOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSByb3V0ZTogQWN0aXZhdGVkUm91dGUpIHt9XG5cbiAgQElucHV0KClcbiAgc2V0IHJvdXRlckxpbmsoZGF0YTogYW55W10gfCBzdHJpbmcpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgdGhpcy5jb21tYW5kcyA9IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tbWFuZHMgPSBbZGF0YV07XG4gICAgfVxuICAgIHRoaXMudXBkYXRlVGFyZ2V0VXJsQW5kSHJlZigpO1xuICB9XG5cblxuICBASG9zdExpc3RlbmVyKFwiY2xpY2tcIilcbiAgb25DbGljaygpOiBib29sZWFuIHtcbiAgICAvLyBJZiBubyB0YXJnZXQsIG9yIGlmIHRhcmdldCBpcyBfc2VsZiwgcHJldmVudCBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3JcbiAgICBpZiAoISh0eXBlb2YgdGhpcy50YXJnZXQgPT09IFwic3RyaW5nXCIpIHx8IHRoaXMudGFyZ2V0ID09ICdfc2VsZicpIHtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKHRoaXMuY29tbWFuZHMsIHtyZWxhdGl2ZVRvOiB0aGlzLnJvdXRlfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVUYXJnZXRVcmxBbmRIcmVmKCk6IHZvaWQge1xuICAgIGNvbnN0IHRyZWUgPSB0aGlzLnJvdXRlci5jcmVhdGVVcmxUcmVlKHRoaXMuY29tbWFuZHMsIHtyZWxhdGl2ZVRvOiB0aGlzLnJvdXRlfSk7XG4gICAgaWYgKHRyZWUpIHtcbiAgICAgIHRoaXMuaHJlZiA9IHRoaXMucm91dGVyLnNlcmlhbGl6ZVVybCh0cmVlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==