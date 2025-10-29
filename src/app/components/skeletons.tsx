import Skeleton from "@mui/material/Skeleton"
import { twMerge } from "tailwind-merge"

const CARD_CLASSNAME = 'overflow-auto whitespace-nowrap'; 

  export default function Skeletons(){

      return (
              <div className="flex-1 overflow-y-auto max-h-full">      
        <div className='w-9/10 h-dvh flex flex-wrap flew-row columns-xs gap-4'>
            <SkeletonCard key={1} className={CARD_CLASSNAME}/>
            <SkeletonCard key={2} className={CARD_CLASSNAME}/>
            <SkeletonCard key={3} className={CARD_CLASSNAME}/>
            <SkeletonCard key={4} className={CARD_CLASSNAME}/>
            <SkeletonCard key={5} className={CARD_CLASSNAME}/>
            <SkeletonCard key={6} className={CARD_CLASSNAME}/>
            <SkeletonCard key={7} className={CARD_CLASSNAME}/>
            <SkeletonCard key={8} className={CARD_CLASSNAME}/>
            <SkeletonCard key={9} className={CARD_CLASSNAME}/>
            <SkeletonCard key={10} className={CARD_CLASSNAME}/>
        </div>
      </div>

      )
    }

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