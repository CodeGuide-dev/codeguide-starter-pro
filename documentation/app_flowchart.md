flowchart TD
A[User] --> B[Browser sends request]
B --> C[Nextjs App Router]
C --> D[Render layout_tsx]
D --> E[Render page_tsx]
E --> F[Load UI components]
E --> G[Apply global css]
E --> H[Client side fetch]
H --> I[Call API data route]
I --> J[API route handler]
J --> K[Process request and business logic]
K --> L[Send response]
L --> E

subgraph Webhook Flow
  X[External service] --> Y[Call API webhooks route]
  Y --> Z[Process webhook payload]
  Z --> K
end