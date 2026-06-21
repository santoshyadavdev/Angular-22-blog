import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-webmcp-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './webmcp-demo.html',
  styleUrl: './webmcp-demo.css',
})
export class WebMcpDemo {
  protected readonly provideToolsCode = `// app.config.ts — register tools at the application level
import { provideExperimentalWebMcpTools } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalWebMcpTools([
      {
        name: 'get_user_profile',
        description: 'Fetches the current user profile data',
        inputSchema: {
          type: 'object',
          properties: {
            includeAvatar: {
              type: 'boolean',
              description: 'Whether to include the avatar URL',
            },
          },
        },
        execute: async (args, client) => {
          const userService = inject(UserService);
          const user = await userService.getCurrentUser();
          return JSON.stringify({
            name: user.name,
            email: user.email,
            avatar: args.includeAvatar ? user.avatarUrl : undefined,
          });
        },
      },
    ]),
  ],
};`;

  protected readonly declareToolCode = `// product-list.component.ts — register a tool dynamically
import { declareExperimentalWebMcpTool, inject } from '@angular/core';

@Component({ ... })
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);

  constructor() {
    // Tool is registered when component is created,
    // and automatically unregistered when destroyed.
    declareExperimentalWebMcpTool({
      name: 'add_to_cart',
      description: 'Adds a product to the shopping cart by product ID',
      inputSchema: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'The unique product identifier',
          },
          quantity: {
            type: 'number',
            description: 'Number of items to add (default: 1)',
          },
        },
        required: ['productId'],
      },
      execute: async (args, client) => {
        // Runs in the component's injection context
        const product = await this.productService.getById(args.productId);
        if (!product) return 'Product not found';

        // Respect the abort signal for cancellation
        if (client.signal.aborted) return 'Operation cancelled';

        this.cart.add(product, args.quantity ?? 1);
        return \`Added \${args.quantity ?? 1}x "\${product.name}" to cart\`;
      },
    });
  }
}`;

  protected readonly toolDescriptorCode = `// The ToolDescriptor interface:
interface ToolDescriptor<InputSchema> {
  /** Unique name the agent uses to invoke this tool */
  name: string;

  /** Description helping the agent decide when to use this tool */
  description: string;

  /** JSON Schema defining the expected arguments */
  inputSchema: InputSchema;

  /** The function that runs when the agent calls this tool */
  execute: (
    args: InferArgsFromInputSchema<InputSchema>,
    client: Client
  ) => unknown;
}

// The Client interface:
interface Client {
  /** AbortSignal — cancel long-running operations */
  signal: AbortSignal;
}`;

  protected readonly routeLevelCode = `// Register tools for specific routes only
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin.component'),
    providers: [
      provideExperimentalWebMcpTools([
        {
          name: 'list_users',
          description: 'Lists all registered users (admin only)',
          inputSchema: {
            type: 'object',
            properties: {
              role: { type: 'string', description: 'Filter by role' },
              limit: { type: 'number', description: 'Max results' },
            },
          },
          execute: async (args) => {
            const userService = inject(UserService);
            const users = await userService.list({
              role: args.role,
              limit: args.limit ?? 50,
            });
            return JSON.stringify(users);
          },
        },
      ]),
    ],
  },
];
// Tool is available only when the /admin route is active!`;
}
