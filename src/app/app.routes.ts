import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'signal-forms-demo',
    loadComponent: () =>
      import('./signal-forms-demo/signal-forms-demo').then(
        (m) => m.SignalFormsDemo
      ),
  },
  {
    path: 'linked-signal-demo',
    loadComponent: () =>
      import('./linked-signal-demo/linked-signal-demo').then(
        (m) => m.LinkedSignalDemo
      ),
  },
  {
    path: 'debounced-signal-demo',
    loadComponent: () =>
      import('./debounced-signal-demo/debounced-signal-demo').then(
        (m) => m.DebouncedSignalDemo
      ),
  },
  {
    path: 'inject-async-demo',
    loadComponent: () =>
      import('./inject-async-demo/inject-async-demo').then(
        (m) => m.InjectAsyncDemo
      ),
  },
  {
    path: 'fetch-backend-demo',
    loadComponent: () =>
      import('./fetch-backend-demo/fetch-backend-demo').then(
        (m) => m.FetchBackendDemo
      ),
  },
  {
    path: 'hydration-demo',
    loadComponent: () =>
      import('./hydration-demo/hydration-demo').then(
        (m) => m.HydrationDemo
      ),
  },
  {
    path: 'resource-demo',
    loadComponent: () =>
      import('./resource-demo/resource-demo').then(
        (m) => m.ResourceDemo
      ),
  },
  {
    path: 'compiler-demo',
    loadComponent: () =>
      import('./compiler-demo/compiler-demo').then(
        (m) => m.CompilerDemo
      ),
  },
  {
    path: 'router-demo',
    loadComponent: () =>
      import('./router-demo/router-demo').then((m) => m.RouterDemo),
    children: [
      {
        path: 'teams/:teamId/members/:memberId',
        loadComponent: () =>
          import('./router-demo/router-demo').then((m) => m.RouteChild),
      },
    ],
  },
  {
    path: 'typescript6-demo',
    loadComponent: () =>
      import('./typescript6-demo/typescript6-demo').then(
        (m) => m.TypeScript6Demo
      ),
  },
  {
    path: 'breaking-changes',
    loadComponent: () =>
      import('./breaking-changes-demo/breaking-changes-demo').then(
        (m) => m.BreakingChangesDemo
      ),
  },
  {
    path: 'material-demo',
    loadComponent: () =>
      import('./material-demo/material-demo').then(
        (m) => m.MaterialDemo
      ),
  },
  {
    path: 'cli-demo',
    loadComponent: () =>
      import('./cli-demo/cli-demo').then((m) => m.CliDemo),
  },
  { path: '', redirectTo: 'signal-forms-demo', pathMatch: 'full' },
];
