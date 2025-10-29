import { useCallback, useState } from "react";
import { actor, character, ensemble } from "./types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { performUpdate } from "../database/queries";
import { updateCharacterQ } from '../database/updatecharacterquery';
import ChangeActorCard from './changeactorcard'
import React from "react";
import { updateEnsembleQ } from "../database/updateensemblequery";



function ChangeCard({character, ensemble, featured, setOpen} : {character?:character, ensemble?:ensemble, featured?:boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>}){
  const [actors, setActors] = useState<actor[]>(character?character.played_by:[])
  const [actorUpdate, setActorUpdate] = useState<{ actor: string, ensemble: Array<string>, roles: Array<string> }>({ actor: '', ensemble: [], roles: [] })
  const [actorIndex, setActorIndex] = useState<number>(0)
  const [action, setAction] = useState<string>('unchanged')
  const [selectedActor, setSelectedActor] = useState<actor | null>(null);
    const queryClient = useQueryClient()

    const updateMutation = useMutation({
        mutationFn: (updateQ:string) => {return performUpdate(updateQ)},
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['characters'] }),
            queryClient.invalidateQueries({ queryKey: ['ensembles'] }),
            queryClient.invalidateQueries({ queryKey: ['availability'] }),
          ])
        },
    })



  console.log(`character ${JSON.stringify(character)}\n actor index ${actorIndex}`)

    const saveData = useCallback((newActors:actor[], actorUpdate: { actor: string, ensembles: Array<string>, roles: Array<string> }) => {
    // Save the updated actors and actorUpdate to the server or state management
    console.log('Saving data:', { newActors, actorUpdate });
    setOpen(false);
    if(character){
        console.log(`update query ${updateCharacterQ(character.id as string, newActors.map(a => a.id as string), actorUpdate)}`);
        updateMutation.mutate(updateCharacterQ(character.id as string, newActors.map(a => a.id as string), actorUpdate));
    }
    if(ensemble){
        console.log(`update query/n ${updateEnsembleQ(ensemble.id as string, newActors.map(a => a.id as string), featured || false, actorUpdate)}`);
        updateMutation.mutate(updateEnsembleQ(ensemble.id as string, newActors.map(a => a.id as string), featured || false, actorUpdate));
    }
  }, [setOpen]);


  const update = useCallback((a: actor, action:string, actorUpdate: {ensembles: Array<string>, roles: Array<string> }) => {
    // Update the state with the new values
      console.log(`selected actor ${JSON.stringify(selectedActor)} replacement actor ${JSON.stringify(a)} action ${action} actorUpdate ${JSON.stringify(actorUpdate)}`);
      let updatedActors = actors;
        if(a && action === 'replaced' && selectedActor)updatedActors = [...actors.filter((a) => a.id !== (selectedActor as actor).id), a];
        else if(action === 'removed' && selectedActor)updatedActors = actors.filter((a) => a.id !== (selectedActor as actor).id);
        else if(a && action === 'added')updatedActors = [...actors, a];
        else{
          console.log('No action taken');
      };

    saveData(updatedActors, {actor:action !== 'removed' ? a.id as string : '', ...actorUpdate});
  }, [selectedActor, saveData]);

  if(actors.length === 1 && selectedActor === null)setSelectedActor(actors[0])
    
    
  return(

      <div>
        {character && actors.length > 1 && !selectedActor && <SelectActor character={character} actors={actors} selectedActor={selectedActor} setSelectedActor={setSelectedActor} />}
        {(selectedActor || actors.length === 0) && <ChangeActorCard key={0} character={character} actor_name={selectedActor?.first_name || ''} update={update} />}
      </div>
    )

}

function SelectActor({character, actors, selectedActor, setSelectedActor} : {character: character, actors: actor[], selectedActor: actor | null, setSelectedActor: React.Dispatch<React.SetStateAction<actor | null>>}){

  return(
    <div>
      <p className='mb-2'>Select an actor to manage for the role of <span className='font-semibold'>{character.name}</span>:</p>  
      <p className='text-sm'>
        {actors.map((a, index) => (
          <span key={a.id} onClick={() => setSelectedActor(a)} className={`cursor-pointer p-1 ${selectedActor?.id === a.id ? 'bg-blue-500 text-white' : ''}`}>
            {`${a.first_name} ${a.last_name}${index < actors.length - 1 ? ', ' : '' }`}
          </span>
        ))}
      </p>
    </div>
  )
}

export default React.memo(ChangeCard)