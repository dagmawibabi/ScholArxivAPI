import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "./db";
require("dotenv").config();

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(user: any, url) {
            console.log(`Send reset password email to ${user.email}`);
            console.log(`Reset password url: ${url}`);
        },
    },
    trustedOrigin: "https://www.dagmawi.dev/api/auth/sign_in",
    // [
    // "https://scholarxiv.com",
    // "https://www.scholarxiv.com",
    // "https://www.scholarxiv.com/api/sign_in",
    // process.env.LOCAL_ORIGIN!,
    // process.env.LOCAL_API_ORIGIN!,
    // process.env.LOCAL_API_AUTH_ORIGIN!,
    // process.env.SAW_ORIGIN!,
    // process.env.SCHOLARXIV_ORIGIN!,
    // process.env.SCHOLARXIV_ALT_ORIGIN!,
    // process.env.DAGMAWI_ORIGIN!,
    // process.env.DAGMAWI_API_ORIGIN!,
    // process.env.DAGMAWI_DEV_ORIGIN!,
    // process.env.DAGMAWI_DEV_API_ORIGIN!,
    // ],
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
    advanced: {
        crossSubDomainCookies: {
            enabled: process.env.ENABLE_CROSS_SUBDOMAIN === "true",
            domain: process.env.CROSS_SUBDOMAIN,
        },
        disableCSRFCheck: process.env.DISABLE_CSRF === "true",
        useSecureCookies: process.env.USE_SECURE_COOKIES === "true",
    },
    // plugins: [multiSession()],
});
