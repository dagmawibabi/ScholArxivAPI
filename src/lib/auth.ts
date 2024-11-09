import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "./db";

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(user: any, url) {
            console.log(`Send reset password email to ${user.email}`);
            console.log(`Reset password url: ${url}`);
        },
    },
    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:5173/api",
        "http://localhost:5173/api/auth",
        "https://dagmawi.dev",
        "https://dagmawi.dev/api",
        "https://dagmawi.dev/api/auth",
        "https://saw-5.vercel.app",
        "https://www.ScholArxiv.com",
        "https://ScholArxiv.com",
        "https://schol-arxiv-web.vercel.app",
    ],
    //! Uncomment when you need social logins
    // socialProviders: {
    //   github: {
    //     enabled: true,
    //     clientId: process.env.GITHUB_CLIENT_ID!,
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    //   },
    //   google: {
    //     enabled: true,
    //     clientId: process.env.GOOGLE_CLIENT_ID!,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   },
    // },
    // advanced: {
    //     crossSubDomainCookies: { enabled: true },
    // },
    // plugins: [multiSession()],
});
