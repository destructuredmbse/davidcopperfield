import { character, equipment, person, location, ensemble } from "./types"

  export const charLabel = (char:character) => `${char.name} (${char.played_by.map((p) => `${p.first_name} ${p.last_name}`).join(', ')})`
  export const ensLabel = (ens:ensemble) => `${ens.name} Ensemble`
  export const personLabel = (p:person) => `${p.first_name}${p.last_name?` ${p.last_name}`:''}`
  export const equipmentLabel = (e:equipment) => `${e.name} (${e.type})${!(e.status === null || e.status === 'working')?` (${e.status})`:''}`
  export const locationLabel = (l:location) => `${l.name}`