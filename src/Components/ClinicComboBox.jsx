/* eslint-disable react/prop-types */
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import admin from "../Controllers/admin";
import UseClinicsData from "../Hooks/UseClinicsData";

export function ClinicComboBox({
  data: items,
  setState,
  name,
  defaultData,
  isDisabled,
  isDisabledOverright,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { colorMode } = useColorMode();
  const { clinicsData } = UseClinicsData();

  useEffect(() => {
    if (admin.role.name.toLowerCase() === "clinic") {
      const clinic = clinicsData?.find(
        (clinic) => clinic.id === admin.clinic_id
      );
      setState(clinic);
      setValue(clinic);
    }
    if (defaultData) {
      if (typeof defaultData === "string" || typeof defaultData === "number") {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id == Number(defaultData)
        );
        if (clinic) {
          setState(clinic);
          setValue(clinic);
        }
      } else {
        // If defaultData is an object, use it directly
        setState(defaultData);
        setValue(defaultData);
      }
    }
  }, [clinicsData, setState, defaultData]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          isDisabled={
            isDisabledOverright
              ? false
              : isDisabled ||
                admin.role.name.toLowerCase() === "clinic" ||
                admin.clinic_id
          }
          size={"md"}
          textAlign={"left"}
          justifyContent={"space-between"}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[100%] h-8 justify-between bg-transparent hover:bg-transparent hover:text-inherit rounded-[6px] capitalize text-left ${
            colorMode === "dark" ? "border-[#ffffff3d]" : "border-[#E2e8f0]"
          }`}
          _disabled={{
            cursor: "not-allowed",
          }}
        >
          {value.title || `Select ${name}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[100%] p-0 max-h-[240px] overflow-y-scroll hideScrollbar z-[1500] ${
          colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
        }`}
      >
        <Command
          className={`${
            colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
          }`}
        >
          <CommandInput
            placeholder={`Search ${name}`}
            colorMode={colorMode}
            className={colorMode === "dark" ? "text-[#fff]" : "text-[#000]"}
          />
          <CommandEmpty>No {name} found.</CommandEmpty>
          <CommandGroup>
            {items?.map((item) => (
              <CommandItem
                key={item.id}
                value={item.title.toString()}
                onSelect={() => {
                  if (value.id === item.id) {
                    setValue("");
                    setState("");
                  } else {
                    setValue(item);
                    setState(item);
                  }
                  setOpen(false);
                }}
                className="dark:text-white capitalize"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value.id === item.id ? "opacity-100" : "opacity-0"
                  }`}
                />
                #{item.id} {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
