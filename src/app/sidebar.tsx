import { signIn, signOut, useSession } from "next-auth/react";
import { Tooltip } from "@base-ui-components/react/tooltip";
import { ArrowSvg } from "./components/icons";
import { Session } from "next-auth";
import { useUserAccess } from "../contexts/UserAccessContext";
import SignInSignOut from "./signinsignout";
import Link from "next/link";


export default function Sidebar(){
  const { data: session, status } = useSession()
    const { isAdmin } = useUserAccess();
  
    return(
      <div className="flex flex-row pl-8 pr-2 w-1/6">
        <SignInSignOut session={session} className=" p-2 "/>
        {session &&
        <div>
          <h3><Link href='/acts'>Acts</Link></h3>
          <h3><Link href="/rehearsals">Rehearsals</Link></h3>
          <h3><Link href="/characters">Characters</Link></h3>
          <h3><Link href="/ensembles">Ensembles</Link></h3>
          <h3><Link href="/cast">Cast</Link></h3>
          <h3><Link href="/availability">Cast Availability</Link></h3>
          {isAdmin() && <h3 className="text-red-700"><Link href="/admin">User Admin</Link></h3>}
      </div>}
      </div>
    )
  }

  