import { Checkbox } from "@base-ui-components/react/checkbox";
import { CheckboxGroup } from "@base-ui-components/react/checkbox-group";
import { Fieldset } from "@base-ui-components/react/fieldset";
import { CheckIcon, HorizontalRuleIcon } from "./icons";
import { Field } from "@base-ui-components/react/field";
import { equipmentLabel, personLabel } from "./helpers";
import React from "react";
import { equipment } from "./types";
import { EquipmentLabel } from "./labels";

export default function EquipmentSelector({selected, equipment, setSelectedEquipment} : {selected?:equipment[], equipment: equipment[], setSelectedEquipment: React.Dispatch<React.SetStateAction<equipment[]>>}) {
  const [select, setSelect] = React.useState<equipment[]>(selected || []);

    const update = (value:string[]) => {
      setSelect(equipment.filter(e => value.some(v => v === e.id)))
      setSelectedEquipment(equipment.filter(e => value.some(v => v === e.id)));
    }
  
  return (
    <div>
      <Fieldset.Legend className={`font-semibold text-xs`}>{`equipment`}</Fieldset.Legend>
      <CheckboxGroup
        aria-labelledby={`equipment-caption`}
        value={select.map(s => s.id as string)}
        onValueChange={update}
        allValues={equipment.map(e => e.id as string)}
        className={`flex flex-col items-start gap-1 text-gray-900 font -ml-px`}
        >
        <label className={`flex items-center gap-2 text-xs text-gray-900`} id={`equipment-caption`}>
          <Checkbox.Root className={`flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[unchecked]:border data-[indeterminate]:border-gray-300 data-[unchecked]:border-gray-300`} 
            name='euipment' parent>
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
      {equipment.map((e, i) =>
      <Field.Label key={i} className={`flex items-center gap-2 text-xs text-gray-900`}>
          <Checkbox.Root value={e.id} className={`flex size-3 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-[checked]:bg-gray-900 data-[unchecked]:border data-[unchecked]:border-gray-300`}>
            <Checkbox.Indicator className={`flex text-gray-50 data-[unchecked]:hidden data-[checked]border-gray-900`}>
              <CheckIcon className={`size-2`} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <EquipmentLabel equipment={e}/>
        </Field.Label>)
      }
      </CheckboxGroup>
    </div>
  );
}

