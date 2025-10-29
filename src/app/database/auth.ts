'use server'
import {createClient} from "gel"

interface user {
    username: string,
    first_name: string,
    last_name?:string,
    rba:string[]
    uuid:string
    first_logon: boolean
}

const userQ = `
select default::person {
  last_name,
  first_name,
  _role,
  id,
  is_admin,
  rba,
  username,
  first_logon,
}
filter .username = <str>$username and .pwHash = <str>$pwHash
`

export async function getUser(username:string, pwHash:string):Promise<user|null> {
  const client = createClient()
  if(!client) return null
  if(!username || !pwHash)  return null
  try{
    const usr = await client.query<user>(userQ, {username: username, pwHash: pwHash})
    return usr.length === 1?usr[0]:null
 }
  catch (e)
  { console.log(`database error ${e}`); return null}
}