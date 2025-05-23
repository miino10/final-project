"use client";
import { WobbleCard } from "@/components/ui/wobble-card";
import React from "react";
import { motion } from "framer-motion";

export function OurServiceCard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col text-center items-center mb-8">
        <motion.h1
          className="text-3xl md:text-4xl font-semibold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          Our Innovative Solutions
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-64 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        />
        <motion.div
          className="mt-4 flex space-x-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}>
          {["Efficient", "Reliable", "Innovative"].map((word, index) => (
            <motion.span
              key={index}
              className="text-lg text-gray-600"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}>
              {word}
            </motion.span>
          ))}
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full px-4">
        <WobbleCard containerClassName="col-span-1 md:col-span-2 bg-emerald-800 min-h-[300px]">
          <div className="p-6 ">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Streamline Your Finances with AccounTech Pro
            </h2>
            <p className="text-neutral-200">
              Powerful cloud-based accounting software for small to medium
              businesses. Automate bookkeeping, track expenses, and generate
              real-time financial reports.
            </p>
          </div>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 bg-sky-800 min-h-[300px]">
          <div className="p-6">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Effortless Invoicing
            </h2>
            <p className="text-neutral-200">
              Create professional invoices in seconds and get paid faster with
              our automated reminders and payment integrations.
            </p>
          </div>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 bg-purple-800 min-h-[300px]">
          <div className="p-6">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Real-time Analytics
            </h2>
            <p className="text-neutral-200">
              Get instant insights into your business performance with our
              powerful analytics dashboard.
            </p>
          </div>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 md:col-span-2 bg-red-800 min-h-[300px]">
          <div className="p-6">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Secure Cloud Storage
            </h2>
            <p className="text-neutral-200">
              Keep your financial data safe and accessible with our
              state-of-the-art cloud storage solution.
            </p>
          </div>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 md:col-span-2 lg:col-span-3 bg-green-800 min-h-[300px]">
          <div className="p-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Effortless Inventory Management
            </h2>
            <p className="text-neutral-200">
              Streamline your stock control with real-time tracking, automated
              reordering, and insightful inventory reports. Optimize your supply
              chain effortlessly and stay ahead of demand.
            </p>
          </div>
        </WobbleCard>
      </div>
    </div>
  );
}
