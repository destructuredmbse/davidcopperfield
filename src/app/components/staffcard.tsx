import { twMerge } from 'tailwind-merge'
import { CharacterLabel, EnsembleLabel, PersonLabel } from './labels'
import { person, user } from './types'
import SafeAvatar from './SafeAvatar'
import React, { useState } from 'react';

const actorKey = (actor:person) => `${actor.first_name.trim().toLowerCase().replaceAll(' ', '_')}_${actor.last_name && actor.last_name.trim().toLowerCase().replaceAll(' ', '_')}`;


export default function StaffCard({staff, className}: {staff?:user, className?: string}){
    const isSystemuser = staff && 'username' in staff && staff.username
    return(
      <div className={twMerge(className, 'size-48 p-1 border rounded-lg shadow-xl bg-gray-100 relative')}>
        <div className='absolute top-2 right-2'>
          {staff && (
            <SafeAvatar 
              src={`/images/staff/${actorKey(staff)}.png`}
              alt={`${staff.first_name} ${staff.last_name || ''}`}
            />
          )}
        </div>
        
        {/* Main content with margin to avoid avatar overlap */}
        {staff && <div className="pt-8 pr-18">
          <h3 className="text-sm font-semibold text-red-800 text-wrap pb-2"><PersonLabel person={staff} className='text-gray-500'/></h3>
          {isSystemuser && <div className='text-nowrap'>
            {'username' in staff && staff.username && <p className='text-xs'><span className='capitalize'>{staff.first_name}</span> is a system staff</p>}
            {'is_admin' in staff && staff.is_admin && <p className='text-xs text-red-700'><span className='capitalize'>{staff.first_name}</span> is a system admin</p>}
            {staff.first_logon && <p className='text-xs text-red-700'><span className='capitalize'>{staff.first_name}</span> hasn't logged in yet!</p>}
            {staff.username &&
                <p className='text-xs text-gray-500'><span className='font-semibold'>Username </span>{`${staff.username}`}</p>
              }
            {staff.rba && staff.rba.length > 0 &&
                <p className='text-xs text-gray-500'><span className='font-semibold '>Access </span>
                  {staff.rba.map((r:string, i:number) => <span key={i} ><span className='text-xs text-gray-500'>{r}</span>{`${i + 1 < (staff.rba?.length || 0)?', ':''}`}</span>)}
                </p>
              }
            {staff.email &&
                <p className='text-xs text-gray-500'><span className='font-semibold'>Email </span>{`${staff.email}`}</p>
              }
           </div>}
        </div>}
      </div>
    )
  }


