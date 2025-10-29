import { signIn, signOut, useSession } from "next-auth/react";
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Tooltip } from "@base-ui-components/react/tooltip";
import { ArrowSvg } from "./components/icons";
import { Session } from "next-auth";
import { useUserAccess } from "../contexts/UserAccessContext";


export default function Sidebar(){
  const { data: session, status } = useSession()
    const { isAdmin } = useUserAccess();
  
    return(
      <div className="flex flex-row pl-8 pr-2 w-1/6">
        <SignButtons session={session} className=" p-2 "/>
        {session &&
        <div>
          <h3><a href='/acts'>Acts</a></h3>
          <h3><a href="/rehearsals">Rehearsals</a></h3>
          <h3><a href="/characters">Characters</a></h3>
          <h3><a href="/ensembles">Ensembles</a></h3>
          <h3><a href="/cast">Cast</a></h3>
          <h3><a href="/availability">Cast Availability</a></h3>
          {isAdmin() && <h3 className="text-red-700"><a href="/admin">User Admin</a></h3>}
      </div>}
      </div>
    )
  }

  function SignButtons({session, className} : {session: Session | null, className?:string}){
    return (

     <Tooltip.Provider>
      <div className={className}>
        {!session && <Tooltip.Root>
          <Tooltip.Trigger 
            onClick={() => signIn()}
            className="flex size-8 items-center justify-center rounded-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[popup-open]:bg-gray-100 focus-visible:[&:not(:hover)]:bg-transparent">
            <LoginOutlinedIcon aria-label="Bold" className="size-4" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={10}>
              <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-sm shadow-lg shadow-gray-200 outline outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                  <ArrowSvg />
                </Tooltip.Arrow>
                Log in
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>}

        {session && <Tooltip.Root>
          <Tooltip.Trigger 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex size-8 items-center justify-center rounded-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[popup-open]:bg-gray-100 focus-visible:[&:not(:hover)]:bg-transparent">
            <LogoutOutlinedIcon aria-label="Italic" className="size-4" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={10}>
              <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-sm shadow-lg shadow-gray-200 outline outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                  <ArrowSvg />
                </Tooltip.Arrow>
                Log out
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>}

      </div>
    </Tooltip.Provider>
    )}