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
import ActorForm from './actorform';
import ImageUpload from './ImageUpload';


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
    ${actor.parent?`parent := (select detached actor filter .id = <uuid>"${actor.parent.id as string}")`:''}
}
`

export function Cast(){
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('cast')

  const {data: cast, isLoading} = useQuery({ queryKey: [`actors`], queryFn: () => getCast() })

  const { hasAnyRole, isLoading: accessLoading, rba } = useUserAccess()
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

    const handleSave = (actor:actor) => {
      console.log(insertActorQ(actor))
      actorMutation.mutate(insertActorQ(actor))
      setIsFormOpen(false)
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
                    <ActorCard 
                      key={a.id || `${a.first_name}_${a.last_name}`} 
                      actor={a} 
                      className={CARD_CLASSNAME}
                      edit={edit}
                      actorMutate={actorMutation.mutate}
                    />
                  )) 
              }
              {edit && !isLoading && <div className="size-48 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <Dialog.Trigger onClick={() => setIsFormOpen(true)}>
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
              {/* <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" /> */}
              {isFormOpen && <Dialog.Popup className="fixed top-1/2 left-1/2 z-40 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
                  <div className="flex flex-wrap gap-4">
                      {/* Show form when open */}
                      { (
                              <div className="relative">
                              <ActorForm
                                  onSave={handleSave}
                                  onCancel={handleCancel}
                                  />
                              {/* <HelpPopover /> */}
                          </div>
                      )}
                  </div>
              </Dialog.Popup>}
          </Dialog.Portal>}

      </Dialog.Root>     
  )
}


