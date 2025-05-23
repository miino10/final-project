import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationProfilePage() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      {" "}
      <OrganizationProfile routing="path" path="/organization-profile" />{" "}
    </div>
  );
}
