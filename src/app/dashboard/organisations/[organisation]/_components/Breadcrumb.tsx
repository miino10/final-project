import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    
  } from "@/components/ui/breadcrumb";
  import { Slash } from "lucide-react";
  
  export interface BreadcrumbItem {
    label: string;
    path: string;
  }
  
  interface BreadcrumbComponentProps {
    breadcrumbs: BreadcrumbItem[];
  }
  
  function BreadcrumbComponent({ breadcrumbs }: BreadcrumbComponentProps) {
    return (
      <Breadcrumb className="p-4">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.path}>
              {index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
              {index < breadcrumbs.length - 1 && (
                <div>
                  <Slash />
                </div>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }
  
  export default BreadcrumbComponent;
  