import { Fieldset } from "@base-ui-components/react/fieldset";
import { actor, character, ensemble, scene, person, equipment } from "./types";
import React, { useMemo } from "react";
import { CheckboxGroup } from "@base-ui-components/react/checkbox-group";
import { Checkbox } from "@base-ui-components/react/checkbox";
import { Field } from "@base-ui-components/react/field";
import { CheckIcon, HorizontalRuleIcon } from "./icons";
import { charLabel, ensLabel } from "./helpers";
import { useQuery } from "@tanstack/react-query";
import { getScenesAvailability } from "../database/queries";
import { twMerge } from 'tailwind-merge'
import { equal } from "assert";
import { CharacterLabel, EnsembleLabel } from "./labels";

export default function CharactersSelector({scenes, date, called, setCalled, setSelectedEnsembles} 
  : {scenes: scene[] | undefined, 
    date?:string | undefined,
    called?:(character|ensemble)[],
    setCalled: React.Dispatch<React.SetStateAction<character[]>>,
    setSelectedEnsembles: React.Dispatch<React.SetStateAction<ensemble[]>>}) {

      const sceneNames = scenes?.map(s => s.name) || []
       const {data: characters, isLoading: sceneLoading} = useQuery({ queryKey: [`${sceneNames}`, date], 
          queryFn: () => getScenesAvailability(sceneNames, date as string) })
       
      if(sceneLoading)return(<p className="text-xs text-red-600">Collecting scene data</p>)
      if(!sceneLoading && characters){


        const update = (value:string[]) => {
            const select = characters.filter(c => value.includes(c.id as string))
            console.log(`characters selected: ${select.map(s => s.name).join(', ')}`)
            setCalled(select.filter((c) => 'played_by' in c) as character[])
            const selectedEnsembles = select.filter((e) => !('played_by' in e)) as ensemble[];
            if(selectedEnsembles) setSelectedEnsembles(selectedEnsembles);
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
                value={c.id} className={`flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300`}>
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

