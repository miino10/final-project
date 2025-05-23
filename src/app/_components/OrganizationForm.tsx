"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeftFromLine,
  Loader,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { UserButton, useOrganizationList } from "@clerk/nextjs";
import { organizationFormSchema, OrganizationFormValues } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { MyLogo } from "./NotifyGradientLine";
import { useRouter } from "next/navigation";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";

const OrganizationForm = () => {
  const [step, setStep] = useState(1);
  const { data: plans, isLoading: isLoadingPlans, error } = useSubscriptionPlans();
  const { toast } = useToast();
  const router = useRouter();
  const { setActive, isLoaded: isAuthLoaded } = useOrganizationList();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      businessType: "",
      industry: "",
      companySize: "",
      foundedYear: undefined,
      website: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      preferredCurrency: "",
      fiscalYearStartMonth: undefined,
      fiscalYearStartDay: undefined,
      timeZone: "",
      accountingMethod: "",
      planId: undefined,
    },
  });

  const totalSteps = 3;

  const handleNext = async () => {
    const fields = {
      1: [
        "name",
        "businessType",
        "industry",
        "companySize",
        "foundedYear",
        "website",
        "description",
      ],
      2: ["email", "phone", "address"],
      3: [
        "preferredCurrency",
        "fiscalYearStartMonth",
        "fiscalYearStartDay",
        "timeZone",
        "accountingMethod",
      ],
    };

    const currentFields = fields[step as keyof typeof fields];
    const isValid = await form.trigger(
      currentFields as Array<keyof OrganizationFormValues>
    );

    if (!isValid) {
      return;
    }

    if (step === totalSteps) {
      form.handleSubmit(onSubmit)();
    } else {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const { mutate: CreateOrganization, isLoading } = useMutation({
    mutationFn: (data: OrganizationFormValues) =>
      axios
        .post<{ org: { id: string } }>("/api/organisations", data)
        .then((res) => res.data),
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Success",
        description: "Organization created successfully",
      });

      if (isAuthLoaded && setActive) {
        setActive({ organization: data.org.id })
          .then(() => {
            router.push(`/dashboard/organisations/${data.org.id}`);
            form.reset();
            setStep(1);
          })
          .catch((err) => {
            console.error("Failed to set active organization", err);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to activate the new organization.",
            });
            // Optionally, still redirect or handle differently
            router.push(`/dashboard/organisations/${data.org.id}`);
            form.reset();
            setStep(1);
          });
      } else {
        // Fallback or error if Clerk is not loaded or setActive is not available
        console.warn(
          "Clerk's useOrganizationList is not ready, or setActive is unavailable. Redirecting without setting active organization."
        );
        router.push(`/dashboard/organisations/${data.org.id}`);
        form.reset();
        setStep(1);
      }
    },
    onError: (error: unknown) => {
      let errorMessage = "An unexpected error occurred";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    CreateOrganization(data);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Organization Basics</h2>
              <p className="text-sm text-gray-500">
                Please provide basic information about your organization.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Enter organization name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("businessType", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soleProprietorship">
                      Sole Proprietorship
                    </SelectItem>
                    <SelectItem value="llc">
                      Limited Liability Company (LLC)
                    </SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.businessType && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.businessType.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select
                  onValueChange={(value) => form.setValue("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.industry && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.industry.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("companySize", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.companySize && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.companySize.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("planId", parseInt(value))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPlans ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader className="h-5 w-5 animate-spin" />
                      </div>
                    ) : error ? (
                      <div className="p-4 text-sm text-red-500">
                        Failed to load plans
                      </div>
                    ) : plans?.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        No plans available
                      </div>
                    ) : (
                      plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.planId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.planId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Founded Year</Label>
                <Input
                  {...form.register("foundedYear")}
                  placeholder="Enter founded year (e.g., 2020)"
                />
                {form.formState.errors.foundedYear && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.foundedYear.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input
                  {...form.register("website")}
                  placeholder="Enter website URL"
                  type="url"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Company Description</Label>
                <Input
                  {...form.register("description")}
                  placeholder="Enter company description"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Contact Information</h2>
              <p className="text-sm text-gray-500">
                Please provide contact details for your organization.
              </p>
            </div>
            <div className="space-y-4">
              {/* <div className="space-y-2">
                <Label>Primary Contact Name</Label>
                <Input
                  {...form.register("primaryContactName")}
                  placeholder="Enter primary contact name"
                />
                {form.formState.errors.primaryContactName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.primaryContactName.message}
                  </p>
                )}
              </div> */}
              <div className="space-y-2">
                <Label>Primary Contact Email</Label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="Enter email address"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  {...form.register("phone")}
                  type="tel"
                  placeholder="Enter phone number"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Business Address</Label>
                <Input
                  {...form.register("address")}
                  placeholder="Enter business address"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Financial Settings</h2>
              <p className="text-sm text-gray-500">
                Configure your organization's financial preferences.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Currency</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("preferredCurrency", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.preferredCurrency && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.preferredCurrency.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year Start Date</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Month</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("fiscalYearStartMonth", Number(value))
                      }
                      value={form.watch("fiscalYearStartMonth")?.toString()}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.fiscalYearStartMonth && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.fiscalYearStartMonth.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Day</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("fiscalYearStartDay", Number(value))
                      }
                      value={form.watch("fiscalYearStartDay")?.toString()}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.fiscalYearStartDay && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.fiscalYearStartDay.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Select
                  onValueChange={(value) => form.setValue("timeZone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Djibouti">
                      Eastern Africa Time (EAT)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.timeZone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.timeZone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Accounting Method</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("accountingMethod", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accounting method" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="cash">Cash Basis</SelectItem> */}
                    <SelectItem value="accrual">Accrual Basis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white flex flex-col justify-center items-start p-4">
      <div className="flex items-center justify-between gap-2 mb-4  w-full py-2">
        <Link
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          href={"/"}>
          <ArrowLeftFromLine />
        </Link>
        <MyLogo />
        <UserButton afterSignOutUrl="/" />
      </div>
      <div className="w-full max-w-2xl mx-auto ">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <button onClick={handlePrev} className="hover:opacity-80">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="md:text-xl">Organization Registration</h1>
            <span className="text-gray-400 text-sm ml-2">In progress</span>
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 ${
                  i + 1 <= step ? "bg-[rgb(188,241,251)]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg">
          {renderStep()}
          <div className="mt-8 flex flex-wrap gap-2  justify-between">
            <Button
              disabled={step === 1 || isLoading}
              onClick={handlePrev}
              className="bg-[rgb(188,241,251)]  hover:opacity-90  flex items-center">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              disabled={isLoading}
              onClick={handleNext}
              className="bg-[rgb(188,241,251)]  hover:opacity-90 flex items-center">
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationForm;
