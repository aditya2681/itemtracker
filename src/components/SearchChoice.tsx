import { Combobox, ComboboxClear, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxTrigger } from '@ui-sdk/react/combobox';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
export type Choice = { value: string; label: string; detail?: string; keywords?: string[] };
export function SearchChoice({label, placeholder, options, value, onChange, hint}:{label:string; placeholder:string; options:Choice[]; value:string; onChange:(value:string)=>void; hint?:string}) {
 const [field, setField] = useState<HTMLDivElement | null>(null);
 return <Combobox value={value || null} onValueChange={v=>onChange(v ?? '')} itemToLabel={v=>options.find(o=>o.value===v)?.label ?? ''}>
  <div className="choice-field"><ComboboxLabel>{label}</ComboboxLabel><div className="choice-input" ref={setField}><ComboboxInput placeholder={placeholder}/><ComboboxClear aria-label={`Clear ${label}`}><X size={17}/></ComboboxClear><ComboboxTrigger aria-label={`Show ${label} choices`}><ChevronDown size={19}/></ComboboxTrigger></div>{hint&&<small>{hint}</small>}</div>
  <ComboboxContent anchor={field} className="choice-popup" sideOffset={4}><ComboboxEmpty className="choice-empty">No matches found.</ComboboxEmpty><ComboboxList className="choice-list">{options.map(option=><ComboboxItem className="choice-option" key={option.value} value={option.value} label={option.label} keywords={option.keywords}><strong>{option.label}</strong>{option.detail&&<small>{option.detail}</small>}</ComboboxItem>)}</ComboboxList></ComboboxContent>
 </Combobox>;
}
