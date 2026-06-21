import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  resource,
  ResourceParamsStatus,
  resourceFromSnapshots,
} from '@angular/core';
import type { ResourceSnapshot } from '@angular/core';
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

@Component({
  selector: 'app-resource-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './resource-demo.html',
  styleUrl: './resource-demo.css',
})
export class ResourceDemo {
  // ════════════════════════════════════════════════════════════
  // 1. SSR Transfer Cache with `id`
  //    The `id` option caches the resource value in TransferState
  //    during SSR, so the client doesn't re-fetch it.
  // ════════════════════════════════════════════════════════════
  protected readonly cachedUser = resource<User, number>({
    id: 'featured-user',
    params: () => 1,
    loader: async ({ params: userId }) => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userId}`
      );
      return res.json();
    },
    defaultValue: { id: 0, name: 'Loading...', email: '', username: '' },
  });

  // ════════════════════════════════════════════════════════════
  // 2. ResourceParamsStatus ,  special return statuses
  //    Throw IDLE or LOADING from params to control state
  // ════════════════════════════════════════════════════════════
  protected readonly selectedUserId = signal<number | null>(null);

  protected readonly userDetail = resource<User, number>({
    params: () => {
      const id = this.selectedUserId();
      if (id === null) {
        // Transition to idle ,  no request needed yet
        throw ResourceParamsStatus.IDLE;
      }
      return id;
    },
    loader: async ({ params: userId }) => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userId}`
      );
      return res.json();
    },
  });

  protected selectUser(id: number | null): void {
    this.selectedUserId.set(id);
  }

  // ════════════════════════════════════════════════════════════
  // 3. Stream Resource ,  synchronous value updates
  //    Uses `stream` instead of `loader` to provide a signal
  //    that can update the value synchronously over time
  // ════════════════════════════════════════════════════════════
  protected readonly streamCounter = signal(0);

  protected readonly streamResource = resource<string, number>({
    params: () => this.streamCounter(),
    stream: ({ params: counter }) => {
      const value = signal<{ value: string }>({
        value: `Stream #${counter}: initializing...`,
      });

      // Simulate streaming updates
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step >= 5) {
          clearInterval(interval);
          value.set({ value: `Stream #${counter}: complete (5/5 updates)` });
        } else {
          value.set({
            value: `Stream #${counter}: update ${step}/5`,
          });
        }
      }, 600);

      return value;
    },
    defaultValue: 'Waiting...',
  });

  protected restartStream(): void {
    this.streamCounter.update((c) => c + 1);
  }

  // ════════════════════════════════════════════════════════════
  // 4. Resource Composition via Snapshots
  //    Combine multiple resources into one using
  //    resourceFromSnapshots()
  // ════════════════════════════════════════════════════════════
  protected readonly postId = signal(1);

  // Resource A: fetch a post
  private readonly postResource = resource<Post, number>({
    params: () => this.postId(),
    loader: async ({ params: id }) => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`
      );
      return res.json();
    },
  });

  // Resource B: fetch the author using the post's userId (chained)
  private readonly authorResource = resource<User, number>({
    params: (ctx) => {
      // Chain off the post resource ,  propagates loading/error state
      const post = ctx.chain(this.postResource);
      return post!.userId;
    },
    loader: async ({ params: userId }) => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userId}`
      );
      return res.json();
    },
  });

  // Compose both into a single snapshot view
  protected readonly composedResource = resourceFromSnapshots(
    (): ResourceSnapshot<{ post: Post; author: User }> => {
      const postSnap = this.postResource.snapshot();
      const authorSnap = this.authorResource.snapshot();

      // If either is loading, show loading
      if (
        postSnap.status === 'loading' ||
        postSnap.status === 'reloading' ||
        authorSnap.status === 'loading' ||
        authorSnap.status === 'reloading'
      ) {
        return { status: 'loading', value: undefined! };
      }

      // If either errored, propagate error
      if (postSnap.status === 'error') {
        return { status: 'error', error: postSnap.error };
      }
      if (authorSnap.status === 'error') {
        return { status: 'error', error: authorSnap.error };
      }

      // Both resolved
      if (
        (postSnap.status === 'resolved' || postSnap.status === 'local') &&
        (authorSnap.status === 'resolved' || authorSnap.status === 'local')
      ) {
        return {
          status: 'resolved',
          value: {
            post: postSnap.value as Post,
            author: authorSnap.value as User,
          },
        };
      }

      return { status: 'idle', value: undefined! };
    }
  );

  protected nextPost(): void {
    this.postId.update((id) => (id % 10) + 1);
  }

  protected prevPost(): void {
    this.postId.update((id) => (id <= 1 ? 10 : id - 1));
  }
}
