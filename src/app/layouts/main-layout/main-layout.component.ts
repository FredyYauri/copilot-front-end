import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { MENU_CONFIG, MenuItem } from '@core/models/menu.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly openMenus = signal<Record<string, boolean>>({});

  readonly visibleMenu = computed(() => {
    return MENU_CONFIG
      .map(item => this.filterMenuItem(item))
      .filter((item): item is MenuItem => item !== null);
  });

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(e => {
      this.autoExpandParent(e.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    this.autoExpandParent(this.router.url);
  }

  toggleMenu(route: string): void {
    this.openMenus.update(state => ({ ...state, [route]: !state[route] }));
  }

  isMenuOpen(route: string): boolean {
    return !!this.openMenus()[route];
  }

  onLogout(): void {
    this.authService.logout();
  }

  private filterMenuItem(item: MenuItem): MenuItem | null {
    if (!item.children) {
      if (!item.permissions || this.authService.hasAnyPermission(...item.permissions)) {
        return item;
      }
      return null;
    }

    const visibleChildren = item.children
      .filter(child => !child.permissions || this.authService.hasAnyPermission(...child.permissions));

    if (visibleChildren.length === 0) return null;

    return { ...item, children: visibleChildren };
  }

  private autoExpandParent(url: string): void {
    const updates: Record<string, boolean> = {};
    for (const item of MENU_CONFIG) {
      if (item.children && url.startsWith(item.route)) {
        updates[item.route] = true;
      }
    }
    if (Object.keys(updates).length > 0) {
      this.openMenus.update(state => ({ ...state, ...updates }));
    }
  }
}
