import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { character, actor } from "./types"
import { getCast } from "../database/queries"
import { Form } from "@base-ui-components/react/form"
import React from "react"
import { Field } from "@base-ui-components/react/field"
import { Combobox } from '@base-ui-components/react/combobox';
import { PersonLabel } from "./labels"
import { personLabel } from "./helpers"
import ActorCard from './actorcard'
import { updateCharacterQ } from "../database/updatecharacterquery"
import { ChevronDownIcon, ClearIcon } from "./icons"



function ChangeActor({setActor, className} : {setActor:(actor: actor) => void, className?:string}){
    const id = React.useId();

    const {data: cast, isLoading} = useQuery({ queryKey: [`actors`], queryFn: () => getCast() })

  return (
      !isLoading && cast && <Combobox.Root
        items={cast}
        itemToStringLabel={(item) => personLabel(item)}
        onValueChange={(selectedActor) => {
          if (selectedActor) {
            setActor(selectedActor);
          }
        }}
>
      <div className="relative flex flex-col gap-1 text-sm leading-5 font-medium text-gray-900">
        <label htmlFor={id}>Choose an actor</label>
        <Combobox.Input
          placeholder="e.g. Noah West"
          id={id}
          className="h-6 w-64 rounded-md font-normal border border-gray-200 pl-1.5 text-xs text-gray-900 bg-[canvas]"
        />
        <div className="absolute right-2 bottom-0 flex h-6 items-center justify-center text-gray-600">
          <Combobox.Clear
            className="flex h-6 w-6 items-center justify-center rounded bg-transparent p-0"
            aria-label="Clear selection"
          >
            <ClearIcon className="size-3" />
          </Combobox.Clear>
          <Combobox.Trigger
            className="flex h-6 w-6 items-center justify-center rounded bg-transparent p-0"
            aria-label="Open popup"
          >
            <ChevronDownIcon className="size-3" />
          </Combobox.Trigger>
        </div>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className="outline-none" sideOffset={4}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Combobox.Empty className="px-4 py-2 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No fruits found.
            </Combobox.Empty>
            <Combobox.List>
              {(actor: actor) => (
                <Combobox.Item
                  key={actor.id}
                  value={actor}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{personLabel(actor)}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function ChevronUpDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.5"
      {...props}
    >
      <path d="M0.5 4.5L4 1.5L7.5 4.5" />
      <path d="M0.5 7.5L4 10.5L7.5 7.5" />
    </svg>
  );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

export default React.memo(ChangeActor)