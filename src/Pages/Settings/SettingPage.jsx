/* eslint-disable react/prop-types */
import { 
  Box, 
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel,
  Card,
  CardBody,
  VStack,
} from "@chakra-ui/react";
import { GET } from "../../Controllers/ApiControllers";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../Components/Loading";
import admin from "../../Controllers/admin";
import SettingConfigurations from "./Configs/SettingConfigurations";
import t from "../../Controllers/configs";

const getData = async () => {
  await t();
  const res = await GET(admin.token, "get_configurations");
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

export default function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["configs"],
    queryFn: getData,
  });

  const groupNames = () => {
    try {
      let names = [];
      for (let index = 0; index < data?.length; index++) {
        const element = data[index];
        if (!names.includes(element.group_name)) {
          names.push(element.group_name);
        }
      }
      return names;
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <VStack spacing={6} align="stretch">
      {/* Settings Configuration Tabs */}
      <Card>
        <CardBody p={0}>
          <Tabs variant="enclosed" colorScheme="blue" isFitted={false}>
            <Box 
              overflowX="auto" 
              overflowY="hidden"
              sx={{
                '&::-webkit-scrollbar': { display: 'none' },
                'scrollbarWidth': 'none',
                'msOverflowStyle': 'none'
              }}
            >
              <TabList 
                px={{ base: 4, md: 6 }} 
                pt={6}
                minW="max-content"
                borderBottom="2px solid"
                borderColor="blue.200"
              >
                {groupNames()?.map((item) => (
                  <Tab 
                    key={item}
                    fontWeight="semibold" 
                    fontSize={{ base: "xs", sm: "sm", md: "md" }}
                    px={{ base: 3, sm: 4, md: 6 }}
                    py={{ base: 2, sm: 3 }}
                    whiteSpace="nowrap"
                    _selected={{ 
                      bg: "blue.50", 
                      color: "blue.600",
                      borderColor: "blue.500"
                    }}
                    _hover={{ bg: "blue.50" }}
                  >
                    {item}
                  </Tab>
                ))}
              </TabList>
            </Box>
            <TabPanels>
              {groupNames()?.map((item) => (
                <TabPanel key={item} px={{ base: 4, md: 6 }} py={6}>
                  <SettingConfigurations groupName={item} />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  );
}
