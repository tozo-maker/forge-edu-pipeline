
import React, { useState, useRef, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  allowCustom?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  emptyText = "No items found.",
  className,
  allowCustom = false
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  const handleAddCustom = () => {
    if (inputValue && !selected.includes(inputValue) && allowCustom) {
      onChange([...selected, inputValue]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && inputValue && allowCustom) {
      e.preventDefault();
      handleAddCustom();
    }
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const getLabel = (value: string) => {
    const option = options.find(o => o.value === value);
    return option ? option.label : value;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
            className
          )}
        >
          <div className="flex flex-wrap gap-1.5">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map(value => (
                <Badge key={value} variant="secondary" className="flex items-center gap-1">
                  {getLabel(value)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(value);
                    }}
                  />
                </Badge>
              ))
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput 
            ref={inputRef}
            placeholder="Search items..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty>
            {emptyText}
            {allowCustom && inputValue && (
              <button
                onClick={handleAddCustom}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent mt-2"
              >
                <Plus className="h-4 w-4" />
                Add "{inputValue}"
              </button>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {options.map(option => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border", selected.includes(option.value) ? "bg-primary border-primary" : "opacity-50")}>
                  {selected.includes(option.value) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span>{option.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
