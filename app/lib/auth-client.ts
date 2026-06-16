// Route handler + client
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { accessControl, ADMIN, CLIENT } from "./permissions";

export const authClient = createAuthClient({
    plugins: [adminClient({ ac: accessControl, roles: { ADMIN, CLIENT }})],
});