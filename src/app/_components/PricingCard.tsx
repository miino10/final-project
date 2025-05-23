"use client";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import React, { useState } from "react";
import { basicFeatures, professionalFeatures } from "../../../constants/subs-plane";

export default function PricingCard() {
  const [isAnnual, setIsAnnual] = useState(false);

  const calculatePrice = (basePrice: number) => {
    return isAnnual ? Math.round((basePrice * 12 * 0.8) / 12) : basePrice;
  };

  const renderFeatures = (features: string[]) =>
    features.map((feature) => (
      <li
        key={feature}
        className="flex items-center gap-2 text-sm text-gray-600">
        <svg
          className="w-4 h-4 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>{feature}</span>
      </li>
    ));

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pricing Plans
          </h2>
          <p className="text-gray-600 text-sm">
            {isAnnual
              ? "Save 20% with annual billing."
              : "No credit card required."}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-gray-600">Monthly</span>
            <Switch
              onClick={() => setIsAnnual(!isAnnual)}
              id="billing-toggle"
            />
            <span className="text-sm text-gray-600">Annually</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-500 transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Basic</h3>
            <p className="text-sm text-gray-600 mb-4">For small teams</p>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ${calculatePrice(30)}
              </span>
              <span className="text-sm text-gray-600">/user/month</span>
            </div>
            <Link
              href="/book-demo"
              className="block w-full py-2 px-4 rounded-md border border-gray-300 text-sm font-medium mb-4 hover:bg-gray-50 transition-colors text-center">
              Start free trial
            </Link>
            <ul className="space-y-2 text-sm">
              {renderFeatures(basicFeatures)}
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
              Popular
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Professional
            </h3>
            <p className="text-sm text-gray-600 mb-4">For growing businesses</p>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">
                ${calculatePrice(70)}
              </span>
              <span className="text-sm text-gray-600">/user/month</span>
            </div>
            <Link
              href="/book-demo"
              className="block w-full py-2 px-4 rounded-md bg-blue-500 text-sm text-white font-medium mb-4 hover:bg-blue-600 transition-colors text-center">
              Start free trial
            </Link>
            <ul className="space-y-2 text-sm">
              {renderFeatures(professionalFeatures)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
