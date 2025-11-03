import * as React from 'react';
import { Autocomplete } from '@base-ui-components/react/autocomplete';
import { day } from './types';
import { Combobox } from '@base-ui-components/react/combobox';
import { CheckIcon, ChevronDownIcon, ClearIcon } from './icons';

export default function DateSelector({day, days, setSelectedDay}: {day:day|null, days:day[], setSelectedDay: (value:day|null) => void}) {
  const id = React.useId();
    const containerRef = React.useRef<HTMLDivElement | null>(null);
  
    console.log(`number of days ${days.length} selected day ${day?.short}`)
    return (
      <Combobox.Root 
              value={day || null}
              items={days} 
              itemToStringLabel={(item) => item?.short || ''} 
              onValueChange={(value) => setSelectedDay(value)}
              isItemEqualToValue={(itemValue, selectedValue) => itemValue !== null && selectedValue !== null && itemValue.id === selectedValue.id}
              filter={(itemValue:day, query) => itemValue?.short?itemValue.short?.toLowerCase().includes(query.toLowerCase()) : false}>
        <div className="flex flex-col items-left gap-2 relative text-gray-900">
          <label className='text-sm font-semibold text-gray-900 pr-2' htmlFor={id}>Date</label>
          <div className="flex flex-row items-center relative text-gray-900">
              <Combobox.Input
                placeholder="Select a date"
                value={day?.short?day.short:''}
                id={id}
                className="h-6 pr-2 indent-2 rounded-md font-normal text-sm text-gray-900 bg-[canvas] "
              />
              <div className="right-2 bottom-0 flex h-6 items-center justify-center text-gray-600">
                <Combobox.Clear
                  className="flex h-3 w-3 items-center justify-center rounded bg-transparent p-0"
                  aria-label="Clear selection"
                >
                  <ClearIcon className="size-3" />
                </Combobox.Clear>
                <Combobox.Trigger
                  className="flex h-3 w-3 items-center justify-center rounded bg-transparent p-0"
                  aria-label="Open popup"
                >
                  <ChevronDownIcon className="size-3" />
                </Combobox.Trigger>
            </div>
          </div>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" sideOffset={4} anchor={containerRef.current}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-white py-2 text-gray-900 text-sm shadow-lg shadow-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none border border-gray-300 z-50">
            <Combobox.Empty className="px-2 py-1 text-sm leading-4 text-gray-600 empty:m-0 empty:p-0">
              No dates found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: day) =>
                  <Combobox.Item
                    key={item.id}
                    value={item}
                    className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-1 py-1 pr-1 pl-1 text-xs outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-300"
                  >
                    <Combobox.ItemIndicator className="col-start-1">
                      <CheckIcon className="size-3" />
                    </Combobox.ItemIndicator>
                    <div className="col-start-2">{item.short}</div>
                </Combobox.Item>
              }
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}



