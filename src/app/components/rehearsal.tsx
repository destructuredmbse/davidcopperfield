import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRehearsal, performUpdate } from "../database/queries"
import { character, equipment, person, rehearsal, scene, ensemble } from "./types"
import SceneCard from "./scenecard"
import { ensLabel, personLabel } from "./helpers"
import { CharacterLabel, EnsembleLabel, EquipmentLabel } from "./labels"
import Skeleton from "@mui/material/Skeleton"
import { Dialog } from "@base-ui-components/react/dialog"
import { AlertDialog } from '@base-ui-components/react/alert-dialog';
import { useState } from "react"
import { ArrowSvg, ClearIcon } from "./icons"
import EditRehearsal from "./editrehearsal"

const deleteQuery = (rehearsalId:string) => {
return `delete rehearsal filter .id = <uuid>"${rehearsalId as string}"`
}



export default function Rehearsal({rehearse, setRehearsalOpen, setDialogOpen, setDialogType, isLoading, edit}:
  {rehearse:rehearsal, 
    setRehearsalOpen:React.Dispatch<React.SetStateAction<boolean>>, 
    isLoading?:boolean,
    setDialogOpen: (dialogOpen: boolean) => void,
    setDialogType: (dialogType:'edit'|'view'|'new') => void,
    edit:boolean, 
  }){
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
                const queryClient = useQueryClient()

    const deleteRehearsalMutation = useMutation({
        mutationFn: (updateQ:string) => {return performUpdate(updateQ)},
        onSuccess: (data:any) => {
            queryClient.invalidateQueries({ queryKey: ['rehearsals'] })
        },
        onError: (error) => {
            console.error('Failed to delete rehearsal:', error)
        }
    })
  

    const cn = `border rounded-lg p-2 w-min-60 grow shadow-xl bg-gray-100`

  return (
    <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>

    <div id='rehearsal-card'>
      {isLoading?<Skeleton height={230} width={850} />:
      <div className="flex flex-col relative">
        <div>
            <p>
                <span> </span>
                <span className="font-semibold">Day:</span> <span>{rehearse.day.short || rehearse.day._date}</span>
                <span>, </span>
                <span className="font-semibold">Time:</span> <span>{rehearse.times}</span>
                <span>, </span>
                <span className="font-semibold">Location(s):</span> <span>{`${rehearse.venues.map((v) => `${v.name} ${v.postcode || ''}`).join(', ')}`}</span>
            </p>
            <div className="flex flex-row gap-2 pt-4">
              <div className="columns-2">
                {rehearse.scenes.map((s, i) => <SceneCard key={i} scene={s} ensemble={true} />)}  
              </div>
              <CalledList called={rehearse.called}  ensembles={rehearse.ensembles} className='min-w-40 p-1 border rounded-lg shadow-xl bg-gray-100' />
              <div className="grid grid-cols-2 gap-2 min-w-48">
                  <PeopleList key="1" className='min-w-24 p-1 border rounded-lg shadow-xl bg-gray-100' job='Creatives' people={rehearse.creative as person[]} />
                  <PeopleList key="2" className='min-w-24 p-1 border rounded-lg shadow-xl bg-gray-100' job='Assistants' people={rehearse.assistants as person[]} />
                  <PeopleList key="3" className='min-w-24 p-1 border rounded-lg shadow-xl bg-gray-100' job='Support' people={rehearse.support as person[]} />
                  <PeopleList key="4" className='min-w-24 p-1 border rounded-lg shadow-xl bg-gray-100' job='Volunteers' people={rehearse.volunteers as person[]} />
                  <PeopleList key="5" className='min-w-24 p-1 border rounded-lg shadow-xl bg-gray-100' job='Students' people={rehearse.students as person[]} />
              </div>
              <EquipmentList equip={rehearse.equipment || []} className='min-w-40 p-1 border rounded-lg shadow-xl bg-gray-100'/>
              <div className="grid grid-cols-1 content-start min-w-40">
                  <BSL bsl={rehearse.bsl_interpreter} />
                  <Notes notes={rehearse.notes || []} className=""/>
              </div>
            </div>
        </div>
        {edit && <div className="flex flex-row gap-1 pt-2 justify-end">
            <AlertDialog.Trigger 
                onClick={() => {console.log(`deleting ... ${deleteDialogOpen}`); setDeleteDialogOpen(true); console.log(`dialog open ... ${deleteDialogOpen}`);}}
                className="text-xs w-20 text-red-700 border border-red-700 rounded"
                >
                delete
            </AlertDialog.Trigger>
            <Dialog.Trigger 
                onClick={() => {setDialogType('edit'); setDialogOpen(true);}}
                className="text-xs w-20 text-green-800 border border-green-800 rounded">
                edit
            </Dialog.Trigger>
            </div>}
        </div>}
    </div>

      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" />
        <AlertDialog.Popup className="z-50 fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
          <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
            Delete rehearsal?
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-6 text-sm text-gray-600">
            You can’t undo this action.
          </AlertDialog.Description>
          <div className="flex justify-end gap-4">
            <AlertDialog.Close 
                className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100"
                onClick={() => setRehearsalOpen(false)}>
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close
                onClick={() => {console.log(`${deleteQuery(rehearse.id)}`);
                                deleteRehearsalMutation.mutate(deleteQuery(rehearse.id))
                                setRehearsalOpen(false)
                            }}                
                className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-red-800 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
              Delete
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
    
  )

}

function BSL({bsl}:{bsl:person | undefined}){
    return (
        <div className="text-xs">
            <p className="font-semibold">BSL Interpreter</p>
            <p className="">
                {bsl?`${personLabel(bsl)}`:'Not required'}
            </p>
        </div>

    )
}

function PeopleList({job, people, className}: {job:string, people:person[], className:string}){
    
    return (
    <div className={className}>
        <div className="text-xs">
            <p className="font-semibold">{job}</p>
            <ul className="">
                {people.length > 0?people.map((p, i) => <li key={i}>{p.first_name}</li>):<li>No {job.toLowerCase()}</li>}
            </ul>
        </div>
    </div>
    )
}

function Notes({notes, className}: {notes:string[], className:string}){

    
    return (
        <div className={className}>
            <div className="text-xs">
                <p className="font-semibold">Notes</p>
                <ul className="">
                    {notes?notes.map((n, i) => <li key={i}>{n}</li>):<li>No notes</li>}
                </ul>
            </div>
        </div>
    )
}


function EquipmentList({equip, className}: {equip:equipment[], className:string}){

    const ment = equip?equip.map((e) => `
        ${e.name} (${e.type})${!(e.status === null || e.status === 'working')?` (${e.status})`:''}
    `):[]

    
    return (
    <div className={className}>
        <div className="text-xs">
            <p className="font-semibold">Equipment</p>
            <ul className="">
                {(equip && equip.length > 0)?equip.map((e, i) => <li key={i}><EquipmentLabel equipment={e}/></li>):<li>No equipment required</li>}
            </ul>
        </div>
    </div>
    )
}

function CalledList({called, ensembles, className}: {called:character[], ensembles:ensemble[], className?:string}){

    
    return (
    <div className={className}>
        <div className="text-xs">
            <p className="font-semibold">Called</p>
            <ul className="text-gray-900">
                {called.length > 0?called.map((c) => <li key={c.id}><CharacterLabel character={c} /></li>):<li>No characters called</li>}
                {ensembles.length > 0?ensembles.map((e) => <li key={e.id}><EnsembleLabel ensemble={e} /></li>):<li>No essemble called</li>}
            </ul>
        </div>
    </div>
    )
}

export function DeleteAlertDialog() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-red-800 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
        Discard draft
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
          <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
            Discard draft?
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-6 text-base text-gray-600">
            You can’t undo this action.
          </AlertDialog.Description>
          <div className="flex justify-end gap-4">
            <AlertDialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
              Cancel
            </AlertDialog.Close>
            <AlertDialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-red-800 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
              Discard
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}