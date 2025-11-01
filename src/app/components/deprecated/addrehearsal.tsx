import { useCallback, useMemo, useState } from "react"
import { character, person, scene, equipment, location, ensemble, day, time } from "../types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllScenes, getDays, getEquipment, getLocations, getPeople, getSceneAvailability, insertReheasal, performUpdate } from "../../database/queries"
import { Form } from "@base-ui-components/react/form"
import { Field } from "@base-ui-components/react/field"
import { Fieldset } from "@base-ui-components/react/fieldset"
import DateSelector from "../dateselector"
import TimeSelector from "../timeselector"
import LocationSelector from "../locationselector"
import BSLSelector from "../bslselector"
import CharactersSelector from "../charactersselector"
import EquipmentSelector from "../equipmentselector"
import { upsertRehearsalQ } from '../../database/upsertrehearsalquery'
import PeopleSelector from "../peopleselector"
import SceneSelector from "../sceneselector"
import PagesSelector from "../pagesselector"

export default function AddRehearsal({onSuccess}: {onSuccess?: () => void}){
  const [sceneName, setSceneName] = useState<string>()
  const [scene, setScene] = useState<scene>()
  const [pages, setPages] = useState('')
  const [teams, setTeams] = useState<Map<string, person[]>>(new Map())
  const [called, setCalled] = useState<character[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<equipment[]>([])
  const [selectedLocation, setSelectedLocation] = useState<location>()
  const [selectedDay, setSelectedDay] = useState<day>()
  const [selectedTimes, setSelectedTimes] = useState<time>()
  const [selectedBSL, setSelectedBSL] = useState<person>()
  const [selectedEnsemble, setSelectedEnsemble] = useState<ensemble>()
  const [text, setText] = useState<string>()
  
  const queryClient = useQueryClient()

  const insertRehearsal = useMutation({
        mutationFn: (insertQ:string) => {return performUpdate(insertQ)},
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['rehearsals'] })
            onSuccess?.(); // Call the close callback if provided
    },
    })



  if(teams.size === 0){
    teams.set('creative', [])
    teams.set('support', [])
    teams.set('assistant', [])
    teams.set('volunteer', [])
    teams.set('student', [])
  }

  const daysQuery = useQuery({ queryKey: [`days`], queryFn: () => getDays() })
  const {data: days, isLoading: daysLoading} = daysQuery

  const scenesQuery = useQuery({ queryKey: [`scenes`], queryFn: () => getAllScenes() })
  const {data: scenes, isLoading: scenesLoading} = scenesQuery
  const peopleQuery = useQuery({ queryKey: [`people`], queryFn: () => getPeople() })
  const {data: people, isLoading: peopleLoading} = peopleQuery
  const equipmentQuery = useQuery({ queryKey: [`equipment`], queryFn: () => getEquipment() })
  const {data: equipment, isLoading: equipmentLoading} = equipmentQuery
  const locationsQuery = useQuery({ queryKey: [`locations`], queryFn: () => getLocations() })
  const {data: locations, isLoading: locationsLoading} = locationsQuery


  const form_ready = 
        !sceneName || !selectedTimes || 
        !selectedDay || !selectedLocation || 
        (called.length === 0 )|| 
        !(teams.has('creative') && (teams.get('creative') as person[]).length > 0)

  

  return(
    <Form
      onSubmit={async (event) => {
        event.preventDefault();
        const insertQ = upsertRehearsalQ(
              {aim:scene as scene, 
              teams:teams,
              equipment:selectedEquipment as equipment[],
              location: selectedLocation as location,
              day:selectedDay as day,
              time:selectedTimes as time,
              called:called,
              ensemble: selectedEnsemble as ensemble,
              bsl:selectedBSL,
              notes:text,
              pages:pages
          }          
        )
        insertRehearsal.mutate(insertQ)
      }}     
    >
      <Field.Root 
        name="rehearsal" 
        render={<Fieldset.Root />} 
        className={`w-full`}>
      <div className='flex flex-row items-start gap-6 text-sm bg-gray-50 p-2 rounded-lg'>
            <div className="flex flex-col gap-2">
                {!scenesLoading?<SceneSelector scenes={scenes as scene[]} setSceneName={setSceneName}/>:'Form loading'}
                {scene?<PagesSelector setPages={setPages}/>:''}
            </div>        
            <div className="">
                {!daysLoading && days?
                    <DateSelector days={days} setSelectedDay={setSelectedDay} />:'Form loading'}
            </div>
            <div className="">
                <TimeSelector setSelectedTimes={setSelectedTimes}/>
            </div>
            <div className="">
                {!locationsLoading && locations?
                    <LocationSelector 
                        locations={locations as location[]} 
                        setSelectedLocation={setSelectedLocation}/>:'Form loading'}
            </div>            
      </div>
      <div className="flex flex-row gap-4 p-4">
        <div className="text-xs w-48 pl-2 truncate text-nowrap">
          {!sceneName?'':
          !selectedDay?
            <p className="text-xs text-red-600">Select a date</p>:
            <CharactersSelector sceneName={sceneName} setScene={setScene} setCalled={setCalled} date={selectedDay?._date} setSelectedEnsemble={setSelectedEnsemble}/>
          }
          </div>
        {!peopleLoading && people?<div className="flex flex-row gap-4">
          <div key={1} className="text-xs w-20">
            <PeopleSelector people={people as person[]} role='creative' teams={setTeams}/>
          </div>
          <div key={2} className="text-xs w-20">
            <PeopleSelector people={people as person[]} role='assistant' teams={setTeams}/>
          </div>
          <div key={3} className="text-xs w-20">
            <PeopleSelector people={people as person[]} role='support' teams={setTeams}/>
          </div>
          <div key={4} className="text-xs w-20">
            <PeopleSelector people={people as person[]} role='volunteer' teams={setTeams}/>
          </div>
          <div key={5} className="text-xs w-20">
            <PeopleSelector people={people as person[]} role='student' teams={setTeams}/>
          </div>
        </div>:'Loading teams'}
        {!equipmentLoading && equipment?<div className='text-xs w-48'>
          <EquipmentSelector equipment={equipment} setSelectedEquipment={setSelectedEquipment}/>
        </div>:''}
        <div className='flex flex-col'>
          {!peopleLoading && people?<div>
            <BSLSelector 
                bsl={people?.filter((p) => p._role === 'bsl interpreter') as person[]} 
                setSelectedBSL={setSelectedBSL}
              />
          </div>:''}
          <div className="text-xs pt-4">
            <p className="font-semibold">Notes</p>
            <textarea 
                placeholder="Add notes here ..."
                className="border border-gray-400 rounded-md w-40 h-48"
                onChange={(e) => setText(e.target.value)}/>
          </div>
          
        </div>
      </div>
      </Field.Root>
      <div className="flex flex-row gap-4 items-center">
        <SubmitButton form_ready={form_ready}/>
        <div className="text-xs text-red-600">
            {form_ready?<p>{`A rehearsal needs: 
                ${[`${!selectedDay?`a date`:''}`,
                `${!selectedTimes?`times`:''}`,
                `${!selectedLocation?`a venue`:''}`,
                `${called.length === 0?`some cast members called`:''}`,
                `${(teams.has('creative')?teams.get('creative'):[])?.length === 0?`at least one creative`:''}`].join(' ')}`
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
            className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            disabled={form_ready}
            >
            Save
        </button>
    )
}


