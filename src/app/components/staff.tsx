import { Accordion } from '@base-ui-components/react/accordion';
import { Tabs } from '@base-ui-components/react/tabs';
import { getStaff, getActs, getCharacters  } from "../database/queries";
import { actor, scene, scene_status, character, section, ensemble, user, person } from "./types";
import { colours } from "./colours";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import CharacterCard from './charactercard';
import Skeleton from '@mui/material/Skeleton';
import StaffCard from './staffcard';
import { Input } from '@base-ui-components/react/input';
import { useState, useMemo, useCallback } from 'react';
import Skeletons from './skeletons';
import StaffManager from './staffmanager';
import ImageUpload from './imageupload';

// Move filter function outside component to prevent recreation
const filter_criteria = (a:user, f:string) =>
    (`${a.first_name} ${a.last_name}`.toLowerCase().includes(f) ||
        a._role && a._role.toLowerCase().includes(f)) ||
          'rba' in a && a.rba && a.rba.some((e) => e.toLowerCase().includes(f))

// Stable className constant
const CARD_CLASSNAME = 'overflow-auto whitespace-nowrap';

export function Staff(){
  const [filter, setFilter] = useState('')
  const [activeTab, setActiveTab] = useState('staff')

  const {data: staff, isLoading} = useQuery({ queryKey: [`users`], queryFn: () => getStaff() })
  
  // Memoize filtered actors to prevent recalculation on every render
  const filteredStaff = useMemo(() => {
    if (isLoading || !staff || !filter) return staff || [];
    return staff.filter((u:user) => filter_criteria(u, filter));
  }, [staff, filter, isLoading]);
  
  // Memoize filter change handler
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value.toLowerCase());
  }, []);
  
  return(
    <div className="flex flex-col h-screen">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'staff'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Staff Management
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upload Images
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'staff' && (
        <>
          <div className='pb-4 w-full relative'>
            <p className='pr-2'>Filter</p>
                <Input
                  placeholder="filter"
                  className="h-6 w-full max-w-64 rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-100"
                  onValueChange={handleFilterChange}
                />
          </div>
          <div className="flex-1 overflow-y-auto max-h-full">
            <div className='w-9/10 h-dvh flex flex-wrap flew-row columns-xs gap-4'>
              {isLoading ? <Skeletons /> :
                filteredStaff.length > 0 ? 
                  filteredStaff.map((u:user) => (
                    <StaffManager 
                      key={u.id} 
                      existingStaff={u} 
                      //className={CARD_CLASSNAME}
                    />
                  )) :''}
                  {!isLoading && <StaffManager key='create_new_user' />}
              </div>
            </div>
        </>
      )}

      {activeTab === 'upload' && (
        <div className="flex-1 overflow-y-auto">
          <ImageUpload 
            uploadType="staff"
            onUploadComplete={(filename: string) => {
              console.log('Image uploaded:', filename)
              // Optionally switch back to staff tab after successful upload
              // setActiveTab('staff')
            }}
          />
        </div>
      )}
    </div>
  )
}


