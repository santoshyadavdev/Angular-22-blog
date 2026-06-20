import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
// MatNavList removed — using plain nav for full style control
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatToolbar,
    MatIconButton,
    MatIcon,

  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly breakpoint = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpoint
      .observe('(max-width: 960px)')
      .pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  protected readonly sidenavOpen = signal(true);

  protected toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }

  protected closeMobileSidenav(): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }
}
