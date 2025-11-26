'use client';

import React, { useState, useEffect, useMemo } from 'react';
import StaffCardForm from './staffcardform';
import StaffCard from './staffcard';
import { person, user } from './types';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useMutation, useQueryClient, UseMutationResult, UseMutateFunction } from '@tanstack/react-query';
import { Popover } from '@base-ui-components/react/popover';
import { performUpdate } from '../database/queries';;
import { Dialog } from '@base-ui-components/react/dialog';
import { ArrowSvg, BellIcon } from './icons';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { AlertDialog } from '@base-ui-components/react/alert-dialog';
import { hashPassword } from '../utils/passwordHash';


interface StaffManagerProps {
  existingStaff?: user ;
}

const updateUserQ = (user:user) => `
update person filter .id = <uuid>"${user.id}"
set{
    first_name := <str>"${user.first_name}",
    ${'last_name' in user?`last_name := <str>"${user.last_name}",`:''}
    ${'_role' in user?`_role := <str>"${user._role}",`:''}
    ${'photo' in user?`photo := <str>"${user.photo}",`:''}
    ${'email' in user?`email := <str>"${user.email}",`:''}
    ${'username' in user?`username := <str>"${user.username}",`:`username := <str>{},`}
    ${user.is_admin?`is_admin := <bool>${user.is_admin},`:`is_admin := <bool>false,`}
    ${user.rba?`rba := {${user.rba.map(r => `<rba>"${r}"`).join(', ')}},`:`rba := {},`}
    ${'first_logon' in user?`first_logon := <bool>${user.first_logon}`:`first_logon := <bool>true`}
}
`

const insertUserQ = (user:user, pwHash:string) => `
insert person
{
    first_name := <str>"${user.first_name}",
    ${user.last_name?`last_name := <str>"${user.last_name}",`:''}
    ${user._role?`_role := <str>"${user._role}",`:''}
    ${'photo' in user?`photo := <str>"${user.photo}",`:''}
    ${user.email?`email := <str>"${user.email}",`:''}
    ${user.username?`username := <str>"${user.username}",`:''}
    ${user.is_admin?`is_admin := <bool>${user.is_admin},`:''}
    ${user.rba?`rba := {${user.rba.map(r => `<rba>"${r}"`).join(', ')}},`:''}
    first_logon := <bool>true,
    pwHash := <str>"${pwHash}"

}
`

const deleteUserQ = (id:string) => `
delete person filter .id = <uuid>"${id}"
`


export default function StaffManager({ existingStaff }: StaffManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<user | undefined>(existingStaff);
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false);
  const queryClient = useQueryClient()


  // Sync currentStaff with existingStaff prop changes
  useEffect(() => {
    setCurrentStaff(existingStaff);
  }, [existingStaff]);

    const userMutation = useMutation({
        mutationFn: (query:string) => {return performUpdate(query)},
        onSuccess: async () => {
            await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['users'] }),
            ])
            setIsFormOpen(false);
        },
        onError: (error) => {
            console.error('Failed to insert or update user:', error)
            alert('Error saving staff member. Please try again.');
        }
    })

  const handleCreate = () => {
    setCurrentStaff(undefined);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleDelete = (open:boolean, details:AlertDialog.Root.ChangeEventDetails) => {
    console.log('delete', open)
    setDialogOpen(open)
  }

  const handleEdit = (open:boolean, details:Dialog.Root.ChangeEventDetails) => {
    console.log('edit', open)
    setIsEditMode(open);
    setIsFormOpen(open);
  };

  const handleSave = async (data: user) => {
    try {
      console.log('Saving staff data:', data);
      data = {...data, 
        rba : data.rba && data.rba.includes('full') ? ['full'] : data.rba }
      
      // For demo purposes, just update local state
      if (isEditMode && currentStaff) {
        console.log(updateUserQ(data))
        userMutation.mutate(updateUserQ(data))
      } else {
        // Generate hash for default password 'copperfield' for new users
        const pwHash = await hashPassword('copperfield')
        
        console.log(insertUserQ(data, pwHash))
        userMutation.mutate(insertUserQ(data, pwHash))
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Error saving staff member. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };
 
  return (
        <Dialog.Root open={isFormOpen || false} onOpenChange={setIsFormOpen}>
            <div className="space-y-4">
            <div className="flex items-center space-x-4">
                {!currentStaff && (
                    <div className="size-48 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Dialog.Trigger onClick={handleCreate}>
                                <AddIcon sx={{ fontSize: 32 }} className="mx-auto mb-2" />
                            </Dialog.Trigger>
                        <p className="text-xs">"Add New Staff"</p>
                        </div>
                    </div>)}
                {currentStaff && (
                    <div className="relative">
                        <div className="absolute bottom-0.5 z-30 left-0.5 flex items-center content-center justify-between">
                            <Dialog.Trigger
                                onClick={() => {
                                  setIsEditMode(true);
                                  setIsFormOpen(true);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                            >
                                <EditIcon sx={{ fontSize: 12 }} />
                                <span>Edit</span>
                            </Dialog.Trigger>
                            <DeleteStaff id={currentStaff.id as string}
                                    dialogOpen={dialogOpen}
                                    setDialogOpen={setDialogOpen}
                                    setIsFormOpen={setIsFormOpen}
                                    mutate={userMutation.mutate}
                                    />
                        </div>
                        <StaffCard staff={currentStaff} />
                    </div>
                )}
            </div>
        </div>


  
        <Dialog.Portal>
                {!dialogOpen && <Dialog.Popup className="fixed top-1/2 left-1/2 z-40 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
                    <div className="flex flex-wrap gap-4">
                        {/* Show form when open */}
                        { (
                                <div className="relative">
                                <StaffCardForm
                                    staff={isEditMode ? currentStaff : undefined}
                                    isEditMode={isEditMode}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    />
                                <HelpPopover />
                            </div>
                        )}
                    </div>
                </Dialog.Popup>}
            </Dialog.Portal>
        </Dialog.Root>        

    )
}

function DeleteStaff({ id, dialogOpen, setDialogOpen, setIsFormOpen, mutate } : 
    {id:string, 
        dialogOpen: boolean, 
        setDialogOpen:(dialogOpen:boolean) => void, 
        setIsFormOpen:(isFormOpen:boolean) => void
        mutate:(query: string) => void
    } ){

    return(
    <AlertDialog.Root open={dialogOpen || false} onOpenChange={setDialogOpen}>
        <AlertDialog.Trigger
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
        >
            <PersonRemoveIcon sx={{ fontSize: 12 }} />
            <span>Delete</span>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
            {/* <AlertDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" /> */}
            {<AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-64 z-50 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-4 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
            <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                Delete user?
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-2 text-sm text-gray-600">
                You can’t undo this action.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
                <AlertDialog.Close 
                    className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100"
                    onClick={() => setIsFormOpen(false)}>
                Cancel
                </AlertDialog.Close>
                <AlertDialog.Close
                    onClick={() => {console.log(`${deleteUserQ(id)}`);
                                    mutate(deleteUserQ(id))
                                    setIsFormOpen(false)
                                }}                
                    className="flex h-6 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-sm font-medium text-red-800 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                Delete
                </AlertDialog.Close>
            </div>
            </AlertDialog.Popup>}
        </AlertDialog.Portal>
    </AlertDialog.Root>

    )
}

export function HelpPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger className="absolute top-2 left-2 z-30 flex size-2 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 data-[popup-open]:bg-gray-100">
        <HelpOutlineOutlinedIcon fontSize='small' aria-label="help" className='text-red-700'/>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className='z-50'>
          <Popover.Popup className="origin-[var(--transform-origin)] rounded-lg bg-[canvas] px-6 py-4 z-50 text-gray-900 shadow-lg shadow-gray-200 outline outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
              <ArrowSvg />
            </Popover.Arrow>
            <Popover.Title className="text-base font-medium">Usage instructions</Popover.Title>
            <Popover.Description className="text-base text-gray-600" render={
                <ul className="text-xs text-blue-700 space-y-1 list-disc">
                    <li><strong>Create Person:</strong> Turn off "System User" toggle to create a basic person record</li>
                    <li><strong>Role</strong>Select the role of the person - one of 'creative', 'assistant', 'volunteer', 'student' or 'bsl interpreter'.</li>
                    <li><strong>Create User:</strong> Turn on "System User" toggle to create a user account with login access</li>
                    <li><strong>Edit Restrictions:</strong> Once a person is created, their names cannot be edited</li>
                    <li><strong>Access:</strong> Select access roles for system users (rehearsals, cast, admin, full)</li>
                    <li><strong>Admin:</strong> Check "System Admin" for administrative privileges</li>
                    <li>A initial password, <strong>copperfield</strong>, is generated for a system user - they will have to change this when the first logon.</li>
                </ul>}>
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}


