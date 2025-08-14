# Easy Storefront (Restaurant Ordering App)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Realtime Admin Updates (SSE)

Admin dashboard subscribes to `/api/orders/events?key=ADMIN_KEY` using Server-Sent Events. Events:

- `snapshot`: initial full array of orders
- `update`: object `{ type: 'order_created' | 'order_updated', data: Order }`

Keep-alive pings (`: ping`) every 15s prevent idle timeouts. For stronger security later, migrate away from query param auth (e.g., short-lived token retrieval via POST then use as query param / Authorization header with a custom EventSource polyfill or switch to WebSocket).

## Rate Limiting

A simple in-memory rate limiter added via `middleware.ts` limiting POST `/api/orders` (default 5 per minute per IP). Configure via env `ORDER_RATE_LIMIT`. For multi-instance deploy replace with Redis-based shared limiter.

## Cart Sessions
Customers can start a cart session via `/start` by entering their phone number. This creates (or reuses) a `CartSession` stored locally (localStorage) with `sessionId` + phone. When an order is placed, backend links order to the latest cart session for that phone (`cartSessionId`). Future enhancements: multi-device sync, abandoned cart reminders.

## Environment Variables

```
DATABASE_URL="file:./dev.db"   # SQLite dev
ADMIN_KEY=changeme
ORDER_RATE_LIMIT=5
```

## Deployment Notes (Render)

- Ensure Node 20+.
- Set environment variables above.
- Persistent volume needed only if sticking with SQLite; otherwise migrate to Postgres (update `prisma/schema.prisma` provider).
- Run `npx prisma migrate deploy` then `npm run build`.
