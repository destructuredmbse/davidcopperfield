import { Tooltip } from "@base-ui-components/react/tooltip";
import { ArrowSvg } from "./components/icons";
import { signOutAction } from "./actions/auth";
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Session } from "next-auth";
import Link from "next/link";

export default function SignInSignOut({session, className} : {session: Session | null, className?:string}){
    return (

     <Tooltip.Provider>
      <div className={className}>
        {(!session || !session.user) && <Tooltip.Root>
          <Link href="/auth/signin">
            <Tooltip.Trigger 
              className="flex size-4 items-center justify-center rounded-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[popup-open]:bg-gray-100 focus-visible:[&:not(:hover)]:bg-transparent">
              <LoginOutlinedIcon aria-label="Bold" className="size-2 text-red-800" />
            </Tooltip.Trigger>
          </Link>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={10}>
              <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-xs text-red-800 shadow-lg shadow-gray-200 outline  outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                  <ArrowSvg />
                </Tooltip.Arrow>
                Log in
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>}

        {session && session.user && <Tooltip.Root>
          <form action={signOutAction}>
            <Tooltip.Trigger 
              type="submit"
              className="flex size-4 items-center justify-center rounded-sm text-gray-900 select-none hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-200 data-[popup-open]:bg-gray-100 focus-visible:[&:not(:hover)]:bg-transparent">
            <LogoutOutlinedIcon aria-label="Italic" className="size-2 text-red-800" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={10}>
              <Tooltip.Popup className="flex origin-[var(--transform-origin)] flex-col rounded-md bg-[canvas] px-2 py-1 text-xs text-red-800 shadow-lg shadow-gray-200 outline  outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
                <Tooltip.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                  <ArrowSvg />
                </Tooltip.Arrow>
                Log out
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
          </form>
        </Tooltip.Root>}

      </div>
    </Tooltip.Provider>
    )}