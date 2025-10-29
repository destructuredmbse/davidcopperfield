import { twMerge } from "tailwind-merge"
import { character, person, actor, equipment, ensemble, user } from "./types"

export function CharacterLabel({character, short, className} : {character:character, short?:boolean, className?:string}){
  short = short && short || false
 return(
  <span 
    data-unavailable={character.played_by && character.played_by.some((p) => 'available' in p && !p.available)} 
    className={twMerge(className, 'data-[unavailable=true]:!text-red-600')}>
    {character.name} 
    {!short && character.played_by && character.played_by.length > 0?<span> ({character.played_by.map((p, i) => <PersonLabel key={i} person={p} />)})</span>:''}
    </span>
 )
}

export function PersonLabel({person, className} : {person?:person|actor, className?:string}){

  return(
      <span 
        data-unavailable={`${person && 'available' in person && !person.available}`}
          className={twMerge(className, 'capitalize data-[unavailable=true]:line-through data-[unavailable=true]:text-red-600')}>
            {person?person.first_name:''}{person?.last_name?` ${person.last_name}`:''}{person && '_role' in person && person._role?` (${person._role})`:''}
          </span>

  )
}

export function EquipmentLabel({equipment, className} : {equipment:equipment, className?:string}){
    
  return(
    <span data-broken={`${'status' in equipment && equipment.status !==null && equipment.status !== 'working'}`} className={twMerge(className, 'data-[broken=true]:text-red-600')}>
        {equipment.name} ({equipment.type}){'status' in equipment && (equipment.status !==null && equipment.status !== 'working')?` (${equipment.status})`:''}
      </span>

  )
}

export function EnsembleLabel({ensemble, short, className} : {ensemble:ensemble, short?:boolean, className?:string}){
    short = short && short || false
    const notfull = 'number' in ensemble && 'available' in ensemble && (ensemble.available as number) < (ensemble.number as number)
    return(
        <span data-notfull={`${notfull}`}
                className={twMerge(className, 'data-[notfull=true]:text-red-600')}>
                     {ensemble.name}{`${short?'':' Ensemble'}`}{notfull?<span> ({ensemble.available} of {ensemble.number})</span>:''}
                </span>
    )
}