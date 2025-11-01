import { Accordion } from '@base-ui-components/react/accordion';
import { Tabs } from '@base-ui-components/react/tabs';
import { getCast, getActs, getCharacters, performUpdate,  } from "../database/queries";
import { actor, scene, scene_status, character, section, ensemble } from "./types";
import { colours } from "./colours";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query'
import CharacterCard from './charactercard';
import Skeleton from '@mui/material/Skeleton';
import ActorCard from './actorcard';
import { Input } from '@base-ui-components/react/input';
import { useState, useMemo, useCallback } from 'react';
import Skeletons from './skeletons';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { Dialog } from '@base-ui-components/react/dialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ActorForm from './actorform';
import ImageUpload from './imageupload';
import { AlertDialog } from '@base-ui-components/react/alert-dialog';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';



// Move filter function outside component to prevent recreation
const filter_criteria = (a:actor, f:string) =>
    (`${a.first_name} ${a.last_name}`.toLowerCase().includes(f) ||
        a.plays && a.plays.some((p) => p.name.toLowerCase().includes(f)) ||
          a.ensemble && a.ensemble.some((e) => e.name.toLowerCase().includes(f)) ||
            a.featured_in && a.featured_in.some((e) => e.name.toLowerCase().includes(f)))

// Stable className constant
const CARD_CLASSNAME = 'overflow-auto whitespace-nowrap';

const insertActorQ = (actor:actor) => `
insert actor
{
    first_name := <str>"${actor.first_name}",
    ${actor.last_name?`last_name := <str>"${actor.last_name}",`:''}
    ${'photo' in actor?`photo := <str>"${actor.photo}",`:''}
    ${actor.parent?`parent := (select detached actor filter .id = <uuid>"${actor.parent.id as string}")`:''}
}
`

const deleteActorQ = (id:string) => `
delete actor filter .id = <uuid>"${id}"
`

const updateActorQ = (actor:actor) => `
update actor filter .id = <uuid>"${actor.id}"
set {
    ${actor.first_name?`first_name := <str>"${actor.first_name}",`:''}
    ${actor.last_name?`last_name := <str>"${actor.last_name}",`:''}
    ${'photo' in actor?`photo := <str>"${actor.photo}",`:''}
    ${actor.parent?`parent := (select detached actor filter .id = <uuid>"${actor.parent.id as string}")`:''}
}
`

export function Cast(){
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('cast')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editActor, setEditActor] = useState<actor>()

  const {data: cast, isLoading} = useQuery({ queryKey: [`actors`], queryFn: () => getCast() })

  const { hasAnyRole, isLoading: accessLoading, rba, isAdmin } = useUserAccess()
  // Use the context helper instead of manually checking rba
  const edit = hasAnyRole(['actors', 'full'])
 
  
const actorMutation = useMutation({
      mutationFn: (query:string) => {return performUpdate(query)},
      onSuccess: async () => {
          await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['actors'] }),
          ])
          setIsFormOpen(false);
      },
      onError: (error) => {
          console.error('Failed to insert or update user:', error)
          alert('Error saving staff member. Please try again.');
      }
  })

    const handleSave = (actor:actor, edit:boolean) => {
      console.log(edit, actor)
      const query = edit?updateActorQ(actor) : insertActorQ(actor)
      console.log(query)
      actorMutation.mutate(query)
      setIsFormOpen(false)
    }

    const handelDelete = (id:string) => {
      const query = deleteActorQ(id)
      console.log(query)
      actorMutation.mutate(query)
  }

    const handleCancel = () => setIsFormOpen(false) 

  
  // Memoize filtered actors to prevent recalculation on every render
  const filteredActors = useMemo(() => {
    if (!cast || !filter) return cast || [];
    return cast.filter((a: actor) => filter_criteria(a, filter));
  }, [cast, filter]);
  
  // Memoize filter change handler
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value.toLowerCase());
  }, []);

  return(
    <Dialog.Root open={isFormOpen}>
    <div className="flex flex-col h-screen">  
      {/* Tab Navigation */}
      {edit && <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('cast')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cast'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cast Management
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upload Images
          </button>
        </nav>
      </div>   }   
      {activeTab === 'cast' && (
        <>     
        <div className="flex flex-col h-screen">
          <div className='pb-4 w-full relative'>
            <p className='pr-2'>Filter</p>
                <Input
                  placeholder="filter"
                  className="h-6 w-full max-w-64 rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline focus:-outline-offset-1 focus:outline-blue-100"
                  onValueChange={handleFilterChange}
                />
          </div>

          <div className="flex-1 overflow-y-auto max-h-full">
            <div className='w-9/10 h-dvh flex flex-wrap flew-row columns-xs gap-4'>
              {isLoading ? <Skeletons /> :
                  filteredActors.map((a: actor) => (
                    <div key={a.id || `${a.first_name}_${a.last_name}`} className='relative'>
                      <ActorCard 
                        
                        actor={a} 
                        className={CARD_CLASSNAME}
                      />
                      <div className='flex flex-row absolute bottom-1 left-1'>
                    <Dialog.Trigger 
                      
                      onClick={() => {setEditActor(a); setIsFormOpen(true)}}>
                        <EditIcon sx={{ fontSize: 12 }} className="text-red-800 mx-auto mr-1" />
                        <span className='text-xs '>Edit</span>
                    </Dialog.Trigger>
                      <DeleteActor 
                        id={a.id as string} 
                        dialogOpen={dialogOpen} 
                        setDialogOpen={setDialogOpen}
                        handleDelete={handelDelete}/>
                        </div>
                    </div>
                  )) 
              }
              {edit && !isLoading && <div className="size-48 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <Dialog.Trigger onClick={() => {setEditActor(undefined); setIsFormOpen(true)}}>
                        <AddIcon sx={{ fontSize: 32 }} className="mx-auto mb-2" />
                    </Dialog.Trigger>
                    <p className="text-xs">"Add New Actor"</p>
                </div>
              </div>}

            </div>
          </div>
        </div>
        </>)}
        {edit && activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto">
            <ImageUpload 
              uploadType="cast"
              onUploadComplete={(filename: string) => {
                console.log('Cast image uploaded:', filename)
                // Optionally switch back to cast tab after successful upload
                // setActiveTab('cast')
              }}
            />
          </div>
        )}
       </div> 
      {edit && <Dialog.Portal>
              {isFormOpen && <Dialog.Popup className="fixed top-1/2 left-1/2 z-40 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
                  <div className="flex flex-wrap gap-4">
                      {/* Show form when open */}
                      { (
                              <div className="relative">
                              <ActorForm
                                  actor={editActor}
                                  onSave={handleSave}
                                  onCancel={handleCancel}
                                  />
                          </div>
                      )}
                  </div>
              </Dialog.Popup>}
          </Dialog.Portal>}

      </Dialog.Root>     
  )
}




  function DeleteActor({ id, dialogOpen, setDialogOpen, handleDelete } : 
    {id:string, 
        dialogOpen: boolean, 
        setDialogOpen:(dialogOpen:boolean) => void, 
        handleDelete:(id: string) => void
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
                    onClick={() => handleDelete(id)}                
                    className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-red-800 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                Delete
                </AlertDialog.Close>
            </div>
            </AlertDialog.Popup>}
        </AlertDialog.Portal>
    </AlertDialog.Root>
    )
    }


