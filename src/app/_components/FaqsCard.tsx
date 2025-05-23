"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqsCardProps {
  faqs?: FaqItem[];
  className?: string;
}

const defaultFaqs: FaqItem[] = [
  {
    question: "What features does your accounting software offer?",
    answer:
      "Our software includes comprehensive features such as automated bookkeeping, real-time financial reporting, expense tracking, invoice management, payroll processing, tax compliance tools, and integration with popular business platforms.",
  },
  {
    question: "Is the software suitable for small businesses?",
    answer:
      "Yes, our software is designed to scale with your business. We offer different plans tailored to businesses of all sizes, from startups to enterprises, with features that can be customized to meet your specific needs.",
  },
  {
    question: "How secure is my financial data?",
    answer:
      "We implement bank-level security measures including end-to-end encryption, multi-factor authentication, regular security audits, and automated backups to ensure your financial data is always protected and compliant with industry standards.",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "Yes, we provide 24/7 customer support through multiple channels including live chat, email, and phone. Our dedicated support team is always ready to help you with any questions or technical issues.",
  },
  {
    question: "Can I try the software before purchasing?",
    answer:
      "Absolutely! We offer a 14-day free trial with full access to all features. No credit card required. This allows you to thoroughly test the software and ensure it meets your business needs before making a commitment.",
  },
];

export default function FaqsCard({
  faqs = defaultFaqs,
  className,
}: FaqsCardProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Get answers to common questions about our accounting software and
            services.
          </p>
        </div>

        <div className={cn("w-full max-w-4xl mx-auto", className)}>
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <h3 className="font-medium text-base sm:text-lg text-gray-900">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0">
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}>
                      <div className="px-6 pb-4 text-sm sm:text-base text-gray-600">
                        <div className="pt-2 border-t border-gray-100">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
