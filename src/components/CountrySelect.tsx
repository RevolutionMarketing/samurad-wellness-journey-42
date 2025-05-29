
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const countries = [
  { code: 'IT', name: 'Italia', dialCode: '+39' },
  { code: 'US', name: 'Stati Uniti', dialCode: '+1' },
  { code: 'GB', name: 'Regno Unito', dialCode: '+44' },
  { code: 'DE', name: 'Germania', dialCode: '+49' },
  { code: 'FR', name: 'Francia', dialCode: '+33' },
  { code: 'ES', name: 'Spagna', dialCode: '+34' },
  { code: 'PT', name: 'Portogallo', dialCode: '+351' },
  { code: 'CH', name: 'Svizzera', dialCode: '+41' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'NL', name: 'Paesi Bassi', dialCode: '+31' },
  { code: 'BE', name: 'Belgio', dialCode: '+32' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
];

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CountrySelect = ({ value, onValueChange }: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  
  const selectedCountry = countries.find(country => country.dialCode === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          {selectedCountry ? (
            <span>{selectedCountry.dialCode} ({selectedCountry.name})</span>
          ) : (
            "Seleziona paese..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-gray-800 border-gray-600">
        <Command className="bg-gray-800">
          <CommandInput 
            placeholder="Cerca paese..." 
            className="text-white placeholder:text-gray-400"
          />
          <CommandList className="max-h-60">
            <CommandEmpty className="text-gray-400">Nessun paese trovato.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dialCode}`}
                  onSelect={() => {
                    onValueChange(country.dialCode);
                    setOpen(false);
                  }}
                  className="text-white hover:bg-gray-700 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.dialCode ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{country.name}</span>
                  <span className="text-gray-400">{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelect;
