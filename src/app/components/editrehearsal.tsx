import { useCallback, useMemo, useState } from "react"
import { character, person, scene, equipment, location, ensemble, day, time, rehearsal } from "./types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllScenes, getDays, getEquipment, getLocations, getPeople, getSceneAvailability, insertReheasal } from "../database/queries"
import { Form } from "@base-ui-components/react/form"
import { Field } from "@base-ui-components/react/field"
import { Fieldset } from "@base-ui-components/react/fieldset"
import DateSelector from "./dateselector"
import TimeSelector from "./timeselector"
import LocationSelector from "./locationselector"
import BSLSelector from "./bslselector"
import CharactersSelector from "./charactersselector"
import EquipmentSelector from "./equipmentselector"
import { upsertRehearsalQ } from "../database/upsertrehearsalquery"
import PeopleSelector from "./peopleselector"
import SceneSelector from "./sceneselector"
import PagesSelector from "./pagesselector"

export default function EditRehearsal(
  { rehearsal, setEditOpen,
      onSuccess}: 
    {
      rehearsal?: rehearsal,
      setEditOpen?: (open:boolean) =>void,
      onSuccess?: () => void}){
  const [sceneName, setSceneName] = useState<string>(rehearsal?.scenes[0]?.name || '')
  const [selectedScene, setSelectedScene] = useState<scene|undefined>(rehearsal?.scenes?rehearsal.scenes[0]:undefined)
  const [selectedPages, setSelectedPages] = useState<string>(rehearsal?.scenes?.[0]?.['@pages'] || '')
  const [selectedTeams, setSelectedTeams] = 
    useState<Map<string, person[]>>(new Map([['creative', rehearsal?.creative || []], 
      ['support',rehearsal?.support || []], 
      ['assistant',rehearsal?.assistants || []], 
      ['volunteer',rehearsal?.volunteers || []], 
      ['student', rehearsal?.students || []]]))
  const [selectedCalled, setSelectedCalled] = useState<character[]>(rehearsal?.called || [])
  const [selectedEquipment, setSelectedEquipment] = useState<equipment[]>(rehearsal?.equipment || [])
  const [selectedLocation, setSelectedLocation] = useState<location|undefined>(rehearsal?.venues[0])
  const [selectedDay, setSelectedDay] = useState<day|null>(rehearsal?.day || null)
  const [selectedTimes, setSelectedTimes] = useState<time|null>(rehearsal?{name:rehearsal.times, start_time:rehearsal._start_time, end_time:rehearsal._end_time}:null)
  const [selectedBSL, setSelectedBSL] = useState<person|undefined>(rehearsal?.bsl_interpreter)
  const [selectedEnsemble, setSelectedEnsemble] = useState<ensemble|undefined>(rehearsal?.ensemble)
  const [text, setText] = useState<string>(rehearsal?.notes?rehearsal.notes[0]:'')
  
  const queryClient = useQueryClient()

  const insertRehearsal = useMutation({
        mutationFn: (insertQ:string) => {return insertReheasal(insertQ)},
        onSuccess: (data:any) => {
            queryClient.invalidateQueries({ queryKey: ['rehearsals'] })
            setEditOpen && setEditOpen(false)
            onSuccess?.(); // Call the close callback if provided
        },
        onError: (error:any) => {
            console.error('Error inserting rehearsal:', error)
        },
    })

  const daysQuery = useQuery({ queryKey: [`days`], queryFn: () => getDays() })
  const {data: days, isLoading: daysLoading} = daysQuery

  const scenesQuery = useQuery({ queryKey: [`scenes`], queryFn: () => getAllScenes() })
  const {data: _scenes, isLoading: scenesLoading} = scenesQuery
  const peopleQuery = useQuery({ queryKey: [`people`], queryFn: () => getPeople() })
  const {data: people, isLoading: peopleLoading} = peopleQuery
  const equipmentQuery = useQuery({ queryKey: [`equipment`], queryFn: () => getEquipment() })
  const {data: _equipment, isLoading: equipmentLoading} = equipmentQuery
  const locationsQuery = useQuery({ queryKey: [`locations`], queryFn: () => getLocations() })
  const {data: locations, isLoading: locationsLoading} = locationsQuery


  const form_ready = 
        !selectedScene || !selectedTimes || 
        !selectedDay || !selectedLocation || 
        (selectedCalled.length === 0 )|| 
        !(selectedTeams.has('creative') && (selectedTeams.get('creative') as person[]).length > 0)

  return(
    <Form
      onSubmit={async (event: React.FormEvent) => {
        event.preventDefault();
        const insertQ = upsertRehearsalQ(
              {
              rehearsal:rehearsal?.id as string || undefined,
              aim:selectedScene as scene, 
              teams:selectedTeams,
              equipment:selectedEquipment as equipment[],
              location: selectedLocation as location,
              day:selectedDay as day,
              time:selectedTimes as time,
              called:selectedCalled,
              ensemble: selectedEnsemble as ensemble,
              bsl:selectedBSL,
              notes:text,
              pages:selectedPages
          }          
        )
        insertRehearsal.mutate(insertQ)
      }}     
    >
      <Field.Root 
        name="rehearsal" 
        render={<Fieldset.Root />} 
        className={`w-full`}>
      <div className='flex flex-row items-start gap-6 text-sm bg-gray-50 p-2 outline outline-gray-400 rounded-lg'>
            <div className="flex flex-col gap-2">
                {!scenesLoading?<SceneSelector scene={selectedScene || undefined} scenes={_scenes as scene[]} setSelectedScene={setSelectedScene}/>:'Form loading'}
                {selectedScene?<PagesSelector pages={selectedPages} setPages={setSelectedPages}/>:''}
            </div>        
            <div className="">
                {!daysLoading && days?
                    <DateSelector day={selectedDay} days={days} setSelectedDay={setSelectedDay} />:'Form loading'}
            </div>
            <div className="">
                <TimeSelector time={selectedTimes} setSelectedTimes={setSelectedTimes}/>
            </div>
            <div className="">
                {!locationsLoading && locations?
                    <LocationSelector 
                        location={selectedLocation}
                        locations={locations as location[]} 
                        setSelectedLocation={setSelectedLocation}/>:'Form loading'}
            </div>            
      </div>
      <div className="flex flex-row gap-4 p-4">
        <div className="text-xs w-48 pl-2 truncate text-nowrap">
          {selectedScene && !selectedDay &&
            <p className="text-xs text-red-700">Select a date</p>}
              {selectedScene && selectedDay && 
                <CharactersSelector called={selectedEnsemble?[...selectedCalled, selectedEnsemble]:selectedCalled} 
                  sceneName={selectedScene.name} 
                  setScene={setSelectedScene} 
                  setCalled={setSelectedCalled} 
                  date={selectedDay._date} 
                  setSelectedEnsemble={setSelectedEnsemble}/>}
          </div>
        {!peopleLoading && people?<div className="flex flex-row gap-4">
          <div key={1} className="text-xs w-20">
            <PeopleSelector selected={selectedTeams.get('creative')} people={people as person[]} role='creative' teams={setSelectedTeams}/>
          </div>
          <div key={2} className="text-xs w-20">
            <PeopleSelector selected={selectedTeams.get('assistant')} people={people as person[]} role='assistant' teams={setSelectedTeams}/>
          </div>
          <div key={3} className="text-xs w-20">
            <PeopleSelector selected={selectedTeams.get('support')} people={people as person[]} role='support' teams={setSelectedTeams}/>
          </div>
          <div key={4} className="text-xs w-20">
            <PeopleSelector selected={selectedTeams.get('volunteer')} people={people as person[]} role='volunteer' teams={setSelectedTeams}/>
          </div>
          <div key={5} className="text-xs w-20">
            <PeopleSelector selected={selectedTeams.get('student')} people={people as person[]} role='student' teams={setSelectedTeams}/>
          </div>
        </div>:'Loading teams'}
        {!equipmentLoading && _equipment?<div className='text-xs w-48'>
          <EquipmentSelector selected={selectedEquipment} equipment={_equipment} setSelectedEquipment={setSelectedEquipment}/>
        </div>:''}
        <div className='flex flex-col'>
          {!peopleLoading && people?<div>
            <BSLSelector selected={selectedBSL}
                bsl={people?.filter((p) => p._role === 'bsl interpreter') as person[]} 
                setSelectedBSL={setSelectedBSL}
              />
          </div>:''}
          <div className="text-xs pt-4">
            <p className="font-semibold">Notes</p>
            <textarea 
                placeholder="Add notes here ..."
                value={text || undefined}
                className="border border-gray-400 rounded-md w-40 h-48"
                onChange={(e) => setText(e.target.value)}/>
          </div>
          
        </div>
      </div>
      </Field.Root>
      <div className="flex flex-row gap-4 items-center">
        <SubmitButton form_ready={form_ready}/>
        <div className="text-xs text-red-700">
            {form_ready?<p>{`A rehearsal needs: 
                ${[`${!selectedDay?`a date`:''}`,
                `${!selectedTimes?`times`:''}`,
                `${!selectedLocation?`a venue`:''}`,
                `${selectedCalled.length === 0?`some cast members called`:''}`,
                `${(selectedTeams.has('creative')?selectedTeams.get('creative'):[])?.length === 0?`at least one creative`:''}`].join(' ')}`
                }
            </p>:''}
        </div>
    </div>
    </Form>
  )
}

function SubmitButton({form_ready}:{form_ready:boolean}){
    return(
        <button
            type="submit"
            className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            disabled={form_ready}
            >
            Save rehearsal
        </button>
    )
}


