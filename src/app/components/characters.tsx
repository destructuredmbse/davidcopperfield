import { Accordion } from '@base-ui-components/react/accordion';
import { Tabs } from '@base-ui-components/react/tabs';
import { getActs, getCharacters, performUpdate,  } from "../database/queries";
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
import { useCallback, useMemo, useState } from 'react';
import { Input } from '@base-ui-components/react/input';
import Skeletons from './skeletons';
import { useUserAccess } from "../../contexts/UserAccessContext";
import { Dialog } from '@base-ui-components/react/dialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { is } from 'zod/v4/locales';
import CharacterForm from './characterform'


const filter_criteria = (c:character, f:string) =>
    (`${c.name}`.toLowerCase().includes(f) || c.played_by.some(a =>
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(f) ||
        a.plays && a.plays.some((p) => p.name.toLowerCase().includes(f)) ||
          a.ensemble && a.ensemble.some((e) => e.name.toLowerCase().includes(f)) ||
            a.featured_in && a.featured_in.some((e) => e.name.toLowerCase().includes(f))))

const CARD_CLASSNAME = 'overflow-auto whitespace-nowrap';

const insertCharacterQ = (char:character) => `
insert character
{
    name := <str>"${char.name}",
    ${char.played_by?`played_by := (select actor filter .id in {${char.played_by.map(c => `<uuid>"${c.id as string}"`).join(', ')}}),`:''}
}
`

export function Characters(){
    const [filter, setFilter] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const queryClient = useQueryClient()
    const [isFormOpen, setIsFormOpen] = useState(false)

    const { hasAnyRole, isLoading: accessLoading, rba } = useUserAccess()

        const characterMutation = useMutation({
        mutationFn: (query:string) => {return performUpdate(query)},
        onSuccess: async () => {
            await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['characters'] }),
            ])
            setIsFormOpen(false);
        },
        onError: (error) => {
            console.error('Failed to insert or update user:', error)
            alert('Error saving staff member. Please try again.');
        }
    })

    const handleSave = (char:character) => {
      console.log(insertCharacterQ(char))
      characterMutation.mutate(insertCharacterQ(char))
      setIsFormOpen(false)
    }

    const handleCancel = () => setIsFormOpen(false) 
   
  // Use the context helper instead of manually checking rba
  const edit = hasAnyRole(['characters', 'full'])

    const {data: characters, isLoading} = useQuery({ queryKey: [`characters`], queryFn: () => getCharacters() })

  
  // Memoize filtered actors to prevent recalculation on every render
  const filteredCharacters = useMemo(() => {
    if (!characters || !filter) return characters || [];
    return characters.filter((c:character) => filter_criteria(c, filter));
  }, [characters, filter]);
  
  // Memoize filter change handler
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value.toLowerCase());
  }, []);



    return(
    <Dialog.Root open={isFormOpen}>
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
            filteredCharacters.map((c: character, i) => <CharacterCard key={i} character={c} characterMutate={characterMutation.mutate} className={CARD_CLASSNAME} edit={edit}/>)}
                {edit && <div className="size-48 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Dialog.Trigger onClick={() => setIsFormOpen(true)}>
                                <AddIcon sx={{ fontSize: 32 }} className="mx-auto mb-2" />
                            </Dialog.Trigger>
                        <p className="text-xs">"Add New Character"</p>
                        </div>
                </div>}
                    
        </div>
      </div>


      <Dialog.Portal>
              {/* <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" /> */}
              {!dialogOpen && <Dialog.Popup className="fixed top-1/2 left-1/2 z-40 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
                  <div className="flex flex-wrap gap-4">
                      {/* Show form when open */}
                      { (
                              <div className="relative">
                              <CharacterForm
                                  onSave={handleSave}
                                  onCancel={handleCancel}
                                  />
                              {/* <HelpPopover /> */}
                          </div>
                      )}
                  </div>
              </Dialog.Popup>}
          </Dialog.Portal>

          </div>
      </Dialog.Root>     
  
      
    )}





