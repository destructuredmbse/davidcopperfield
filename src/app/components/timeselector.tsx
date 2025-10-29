import React from "react";
import { time } from "./types";
import { Combobox } from "@base-ui-components/react/combobox";
import { CheckIcon, ChevronDownIcon, ClearIcon } from "./icons";
import { personLabel } from "./helpers";


const times:time[] =
[
  {
    name:'10am - 1pm',
    start_time:'10:00:00',
    end_time: '13:00:00'
  },
  {
    name:'10am - 5pm',
    start_time:'10:00:00',
    end_time:'17:00:00'
  },
  {
    name:'11am - 5pm',
    start_time:'11:00:00',
    end_time:'17:00:00'
  },
  {
    name:'2pm - 5am',
    start_time:'14:00:00',
    end_time:'17:00:00'
  },
  {
    name:'6.30pm - 9.30pm',
    start_time: '18.30:00',
    end_time: '21.30:00'
  },
]

export default function TimeSelector({time, setSelectedTimes} :{ time?:time, setSelectedTimes: React.Dispatch<React.SetStateAction<time|undefined>>}){
  const id = React.useId()
    return (
      <Combobox.Root items={times} 
              itemToStringLabel={(value) => value.name as string}
              value={time || null}
              onValueChange={(value) => setSelectedTimes(value)}>
        <div className="flex flex-row items-center relative text-gray-900">
          <label className='text-sm font-semibold text-gray-900 pr-2' htmlFor={id}>Times</label>
          <Combobox.Input
            placeholder="Select a time"
            id={id}
            value={time?.name || ''}
            className="h-6 pr-2 indent-2 rounded-md font-normal text-sm text-gray-900 bg-[canvas] "
          />
        <div className="right-2 bottom-0 flex h-4 justify-items-center text-gray-600">
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

      <Combobox.Portal>
        <Combobox.Positioner className="outline-none" sideOffset={4}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] text-gray-900 text-xs shadow-lg shadow-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none ">
            <Combobox.Empty className="text-sm text-gray-600 empty:m-0 empty:p-0">
              No available times.
            </Combobox.Empty>
            <Combobox.List>
              {(item: time) => (
                <Combobox.Item
                  key={item.name}
                  value={item}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-1 py-1 pr-1 pl-1 text-xs outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-300"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{item.name}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}