import { Checkbox } from "@base-ui-components/react/checkbox"
import React, { useState } from "react"
import { CheckIcon } from "./icons"
import { actor, character } from "./types"
import ActorCard from './actorcard';
import { CheckboxGroup } from "@base-ui-components/react/checkbox-group";
import ChangeActor from './changeactor';


function ChangeActorCard({character, actor_name, update} : {character?:character, actor_name:string | undefined, update: (a: actor, status:string, actorUpdate: {ensembles: Array<string>, roles: Array<string> }) => void}){
  const [actor, setActor] = useState<actor>()
  const [action, setAction] = useState('unchanged')
  const [actorUpdate, setActorUpdate] = useState<{ ensembles: Array<string>, roles: Array<string> }>({ ensembles: [], roles: [] })
  if(!actor_name && action !== 'added')setAction('added')

  return(
    <div className='flex flex-row gap-4'>
      <ActorCard actor={actor} />
      <div>
        {character && actor_name && <CheckboxGroup
          aria-labelledby="manage-caption"
          defaultValue={['replaced']}
          className="flex flex-col items-end gap-1 text-gray-900"
        >
          <div className="font-medium flex flex-col content-end" id="manage-caption">
            <p className='text-nowrap'>How do you want to manage <span className='capitalize'>{`${actor_name}`}</span> in the role of <span>{`${character && character.name}`}</span>?</p>
          </div>
          <div className='flex flex-col gap-2 content-start'>
          <label className='flex flex-row text-sm text-nowrap content-center'>
              <span className='pr-2'>Replace <span className='capitalize'>{`${actor_name}`}</span> with another actor in this role.</span>
              <Checkbox.Root
                className="flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300"
                onCheckedChange={(checked:boolean) => { setAction(checked ? 'replaced' : 'unchanged')}}
                >
                <Checkbox.Indicator
                  className="flex text-gray-50 data-[unchecked]:hidden"
                  >
                  <CheckIcon className="size-2"/>
                  </Checkbox.Indicator>
              </Checkbox.Root>
            </label>       
            <label className='flex flex-row text-sm text-nowrap content-center'>
              <span className='pr-2'>Remove <span className='capitalize'>{`${actor_name}`}</span> from this role</span>
              <Checkbox.Root
                className="flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300"
                // defaultChecked
                onCheckedChange={(checked:boolean) => { setAction(checked ? 'removed' : 'unchanged')}}
                >
                <Checkbox.Indicator
                  className="flex text-gray-50 data-[unchecked]:hidden"
                  >
                  <CheckIcon className="size-2"/>
                  </Checkbox.Indicator>
              </Checkbox.Root>
            </label> 
            <label className='flex flex-row text-sm text-nowrap content-center'>
              <span className='pr-2'>Add an additional actor to play the role with <span className='capitalize'>{`${actor_name}`}</span></span>
              <Checkbox.Root
                className="flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300"
                // defaultChecked
                onCheckedChange={(checked:boolean) => { setAction(checked ? 'added' : 'unchanged')}}
                >
                <Checkbox.Indicator
                  className="flex text-gray-50 data-[unchecked]:hidden"
                  >
                  <CheckIcon className="size-2"/>
                  </Checkbox.Indicator>
              </Checkbox.Root>
            </label> 
          </div>
        </CheckboxGroup>}
      <div>
      {(action === 'replaced' || action === 'added') && 
      <div>
        <ChangeActor setActor={setActor} />
        {actor &&  <div>
          {actor.plays && actor.plays.length > 0 && actor.plays.map((p, index) => (
                <>
                <label key={index} className='flex flex-row text-sm text-nowrap'>
                  <span className='pr-2'>Remove <span className='capitalize'>{`${actor.first_name}`}</span> from the role of <span>{`${p.name}`}</span></span>
                  <Checkbox.Root
                    className="flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300"
                    onCheckedChange={(checked:boolean) => 
                      setActorUpdate(prev => {
                        if(checked) {
                          return {...prev, roles:[...prev.roles, p.id as string]};
                        } else {
                          return {...prev, roles:prev.roles.filter(id => id !== p.id as string)};
                        }
                    })
                    }>
                    <Checkbox.Indicator
                      className="flex text-gray-50 data-[unchecked]:hidden"
                    >
                      <CheckIcon className="size-2"/>
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </label><br /></>
                            ))}
          {actor && actor.ensemble && actor.ensemble.length > 0 && actor.ensemble.map((e, index) => (
                <label key={index} className='flex flex-row text-sm text-nowrap'>
                  <span>Remove <span className='capitalize'>{`${actor.first_name}`}</span> from <span>{`${e.name}`} Ensemble</span></span>
                  <Checkbox.Root
                    className="flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300"
                    onCheckedChange={(checked:boolean) => 
                      setActorUpdate(prev => {
                        if(checked) {
                          return {...prev, ensembles:[...prev.ensembles, e.id as string]};
                        } else {
                          return {...prev, ensembles:prev.ensembles.filter(id => id !== e.id as string)};
                        }
                    })}
                  >
                    <Checkbox.Indicator
                      className="flex text-gray-50 data-[unchecked]:hidden"
                    >
                      <CheckIcon className="size-2"/>
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </label>
              ))}
        </div>}
        </div>
        }
      </div>

      <button
        //disabled={loading}
        type="submit"
        className="absolute bottom-2 right-2 flex h-5 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        onClick={() => {
          console.log(`closing select actor - choosen new actor ${JSON.stringify(actor)}`)
          update(actor as actor, action, actorUpdate);
         
        }}
      >
        OK
      </button>
      </div>
      </div>
  )
}

export default React.memo(ChangeActorCard)