import React from "react";
import { scene } from "./types";
import { Combobox } from "@base-ui-components/react/combobox";
import { CheckIcon, ChevronDownIcon, ClearIcon } from "./icons";

export default function SceneSelector({scene, scenes, setSelectedScene}:{scene?:scene, scenes:scene[], setSelectedScene:(item:scene) => void}){
  const id = React.useId();

  return (
      <Combobox.Root items={scenes} 
              value={scene || null}
              onValueChange={(value) => value !== null && setSelectedScene(value)}
              itemToStringValue={(item) => item !== null?item.name:''}
              isItemEqualToValue={(itemValue, selectedValue) => itemValue !== null && selectedValue !== null && itemValue.id === selectedValue.id}>
        <div className="flex flex-row items-center relative text-gray-900">
          <label className='text-sm font-semibold text-gray-900 pr-2' htmlFor={id}>Aim</label>
          <Combobox.Input
            placeholder="Select scene"
            value={scene?.name || ''}
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

      <Combobox.Portal>
        <Combobox.Positioner className="outline-none" sideOffset={4}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 text-sm shadow-lg shadow-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none ">
            <Combobox.Empty className="px-2 py-1 text-sm leading-4 text-gray-600 empty:m-0 empty:p-0">
              No scenes found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: scene) => (
                <Combobox.Item
                  key={item.id}
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

