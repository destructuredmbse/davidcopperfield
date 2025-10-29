import { Checkbox } from "@base-ui-components/react/checkbox";
import { CheckboxGroup } from "@base-ui-components/react/checkbox-group";
import { Fieldset } from "@base-ui-components/react/fieldset";
import { CheckIcon, HorizontalRuleIcon } from "./icons";
import { Field } from "@base-ui-components/react/field";
import { personLabel } from "./helpers";
import React from "react";
import { person } from "./types";

export default function PeopleSelector({selected, people, role, teams} : {selected?:person[], people: person[], role:string, teams: React.Dispatch<React.SetStateAction<Map<string, person[]>>>}) {
  const [select, setSelect] = React.useState<person[]>(selected || []);
  const update = (value:string[]) => {
    setSelect(people.filter(p => value.includes(p.id as string)))
    teams(prev => {
      const newMap = new Map(prev);
      newMap.set(role, people.filter(p => value.includes(p.id as string)));
      return newMap;
    });
  }

  const team = people.filter((p) => p._role === role)
  return (
    <div>
      <Fieldset.Legend className={`font-semibold text-xs`}>{`${role}s`}</Fieldset.Legend>
      <CheckboxGroup
        aria-labelledby={`${role}-caption`}
        value={select.map(s => s.id as string)}
        onValueChange={update}
        allValues={team.map(t => t.id as string)}
        className={`flex flex-col items-start gap-1 text-gray-900 font -ml-px`}
        >
        <label className={`flex items-center gap-2 text-xs text-gray-900`} id={`${role}-caption`}>
          <Checkbox.Root className={`flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[unchecked]:border data-[indeterminate]:border-gray-300 data-[unchecked]:border-gray-300`} 
            name={role} parent>
            <Checkbox.Indicator
              className={`flex text-gray-50 data-[unchecked]:hidden data-[checked]border-gray-900 data-[indeterminate]border-gray-900`}
              render={(props:any, state:any) => (
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
      {team.map((p, i) =>
      <Field.Label key={i} className={`flex items-center gap-2 text-xs text-gray-900`}>
          <Checkbox.Root value={p.id} className={`flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300`}>
            <Checkbox.Indicator className={`flex text-gray-50 data-[unchecked]:hidden data-[checked]border-gray-900`}>
              <CheckIcon className={`size-2`} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          {personLabel(p)}
        </Field.Label>)
      }
      </CheckboxGroup>
    </div>
  );
}

