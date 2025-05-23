import { FlipWords } from "@/components/ui/flip-words";
import Link from "next/link";

const words = ["accurate", "innovative", "reliable", "seamless"];

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Heading */}
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight">
                <div className="mb-2">Transform Your</div>
                <div className="mb-2">Accounting with</div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <FlipWords
                    words={words}
                    className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                  />
                  <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                    Solutions
                  </span>
                </div>
              </h1>
            </div>

            {/* Description */}
            <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Streamline your financial processes, ensure compliance, and gain
              insights to drive your business forward with our comprehensive
              accounting solutions.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/book-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors duration-200">
                Book a Demo
              </Link>
              <Link
                href="/book-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                Contact Sales
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 sm:mt-16">
              <p className="text-sm text-gray-500 mb-4">
                Trusted by leading companies worldwide
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 px-4">
                {/* Add your company logos here */}
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/95"></div>
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-100/50 blur-3xl"
          style={{ filter: "blur(100px)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl"
          style={{ filter: "blur(100px)" }}
        />
      </div>
    </div>
  );
}
