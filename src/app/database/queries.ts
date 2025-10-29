'use server'
import {createClient, GelError} from "gel"
import { actor, scene, character, section, ensemble, act, rehearsal, person, location, equipment, day, user } from "../components/types";

interface _day{
    id:string,
    name: string,
    day: string,
    short: string,
    ddd: string
}
const actsQ = `
select default::act{
id,
name,
sections: {
  id,
  name,
  colour,
  ensemble: {
    id,
    name
  },
  scenes: {
    id,
    name,
    pages,
    status,
    ensemble: {
      id,
      name
      },
    characters: {
      id,
      name,
      played_by: {
        id,
        first_name,
        last_name
      }
      order by .first_name
    }
    order by .name
  }
  order by .name
}
  order by .name
}
`

const scenesQ = `
select default::scene {
  id,
  name,
  status,
  pages,
  characters: {
    id,
    name,
    description,
    played_by: {
      id,
      first_name,
      last_name
    },
  },
  ensemble: {
    id,
    name,
  },
}
filter .section.name = <str>$section
order by .name
`
const allscenesQ = `
select default::scene {
  id,
  name,
  status,
  characters: {
    id,
    name,
    description,
    played_by: {
        id,
      first_name,
      last_name
    },
  },
  ensemble: {
    id,
    name,
  }
}
order by .name
`

const equipmentQ = `
    select default::equipment {
    id,
    name,
    status,
    type
}
`

const rehearsalsQ = `
select default::rehearsal {
  id,
  _day := to_str(.day.date, 'FMDay, FMDDth Month'),
  times := to_str(.start_time, 'FMHH:MIam') ++ <str>' - ' ++ to_str(.end_time, 'FMHH:MIam'),
  venues: {
    id,
    name,
    adress,
    post_code
  },
  scenes: {
    id,
    name,
    status,
    @pages
  },
  called: {
    id,
    name,
    played_by: {
        id,
      first_name,
      last_name,
      available := count(.availability filter .date = rehearsal.day.date) > 0
    }
  },
  ensemble: {
    id,
    name,
    number := count(.members),
    available := count(.members filter count(.availability filter .date = rehearsal.day.date) > 0),
  }
}
  order by .day.date then .start_time
  `

const rehearsalQ = `
    with uuid := <uuid>$param
    select default::rehearsal {
    id,
    aims,
    day: {
      id,
      _date := to_str(.date),
      day := to_str(.date, 'FMDay, FMDDth Month'), 
      short := to_str(.date, 'FMDy FMDDth Mon'),
    },
    _start_time := to_str(.start_time),
    _end_time := to_str(.end_time),
    times := to_str(.start_time, 'FMHH:MIam') ++ <str>' - ' ++ to_str(.end_time, 'FMHH:MIam'),
    notes,
    outcome,
    venues: {
        id,
        adress,
        name,
        post_code
    },
    bsl_interpreter: {
        id,
        first_name,
        last_name
    },
    creative: {
        id,
        first_name
    },
    support: {
        id,
        first_name
    },
    volunteers: {
        id,
        first_name
    },
    scenes: {
        id,
        @pages,
        name,
        status,
        characters: {
          name,
          played_by: {
              id,
              first_name,
              last_name,
              available := count(.availability filter .date = rehearsal.day.date) > 0
    }
        },
    ensemble: {
        id,
        name
        },
    section: {
        id,
        name        
        }
    },
    equipment: {
        id,
        name,
        status,
        type
    },
    assistants: {
        id,
        first_name
    },
    called: {
        id,
        name,
        played_by: {
            id,
            last_name,
            first_name,
            available := count(.availability filter .date = rehearsal.day.date) > 0
        }
    },
    students: {
        id,
        first_name
    },
    ensemble: {
        id,
        name,
        number := count(.members),
        available := count(.members filter count(.availability filter .date = rehearsal.day.date) > 0),
        subensembles: {
            id,
            name
        }
    }
    }
    filter .id = <uuid>uuid
`

const locationsQ = `
    select default::location {
        id,
        adress,
        name,
        post_code
    }
`

const peopleQ = `
    select default::person {
        id,
        first_name,
        _role,
        last_name
    }
    filter person is not actor
`

const charactersQ = `
select default::character {
  name,
  id,
  played_by: {
    id,
    last_name,
    first_name,
    child := count(.parent) > 0
  }
}
order by .name
`

const daysQ = `
select default::rehearsal_day {
  id,
  name,
  day := to_str(.date, 'FMDay, FMDDth Month'),
  short := to_str(.date, 'FMDy FMDDth Mon'),
  _date := to_str(.date)
}
order by .date
`
const castAvailabilityQ = `
select default::actor {
  last_name,
  id,
  first_name,
  availability: {
    id,
    day := to_str(.date, 'FMDay, FMDDth Month'),
    short := to_str(.date, 'FMDy FMDDth Mon'),
    _month := cal::date_get(.date, 'month'),
    _week := cal::date_get(.date, 'week'),
    _day := cal::date_get(.date, 'day'),
    _date := to_str(.date),

  } 
  filter ._month = <int64>$month
  order by .date,
  plays: {
    id,
    name
  },
  ensemble: {
    id,
    name
  },
  featured_in := .<featured[is ensemble]{name, id},
}
  order by .first_name

`

const rehearsalDaysQ = `
select default::rehearsal_day {
  id,
  name,
  day := to_str(.date, 'FMDDth'),
  short := to_str(.date, 'FMDy FMDDth Mon'),
  _month := cal::date_get(.date, 'month'),
  _week := cal::date_get(.date, 'week'),
  _day := cal::date_get(.date, 'day'),
  _date := to_str(.date),
}
filter ._month = <int64>$month
order by .date
`

const sceneAvailabilityQ = `
with name := <str>$name, date := <str>$date
select default::scene {
  id,
  name,
  characters: {
    id,
    name,
    played_by: {
      id,
      first_name,
      last_name,
      available := count(.availability filter .date = <cal::local_date>date) > 0
    }
  },
    ensemble:{
      id,
      name,
      number := count(.members),
      available := count(.members filter count(.availability filter .date = <cal::local_date>date) > 0),
      }
    }
filter .name = name
`

const ensemblesQ = `
select default::ensemble {
  id,
  name,
  members: {
    id,
    last_name,
    first_name,
    plays: {
      name,
      id
    }
  }
  order by .first_name,
  featured: {
    last_name,
    id,
    first_name,
    plays: {
      id,
      name
    }
  }
  order by .first_name,
}
order by .name
`
const ensembleListQ = `
select default::ensemble {
  id,
  name,
}
order by .name
`
const ensembleQ = `
select default::ensemble {
  id,
  name,
  members: {
    id,
    last_name,
    first_name,
    plays: {
      name,
      id
    }
  }
  order by .first_name,
  featured: {
    last_name,
    id,
    first_name,
    plays: {
      id,
      name
    }
  }
  order by .first_name,
}
filter .name = $name
`

const castQ = `
select default::actor {
  last_name,
  first_name,
  id,
  ensemble: {
    name,
    id
  },
  featured_in := .<featured[is ensemble]{name, id},
  plays: {
    id,
    name
  },
  parent: {
    id,
    first_name,
    last_name
  },
  percentage := to_str(100*count(.availability)/count((select rehearsal_day)),'FM999%')
}
order by .first_name
`

const staffQ =`
select default::person {
  id,
  _role,
  first_name,
  last_name,
  is_admin,
  rba,
  username,
  email,
  first_logon
} 
  filter person is not actor
 `

export async function getActs():Promise<act[]> {
  const client = createClient()
  if(!client) {return []}
  const act = await client.query<act>(actsQ)
    return act
}

export async function getEnsembles():Promise<ensemble[]> {
  const client = createClient()
  if(!client) {return []}
  const ensembles = await client.query<ensemble>(ensemblesQ)
    return ensembles
}

export async function getEnsembleList():Promise<ensemble[]> {
  const client = createClient()
  if(!client) {return []}
  const ensembleList = await client.query<ensemble>(ensembleListQ)
    return ensembleList
}

export async function getEnsemble(name:string):Promise<ensemble> {
  const client = createClient()
  if(!client) {return {name:''}}
  const ensemble = await client.query<ensemble>(ensembleQ, {name: name})
    return ensemble[0]
}

export async function getScenes(section:string):Promise<Array<scene>> {
  const client = createClient()
  if(!client) {return []}
  const scenes = await client.query<scene>(scenesQ, {section: section})
    return scenes
}

export async function getAllScenes():Promise<Array<scene>> {
  const client = createClient()
  if(!client) {return []}
  const scenes = await client.query<scene>(allscenesQ)
    return scenes
}

export async function getRehearsals():Promise<rehearsal[]> {
  const client = createClient()
  if(!client) {return []}
  const rehearsals = await client.query<rehearsal>(rehearsalsQ)
    return rehearsals
}

export async function getRehearsalDays(month: number):Promise<day[]> {
  const client = createClient()
  if(!client) {return []}
  const rehearsalDays = await client.query<day>(rehearsalDaysQ, {month:month})
    return rehearsalDays
}

export async function getRehearsal(id: string):Promise<rehearsal|null> {
  const client = createClient()
  if(!client) {return null}
  const rehearsal = await client.query<rehearsal>(rehearsalQ, {param: id})
    return rehearsal[0]
}

export async function getPeople():Promise<Array<person>> {
  const client = createClient()
  if(!client) {return []}
  const people = await client.query<person>(peopleQ)
    return people
}

export async function getEquipment():Promise<Array<equipment>> {
  const client = createClient()
  if(!client) {return []}
  const equipment = await client.query<equipment>(equipmentQ)
    return equipment
}

export async function getLocations():Promise<Array<location>> {
  const client = createClient()
  if(!client) {return []}
  const locations = await client.query<location>(locationsQ)
    return locations
}

export async function getCharacters():Promise<Array<character>> {
  const client = createClient()
  if(!client) {return []}
  const characters = await client.query<character>(charactersQ)
    return characters
}

export async function getCast():Promise<Array<actor>> {
  const client = createClient()
  if(!client) {return []}
  const cast = await client.query<actor>(castQ)
    return cast
}

export async function getCastAvailability(month: number):Promise<Array<actor>> {
  const client = createClient()
  if(!client) {return []}
  const cast = await client.query<actor>(castAvailabilityQ, {month:month})
    return cast
}

export async function getDays():Promise<Array<day>> {
  const client = createClient()
  if(!client) {return []}
  const _days = await client.query<_day>(daysQ)
    return _days.map((_d) => {const {ddd, ...rest} = _d; return {...rest, _date:ddd}})
}

export async function getStaff():Promise<Array<user>> {
  const client = createClient()
  if(!client) {return []}
  return await client.query<user>(staffQ)
}

export async function insertReheasal(insertQ:string){
  const client = createClient()
      try{
        return client.query(insertQ)  
        }
      catch (err){
          console.log(err)
          return null
      }

}
export async function performUpdate(updateQ:string){
  const client = createClient()
      try{
        return client.query(updateQ)  
        }
      catch (err){
          const e = (err as GelError)
          console.log(`message ${e.message}, name ${e.name}, cause ${e.cause}`)
          return null
      }

}

export async function getSceneAvailability(scene_name:string|undefined, date:string):Promise<scene|undefined> {
  const client = createClient()
  if(!client) {return undefined}
  if(!scene_name || !date) return undefined
  const _scene = await client.query<scene>(sceneAvailabilityQ, {name:scene_name, date:date})
    return _scene.length > 0?_scene[0]:undefined
}


