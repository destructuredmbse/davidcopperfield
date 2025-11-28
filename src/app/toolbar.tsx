import { Toolbar } from "@base-ui-components/react/toolbar";
import { Tooltip } from "@base-ui-components/react/tooltip";
import { ArrowSvg } from "./components/icons";
import { useUserAccess } from "@/contexts/UserAccessContext";
import { useSession } from "next-auth/react";
import SignInSignOut from "./signinsignout";
import Selector from "./selector";
import { useState } from "react";

export default function DavidToolbar(){
    const [selected, setSelected] = useState('')
      const { hasAnyRole, isLoading: accessLoading, rba, isAdmin, hasFirstName } = useUserAccess()
      const fn = hasFirstName()
  const { data: session, status } = useSession()



    return(
              <Toolbar.Root className="flex flex-row items-right gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5">
                {status === 'authenticated' && session?.user && <div className="flex flex-row">
                    <Selector isAdmin={isAdmin()} setSelected={setSelected}/>
                    <div className="p-2 text-xs text-red-800">{`${hasAnyRole([selected, 'full'])?'You can edit this page':'You can read this page'}`}</div>
                    <Tooltip.Root >
                      <Tooltip.Trigger className='text-xs text-red-800 font-semibold'>{fn}</Tooltip.Trigger>
                      <Tooltip.Portal>
                      <Tooltip.Positioner sideOffset={10}>
                        <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-xs text-red-800 shadow-lg shadow-gray-200 outline outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                          <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                            <ArrowSvg />
                          </Tooltip.Arrow>
                            {<div>{`${rba?`You can edit ${rba.join(', ')}`: 'You only have readonly access'}`}</div>}
                        </Tooltip.Popup>
                      </Tooltip.Positioner>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                </div>}
                <SignInSignOut session={session} className="p-2"/>
              </Toolbar.Root>              
    )
}