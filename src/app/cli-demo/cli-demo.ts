import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cli-demo',
  templateUrl: './cli-demo.html',
  styleUrl: './cli-demo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CliDemo {
  vitestCode = `// angular.json ,  Vitest configuration options
{
  "projects": {
    "my-app": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "tsConfig": "tsconfig.spec.json",
            "isolate": true,          // Run each test file in isolation
            "quiet": true,            // Suppress build output noise
            "coverage": {
              "enabled": true,
              "provider": "istanbul"   // Istanbul coverage support
            }
          }
        }
      }
    }
  }
}`;

  migrationRows = [
    { old: 'Node.js v20', new: 'Node.js v22.22.0+ / v24.13.1+', badge: 'removed' },
    { old: '@angular-devkit/architect-cli', new: '@angular-devkit/architect', badge: 'removed' },
    { old: 'Jest / Web Test Runner builders', new: 'Vitest (@angular/build:unit-test)', badge: 'removed' },
    { old: 'experimentalPlatform', new: 'platform (stabilized)', badge: 'changed' },
    { old: 'Webpack builders', new: '@angular/build', badge: 'changed' },
    { old: 'CommonEngine (from @angular/ssr)', new: 'AngularNodeAppEngine / AngularAppEngine', badge: 'changed' },
    { old: '@ngtools/webpack', new: '@angular/build', badge: 'removed' },
  ];
}
