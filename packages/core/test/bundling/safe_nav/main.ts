/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Benchmark for the optimizeTemporaries and self-assignment-elimination compiler phases.
 *
 * Simulates a realistic Angular Material admin dashboard using modern Angular Signals.
 * Signal reads (user(), order(), etc.) are function calls — bundlers cannot inline them —
 * so the compiler's temporary variable output appears directly in the final bundle.
 *
 * Each component reads a nullable signal input across many bindings: before this
 * optimization every binding got its own `let` slot; after, all bindings in a component
 * share a single slot per signal.
 *
 * Covers three valid function-call-in-template patterns:
 *   1. Signal inputs   — input<T | null>()       — user()?.name
 *   2. Computed signals — computed(() => ...)     — revenue()?.today
 *   3. Store-style signals — signal exposed as readonly — product()?.sku
 */

import {Component, computed, input, signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

// ─── Domain interfaces ──────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  phone: string;
  joinedAt: string;
  lastActiveAt: string;
  address: {street: string; city: string; state: string; country: string; zip: string} | null;
  manager: {id: string; name: string; email: string} | null;
}

interface Order {
  id: string;
  reference: string;
  total: number;
  tax: number;
  status: string;
  placedAt: string;
  updatedAt: string;
  customer: {name: string; email: string; phone: string} | null;
  shipping: {carrier: string; tracking: string; estimatedAt: string; address: string} | null;
  payment: {method: string; last4: string; brand: string} | null;
}

interface Product {
  sku: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  stock: number;
  category: {id: string; name: string; slug: string} | null;
  brand: {id: string; name: string; logo: string} | null;
  rating: {average: number; count: number; breakdown: string} | null;
}

interface Analytics {
  revenue: {today: number; week: number; month: number; year: number; growth: string} | null;
  orders: {today: number; pending: number; completed: number; cancelled: number} | null;
  customers: {total: number; new: number; returning: number; churn: string} | null;
  conversion: {rate: number; trend: string; sessions: number} | null;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  actor: {name: string; avatar: string} | null;
  action: {label: string; url: string} | null;
}

// ─── Pattern 1: Signal inputs — canonical Angular 17+ pattern ───────────────

/**
 * Top navigation bar — shows current user identity.
 * 10 bindings on user() signal input.
 */
@Component({
  selector: 'app-nav-header',
  standalone: true,
  template: `
    <header class="nav-header">
      <img class="avatar" [src]="user()?.avatar" [alt]="user()?.name" />
      <span class="name">{{ user()?.name }}</span>
      <span class="role">{{ user()?.role }}</span>
      <span class="department">{{ user()?.department }}</span>
      <a [href]="'mailto:' + user()?.email">{{ user()?.email }}</a>
      <span class="phone">{{ user()?.phone }}</span>
      <span class="manager">Reports to: {{ user()?.manager?.name }}</span>
      <span class="joined">Joined: {{ user()?.joinedAt }}</span>
      <span class="last-active">Active: {{ user()?.lastActiveAt }}</span>
    </header>
  `,
})
class NavHeaderComponent {
  readonly user = input<User | null>(null);
}

/**
 * User profile card — full detail view.
 * 12 bindings on user() signal input, including nested address and manager.
 */
@Component({
  selector: 'user-profile',
  standalone: true,
  template: `
    <section class="profile">
      <img [src]="user()?.avatar" [alt]="user()?.name" />
      <h2>{{ user()?.name }}</h2>
      <p>{{ user()?.email }}</p>
      <p>{{ user()?.phone }}</p>
      <p>{{ user()?.role }} · {{ user()?.department }}</p>
      <address>
        {{ user()?.address?.street }}<br />
        {{ user()?.address?.city }}, {{ user()?.address?.state }}<br />
        {{ user()?.address?.zip }} {{ user()?.address?.country }}
      </address>
      <p>Manager: {{ user()?.manager?.name }} ({{ user()?.manager?.email }})</p>
      <p>Member since {{ user()?.joinedAt }}</p>
    </section>
  `,
})
class UserProfileComponent {
  readonly user = input<User | null>(null);
}

/**
 * Order detail panel — shows full order information.
 * 13 bindings on order() signal input, three levels of nullable nesting.
 */
@Component({
  selector: 'order-detail',
  standalone: true,
  template: `
    <article class="order-detail">
      <h3>Order {{ order()?.reference }}</h3>
      <p>Status: {{ order()?.status }}</p>
      <p>Total: {{ order()?.total }} (tax: {{ order()?.tax }})</p>
      <p>Placed: {{ order()?.placedAt }} · Updated: {{ order()?.updatedAt }}</p>
      <section>
        <h4>Customer</h4>
        <p>{{ order()?.customer?.name }}</p>
        <p>{{ order()?.customer?.email }}</p>
        <p>{{ order()?.customer?.phone }}</p>
      </section>
      <section>
        <h4>Shipping</h4>
        <p>{{ order()?.shipping?.carrier }} — {{ order()?.shipping?.tracking }}</p>
        <p>ETA: {{ order()?.shipping?.estimatedAt }}</p>
        <p>{{ order()?.shipping?.address }}</p>
      </section>
      <section>
        <h4>Payment</h4>
        <p>{{ order()?.payment?.brand }} ending {{ order()?.payment?.last4 }}</p>
        <p>Method: {{ order()?.payment?.method }}</p>
      </section>
    </article>
  `,
})
class OrderDetailComponent {
  readonly order = input<Order | null>(null);
}

/**
 * Order summary row — used inside a data table.
 * 8 bindings on order() signal input.
 */
@Component({
  selector: 'order-row',
  standalone: true,
  template: `
    <tr>
      <td>{{ order()?.reference }}</td>
      <td>{{ order()?.customer?.name }}</td>
      <td>{{ order()?.total }}</td>
      <td>{{ order()?.status }}</td>
      <td>{{ order()?.placedAt }}</td>
      <td>{{ order()?.shipping?.carrier }}</td>
      <td>{{ order()?.shipping?.tracking }}</td>
      <td>{{ order()?.payment?.brand }}</td>
    </tr>
  `,
})
class OrderRowComponent {
  readonly order = input<Order | null>(null);
}

/**
 * Product card — used in a product grid.
 * 11 bindings on product() signal input.
 */
@Component({
  selector: 'product-card',
  standalone: true,
  template: `
    <div class="product-card">
      <h3>{{ product()?.name }}</h3>
      <p>{{ product()?.description }}</p>
      <code>{{ product()?.sku }}</code>
      <p class="price">
        \${{ product()?.price }} <s>\${{ product()?.comparePrice }}</s>
      </p>
      <p>Stock: {{ product()?.stock }}</p>
      <span>{{ product()?.category?.name }}</span>
      <small>{{ product()?.category?.slug }}</small>
      <span>{{ product()?.brand?.name }}</span>
      <div class="rating">
        <span>{{ product()?.rating?.average }} / 5</span>
        <span>({{ product()?.rating?.count }} reviews)</span>
        <span>{{ product()?.rating?.breakdown }}</span>
      </div>
    </div>
  `,
})
class ProductCardComponent {
  readonly product = input<Product | null>(null);
}

/**
 * Notification item — shows actor and action for each notification.
 * 8 bindings on notification() signal input.
 */
@Component({
  selector: 'notification-item',
  standalone: true,
  template: `
    <li class="notification">
      <img [src]="notification()?.actor?.avatar" [alt]="notification()?.actor?.name" />
      <div>
        <strong>{{ notification()?.actor?.name }}</strong>
        <p>{{ notification()?.title }}</p>
        <small>{{ notification()?.body }}</small>
        <time>{{ notification()?.createdAt }}</time>
      </div>
      <a [href]="notification()?.action?.url">{{ notification()?.action?.label }}</a>
    </li>
  `,
})
class NotificationItemComponent {
  readonly notification = input<Notification | null>(null);
}

// ─── Pattern 2: Computed signals — derived nullable slices ───────────────────

/**
 * Analytics dashboard — slices one analytics signal into computed sub-signals.
 * revenue(), orders(), customers(), conversion() are all computed signals
 * (function calls in the template).
 */
@Component({
  selector: 'analytics-dashboard',
  standalone: true,
  template: `
    <div class="analytics">
      <section>
        <h4>Revenue</h4>
        <p>Today: {{ revenue()?.today }}</p>
        <p>This week: {{ revenue()?.week }}</p>
        <p>This month: {{ revenue()?.month }}</p>
        <p>This year: {{ revenue()?.year }}</p>
        <p>Growth: {{ revenue()?.growth }}</p>
      </section>
      <section>
        <h4>Orders</h4>
        <p>Today: {{ orders()?.today }}</p>
        <p>Pending: {{ orders()?.pending }}</p>
        <p>Completed: {{ orders()?.completed }}</p>
        <p>Cancelled: {{ orders()?.cancelled }}</p>
      </section>
      <section>
        <h4>Customers</h4>
        <p>Total: {{ customers()?.total }}</p>
        <p>New: {{ customers()?.new }}</p>
        <p>Returning: {{ customers()?.returning }}</p>
        <p>Churn: {{ customers()?.churn }}</p>
      </section>
      <section>
        <h4>Conversion</h4>
        <p>Rate: {{ conversion()?.rate }}</p>
        <p>Trend: {{ conversion()?.trend }}</p>
        <p>Sessions: {{ conversion()?.sessions }}</p>
      </section>
    </div>
  `,
})
class AnalyticsDashboardComponent {
  readonly analytics = input<Analytics | null>(null);

  readonly revenue = computed(() => this.analytics()?.revenue ?? null);
  readonly orders = computed(() => this.analytics()?.orders ?? null);
  readonly customers = computed(() => this.analytics()?.customers ?? null);
  readonly conversion = computed(() => this.analytics()?.conversion ?? null);
}

// ─── Pattern 3: Store-style readonly signals ─────────────────────────────────

/**
 * Sidebar user summary — models a component reading from a signal store.
 * Simulates NgRx/NGXS signal store pattern: store exposes signals as readonly.
 * 9 bindings on selectedUser() store signal.
 */
@Component({
  selector: 'sidebar-user',
  standalone: true,
  template: `
    <aside class="sidebar-user">
      <img [src]="selectedUser()?.avatar" [alt]="selectedUser()?.name" />
      <h3>{{ selectedUser()?.name }}</h3>
      <p>{{ selectedUser()?.email }}</p>
      <p>{{ selectedUser()?.role }}</p>
      <p>{{ selectedUser()?.department }}</p>
      <p>{{ selectedUser()?.phone }}</p>
      <p>{{ selectedUser()?.address?.city }}, {{ selectedUser()?.address?.country }}</p>
      <p>Manager: {{ selectedUser()?.manager?.name }}</p>
    </aside>
  `,
})
class SidebarUserComponent {
  private readonly _store = signal<User | null>(null);
  readonly selectedUser = this._store.asReadonly();
}

// ─── Root dashboard ──────────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavHeaderComponent,
    UserProfileComponent,
    OrderDetailComponent,
    OrderRowComponent,
    ProductCardComponent,
    NotificationItemComponent,
    AnalyticsDashboardComponent,
    SidebarUserComponent,
  ],
  template: `
    <app-nav-header [user]="currentUser()" />
    <div class="layout">
      <sidebar-user />
      <main>
        <analytics-dashboard [analytics]="analytics()" />
        <user-profile [user]="currentUser()" />
        <order-detail [order]="selectedOrder()" />
        <table>
          @for (order of recentOrders(); track order?.id) {
            <order-row [order]="order" />
          }
        </table>
        <div class="product-grid">
          @for (product of featuredProducts(); track product?.sku) {
            <product-card [product]="product" />
          }
        </div>
        <ul>
          @for (n of notifications(); track n?.id) {
            <notification-item [notification]="n" />
          }
        </ul>
      </main>
    </div>
  `,
})
class DashboardComponent {
  readonly currentUser = signal<User | null>(null);
  readonly analytics = signal<Analytics | null>(null);
  readonly selectedOrder = signal<Order | null>(null);
  readonly recentOrders = signal<(Order | null)[]>([]);
  readonly featuredProducts = signal<(Product | null)[]>([]);
  readonly notifications = signal<(Notification | null)[]>([]);
}

bootstrapApplication(DashboardComponent);
