import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroWidget } from './widgets/hero-widget';
import { CommentsWidget } from './widgets/comments-widget';
import { AnalyticsWidget } from './widgets/analytics-widget';
import { ChatWidget } from './widgets/chat-widget';
import { NewsletterWidget } from './widgets/newsletter-widget';

@Component({
  selector: 'app-hydration-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroWidget,
    CommentsWidget,
    AnalyticsWidget,
    ChatWidget,
    NewsletterWidget,
  ],
  templateUrl: './hydration-demo.html',
  styleUrl: './hydration-demo.css',
})
export class HydrationDemo {}
