'use client';

import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { character, person, user, actor, scene, ensemble, section } from './types';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Avatar } from '@base-ui-components/react/avatar';
// Temporarily commenting out problematic imports to isolate the issue
// import { Field } from '@base-ui-components/react/field';
// import { Form } from '@base-ui-components/react/form';
import { Switch } from '@base-ui-components/react/switch';
import { Checkbox } from '@base-ui-components/react/checkbox';
// Using regular button elements since @base-ui-components/react/button may not be available
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Combobox } from '@base-ui-components/react/combobox';
import { Select } from '@base-ui-components/react/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllScenes, getCast, getCharacters, getEnsembles, getScenes } from '../database/queries';
import { ensLabel, personLabel } from './helpers';

export interface SceneFormProps {
  section?:section;
  scene?: scene
  onSave: (isEdit: boolean, ata: scene, sect?:section) => void;
  onCancel: () => void;
  className?: string;
}


const actorKey = (actor: person) => 
  `${actor.first_name.trim().toLowerCase().replaceAll(' ', '_')}_${actor.last_name && actor.last_name.trim().toLowerCase().replaceAll(' ', '_')}`;

export default function SceneCardForm({ 
  section,
  scene,
  onSave, 
  onCancel, 
  className 
}: SceneFormProps) {
  const [formData, setFormData] = useState<scene>({
    name:  scene?.name || '',
    characters: scene?.characters || [],
    ensemble: scene?.ensemble || section?.ensemble || undefined,
    status: scene?.status || undefined,
    pages: scene?.pages || ''
  });
  const [isEdit, setIsEdit] = useState(!(scene === undefined))


  const handleCharactersChange = (chars: character[]) => {
    setFormData(prev => {
      return {...prev,
      characters: chars}
    });
  };

  const handleEnsembleChange = (ens: ensemble) => {
  setFormData(prev => {
      return {...prev,
      ensemble: ens}
    });

  }
  const handlePreviousChange = (previous: scene) => {
  setFormData(prev => {
      return {...prev,
      previous: previous}
    });

  }

  const handlePropChange = (value: string, type: string) => {
    setFormData(prev => {
      return {...prev,
      [type]: value}
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(isEdit, formData, section)

    onSave(isEdit, isEdit?{id:(scene as scene).id, ...formData}:formData, section);
  }

  return (
    <div className={twMerge(className, 'p-1 z-20 w-60 h-min-96 border rounded-lg shadow-xl bg-white relative')}>
      <form onSubmit={handleSubmit} className="p-2 h-full flex flex-col flew-grow bg-white">
        <div className="flex-1 space-y-2">
          {/* Names Section */}
          <div className="space-y-1">
            <div>
              <label className="text-xs font-semibold text-red-800">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handlePropChange(e.target.value, 'name')}
                required
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-red-800">
                Pages
              </label>
              <input
                type="text"
                value={formData.pages}
                onChange={(e) => handlePropChange(e.target.value, 'pages')}
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
              />
            </div>

          </div>
          <div>
              <label className="text-xs font-semibold text-red-800">
                Status
              </label>
            <StatusSelector handlePropChange={handlePropChange} state={isEdit?`${formData.status}`:undefined}/>
          </div>
          <CharactersSelector handleCharactersChange={handleCharactersChange} chars={isEdit?formData.characters:undefined}/>
          <EnsembleSelector handleEnsembleChange={handleEnsembleChange} ens={formData.ensemble}/>
          </div>
        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
          >
            <CancelIcon sx={{ fontSize: 12 }} />
            <span>Cancel</span>
          </button>
          
          <button
            type="submit"
            className="flex items-center space-x-1 px-2 py-1 text-xs text-white bg-red-800 hover:bg-red-900 rounded transition-colors"
          >
            <SaveIcon sx={{ fontSize: 12 }} />
            <span>{`${isEdit?'Edit':'Create'}`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function CharactersSelector({ chars, handleCharactersChange } : { chars?:character[], handleCharactersChange: (value:character[]) => void}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  const {data: characters, isLoading} = useQuery({ queryKey: [`characters`], queryFn: () => getCharacters() })

  return (
    <Combobox.Root items={characters} onValueChange={handleCharactersChange} value={chars} multiple>
      <div className="flex flex-col gap-1">
        <label className="text-xs leading-5 text-red-800 font-semibold" htmlFor={id}>
          Characters
        </label>
        <Combobox.Chips
          className="flex flex-wrap items-center gap-0.5 rounded-md border border-gray-200 px-1.5 py-1 focus-within:outline focus-within:-outline-offset-1 focus-within:outline-blue-800"
          ref={containerRef}
        >
          <Combobox.Value>
            {(value: character[]) => (
              <React.Fragment>
                {value.map((char) => (
                  <Combobox.Chip
                    key={char.id}
                    className="capitalize flex items-center gap-1 rounded-md bg-gray-100 px-0.5 py-[0.1rem] text-xs text-gray-900 outline-none cursor-default [@media(hover:hover)]:[&[data-highlighted]]:bg-blue-800 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 focus-within:bg-blue-800 focus-within:text-gray-50"
                    aria-label={char.name}
                  >
                    {char.name}
                    <Combobox.ChipRemove
                      className="rounded-md p-1 text-inherit hover:bg-gray-200"
                      aria-label="Remove"
                    >
                      <XIcon className="size-2"/>
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  id={id}
                  placeholder={value.length > 0 ? '' : 'select an actor'}
                  className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
                />
              </React.Fragment>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" sideOffset={4} anchor={containerRef}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Combobox.Empty className="px-2 py-2 text-xs leading-2 text-gray-600 empty:m-0 empty:p-0">
              Characters not found.
            </Combobox.Empty>
            <Combobox.List>
              {(char: character) => (
                <Combobox.Item
                  key={char.id}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-1 py-2 pr-4 pl-2 text-xs leading-2 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                  value={char}
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-2" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{char.name}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function PreviousSelector({prev, handlePreviousChange } : { prev?:scene, handlePreviousChange: (value:scene) => void}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  const {data: scenes, isLoading} = useQuery({ queryKey: [`scenes`], queryFn: () => getAllScenes() })

  return (
    !isLoading && scenes && <Combobox.Root items={scenes} value={prev || undefined} onValueChange={handlePreviousChange} itemToStringLabel={(s:scene) => s.name}>
      <div className="flex flex-col gap-1">
        <label className="text-xs leading-5 text-red-800 font-semibold" htmlFor={id}>
          Previous scene
        </label>
                <Combobox.Input
                  id={id}
                  placeholder={'select the previous scene'}
                  className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
                />
       </div>

      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" sideOffset={4} anchor={containerRef}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Combobox.Empty className="px-2 py-2 text-xs leading-2 text-gray-600 empty:m-0 empty:p-0">
              Scenes not found.
            </Combobox.Empty>
            <Combobox.List>
              {(s: scene) => (
                <Combobox.Item
                  key={s.id}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-1 pr-4 pl-2 text-xs leading-2 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                  value={s}
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-2" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{s.name}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
function EnsembleSelector({ens, handleEnsembleChange } : { ens?:ensemble, handleEnsembleChange: (value:ensemble) => void}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  const {data: ensembles, isLoading} = useQuery({ queryKey: [`ensembles`], queryFn: () => getEnsembles() })

  return (
    !isLoading && ensembles && <Combobox.Root items={ensembles} value={ens} onValueChange={handleEnsembleChange} itemToStringLabel={(e:ensemble) => ensLabel(e)}>
      <div className="flex flex-col gap-1">
        <label className="text-xs leading-5 text-red-800 font-semibold" htmlFor={id}>
          Ensemble
        </label>
                <Combobox.Input
                  id={id}
                  placeholder={'select an ensemble'}
                  className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
                />
       </div>

      <Combobox.Portal>
        <Combobox.Positioner className="z-50 outline-none" sideOffset={4} anchor={containerRef}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Combobox.Empty className="px-2 py-2 text-xs leading-2 text-gray-600 empty:m-0 empty:p-0">
              Scenes not found.
            </Combobox.Empty>
            <Combobox.List>
              {(e: ensemble) => (
                <Combobox.Item
                  key={e.id}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2 text-xs leading-2 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                  value={e}
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-2" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{ensLabel(e)}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

const states = [
  { label: 'Select status', value: null },
  { label: 'unrehearsed', value: 'unrehearsed' },
  { label: 'rehearsed', value: 'rehearsed' },
  { label: 'ready', value: 'ready' },
];

type state = {label:string, value:string}

function StatusSelector({state, handlePropChange} : {state?:string, handlePropChange : (value:string, type:string) => void}) {
  return (
    <Select.Root items={states} value={state || undefined} onValueChange={(value:string | null) => value && handlePropChange(value, 'status')}>
      <Select.Trigger className={twMerge(
                  "w-full flex flex-row items-center text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500")}>
        <Select.Value />
        <Select.Icon className="flex">
          <ChevronUpDownIcon className='size-2'/>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="outline-none select-none z-40" sideOffset={8} side='inline-end'>
          <Select.Popup className="group origin-[var(--transform-origin)] bg-clip-padding w-24 rounded-md bg-[canvas] text-gray-700 shadow-lg shadow-gray-200 outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none dark:shadow-none dark:outline-gray-300">
            <Select.ScrollUpArrow className="top-0 z-[1] flex h-2 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute data-[side=none]:before:top-[-100%] before:left-0 before:h-full before:w-full before:content-['']" />
            <Select.List className="relative py-1 scroll-py-6 overflow-y-auto max-h-[var(--available-height)]">
              {states.map(({ label, value }) => (
                <Select.Item
                  key={label}
                  value={value}
                  className="grid w-20 cursor-default grid-cols-[0.75rem_1fr] items-center gap-1 py-1 pr-1 pl-0.5 text-xs leading-4 outline-none select-none group-data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] group-data-[side=none]:pr-12 group-data-[side=none]:text-xs group-data-[side=none]:leading-4 data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-500 pointer-coarse:py-2.5 pointer-coarse:text-[0.925rem]"
                >
                  <Select.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-2" />
                  </Select.ItemIndicator>
                  <Select.ItemText className="col-start-2">{label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
            <Select.ScrollDownArrow className="z-[1] flex h-2 w-full cursor-default items-center justify-center rounded-md bg-[canvas] text-center text-xs before:absolute before:left-0 before:h-full before:w-full before:content-[''] bottom-0 data-[side=none]:before:bottom-[-100%]" />
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
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

function XIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}




