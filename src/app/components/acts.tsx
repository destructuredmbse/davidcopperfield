import { Accordion } from '@base-ui-components/react/accordion';
import { Tabs } from '@base-ui-components/react/tabs';
import { getActs, performUpdate,  } from "../database/queries";
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
import { useState } from 'react';
import { Dialog } from '@base-ui-components/react/dialog';
import AddIcon from '@mui/icons-material/Add';
import { useUserAccess } from '@/contexts/UserAccessContext';
import SceneCardForm, { SceneFormProps } from './sceneform';
import { Tooltip } from '@base-ui-components/react/tooltip';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { ArrowSvg, ClearIcon } from './icons';
import EditIcon from '@mui/icons-material/Edit';
import { GelError } from 'gel';



const insertSceneQ = (s:scene, sect?:section) => `
with new := (insert scene
{
    name := <str>"${s.name}",
    ${s.pages?`pages := <str>"${s.pages}",`:''}
    ${s.status?`status := <scene_status>"${s.status}",`:''}
    ${s.ensemble?`ensemble := (select ensemble filter .id = <uuid>"${s.ensemble.id}"),`:''}
    ${s.characters && s.characters.length > 0?`characters := (select character filter .id in {${s.characters.map((c) => `<uuid>"${c.id}"`).join(', ')}}),`:''}
})
${sect?.id?`update section filter .id = <uuid>"${sect.id}" set {scenes += new}`:''}
`
const updateSceneQ = (s:scene) => `
update scene filter .id = <uuid>"${s.id}"
set {
    name := <str>"${s.name}",
    ${s.pages?`pages := <str>"${s.pages}",`:''}
    ${s.status?`status := <scene_status>"${s.status}",`:''}
    ${s.ensemble?`ensemble := (select ensemble filter .id = <uuid>"${s.ensemble.id}"),`:''}
    ${s.characters && s.characters.length > 0?`characters := (select character filter .id in {${s.characters.map((c) => `<uuid>"${c.id}"`).join(', ')}}),`:''}
}
`

export function Acts(){

    const {data:acts, isLoading} = useQuery({ queryKey: [`acts`], queryFn: () => getActs() })
  const { hasAnyRole, isLoading: accessLoading, rba, isAdmin } = useUserAccess()
  // Use the context helper instead of manually checking rba
  const edit = hasAnyRole(['scenes', 'full'])
 
  
    return(
        <div className='w-9/10 h-dvh'>
    <Tabs.Root className="rounded-md" defaultValue="act1">
      <Tabs.List className="relative z-0 flex gap-1 px-1 shadow-[inset_0_-1px] shadow-gray-200">
        <Tabs.Tab
          className="flex h-6 items-center justify-center p-2 border-t-2 border-x-2 rounded-t-lg border-red-800 text-sm font-medium break-keep whitespace-nowrap text-gray-600 select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-gray-900 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline data-[selected]:text-gray-900"
          value="act1"
        >
          Act 1
        </Tabs.Tab>
        <Tabs.Tab
          className="flex h-6 items-center justify-center p-2 border-t-2 border-x-2 rounded-t-lg border-red-800 text-sm font-medium break-keep whitespace-nowrap text-gray-600 select-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:-outline-offset-1 before:outline-blue-800 hover:text-gray-900 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline data-[selected]:text-gray-900"
          value="act2"
        >
          Act 2
        </Tabs.Tab>
        <Tabs.Indicator className="absolute top-1/2 left-0 z-[-1] h-6 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] -translate-y-1/2 rounded-sm bg-gray-200 transition-all duration-200 ease-in-out" />
      </Tabs.List>
      <Tabs.Panel
        className="relative flex items-center rounded-lg outline-2 outline-red-800 justify-center -outline-offset-1 focus-visible:rounded-md focus-visible:outline-2"
        value="act1"
      >
        <Sections sections={acts?acts[0].sections:[]} edit={edit}/>
      </Tabs.Panel>
      <Tabs.Panel
        className="relative flex items-center rounded-lg outline-2 outline-red-800 justify-center -outline-offset-1 focus-visible:rounded-md focus-visible:outline-2"
        value="act2"
      >
        <Sections sections={acts?acts[1].sections:[]} edit={edit}/>
      </Tabs.Panel>
    </Tabs.Root>
    </div>
    )}

    function Sections({sections, edit}: {sections: section[], edit:boolean}) {
    
    return(
            <Accordion.Root multiple={false} className="flex w-full p-8 max-w-[calc(100vw-8rem)] flex-col justify-center text-gray-900">
              {sections?sections.map((section, ind) => (
                <Section key={ind} section={section} edit={edit}/>
              )):<p>No section data</p>}
            </Accordion.Root>
    )
  }

  function Section({section, edit}:{section: section, edit:boolean}){
    
    const {bg, bgButton, text, bgHover, alt_text} = colours(section.colour)


    const itemcn = `border-b ${bg} border-gray-200`
    const triggercn = `group relative flex w-full items-baseline justify-between gap-4 ${bgButton} ${alt_text} py-2 pr-1 pl-3 text-left font-medium hover:${bgHover} focus-visible:z-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800`
    const panelcn = `{h-[var(--accordion-panel-height)] overflow-hidden text-base text-gray-600 transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0}`
    return (
      <Accordion.Item className={itemcn}>
        <Accordion.Header>
          <Accordion.Trigger className={triggercn}>
            {section.name}
            <PlusIcon className="mr-2 size-3 shrink-0 transition-all ease-out group-data-[panel-open]:scale-110 group-data-[panel-open]:rotate-45" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className={panelcn}>
          <Panel section={section} edit={edit}/>
        </Accordion.Panel>
      </Accordion.Item>
    )
  }

  function Panel({section, edit}:{section:section, edit:boolean}){
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false) 
  
    const sceneMutation = useMutation({
      mutationFn: (query:string) => {return performUpdate(query)},
      onSuccess: async () => {
          await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['acts'] }),
          queryClient.invalidateQueries({ queryKey: ['scenes'] }),
          ])
          console.log(`successfully executed scene query `)
          setIsFormOpen(false);
      },
      onError: (error) => {
            const e = (error as GelError)
            console.log(`message ${e.message}, name ${e.name}, cause ${e.cause}`)
            if(e.name === 'ConstraintViolationError')alert('The name of a scene has to be unique!');
      }
    })

    const handleSave = (isEdit: boolean, scene:scene, sect?:section) => {
      console.log(`handling save`, isEdit, scene, sect)
      if(isEdit){
        console.log(updateSceneQ(scene))
        sceneMutation.mutate(updateSceneQ(scene))
      }
      else {
        console.log(insertSceneQ(scene, sect))
        sceneMutation.mutate(insertSceneQ(scene, sect))
      }
      setIsFormOpen(false)
    }

    const handleCancel = () => setIsFormOpen(false) 
    
    const textColour = colours(section.colour).text
    const cn = `p-3 ${textColour}} relative`
    const ens = section.ensemble?.name?section.ensemble.name:'no essemble'
    return(
      <Dialog.Root>
      <div className={cn}>
        {edit && <EditScene section={section} onSave={handleSave} onCancel={handleCancel} className='absolute top-2 left-2'/>}
        <p className="text-sm"><span>Essemble</span>: <span>{ens}</span></p>
        <div className="grid grid-cols-5 gap-4">
          {section.scenes.map((scene, i) => (
            <div key={i} className='relative'>
              <SceneCard scene={scene} />
              {edit && <EditScene scene={scene} onCancel={handleCancel} onSave={handleSave} className='absolute top-0.5 right-0.5'/>}
            </div>
            ))
          }
        </div>
      </div>
      {edit && <Dialog.Portal>
              {/* <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" /> */}
              {isFormOpen && <Dialog.Popup className="fixed top-1/2 left-1/2 z-40 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
                  <div className="flex flex-wrap gap-4">
                      {/* Show form when open */}
                      { (
                              <div className="relative">
                              <SceneCardForm
                                  section={section}
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

  function EditScene({section, scene, onSave, onCancel}: SceneFormProps){
  const [editOpen, setEditOpen] = useState(false)
  const isEdit = scene !== undefined

  return(
    <Dialog.Root open={editOpen}>
      <Tooltip.Provider>
       <Tooltip.Root>
          <Tooltip.Trigger 
            className="flex size-8 items-center justify-center rounded-sm text-gray-900 select-none"
            render={
              <Dialog.Trigger 
                className="absolute top-1 right-1 flex size-8 items-center justify-center text-gray-900 select-none"
                onClick={() => setEditOpen(true)}
                >
                  {isEdit?
                      <EditIcon sx={{ fontSize: 12 }} />
                      :<AddCircleOutlineOutlinedIcon aria-label="New" className="size-4 text-red-800" />}
              </Dialog.Trigger>
            }
            >
            </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={10}>
                  <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-white px-1 py-0.5 text-xs shadow-lg shadow-gray-200 outline  outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                    <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                      <ArrowSvg />
                    </Tooltip.Arrow>
                    {isEdit?'Edit scene':'Create new scene'}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
      <Dialog.Portal>
          <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 text-gray-900 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
              <div className="flex flex-row">
                      <SceneCardForm
                          section={section}
                          scene={isEdit?scene:undefined}
                          onSave={(isEdit, sceneData, sect) => {onSave(isEdit, sceneData, sect); setEditOpen(false)}}
                          onCancel={() => {onCancel(); setEditOpen(false)}}
                          />      
              </div>
          </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}



  function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 12 12" fill="currentcolor" {...props}>
      <path d="M6.75 0H5.25V5.25H0V6.75L5.25 6.75V12H6.75V6.75L12 6.75V5.25H6.75V0Z" />
    </svg>
  );
}
