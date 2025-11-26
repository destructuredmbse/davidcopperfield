'use client';

import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { character, person, user, actor } from './types';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCast } from '../database/queries';
import { personLabel } from './helpers';

interface ActorFormProps {
  actor?: actor;
  onSave: (data: actor, edit: boolean) => void;
  onCancel: () => void;
  className?: string;
}


const actorKey = (actor: person) => 
  `${actor.first_name.trim().toLowerCase().replaceAll(' ', '_')}_${actor.last_name && actor.last_name.trim().toLowerCase().replaceAll(' ', '_')}`;

export default function ActorForm({ 
  actor,
  onSave, 
  onCancel, 
  className 
}: ActorFormProps) {

  const [formData, setFormData] = useState<actor>({
    first_name:  actor?.first_name || '',
    last_name: actor?.last_name || '',
    photo: actor?.photo || '',
    parent: actor?.parent || undefined,
  });

  const [isEdit, setIsEdit] = useState(!(actor === undefined))

  const {data: cast, isLoading} = useQuery({ queryKey: [`actors`], queryFn: () => getCast() })


  const handleParentChange = (actor: actor) => {
    setFormData(prev => {
      return {...prev,
      parent: actor}
    });
  };

  const handlePhotoChange = (photo: string) => {
    setFormData(prev => {
      return {...prev,
      photo: photo}
    });
  };

  const handlePropChange = (value: string, type:string) => {
    setFormData(prev => {
      return {...prev,
      [type]: value}
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    

    onSave({...formData, id:actor?actor.id:undefined}, isEdit);
  }

  return (
    <div className={twMerge(className, 'p-1 z-20 w-48 h-96 border rounded-lg shadow-xl bg-white relative')}>
      <form onSubmit={handleSubmit} className="p-2 h-full flex flex-col">
        <div className="flex-1 space-y-2">
          {/* Names Section */}
          <div className="space-y-1">
            <div>
              <label className="text-xs font-semibold text-red-800">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handlePropChange(e.target.value, 'first_name')}
                required
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
              />
            </div>
            </div>
          <div className="space-y-1">
            <div>
              <label className="text-xs font-semibold text-red-800">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handlePropChange(e.target.value, 'last_name')}
                required
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div>
              <label className="text-xs font-semibold text-red-800">
                Photo filename
              </label>
              <input
                type="text"
                value={formData.photo}
                onChange={(e) => handlePropChange(e.target.value, 'photo')}
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  "bg-gray-100 text-gray-500"
                )}
              />
            </div>

          </div>
          <ParentSelector parent={formData.parent} handleParentChange={handleParentChange}/>
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
            <span>{`${isEdit?'Save':'Create'}`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function ParentSelector({ parent, handleParentChange } : { parent?: actor, handleParentChange: (value:actor) => void}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  const {data: cast, isLoading} = useQuery({ queryKey: [`actors`], queryFn: () => getCast() })

  return (
    !isLoading && cast && <Combobox.Root items={cast} value={parent} onValueChange={handleParentChange} itemToStringLabel={(a:actor) => personLabel(a)}>
      <div className="flex flex-col gap-1">
        <label className="text-xs leading-5 text-red-800 font-semibold" htmlFor={id}>
          Parent
        </label>
                <Combobox.Input
                  id={id}
                  placeholder={'select a parent'}
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
              Actor not found.
            </Combobox.Empty>
            <Combobox.List>
              {(actor: actor) => (
                <Combobox.Item
                  key={actor.id}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-1 pr-4 pl-2 text-xs leading-4 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                  value={actor}
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-2" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2 capitalise">{personLabel(actor)}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
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




