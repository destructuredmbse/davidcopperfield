export const updateCharacterQ = (id:string, played_by:string[],actorUpdate:{actor:string, ensembles:string[], roles:string[]}) => {
    let updateEnsemblesQ = '';
    let updateRolesQ = '';
    if(played_by.length === 0) {
        throw new Error('played_by array cannot be empty');
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
return `update character filter .id = <uuid>'${id}'
set { played_by := (select actor filter .id in {${played_by.map((p) => `<uuid>'${p}'`).join(', ')}}) };
${updateEnsemblesQ}
${updateRolesQ}
`
}