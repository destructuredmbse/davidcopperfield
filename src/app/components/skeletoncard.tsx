import { twMerge } from 'tailwind-merge'
import { CharacterLabel, EnsembleLabel, PersonLabel } from './labels'
import { actor, character} from './types'
import {Avatar} from '@base-ui-components/react/avatar'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { ensLabel } from './helpers';
import { colours } from './colours';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';

function SkeletonCard({className}: {className?: string}){
      
    return(
      <div className={twMerge(className, 'size-48 p-1 border rounded-lg shadow-xl bg-gray-100 relative')}>
        {/* Avatar positioned in top right */}
        <div className="absolute top-1 right-1 z-30 inline-flex size-16 items-center justify-center overflow-hidden rounded-full bg-gray-100 align-middle text-base font-medium text-black select-none">
          <Skeleton variant='circular' width={48} height={48}/>
        </div> 
        
        {/* Main content with margin to avoid avatar overlap */}
        <div className="pt-8 pr-18">
          <h3 className="text-sm font-semibold text-red-800 text-wrap"><Skeleton /></h3>
          <Skeleton variant='rounded' />
        </div>
      </div>
    )
  }

export default React.memo(SkeletonCard)