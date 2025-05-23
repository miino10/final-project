"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Find the longest word to set initial width
  useEffect(() => {
    if (containerRef.current) {
      const longestWord = words.reduce((a, b) =>
        a.length >= b.length ? a : b
      );
      const tempDiv = document.createElement("div");
      tempDiv.style.visibility = "hidden";
      tempDiv.style.position = "absolute";
      tempDiv.style.whiteSpace = "nowrap";
      tempDiv.className = containerRef.current.className;
      tempDiv.textContent = longestWord;
      document.body.appendChild(tempDiv);
      setContainerWidth(tempDiv.offsetWidth);
      document.body.removeChild(tempDiv);
    }
  }, [words]);

  // Update width on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const longestWord = words.reduce((a, b) =>
          a.length >= b.length ? a : b
        );
        const tempDiv = document.createElement("div");
        tempDiv.style.visibility = "hidden";
        tempDiv.style.position = "absolute";
        tempDiv.style.whiteSpace = "nowrap";
        tempDiv.className = containerRef.current.className;
        tempDiv.textContent = longestWord;
        document.body.appendChild(tempDiv);
        setContainerWidth(tempDiv.offsetWidth);
        document.body.removeChild(tempDiv);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [words]);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation();
      }, duration);
  }, [isAnimating, duration, startAnimation]);

  return (
    <div
      ref={containerRef}
      style={{ width: containerWidth ? `${containerWidth}px` : "auto" }}
      className={cn("inline-block relative", className)}>
      <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
        <motion.div
          key={currentWord}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="whitespace-nowrap">
          {currentWord}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
