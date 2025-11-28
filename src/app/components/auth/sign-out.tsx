import { signOut } from "@/auth"
 
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        const redirectUrl = process.env.NODE_ENV === 'production' ? '/davidcopperfield' : '/'
        await signOut({ redirectTo: redirectUrl })
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  )
}