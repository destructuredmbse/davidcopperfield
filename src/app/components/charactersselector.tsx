import { Fieldset } from "@base-ui-components/react/fieldset";
import { actor, character, ensemble, scene, person, equipment } from "./types";
import React, { useMemo } from "react";
import { CheckboxGroup } from "@base-ui-components/react/checkbox-group";
import { Checkbox } from "@base-ui-components/react/checkbox";
import { Field } from "@base-ui-components/react/field";
import { CheckIcon, HorizontalRuleIcon } from "./icons";
import { charLabel, ensLabel } from "./helpers";
import { useQuery } from "@tanstack/react-query";
import { getSceneAvailability } from "../database/queries";
import { twMerge } from 'tailwind-merge'
import { equal } from "assert";
import { CharacterLabel, EnsembleLabel } from "./labels";

export default function CharactersSelector({sceneName, date, called, setScene, setCalled, setSelectedEnsemble} 
  : {sceneName: string | undefined, 
    date?:string | undefined,
    called?:(character|ensemble)[],
    setScene: React.Dispatch<React.SetStateAction<scene|undefined>>,
    setCalled: React.Dispatch<React.SetStateAction<character[]>>,
    setSelectedEnsemble: React.Dispatch<React.SetStateAction<ensemble|undefined>>}) {
       const {data: scene, isLoading: sceneLoading} = useQuery({ queryKey: [`${sceneName}`, date], 
          queryFn: () => getSceneAvailability(sceneName, date as string) })
       
      if(sceneLoading)return(<p className="text-xs text-red-600">Collecting scene data</p>)
      if(!sceneLoading && scene){

        setScene(scene) // this causes a rerendering of parent warning ... ought to get the scene in the parent ...

        const characters = scene?scene.ensemble?[...scene.characters, scene.ensemble]:scene.characters:[]

        const update = (value:string[]) => {
            const select = characters.filter(c => value.includes(c.id as string))
            console.log(`characters selected: ${select.map(s => s.name).join(', ')}`)
            setCalled(select.filter((c) => 'played_by' in c) as character[])
            const selectedEnsemble = select.find((e) => !('played_by' in e)) as ensemble | undefined;
            if(selectedEnsemble) setSelectedEnsemble(selectedEnsemble);
            }

            console.log(`called ${called?.filter(c => c != null).map(c => c.name || 'unknown').join(', ')}`)
  
      return (
        <div>
          <Fieldset.Legend className={`font-semibold text-xs`}>Characters to call</Fieldset.Legend>
          <CheckboxGroup
            aria-labelledby="characters-caption"
            value={characters.filter(c => c && called?.some(s => c && s.id === c.id)).map(f => f && f.id as string)}
            onValueChange={update}
            allValues={characters.map((c:character|ensemble) => c.id as string)}
            className={`flex flex-col items-start gap-1 text-gray-900 font -ml-px`}
          >
            <label className={`flex items-center gap-2 text-xs text-gray-900`} id="characters-caption">
              <Checkbox.Root className={`flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[unchecked]:border data-[indeterminate]:border-gray-300 data-[unchecked]:border-gray-300`} 
                name='called' parent>
                <Checkbox.Indicator
                  className={`flex text-gray-50 data-[unchecked]:hidden data-[checked]border-gray-900 data-[indeterminate]border-gray-900`}
                  render={(props: any, state: any) => (
                    <span {...props}>
                      {state.indeterminate ? (
                        <HorizontalRuleIcon className={`size-2`} />
                      ) : (
                        <CheckIcon className={`size-2`} />
                      )}
                    </span>
                  )}
                />
              </Checkbox.Root>
              All
            </label>
          {characters.map((c, i) =>
          <Field.Label key={i} className={`flex items-center gap-2 text-xs text-gray-900`}>
              <Checkbox.Root 
                value={c.id} className={`flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300`}>
                <Checkbox.Indicator className={`flex text-gray-50 data-[unchecked]:hidden data-[checked]border-gray-900`}>
                  <CheckIcon className={`size-2`} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              {c && 'played_by' in c?<CharacterLabel character={c} />:<EnsembleLabel ensemble={(c as ensemble)} />}
            </Field.Label>)
          }
          </CheckboxGroup>
        </div>
      );
  }
}

