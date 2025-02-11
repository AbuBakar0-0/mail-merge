import { NextResponse } from "next/server";

export function middleware(req) {
    const { pathname } = req.nextUrl;
    const user_id = req.cookies.get("user_id")?.value;

    // If user is logged in, prevent access to Signup and Login pages
    if (user_id && (pathname === "/Signup" || pathname === "/")) {
        return NextResponse.redirect(new URL("/Dashboard", req.url));
    }

    // If user is NOT logged in, restrict access to protected routes
    if (!user_id && pathname !== "/" && pathname !== "/Signup" && pathname !== "/login") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

// Apply middleware to all routes except API and static files
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
