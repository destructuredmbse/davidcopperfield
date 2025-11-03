import React from "react";
import { person } from "./types";
import { Combobox } from "@base-ui-components/react/combobox";
import { CheckIcon, ChevronDownIcon, ClearIcon } from "./icons";
import { personLabel } from "./helpers";

export default function BSLSelector({selected, bsl, setSelectedBSL}:{selected?:person, bsl:person[], setSelectedBSL: React.Dispatch<React.SetStateAction<person|undefined>>}){
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
      <Combobox.Root items={[{id:'1', first_name:'Not required', _role:'bsl interpreter'}, ...bsl]} 
              value={selected || {id:'1', first_name:'Not required', _role:'bsl interpreter'}}
              itemToStringLabel={(value) => personLabel(value)}
              //defaultValue={{id:'1', first_name:'Not required', _role:'bsl interpreter'}}
              onValueChange={(value) => setSelectedBSL(value)}>
        <div className="relative text-sm leading-5 text-gray-900">
          <label className='text-xs font-semibold text-gray-900' htmlFor={id}>BSL Interpreter</label>
          <Combobox.Input
            placeholder="Not required"
            id={id}
            className="h-4 w-24 rounded-md font-normal pl-3.5 text-xs text-gray-900 bg-[canvas] "
          />
        <div className="absolute right-2 bottom-0 flex h-6 items-center justify-right text-gray-600">
          <Combobox.Clear
            className="flex h-4 w-3 items-center justify-center rounded bg-transparent p-0"
            aria-label="Clear selection"
          >
            <ClearIcon className="size-3" />
          </Combobox.Clear>
          <Combobox.Trigger
            className="flex h-4 w-3 items-center justify-center rounded bg-transparent p-0"
            aria-label="Open popup"
          >
            <ChevronDownIcon className="size-3" />
          </Combobox.Trigger>
        </div>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" sideOffset={4} anchor={containerRef.current}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 text-xs shadow-lg shadow-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none ">
            <Combobox.Empty className="px-2 py-1 text-xs leading-4 text-gray-600 empty:m-0 empty:p-0">
              No BSL interpreters found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: person) => (
                <Combobox.Item
                  checked={selected && selected.id === item.id}
                  key={item.id}
                  value={item}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-1 py-1 pr-1 pl-1 text-xs leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-300"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{personLabel(item)}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}