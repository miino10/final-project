"use client";
import React, { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const content = [
  {
    title: "Effortless Invoicing",
    description:
      "Create and customize professional invoices in minutes. Automate billing, track payments, and ensure timely cash flow to keep your business running smoothly.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-indigo-300 flex items-center justify-center text-gray-800 font-semibold">
        Invoicing
      </div>
    ),
  },
  {
    title: "Interactive Reporting Dashboard",
    description:
      "Gain actionable insights into your financial data. Visualize revenue, expenses, and other key metrics with dynamic charts and detailed reports.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-teal-100 to-teal-300 flex items-center justify-center text-gray-800 font-semibold">
        Reporting Dashboard
      </div>
    ),
  },
  {
    title: "Payables and Receivables Tracking",
    description:
      "Manage cash flow effortlessly by tracking payables and receivables. Monitor due dates, outstanding balances, and payment history in real-time.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center text-gray-800 font-semibold">
        Payables & Receivables
      </div>
    ),
  },
  {
    title: "Simplified Purchase Orders",
    description:
      "Streamline procurement with automated purchase orders. Easily track orders, manage inventory, and improve vendor coordination.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center text-gray-800 font-semibold">
        Purchase Orders
      </div>
    ),
  },
  {
    title: "Comprehensive Financial Management",
    description:
      "Track bills, manage expenses, and generate custom financial reports with ease. Gain a complete view of your financial health in one place.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center text-gray-800 font-semibold">
        Financial Management
      </div>
    ),
  },
  {
    title: "Advanced Inventory Tracking",
    description:
      "Monitor inventory across multiple locations with precision. Track stock levels, movements, and optimize your supply chain operations effortlessly.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-purple-100 to-purple-300 flex items-center justify-center text-gray-800 font-semibold">
        Inventory Tracking
      </div>
    ),
  },
  {
    title: "User Invitations and Collaboration",
    description:
      "Work seamlessly as a team with user invitation functionality. Assign roles, collaborate on financial tasks, and ensure everyone stays aligned.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-gray-800 font-semibold">
        Collaboration
      </div>
    ),
  },
];

export const StickyScroll = ({
  contentClassName,
}: {
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end end"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map(
      (_, index) => index / (cardLength - 1)
    );
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#EBF5FF", // Light blue background
    "#F3F4F6", // Light gray background
    "#ECFDF5", // Light green background
    "#F5F3FF", // Light purple background
    "#FEF3C7", // Light amber background
  ];

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="h-[30rem] overflow-y-auto flex justify-center relative space-x-10 rounded-md p-10 no-scrollbar"
      ref={ref}>
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-2xl font-bold text-gray-800">
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-kg text-gray-600 max-w-sm mt-10">
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        className={cn(
          "hidden lg:block h-60 w-80 rounded-md sticky top-10 overflow-hidden shadow-lg",
          contentClassName
        )}>
        {content[activeCard].content}
      </div>
    </motion.div>
  );
};

export default StickyScroll;
