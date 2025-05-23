import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/(dashboard)(.*)", "/(api)(.*)"],
  async afterAuth(auth, req) {
    const currentPath = req.nextUrl.pathname;

    // Always allow public routes
    if (
      currentPath === "/" ||
      currentPath === "/sign-in" ||
      currentPath === "/sign-up" ||
      currentPath === "/book-demo" ||
      currentPath === "/main" ||
      currentPath.startsWith("/api")
    ) {
      return NextResponse.next();
    }

    // If not logged in, redirect to sign-in
    if (!auth.userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Check if the user has any organization memberships
    const memberships = await clerkClient.users.getOrganizationMembershipList({
      userId: auth.userId,
    });

    const hasMemberships = memberships.length > 0;

    // If on dashboard route but no orgId, redirect based on memberships
    if (currentPath.startsWith("/dashboard") && !auth.orgId) {
      if (hasMemberships) {
        const firstOrgId = memberships[0].organization.id;
        const targetPath = `/dashboard/organisations/${firstOrgId}`;

        // Check if the current path is already the target path
        if (currentPath !== targetPath) {
          return NextResponse.redirect(new URL(targetPath, req.url));
        } else {
          return NextResponse.next();
        }
      } else {
        return NextResponse.redirect(new URL("/create-organization", req.url));
      }
    }

    // For all other cases, allow access

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
