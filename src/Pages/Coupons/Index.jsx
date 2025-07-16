import { Box, Tab, TabList, Tabs, TabPanels, TabPanel, Text } from "@chakra-ui/react";
import AllCoupons from "./AllCoupon";
import UsedCoupons from "./UsedCoupons";

function Coupons() {
  return (
    <Box px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Coupons
      </Text>
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab fontWeight="600" _selected={{ bg: "blue.50", color: "blue.600" }}>All Coupons</Tab>
          <Tab fontWeight="600" _selected={{ bg: "blue.50", color: "blue.600" }}>Used Coupons</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} pt={6}>
            <AllCoupons />
          </TabPanel>
          <TabPanel px={0} pt={6}>
            <UsedCoupons />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default Coupons;
