'use client'
import * as React from 'react';
import { Autocomplete } from '@base-ui-components/react/autocomplete';
import { day } from './types';

export default function DateSelector({day, days, setSelectedDay}: {day?:day, days:day[], setSelectedDay: React.Dispatch<React.SetStateAction<day|undefined>>}) {
    console.log(`number of days ${days.length}`)
    return (
    <Autocomplete.Root 
        value={day?.short || day?._date || null}
        items={days} 
        itemToStringValue={(item) => item.short as string}
        onValueChange={(stringValue) => {
          // Find the original day object that matches the string value
          const selectedDay = days.find(day => day.id === stringValue);
          if (selectedDay) {
            setSelectedDay(selectedDay);
          }
        }}
        >
    <div className='flex flex-row items-center gap-2'>
      <label className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        Date
      </label>
      <Autocomplete.Input
        placeholder="date"
        className="bg-[canvas] h-6 font-normal rounded-md border border-gray-200 pl-1 text-sm text-gray-900"
      />
    </div>

      <Autocomplete.Portal>
        <Autocomplete.Positioner className="outline-none" sideOffset={4}>
          <Autocomplete.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] overflow-y-auto text-sm scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Autocomplete.Empty className="text-sm leading-4 text-gray-600 empty:m-0 empty:p-0">
              No dates found.
            </Autocomplete.Empty>
            <Autocomplete.List>
              {(day: day) => (
                <Autocomplete.Item
                  key={day.id}
                  className="flex cursor-default py-2 pr-1 pl-1 text-sm leading-2 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded data-[highlighted]:before:bg-gray-900"
                  value={day.short || day._date}
                >
                  {day.short as string}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
      
    </Autocomplete.Root>
  );
}



