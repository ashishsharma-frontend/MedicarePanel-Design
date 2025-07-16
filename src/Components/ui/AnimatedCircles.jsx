/* eslint-disable react-hooks/rules-of-hooks */
import { Box, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useMemo } from "react";

const MotionBox = motion(Box);

// Utility function to get a random value between min and max
const getRandomValue = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// List of Chakra UI colors
const chakraColors = [
  "blue.300",
  "blue.500",
  "teal.300",
  "teal.500",
  "purple.300",
  "purple.500",
  "pink.300",
  "pink.500",
  "orange.300",
  "orange.500",
  "red.300",
  "red.500",
  "cyan.300",
  "cyan.500",
  "yellow.300",
  "yellow.500",
];

const AnimatedCircles = React.memo(() => {
  const circles = useMemo(() => {
    return Array.from({ length: getRandomValue(3, 8) }, () => ({
      size: getRandomValue(30, 80),
      position: {
        top: Math.random() > 0.5 ? `${getRandomValue(5, 80)}%` : "auto",
        bottom: Math.random() > 0.5 ? `${getRandomValue(5, 80)}%` : "auto",
        left: Math.random() > 0.5 ? `${getRandomValue(5, 80)}%` : "auto",
        right: Math.random() > 0.5 ? `${getRandomValue(5, 80)}%` : "auto",
      },
      animation: {
        y: [0, getRandomValue(-30, 30), 0],
        scale: [1, Math.random() * 0.5 + 1, 1],
      },
      duration: getRandomValue(3, 7),
      color: chakraColors[getRandomValue(0, chakraColors.length - 1)],
    }));
  }, []);

  return (
    <>
      {circles.map((circle, index) => (
        <MotionBox
          key={index}
          position="absolute"
          {...circle.position}
          w={`${circle.size}px`}
          h={`${circle.size}px`}
          bg={useColorModeValue(circle.color, circle.color)}
          borderRadius="full"
          opacity={0.3}
          animate={circle.animation}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
});

AnimatedCircles.displayName = "AnimatedCircles";

export default AnimatedCircles;
