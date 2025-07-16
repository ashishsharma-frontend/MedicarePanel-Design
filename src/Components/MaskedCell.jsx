import { Box, Tooltip } from "@chakra-ui/react";
import { useState } from "react";
import PropTypes from "prop-types";

const MaskedCell = ({ value }) => {
  const [show, setShow] = useState(false);
  function maskApiKey(apiKey) {
    // Check if the key length is sufficient for masking
    if (apiKey.length <= 7) {
      const firstPart = apiKey.slice(0, 1); // First 3 characters
      const lastPart = apiKey.slice(-1); // Last 4 characters
      const maskedPart = "*".repeat(apiKey.length - 5); // If it's too short, return it as is
      return `${firstPart}${maskedPart}${lastPart}`;
    } else {
      const firstPart = apiKey.slice(0, 3); // First 3 characters
      const lastPart = apiKey.slice(-4); // Last 4 characters
      const maskedPart = "*".repeat(apiKey.length - 7); // Mask the middle part
      return `${firstPart}${maskedPart}${lastPart}`;
    }
  }

  return (
    <Box
      w={"fit-content"}
      maxW="200px"
      overflow={"hidden"}
      borderRight={0}
      borderLeft={0}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Tooltip
        label={maskApiKey(value)}
        isOpen={show}
        placement="top"
        hasArrow
        bg="blue.500"
        color="white"
        transition="all 0.2s"
        borderRadius="md"
      >
        <span>*************</span>
      </Tooltip>
    </Box>
  );
};

MaskedCell.propTypes = {
  value: PropTypes.string.isRequired,
};

export default MaskedCell;
