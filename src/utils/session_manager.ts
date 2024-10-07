import { auth } from "../lib/auth";

async function sessionManager(c: any) {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    return session!;
}

export default sessionManager;
