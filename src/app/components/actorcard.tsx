import { twMerge } from 'tailwind-merge'
import { CharacterLabel, EnsembleLabel, PersonLabel } from './labels'
import { actor, character} from './types'
import SafeAvatar from './SafeAvatar'
import { ensLabel } from './helpers';
import { colours } from './colours';
import React, { useState } from 'react';
import { AlertDialog } from '@base-ui-components/react/alert-dialog';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

const deleteActorQ = (id:string) => `
delete actor filter .id = <uuid>"${id}"
`

function ActorCard({actor, edit, actorMutate, className}: {actor?:actor, edit?:boolean, actorMutate:(query:string) => void, className?: string}){
  const [dialogOpen, setDialogOpen] = useState(false)
      
    return(
      <div>
      <div className={twMerge(className, 'size-48 p-1 border rounded-lg shadow-xl bg-gray-100 relative')}>
        {/* Avatar positioned in top right */}
        
          <div className='absolute top-2 right-2'>
            {actor && (
              <SafeAvatar 
                src={`/images/cast/${actorKey(actor)}.png`}
                alt={`${actor.first_name} ${actor.last_name}`}
              />
            )}
          </div>
        
        
        {/* Main content with margin to avoid avatar overlap */}
        <div className="pt-6 pr-18">
          <h3 className="text-sm font-semibold text-red-800 text-wrap"><PersonLabel person={actor} className='text-gray-500'/></h3>
          {actor && actor.percentage &&
              <p className='text-xs text-gray-500'>{`Availability ${actor.percentage}`}</p>
            }
          {actor && actor.parent &&
               <p className='text-xs text-red-600'><span>Parent </span>
              <PersonLabel person={actor.parent} className='text-xs text-gray-500'/></p>
            }
          {actor && actor.plays && actor.plays.length > 0 &&
            <div>
              <p className='text-xs font-semibold text-red-600'>Plays</p>
              <ul>
                {actor.plays.map((c, i) => <li key={i} className='text-xs text-gray-500'>{c.name}</li>)}
              </ul>
              </div>
            }
          {actor && actor.ensemble && actor.ensemble.length > 0 &&
              <p>
                {actor.ensemble.map((e, i) => <span key={i} className={`text-xs ${colours(e.name).text}`}>{ensLabel(e)}</span>)}
              </p>
      
            }
          {actor && actor.featured_in && actor.featured_in.length > 0 &&
              <p>
                <span className='text-xs'>Features in </span>
                {actor.featured_in.map((e, i) => <span key={i} className={`text-xs ${colours(e.name).text}`}>{ensLabel(e)}</span>)}
              </p>
            }

        </div>
        {edit && <DeleteActor mutate={actorMutate} id={(actor as actor).id as string} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen}/>}
        </div>
      </div>
    )
  }

  function DeleteActor({ id, dialogOpen, setDialogOpen, mutate } : 
    {id:string, 
        dialogOpen: boolean, 
        setDialogOpen:(dialogOpen:boolean) => void, 
        mutate:(query: string) => void
    } ) {

    return(
    <AlertDialog.Root open={dialogOpen || false} onOpenChange={setDialogOpen}>
        <AlertDialog.Trigger
            className="flex items-center absolute bottom-2 left-2 space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
        >
            <HighlightOffOutlinedIcon sx={{ fontSize: 12 }} className='text-red-800 mr-1'/>
            <span>Delete</span>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
            {/* <AlertDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" /> */}
            {<AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-64 z-50 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-4 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
            <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                Delete actor?
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
                    onClick={() => {console.log(`${deleteActorQ(id)}`);
                                    mutate(deleteActorQ(id))
                                    
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

  const actorKey = (actor:actor) => `${actor.first_name.trim().toLowerCase().replaceAll(' ', '_')}_${actor.last_name.trim().toLowerCase().replaceAll(' ', '_')}`;

export default React.memo(ActorCard)