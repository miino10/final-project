"use client";

import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";

import { BookDemoformSchema } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

type FormData = z.infer<typeof BookDemoformSchema>;

export default function BookDemoForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(BookDemoformSchema),
  });

  const { mutate: submitDemo, isLoading } = useMutation({
    mutationFn: (data: FormData) =>
      axios.post<FormData>("/api/waitlist", data).then((res) => res.data),
    onSuccess: () => {
      reset();
      toast({
        variant: "success",
        title: "Demo Request Submitted",
        description: "We'll be in touch soon to schedule your demo.",
      });
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

  const onSubmit = async (data: FormData) => {
    submitDemo(data);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                Book a Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="john@company.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      {...register("company")}
                      placeholder="Company Inc."
                    />
                    {errors.company && (
                      <p className="text-sm text-red-500">
                        {errors.company.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productInterest">Product Interest *</Label>
                    <Controller
                      name="productInterest"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Accounting Software">
                              Accounting Software
                            </SelectItem>
                            <SelectItem value="Payroll Management">
                              Payroll Management
                            </SelectItem>
                            <SelectItem value="Tax Filing">
                              Tax Filing
                            </SelectItem>
                            <SelectItem value="Financial Reporting">
                              Financial Reporting
                            </SelectItem>
                            <SelectItem value="All Products">
                              All Products
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.productInterest && (
                      <p className="text-sm text-red-500">
                        {errors.productInterest.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size *</Label>
                    <Controller
                      name="companySize"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10 employees">
                              1-10 employees
                            </SelectItem>
                            <SelectItem value="11-50 employees">
                              11-50 employees
                            </SelectItem>
                            <SelectItem value="51-200 employees">
                              51-200 employees
                            </SelectItem>
                            <SelectItem value="201-500 employees">
                              201-500 employees
                            </SelectItem>
                            <SelectItem value="500+ employees">
                              500+ employees
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.companySize && (
                      <p className="text-sm text-red-500">
                        {errors.companySize.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hearAboutUs">
                      How did you hear about us? *
                    </Label>
                    <Controller
                      name="hearAboutUs"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Google Search">
                              Google Search
                            </SelectItem>
                            <SelectItem value="Social Media">
                              Social Media
                            </SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Advertisement">
                              Advertisement
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.hearAboutUs && (
                      <p className="text-sm text-red-500">
                        {errors.hearAboutUs.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subscriptionType">
                      Subscription Type *
                    </Label>
                    <Controller
                      name="subscriptionType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Basic">Basic</SelectItem>
                            <SelectItem value="Professional">
                              Professional
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subscriptionType && (
                      <p className="text-sm text-red-500">
                        {errors.subscriptionType.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    rows={4}
                    placeholder="Tell us about your specific needs or questions..."
                  />
                </div>

                <div className="flex justify-center">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Book Demo"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
