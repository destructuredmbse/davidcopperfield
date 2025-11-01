import { twMerge } from 'tailwind-merge'
import { CharacterLabel, EnsembleLabel, PersonLabel } from './labels'
import { actor, character} from './types'
import SafeAvatar from './safeavatar'
import React, { act, useCallback, useState } from 'react';
import { Popover } from '@base-ui-components/react/popover';
import { ArrowSvg, BellIcon, CheckIcon, ClearIcon } from './icons';
import ChangeActor from './changeactor';
import ActorCard from './actorcard';
import { Checkbox } from '@base-ui-components/react/checkbox';
import { Dialog } from '@base-ui-components/react/dialog';
import { json } from 'stream/consumers';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import { CheckboxGroup } from '@base-ui-components/react/checkbox-group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { performUpdate } from '../database/queries';
import { updateCharacterQ } from '../database/updatecharacterquery';
import ChangeActorCard from './changeactorcard'
import ChangeCard from './changecard'
import { AlertDialog } from '@base-ui-components/react/alert-dialog';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

const deleteCharacterQ = (id:string) => `
delete character filter .id = <uuid>"${id}"
`

function CharacterCard({character, edit, characterMutate, className}: {character:character, edit:boolean, characterMutate: (query:string) => void, className?: string}){
      const [dialogOpen, setDialogOpen] = useState(false)

    const num = character.played_by.length
  
    return(
      <div className={twMerge(className, 'size-48 p-1 border rounded-lg shadow-xl bg-gray-100 relative')}>
        {/* Avatar positioned in top right */}
        
          <div className='absolute top-2 right-2'>
            {num === 1 ? (
              <SafeAvatar 
                src={`/images/cast/${character.played_by[0].photo}`}
                alt={`${character.played_by[0].first_name} ${character.played_by[0].last_name}`}
                fallbackIcon="person"
              />
            ) : (
              <SafeAvatar 
                src=""
                fallbackIcon="people"
                alt="Multiple actors"
              />
            )}
          </div>        
        
        {/* Main content with margin to avoid avatar overlap */}
        <div className="pt-8 pr-18">
          <h3 className="text-sm font-bold text-red-800">{character.name}</h3>
          {num > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600">{`Actor${num > 1?'s':''}`}</p>
              <ul className='text-xs'>
                {character.played_by.map((p, i:number) => <li key={i}><PersonLabel person={p} className='text-gray-500'/></li>)}
              </ul>
            </div>
          )}
        </div>
          {edit && <div className='absolute bottom-2 left-2 flex flex-row items-center'>
            <ChangeDialog character={character} edit={edit}/>
            <DeleteCharacter id={character.id as string} mutate={characterMutate} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
            </div>}
        
      </div>
    )
  }

  const actorKey = (actor:actor) => `${actor.first_name.trim().toLowerCase().replaceAll(' ', '_')}_${actor.last_name.trim().toLowerCase().replaceAll(' ', '_')}`;

function ChangeDialog({character, edit} : {character:character, edit:boolean}) {
  const [open, setOpen] = useState(false);

  return (
  
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="flex h-3 items-center content-center text-xs justify-center bg-inherit select-none hover:text-red-600 hover:bg-gray-100 focus-visible:outline focus-visible:-outline-offset-1 active:bg-gray-100">
        <ChangeCircleOutlinedIcon sx={{ fontSize: 12 }} className='text-red-800 mr-1'/>
        <span>Change players</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
          <ChangeCard character={character} setOpen={setOpen}/>
          <Dialog.Close>
            <ClearIcon className='size-4 absolute top-1 right-1'/>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
    

  );
}

function DeleteCharacter({ id, dialogOpen, setDialogOpen, mutate } : 
    {id:string, 
        dialogOpen: boolean, 
        setDialogOpen:(dialogOpen:boolean) => void, 
        mutate:(query: string) => void
    } ) {

    return(
    <AlertDialog.Root open={dialogOpen || false} onOpenChange={setDialogOpen}>
        <AlertDialog.Trigger
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
        >
            <HighlightOffOutlinedIcon sx={{ fontSize: 12 }} className='text-red-800 mr-1'/>
            <span>Delete</span>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
            {/* <AlertDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" /> */}
            {<AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-64 z-50 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-4 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
            <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                Delete character?
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-2 text-sm text-gray-600">
                You can’t undo this action.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
                <AlertDialog.Close 
                    className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100"
                    >
                Cancel
                </AlertDialog.Close>
                <AlertDialog.Close
                    onClick={() => {console.log(`${deleteCharacterQ(id)}`);
                                    mutate(deleteCharacterQ(id))
                                    
                                }}                
                    className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-red-800 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                Delete
                </AlertDialog.Close>
            </div>
            </AlertDialog.Popup>}
        </AlertDialog.Portal>
    </AlertDialog.Root>
    )
    
}

export default React.memo(CharacterCard)
