import { Accordion } from '@base-ui-components/react/accordion';
import { Tabs } from '@base-ui-components/react/tabs';
import { getCast, getActs, getCharacters, getCastAvailability, getRehearsalDays, performUpdate,  } from "../database/queries";
import { rehearsal_day, day, actor, scene, scene_status, character, section, ensemble } from "./types";
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
import { personLabel } from './helpers';
import { Checkbox } from '@base-ui-components/react/checkbox';
import { Menu } from '@base-ui-components/react/menu';
import { CheckIcon } from './icons';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { useUserAccess } from '@/contexts/UserAccessContext';

// Move filter function outside component to prevent recreation
const filter_criteria = (a:actor, f:string) =>
    (`${a.first_name} ${a.last_name}`.toLowerCase().includes(f) ||
        a.plays && a.plays.some((p) => p.name.toLowerCase().includes(f)) ||
          a.ensemble && a.ensemble.some((e) => e.name.toLowerCase().includes(f)) ||
            a.featured_in && a.featured_in.some((e) => e.name.toLowerCase().includes(f)))

const updateQuery = (changes:Map<string, {add:string[], remove:string[]}>) => {
return Array.from(changes.entries()).map(([key, value]) => 
`${value.add.length > 0?`update actor filter .id = <uuid>"${key}"
set {availability += (select rehearsal_day filter .id in {${value.add.map(d => `<uuid>"${d}"`).join(', ')}})};`:''}
${value.remove.length > 0?`update actor filter .id = <uuid>"${key}"
set {availability -= (select rehearsal_day filter .id in {${value.remove.map(d => `<uuid>"${d}"`).join(', ')}})};`:''}`).join(`\n`)
}

const months = [
       'January', 
        'February', 
        'March', 
        'April', 
        'May', 
        'June', 
        'July', 
        'August', 
        'September', 
        'October', 
        'November', 
        'December'
    ]

// Stable className constant
const ACTOR_CARD_CLASSNAME = 'overflow-auto whitespace-nowrap';

// Helper function to get current month number (1-12)
const getCurrentMonthNumber = () => {
  return new Date().getMonth() + 1;
}

// Helper function to get month number from any date
const getMonthFromDate = (date: string | Date) => {
  return new Date(date).getMonth() + 1;
}

// Helper function to get month name and number
const getCurrentMonthInfo = () => {
  const now = new Date();
  return {
    number: now.getMonth() + 1,        // 1-12
    index: now.getMonth(),             // 0-11  
    name: now.toLocaleDateString('en-US', { month: 'long' }),
    shortName: now.toLocaleDateString('en-US', { month: 'short' }),
    year: now.getFullYear()
  };
}

export function CastAvailability(){
  const [filter, setFilter] = useState('')
  const [changes, setChanges] = useState<Map<string, {add:string[], remove:string[]}>>(new Map())
  const [committed, setCommitted] = useState(true)
  const [month, setMonth] = useState(getCurrentMonthNumber())
  const [away, setAway] = useState(false)
  const queryClient = useQueryClient()

  const { hasAnyRole, isLoading: accessLoading, rba, isAdmin } = useUserAccess()
  // Use the context helper instead of manually checking rba
  const edit = hasAnyRole(['actors', 'full'])


    const updateAvailabilityMutation = useMutation({
        mutationFn: (updateQ:string) => {return performUpdate(updateQ)},
        onSuccess: async () => {
            await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['availability', month] }),
            ])
            setChanges(new Map())
            setCommitted(true)
            setAway(false)
        },
        onError: (error) => {
            console.error('Failed to update availability:', error)
            // Optionally keep changes on error so user can retry
        }
    })

// Helper function to reset changes manually if needed
const resetChanges = useCallback(() => {
    setChanges(new Map())
}, [])

// Helper function to reset changes for specific actors
const resetActorChanges = useCallback((actorIds: string[]) => {
    setChanges(prev => {
        const newChanges = new Map(prev)
        actorIds.forEach(actorId => {
            newChanges.delete(actorId)
        })
        return newChanges
    })
}, [])

// Helper function to check if there are any unsaved changes
const hasUnsavedChanges = useMemo(() => {
    return changes.size > 0 && Array.from(changes.values()).some(change => 
        change.add.length > 0 || change.remove.length > 0
    )
}, [changes])


  const {data: actors, isLoading: isLoadingCastAvailability} = useQuery({ queryKey: [`availability`, month], queryFn: () => getCastAvailability(month) })
  const {data: rehearsalDays, isLoading: isLoadingRehearsalDays} = useQuery({ queryKey: [`rehearsalDays`, month], queryFn: () => getRehearsalDays(month) })

    const ready = !isLoadingCastAvailability && !isLoadingRehearsalDays

  // Memoize rehearsal days to avoid recalculation
  const rds = useMemo(() => {
    if (!isLoadingCastAvailability && !isLoadingRehearsalDays) {
      return rehearsalDays as rehearsal_day[] || []
    }
    return []
  }, [rehearsalDays, isLoadingCastAvailability, isLoadingRehearsalDays])


  // Memoize filtered actors to prevent recalculation on every render
  const filteredActors = useMemo(() => {
    if (!actors || !filter) return actors || [];
    return actors.filter((a: actor) => filter_criteria(a, filter));
  }, [actors, filter]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value.toLowerCase());
  }, []);

  // Function to update availability changes
  const updateActorAvailability = useCallback((actorId: string, dayId: string, available: boolean) => {
    if(committed)setCommitted(false)
    setChanges(prev => {
      const newChanges = new Map(prev);
      const actorChanges = newChanges.get(actorId) || {add:[], remove:[]};
      
      if (available) {
        // Add day to available list
        if (actorChanges.remove.includes(dayId)){
            if((actorChanges.add.length + actorChanges.remove.filter(r => r !== dayId).length) === 0)newChanges.delete(actorId)
            else newChanges.set(actorId, {...actorChanges, remove:actorChanges.remove.filter(r => r !== dayId)})
        }
        else if (!actorChanges.add.includes(dayId)) {
          newChanges.set(actorId, {...actorChanges, add:[...actorChanges.add, dayId]});
        }
      } else {
        // Remove day from available list
        if (actorChanges.add.includes(dayId)){
            if((actorChanges.remove.length + actorChanges.add.filter(r => r !== dayId).length) === 0)newChanges.delete(actorId)
            else newChanges.set(actorId, {...actorChanges, add:actorChanges.add.filter(r => r !== dayId)})
        }      
        else if (!actorChanges.remove.includes(dayId)) {
          newChanges.set(actorId, {...actorChanges, remove:[...actorChanges.remove, dayId]});
        }
    }
      return newChanges;
    });
  }, [committed, setCommitted, setChanges]);

  const navigateAway = useCallback((newMonth:number) =>{
    if(month !== newMonth){
        if(changes.size !== 0)setAway(true)
        else setMonth(newMonth)
    }
  }, [changes, month, away])

  return(
    <div className="flex flex-col h-screen">
      {/* Filter section - positioned above table */}
      <div data-ready={ready} className='w-full relative data-[ready=false]:hidden'>
            <div className='flex flex-col gap-2 w-full p-2 bg-white border-b'>
                <label className='text-sm font-medium text-gray-700'>Filter Cast</label>
                <Input
                placeholder="Search by name, character, or ensemble..."
                className="h-6 w-full max-w-96 p-1 rounded-md border border-gray-200 pl-3.5 text-sm text-gray-900 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-100"
                onValueChange={handleFilterChange}
                />
            </div>
            {edit && <div data-away={away} className='flex flex-row gap-2 absolute content-center bottom-2 right-2 p-1 data-[away=true]:bg-red-600'>
                <button            
                    disabled={changes.size === 0}
                    data-away={away}
                    type="button"
                    className=" p-2 flex h-5 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 data-[away=true]:font-bold"
                    onClick={() => {changes.clear(); setCommitted(true); setAway(false)}}
                >
                    Disgard changes
                </button>
                <button
                    data-away={away}
                    disabled={changes.size === 0}
                    type="button"
                    className="p-2 flex h-5 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400  data-[away=true]:font-bold"
                    onClick={() => {
                    console.log(`saving actor availability changes \n${updateQuery(changes)}`)
                        updateAvailabilityMutation.mutate(updateQuery(changes))
                    }}
                >
                    Save changes
                </button>
            </div>}
        </div>
      {/* Table container with sticky header */}
      <div className="flex-1 overflow-y-auto max-h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          {/* Month header row */}
          <div className="flex min-w-fit justify-center">
            <div className="w-48 pt-1 font-bold bg-gray-100 border-r border-gray-200 text-center"/>
            <div className={`flex-1 pt-1 font-normal bg-gray-100 text-center`} 
                 style={{ width: `calc(var(--spacing) * 16 * ${rds.length})` }}>
              {rds.length > 0 && <Month month={month} onMonthChange={navigateAway} firstMonth={9} lastMonth={2}/>}
            </div>
          </div>
          
          {/* Days header row */}
          <div data-ready={ready} className="flex min-w-fit border-b border-gray-200 data-[ready=false]:hidden">
            <div className="w-48 pb-1 pt-1 pl-3 font-semibold bg-gray-100 border-r border-gray-200">Actor</div>
            {rds.map((day, index) => (
              <div key={index} className="w-16 pb-1 pt-1 font-semibold bg-gray-100 border-r border-gray-200 text-center text-xs">
                {day.day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Data rows */}
        <div data-ready={ready} className="flex flex-col data-[ready=false]:hidden">
          {filteredActors.map((actor, actorIndex) => (
            <div key={actor.id || `${actor.first_name}_${actor.last_name}`} className="flex hover:bg-gray-50">
              <div className="w-48 p-3 border-r border-l border-b border-gray-200 bg-white text-sm capitalize">{personLabel(actor)}</div>
              {rds.map((day, dayIndex) => <Cell key={day.id} actor={actor} day={day} edit={edit} committed={committed} updateActorAvailability={updateActorAvailability}/>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Cell({actor, day, committed, edit, updateActorAvailability}:{actor:actor, day:day, committed:boolean, edit:boolean, updateActorAvailability:(actorId: string, dayId: string, available: boolean) => void}){
    const [changed, setChanged] = useState(false)
    const [checked, setChecked] = useState(actor.availability && actor.availability.some(av => av._date === day._date))
    const available = actor.availability && actor.availability.some(av => av._date === day._date)
    if(committed && changed)setChanged(false)
    if(committed && (available !== checked))setChecked(available)

    const change = (checked:boolean) => {
        updateActorAvailability(actor.id as string, day.id as string, checked)
        setChanged(!changed)
        setChecked(checked)
    }

    return(
        <div data-changed={`${changed}`} className="w-16 p-3 border-r border-b border-gray-200 bg-white data-[changed=true]:bg-gray-200 items-center">
            <Checkbox.Root
                checked={checked}
                className="flex size-5 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-green-600 data-[unchecked]:border data-[unchecked]:border-red-600"
                onCheckedChange={(checked:boolean) => change(checked)}
                disabled={!edit}
                readOnly={!edit}
            >
                <Checkbox.Indicator className="flex text-gray-50 data-[unchecked]:hidden">
                <CheckIcon className="size-3" />
                </Checkbox.Indicator>
            </Checkbox.Root>
        </div>

    )
}


function Month({month, onMonthChange, firstMonth, lastMonth}:{month: number, onMonthChange?: (month:number) => void, firstMonth?: number, lastMonth?: number}){
    // Helper function to check if a month is valid for the season
    const isValidMonth = useCallback((m: number) => {
        if (!firstMonth || !lastMonth) return true;
        
        // Handle season spanning year boundary (e.g., Sept to Feb)
        if (firstMonth < lastMonth) {
            return m >= firstMonth || m <= lastMonth;
        }
        
        // Normal case: season within same calendar year
        return m >= firstMonth && m <= lastMonth;
    }, [firstMonth, lastMonth]);

    // Get valid initial month
    const getInitialMonth = useCallback(() => {
        const current = getCurrentMonthNumber();
        if (isValidMonth(current)) return current;
        return firstMonth || 1;
    }, [isValidMonth, firstMonth]);

    // const [month, setMonth] = useState(getInitialMonth())
    // Helper function to get next valid month
    const getNextMonth = useCallback((currentMonth: number, direction: 'up' | 'down') => {
        let newMonth = currentMonth;
        console.log(`direction ${direction} current month ${currentMonth}`)
        
        if (direction === 'up') {
            newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        } else {
            newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        }
        
        // If no constraints, return the new month
        if (!firstMonth || !lastMonth) {return newMonth;}
        
        // Check if we've reached the boundaries
        if (direction === 'up' && newMonth < firstMonth && newMonth > lastMonth) newMonth =  lastMonth;
        if (direction === 'down' && newMonth > lastMonth && currentMonth < firstMonth) newMonth = firstMonth;
        return newMonth;
    }, [firstMonth, lastMonth]);

    const monthChange = (dir: 'up' | 'down') => {
        const newMonth = getNextMonth(month, dir);
        // Only update if month actually changed
        if (newMonth !== month) {
            // setMonth(newMonth);
            if (onMonthChange) onMonthChange(newMonth);
        }
    } 

    return(
        <div className='flex flex-row content-center justify-self-center'>
            <button 
                data-first={month === firstMonth}
                className='text-red-400 font-normal data-[first=true]:hidden '
                type="button"
                onClick={() => monthChange('down')}
                >
                    <ChevronLeftOutlinedIcon />
            </button>
            <p className='w-40 pl-4 pr-4 text-xl text-red-900 text-center'>{months[month - 1]}</p>
            <button
                data-last={month === lastMonth}
                className='text-red-400 font-normal data-[last=true]:hidden'
                type="button"
                onClick={() => monthChange('up')}
                >
                    <ChevronRightOutlinedIcon />
            </button>
        </div>
    )
}









