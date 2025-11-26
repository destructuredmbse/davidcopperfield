import { twMerge } from 'tailwind-merge'
import { Accordion } from '@base-ui-components/react/accordion';
import { Tabs } from '@base-ui-components/react/tabs';
import { getActs, getEnsembles, performUpdate,  } from "../database/queries";
import { actor, scene, scene_status, character, section, ensemble } from "./types";
import { colours } from "./colours";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query'
import SceneCard from './scenecard';
import ActorCard from './actorcard';
import { ensLabel, personLabel } from './helpers';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Tooltip } from '@base-ui-components/react/tooltip';
import { ArrowSvg, ClearIcon, PlusIcon } from './icons';
import { useState } from 'react';
import { Dialog } from '@base-ui-components/react/dialog';
import ChangeCard from './changecard'
import { AlertDialog } from '@base-ui-components/react/alert-dialog';
import { useUserAccess } from '@/contexts/UserAccessContext';
import AddIcon from '@mui/icons-material/Add';


const removeQuery = (actor:actor, ensemble:ensemble, featured:boolean) => {
return `update ensemble filter .id = <uuid>"${ensemble.id as string}"
${featured?
  `set {featured -= (select actor filter .id = <uuid>"${actor.id as string}")}`:
  `set {members -= (select actor filter .id = <uuid>"${actor.id as string}")}`}`
}


export function Ensembles(){

    const {data: ensembles, isLoading } = useQuery({ queryKey: [`ensembles`], queryFn: () => getEnsembles() })
    const { hasAnyRole, isLoading: accessLoading, rba, isAdmin } = useUserAccess()
    const edit = hasAnyRole(['characters', 'full'])

    return(
      <div className='w-full h-dvh'>  
          <Accordion.Root multiple={false} className="flex w-9/10 p-4 flex-col justify-center text-gray-900">
              {ensembles?ensembles.map((ens, ind) => (
                <Ensemble key={ind} ensemble={ens} edit={edit} />
              )):<p className='text-sm'>No ensemble data</p>}
            </Accordion.Root>
    </div>
    )}


  function Ensemble({ensemble, edit}:{ensemble: ensemble, edit: boolean}){
    
    const {bg, bgButton, text, bgHover, alt_text} = colours(ensemble.name)

    const itemcn = `border-b ${bg} border-gray-200`
    const triggercn = `group relative flex w-full items-baseline justify-between gap-4 ${bgButton} ${alt_text} py-2 pr-1 pl-3 text-left font-medium hover:${bgHover} focus-visible:z-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800`
    const panelcn = `{h-[var(--accordion-panel-height)] overflow-hidden text-base text-gray-600 transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0}`
    return (
      <Accordion.Item className={itemcn}>
        <Accordion.Header>
          <Accordion.Trigger className={triggercn}>
            {ensLabel(ensemble)}
            <PlusIcon className="mr-2 size-3 shrink-0 transition-all ease-out group-data-[panel-open]:scale-110 group-data-[panel-open]:rotate-45" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className={panelcn}>
          <Panel ensemble={ensemble} edit={edit} />
        </Accordion.Panel>
      </Accordion.Item>
    )
  }

  function Panel({ensemble, edit}:{ensemble:ensemble, edit:boolean}){
    const {text, alt_text} = colours(ensemble.name)
    const cn = `p-3 ${alt_text}}`

    return(
      <div className={`p-3 ${alt_text}}`}>
        <div className="flex flex-wrap flew-row columns-xs gap-4">
          {ensemble.members && ensemble.members.map((a, i) => (
              <div key={i} className='relative'>
                <ActorCard actor={a} />
                {edit && <RemoveActor actor={a} ensemble={ensemble} featured={false} className='absolute bottom-1 right-1'/>}
                <div className='absolute bottom-2 right-2'>
                </div>
              </div>
            ))
          }
              {edit && <div className="size-48 p-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                <div className="flex flex-col items-center text-center text-gray-500">
                    <AddActor ensemble={ensemble} featured={false} className='mb-2'/>
                    <p className="text-xs">Add an actor the <span className={`${text}`}>{ensLabel(ensemble)}</span></p>
                </div>
              </div>}

          </div>
        <div>
          <h3 className={`${text} text-xl pt-4`}>Featured</h3>
          <div className="flex flex-wrap flew-row columns-xs gap-4">
            {ensemble && ensemble.featured && ensemble.featured.map((a, i) => (
              <div key={i} className='relative'>
                <ActorCard actor={a} />
                <RemoveActor actor={a} ensemble={ensemble} featured={true} className='absolute bottom-1 right-1'/>
                <div className='absolute bottom-2 right-2'>
                </div>
              </div>
              ))
          }
            {edit && <div className="size-48 p-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                <div className="flex flex-col items-center text-center text-gray-500">
                    <AddActor ensemble={ensemble} featured={true} className='mb-2'/>
                    <p className="text-xs">Add an actor the <span className={`${text}`}>{ensLabel(ensemble)}</span></p>
                </div>
              </div>}             
          </div>
        </div>
      </div>
    )
  }

function RemoveActor({ensemble, actor, featured, className}: {ensemble:ensemble, actor:actor, featured?: boolean, className?:string}){
  const [dialogOpen, setDialogOpen] = useState(false)
      const queryClient = useQueryClient()

    const updateEnsembleMutation = useMutation({
      mutationFn: (updateQ:string) => {return performUpdate(updateQ)},
      onSuccess: async () => {
          await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['ensembles'] }),
          ])
      },
      onError: (error) => {
          console.error('Failed to update availability:', error)
          // Optionally keep changes on error so user can retry
      }
  })

  const {text, alt_text} = colours(ensemble.name)

  return(
    <Tooltip.Provider>
      <Tooltip.Root>
        <AlertDialog.Root open={dialogOpen || false} onOpenChange={setDialogOpen}>
            <AlertDialog.Trigger
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                render={
                    <Tooltip.Trigger className={twMerge(className, 'flex bg-inherit hover:bg-gray-100')}
                          type="button"
                        >
                        <PersonRemoveOutlinedIcon className='text-red-800 mr-2'/>
                    </Tooltip.Trigger>
            }
            >
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                {<AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-64 z-50 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-4 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
                    <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                        Remove actor?
                    </AlertDialog.Title>
                    <AlertDialog.Description className="mb-2 text-sm text-gray-600">
                        You can’t undo this action.
                    </AlertDialog.Description>
                    <div className="flex justify-end gap-2">
                        <AlertDialog.Close 
                            className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline  focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100"
                            >
                        Cancel
                        </AlertDialog.Close>
                        <AlertDialog.Close
                          onClick={() => {
                                updateEnsembleMutation.mutate(removeQuery(actor, ensemble, featured || false))
                              }}
                            className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-red-800 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                        Delete
                        </AlertDialog.Close>
                    </div>
                </AlertDialog.Popup>}
            </AlertDialog.Portal>
        </AlertDialog.Root>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={10}>
              <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-xs text-red-800 shadow-lg shadow-gray-200 outline outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                  <ArrowSvg />
                </Tooltip.Arrow>
                <span>Remove <span className='capitalize'>{personLabel(actor)}</span> from the <span className={`${text}`}>{ensLabel(ensemble)}</span></span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>    
        </Tooltip.Provider>  )
}


function AddActor({ensemble, featured, className}: {ensemble:ensemble, featured?:boolean, className?:string}){
  const [open, setOpen] = useState(false);

  const {text} = colours(ensemble.name)

  return(
    <Dialog.Root open={open} onOpenChange={setOpen}>
       <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger className={twMerge(className, 'flex bg-inherit')}
          render={
              <Dialog.Trigger className="flex items-center justify-center bg-inherit select-none focus-visible:outline focus-visible:-outline-offset-1 active:bg-gray-100">
                <AddIcon sx={{ fontSize: 32 }} className="text-red-800" />
              </Dialog.Trigger>
            }
            >
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={10}>
              <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-xs text-red-800 shadow-lg shadow-gray-200 outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                  <ArrowSvg />
                </Tooltip.Arrow>
                <span>Add an actor the <span className={`${text}`}>{ensLabel(ensemble)}</span></span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>


    </Tooltip.Provider>    
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
          <ChangeCard ensemble={ensemble} featured={featured || false} setOpen={setOpen}/>
          <Dialog.Close>
              <ClearIcon className='size-4 absolute top-1 right-1'/>
            </Dialog.Close>
         </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
    

  )
}

