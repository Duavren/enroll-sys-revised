# Authentication & Authorization (Backend)

This file explains the basic JWT-based auth used by the backend and how to test protected endpoints locally.

## Environment
- Ensure `JWT_SECRET` is set in your `.env` used by the backend (defaults to `secret` in development).

## Token payload
When issuing a JWT for testing, include at least:
- `id` (number)
- `username` (string)
- `role` (string) — one of `superadmin`, `admin`, `dean`, `registrar`, `faculty`, `student`, `cashier`

Example payload:

```json
{
  "id": 1,
  "username": "admin",
  "role": "superadmin"
}
```

## Create a test token (node)
Run this snippet locally (replace secret if you set `JWT_SECRET`):

```js
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1, username: 'admin', role: 'superadmin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
console.log(token);
```

## Using the token with curl
Include the token in the `Authorization` header as `Bearer <token>`.

Example:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/analytics/usage
```

## Protected routes added/updated
- `/api/analytics/*` — requires `admin`, `dean`, or `superadmin` roles
- `/api/logs` (GET) — requires `admin` or `superadmin`; (POST) requires authentication
- `/api/courses/*` — listing requires authentication; create/update: `dean|admin|superadmin`; delete: `superadmin`; reassign: `dean|admin|superadmin`
- `/api/payments/*` — requires authentication; specific endpoints allow `student`, `cashier`, `registrar`, `admin`, `superadmin` as appropriate
- `/api/curriculum/*` — upload: `admin|faculty|dean|superadmin`; pending/approve: `dean|superadmin`

## Notes
- The middleware lives at `src/middleware/auth.middleware.ts` and provides `authenticate` and `authorize(...roles)`.
- For production, ensure `JWT_SECRET` is a strong secret and tokens are issued by a secure auth service.

