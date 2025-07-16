import {
  Center, useColorMode,
  useColorModeValue,
  Box
} from "@chakra-ui/react";
import { memo } from "react";
import { motion } from "framer-motion";

const MotionPolyline = motion("polyline");

const Loading = () => {
  const { colorMode } = useColorMode();

  return (
    <Center
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg={
        colorMode === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)"
      }
      zIndex="9999"
    >
      <Loader />
    </Center>
  );
};

const MemoizedLoading = memo(Loading);
export default MemoizedLoading;

const Loader = () => {
  const backColor = useColorModeValue("#ff4d5033", "#ff4d5044"); // Light/dark mode compatible
  const frontColor = useColorModeValue("#ff4d4f", "#ff6666");

  // Animation variants for the front polyline
  const frontVariants = {
    animate: {
      strokeDashoffset: [192, 0],
      opacity: [1, 0, 1],
      transition: {
        strokeDashoffset: {
          duration: 1.4,
          repeat: Infinity,
          ease: "linear",
        },
        opacity: {
          times: [0, 0.725, 1],
          duration: 1.4,
          repeat: Infinity,
        },
      },
    },
  };

  return (
    <Center h="full" w="full">
      <Box className="loading">
        <svg width="64px" height="48px">
          {/* Back polyline (static) */}
          <MotionPolyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            fill="none"
            stroke={backColor}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Front polyline (animated) */}
          <MotionPolyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            fill="none"
            stroke={frontColor}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="48, 144"
            initial={{ strokeDashoffset: 192 }}
            variants={frontVariants}
            animate="animate"
          />
        </svg>
      </Box>
    </Center>
  );
};
