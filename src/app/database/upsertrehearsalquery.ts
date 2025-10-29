import { person, scene, location, day, time, character, ensemble, equipment } from "../components/types";


export function upsertRehearsalQ(
{ rehearsal, aim, teams, equipment, location, day, time, called, ensemble, bsl, notes, pages }: { rehearsal?:string, aim: scene; teams: Map<string, person[]>; equipment: equipment[]; location: location; day: day; time: time; called: character[]; ensemble?: ensemble; bsl?: person; notes?: string; pages?:string },
):string
{
    
    const creative = teams.get('creative') as person[]
    const support = teams.get('support') as person[]
    const volunteer = teams.get('volunteeer') as person[]
    const assistant = teams.get('assistant') as person[]
    const student = teams.get('student') as person[]


    return `
    ${rehearsal?`update default::rehearsal filter .id = <uuid>'${rehearsal}' set `:`insert default::rehearsal `}{
    day := (select detached day filter .id = <uuid>'${day.id as string}'),
    date := <cal::local_date>'${day._date}',
    end_time := cal::to_local_time('${time.end_time}'),
    start_time := cal::to_local_time('${time.start_time}'),
    ${notes?`notes := '${notes}',`:''}
    venues := (select detached location filter .id = <uuid>'${location.id as string}'),
    ${bsl?`bsl_interpreter := (select detached person filter .id = <uuid>'${bsl.id as string}'),`:''}
    ${creative?.length > 0?`creative := (select detached person filter .id in {${creative.map((p) => `<uuid>'${p.id}'`).join(', ')}}),`:''}
    ${support?.length > 0?`support := (select detached person filter .id in {${support.map((p) => `<uuid>'${p.id}'`).join(', ')}}),`:''}
    ${volunteer?.length > 0?`volunteers := (select detached person filter .id in {${volunteer.map((p) => `<uuid>'${p.id}'`).join(', ')}}),`:''}
    ${assistant?.length > 0?`assistants := (select detached person filter .id in {${assistant.map((p) => `<uuid>'${p.id}'`).join(', ')}}),`:''}
    ${student?.length > 0?`students := (select detached person filter .id in {${student.map((p) => `<uuid>'${p.id}'`).join(', ')}}),`:''}
    scenes := (select detached scene ${pages?`{@pages := '${pages}'} `:''}filter .id = <uuid>'${aim.id as string}'),
    ${equipment?.length > 0?`equipment := (select equipment filter .id in {${equipment.map((e) => `<uuid>'${e.id}'`).join(', ')}}),`:''}
    called := (select character filter .id in {${called.map((c) => `<uuid>'${c.id}'`).join(', ')}}),
    ${ensemble?`ensemble := (select ensemble filter .id = <uuid>'${ensemble.id as string}'),`:''}
    }  
    `
}