export const updateEnsembleQ = (id:string, actors:string[],featured:boolean, actorUpdate:{actor:string, ensembles:string[], roles:string[]}) => {
console.log(`featured ${featured}`)
    let updateEnsemblesQ = '';
    let updateRolesQ = '';
    console.log('Saving data:', { actors, actorUpdate });
    if(actors[0].length === 0) {
        throw new Error('actor id cannot be empty');
    }
    if(actorUpdate.actor !== '') {
        if(actorUpdate.ensembles.length > 0) {
            updateEnsemblesQ = `
update ensemble filter .id in {${actorUpdate.ensembles.map((e) => `<uuid>'${e}'`).join(', ')}}
set {members -= (select actor filter .id = <uuid>'${actorUpdate.actor}')};
`
        }
        if(actorUpdate.roles.length > 0) {
                updateRolesQ = `
update character filter .id in {${actorUpdate.roles.map((r) => `<uuid>'${r}'`).join(', ')}}
set {played_by -= (select actor filter .id = <uuid>'${actorUpdate.actor}')};
`
        }
    }
return `update ensemble filter .id = <uuid>'${id}'
${featured?
  `set {featured += (select actor filter .id = <uuid>"${actors[0] as string}")};`:
  `set {members += (select actor filter .id = <uuid>"${actors[0] as string}")};`}
${updateEnsemblesQ}
${updateRolesQ}
`
}