import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export default authMiddleware({
  // Only truly public routes (no authentication required)
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  
  async afterAuth(auth, req) {
    const currentPath = req.nextUrl.pathname;
    const isAuthenticated = !!auth.userId;

    // Always allow API routes
    if (currentPath.startsWith("/api")) {
      return NextResponse.next();
    }

    // Public routes - no authentication required
    const publicRoutes = ["/", "/sign-in", "/sign-up"];
    if (publicRoutes.includes(currentPath)) {
      return NextResponse.next();
    }

    // If not authenticated, redirect to sign-in
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // From here, user is authenticated
    // Check organization memberships
    const memberships = await clerkClient.users.getOrganizationMembershipList({
      userId: auth.userId,
    });
    const hasMemberships = memberships.length > 0;

    // Routes that require authentication but NOT organization membership
    const authOnlyRoutes = ["/book-demo", "/create-organization"];
    if (authOnlyRoutes.includes(currentPath)) {
      return NextResponse.next();
    }

    // Dashboard routes - require both authentication AND organization membership
    if (currentPath.startsWith("/dashboard")) {
      // If user has no organization memberships, redirect to create organization
      if (!hasMemberships) {
        return NextResponse.redirect(new URL("/create-organization", req.url));
      }

      // If user has memberships but no orgId in URL, redirect to their first org
      if (!auth.orgId) {
        const firstOrgId = memberships[0].organization.id;
        const targetPath = `/dashboard/organisations/${firstOrgId}`;
        return NextResponse.redirect(new URL(targetPath, req.url));
      }

      // Verify user has access to the organization in the URL
      const orgIdFromUrl = currentPath.split("/")[3]; // /dashboard/organisations/{orgId}
      const hasAccessToOrg = memberships.some(
        (membership) => membership.organization.id === orgIdFromUrl
      );

      if (!hasAccessToOrg) {
        // Redirect to their first organization if they don't have access to the one in URL
        const firstOrgId = memberships[0].organization.id;
        const targetPath = `/dashboard/organisations/${firstOrgId}`;
        return NextResponse.redirect(new URL(targetPath, req.url));
      }

      return NextResponse.next();
    }

    // For any other authenticated routes, check if user has organization
    // If they don't have organization, redirect to create one
    if (!hasMemberships) {
      return NextResponse.redirect(new URL("/create-organization", req.url));
    }

    // Allow access to other authenticated routes
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
