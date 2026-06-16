import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = { ...defaultStatements } as const;

export const accessControl = createAccessControl(statement);

export const CLIENT = accessControl.newRole({});
export const ADMIN = accessControl.newRole({ ...adminAc.statements });