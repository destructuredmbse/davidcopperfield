'use client'
import Image from "next/image";
import { useState, useMemo} from 'react';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { DataGrid, GridColDef, GridColumnHeaderParams, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid';
import { getRehearsals, getRehearsal } from "../database/queries";
import { character, ensemble, rehearsal, scene } from "../components/types";
import Rehearsal from '../components/rehearsal'
import { Tooltip } from '@base-ui-components/react/tooltip';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { ClearIcon } from "../components/icons";
import EditRehearsal from "../components/editrehearsal";
import { CharacterLabel, EnsembleLabel } from "../components/labels";
import { useUserAccess } from "../../contexts/UserAccessContext";
import { Dialog } from "@base-ui-components/react/dialog";


type rehearsal_summary = {
  id:string
  date: string,
  times: string,
  venue:string
  scenes: scene[],
  called: character[],
  ensembles: ensemble[]
}



export default function Page() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogType, setDialogType] = useState<'edit'|'view'|'new'>('view')
    const [rehearsal, setRehearsal] = useState<rehearsal|undefined>()
    const [isLoading, setIsLoading] = useState(false)
   const { isAdmin, hasAnyRole, isLoading: accessLoading, rba } = useUserAccess()
  
   
  // Use the context helper instead of manually checking rba
  const edit = hasAnyRole(['rehearsals', 'full'])

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex flex-col items-centre w-full">
          <h2 className="text-red-800 text-3xl">Rehearsals</h2>
                  
        {edit && <div className="relative h-4 p-4">
          <NewRehearsal setDialogOpen={setDialogOpen} setDialogType={setDialogType}/>
        </div>}
          <SummaryTable 
            setDialogOpen={setDialogOpen}
            setIsLoading={setIsLoading}
            setRehearsal={setRehearsal}
            setDialogType={setDialogType}
            edit={edit}/>
      </div>
      <Dialog.Portal>
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-40 max-w-9/10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-100 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
              <div className="flex flex-row bg-white outline outline-red-800 rounded-md p-4">
                {dialogType === 'view' && rehearsal?
                <Rehearsal 
                  rehearse={rehearsal as rehearsal} 
                  setDialogType={setDialogType} 
                  setRehearsalOpen={setDialogOpen} 
                  setDialogOpen={setDialogOpen}
                  edit={edit}/>:
                dialogType === 'edit'?<EditRehearsal rehearsal={rehearsal} setEditOpen={setDialogOpen}/>:
                <EditRehearsal setEditOpen={setDialogOpen}/>}
                <Dialog.Close className='size-5 justify-self-end text-red-800'
                    onClick={() => setDialogOpen(false)}>
                  <ClearIcon />
                </Dialog.Close>
              </div>
          </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
);

}

function SummaryTable({setRehearsal, setIsLoading, setDialogOpen, setDialogType, edit}: 
  {edit:boolean
    setRehearsal: (rehearsal:rehearsal) => void
    setIsLoading: (isLoading:boolean) => void
    setDialogOpen: (dialogOpen:boolean) => void
    setDialogType: (dialogType:'edit'|'view'|'new') => void
  }){
  const apiRef = useGridApiRef()
  const {data: rehearsals, isLoading} = useQuery({ queryKey: [`rehearsals`], queryFn: () => getRehearsals() })
  const rows = useMemo(() => {
    console.log(`rehearsals have ${isLoading?'not ':''}loaded`)
    return !isLoading && rehearsals && rehearsals.map((r, i) => {
    return {id:r.id, 
            date:r._day, 
            times:r.times, 
            venue:`${r.venues[0].name}`, 
            scenes: r.scenes,
            called: r.called,
            ensembles: r.ensembles} as rehearsal_summary})},
    [isLoading, rehearsals])



  const columns:GridColDef[] = [
    {
      headerName: '',
      field: 'more',
      width: 20,
      renderHeader: (params: GridColumnHeaderParams) => (
          <MoreVertOutlinedIcon fontSize='small' />
      ),
      renderCell: (params: GridRenderCellParams<any, Date>) => (
        <CellDialog 
          id={params.row.id} 
          setRehearsal={setRehearsal}
          setDialogOpen={setDialogOpen} 
          setIsLoading={setIsLoading}
          setDialogType={setDialogType}
          edit={edit}/>
      )
    },
    {
      headerName: 'Day',
      field: 'date',
      width: 190,
      renderHeader: (params: GridColumnHeaderParams) => (
        <span className="font-semibold">
          {params.colDef.headerName}
        </span>
      ),
    },
    {
      headerName: 'Times',
      field:'times',
      width: 150,
      renderHeader: (params: GridColumnHeaderParams) => (
        <span className="font-semibold">
          {params.colDef.headerName}
        </span>
      )
    },
    {
      headerName: 'Venue',
      field: 'venue',
      width: 250,
      renderHeader: (params: GridColumnHeaderParams) => (
        <span className="font-semibold">
          {params.colDef.headerName}
        </span>
      ),

    },
    {
      headerName: 'Scenes',
      field: 'scenes',
      width: 100,
      renderHeader: (params: GridColumnHeaderParams) => (
        <span className="font-semibold text-wrap">
          {params.colDef.headerName}
        </span>
      ),
      renderCell: (params: GridRenderCellParams<any, scene[]>) => (
        params.value && <div className="text-gray-900 text-wrap">
          {params.value.map((v, i) => <div key={i} ><span>{v.name}</span>{i + 1 < (params.value as scene[]).length && <br/>}</div>)}
          </div>
      )
    },
    {
      headerName: 'Called',
      field: 'called',
      flex: 1,
      renderHeader: (params: GridColumnHeaderParams) => (
        <span className="font-semibold">
          {params.colDef.headerName}
        </span>
      ),
      renderCell: (params: GridRenderCellParams<any, character[]>) => (
        params.value && <div className="text-gray-900 text-wrap">
          {params.value.map((v, i) => <span key={i} ><CharacterLabel character={v as character} short={true}/>{`${i + 1 < (params.value as character[]).length?', ':''}`}</span>)}
          </div>
      )

    },
    {
      headerName: 'Ensembles',
      field: 'ensembles',
      width: 200,
      renderHeader: (params: GridColumnHeaderParams) => (
        <span className="font-semibold">
          {params.colDef.headerName}
        </span>
      ),
      renderCell: (params: GridRenderCellParams<any, ensemble[]>) => (
        params.value && <div className="text-gray-900 text-wrap">
          {params.value.map((v, i) => <div key={i}><span><EnsembleLabel ensemble={v as ensemble}/></span>{i + 1 < (params.value as ensemble[]).length && <br/>}</div>)}
          </div>
      )

    }
  ]

  return (
    <div className="flex flex-col gap-2 w-full pr-6">
      <div className='pt-2'>
        <DataGrid apiRef={apiRef} columns={columns} getRowHeight={() => 'auto'} rows={rows || []} density='compact' loading={isLoading}/>
      </div>
  </div>
)
}

function CellDialog({id, setRehearsal, setIsLoading, setDialogOpen, setDialogType, edit}: 
  { id:string, 
    setRehearsal:(rehearsal:rehearsal) => void,
    setIsLoading: (isLoading: boolean) => void
    setDialogOpen: (dialogOpen:boolean) => void,
    setDialogType: (dialogType:'edit'|'view'|'new') => void
    edit:boolean})
    {
  const [open, setOpen] = useState(false)

  const {data: rehearsal, isLoading} = useQuery({ queryKey: [`researsal_${id}`], queryFn: () => getRehearsal(id) })
  
  if(!isLoading && rehearsal){setRehearsal(rehearsal); setIsLoading(false)}
  else setIsLoading(true)
  
  return(
    <div>
      <Tooltip.Provider>
       <Tooltip.Root>
          <Tooltip.Trigger 
            className="flex size-8 items-center justify-center rounded-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[popup-open]:bg-gray-100 focus-visible:[&:not(:hover)]:bg-transparent"
            render={
              <Dialog.Trigger 
                onClick={() => {setDialogType('view'); setDialogOpen(true)}}
                className="flex size-8 items-center justify-center text-gray-900 select-none"
                >
                  <MoreVertOutlinedIcon aria-label="Select" className="size-4" />
              </Dialog.Trigger>
            }
            >
            </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={10}>
                  <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-sm shadow-lg shadow-gray-200 outline outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                    <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                      <ArrowSvg />
                    </Tooltip.Arrow>
                    Select to show the full details of a rehearsal.
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
    </div>

  )
}

function NewRehearsal({setDialogOpen, setDialogType}:
  {setDialogOpen:(dialogOpen:boolean) => void
    setDialogType: (v:'edit'|'new'|'view') => void
  }){

  return(
      <Tooltip.Provider>
       <Tooltip.Root>
          <Tooltip.Trigger 
            className="flex size-8 items-center justify-center rounded-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[popup-open]:bg-gray-100 focus-visible:[&:not(:hover)]:bg-transparent"
            render={
              <Dialog.Trigger 
                className="absolute top-1 right-1 flex size-8 items-center justify-center text-gray-900 select-none"
                onClick={() => {setDialogType('new'); setDialogOpen(true)}}
                >
                  <AddCircleOutlineOutlinedIcon aria-label="New" className="size-4 text-red-800" />
              </Dialog.Trigger>
            }
            >
            </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={10}>
                  <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-sm shadow-lg shadow-gray-200 outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                    <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                      <ArrowSvg />
                    </Tooltip.Arrow>
                    Create a rehearsal.
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
  )
}


function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-[canvas]"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-gray-200 dark:fill-none"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="dark:fill-gray-300"
      />
    </svg>
  );
}
