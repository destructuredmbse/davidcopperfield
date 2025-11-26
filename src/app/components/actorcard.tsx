import { twMerge } from 'tailwind-merge'
import { CharacterLabel, EnsembleLabel, PersonLabel } from './labels'
import { actor, character} from './types'
import SafeAvatar from './safeavatar'
import { ensLabel } from './helpers';
import { colours } from './colours';
import React, { useState } from 'react';




function ActorCard({actor,  className}: {actor?:actor, className?: string}){
  const [dialogOpen, setDialogOpen] = useState(false)
      
    return(
      <div>
      <div className={twMerge(className, 'size-48 p-1 border rounded-lg shadow-xl bg-gray-100 relative')}>
        {/* Avatar positioned in top right */}
        
          <div className='absolute top-2 right-2'>
            {actor && (
              <SafeAvatar 
                src={`/images/cast/${actor.photo}`}
                alt={`${actor.first_name} ${actor.last_name}`}
              />
            )}
          </div>
        
        
        {/* Main content with margin to avoid avatar overlap */}
        <div className="pt-6 pr-18">
          <h3 className="text-sm font-semibold text-red-800 text-wrap"><PersonLabel person={actor} className='text-gray-500'/></h3>
          {actor && actor.percentage &&
              <p className='text-xs text-gray-500'>{`Availability ${actor.percentage}`}</p>
            }
          {actor && actor.parent &&
               <p className='text-xs text-red-600'><span>Parent </span>
              <PersonLabel person={actor.parent} className='text-xs text-gray-500'/></p>
            }
          {actor && actor.plays && actor.plays.length > 0 &&
            <div>
              <p className='text-xs font-semibold text-red-600'>Plays</p>
              <ul>
                {actor.plays.map((c, i) => <li key={i} className='text-xs text-gray-500'>{c.name}</li>)}
              </ul>
              </div>
            }
          {actor && actor.ensemble && actor.ensemble.length > 0 &&
              <p>
                {actor.ensemble.map((e, i) => <span key={i} className={`text-xs ${colours(e.name).text}`}>{ensLabel(e)}</span>)}
              </p>
      
            }
          {actor && actor.featured_in && actor.featured_in.length > 0 &&
              <p>
                <span className='text-xs'>Features in </span>
                {actor.featured_in.map((e, i) => <span key={i} className={`text-xs ${colours(e.name).text}`}>{ensLabel(e)}</span>)}
              </p>
            }

        </div>
        </div>
      </div>
    )
  }



  const actorKey = (actor:actor) => `${actor.first_name.trim().toLowerCase().replaceAll(' ', '_')}_${actor.last_name.trim().toLowerCase().replaceAll(' ', '_')}`;

export default React.memo(ActorCard)