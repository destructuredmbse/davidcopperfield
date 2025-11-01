'use client';

import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { person, user } from './types';
import SafeAvatar from './safeavatar';
// Temporarily commenting out problematic imports to isolate the issue
// import { Field } from '@base-ui-components/react/field';
// import { Form } from '@base-ui-components/react/form';
import { Switch } from '@base-ui-components/react/switch';
import { Checkbox } from '@base-ui-components/react/checkbox';
// Using regular button elements since @base-ui-components/react/button may not be available
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface StaffCardFormProps {
  staff?: user ;
  isEditMode?: boolean;
  onSave: (data: user) => void;
  onCancel: () => void;
  className?: string;
}

// Available role options for users
const ROLE_OPTIONS = [
    'scenes',
    'rehearsals',
    'actors',
    'characters',
    'full',
    'readonly',
    
];

const actorKey = (actor: person) => 
  `${actor.first_name.trim().toLowerCase().replaceAll(' ', '_')}_${actor.last_name && actor.last_name.trim().toLowerCase().replaceAll(' ', '_')}`;

export default function StaffCardForm({ 
  staff, 
  isEditMode = false, 
  onSave, 
  onCancel, 
  className 
}: StaffCardFormProps) {
  const [isUserAccount, setIsUserAccount] = useState(
    staff ? 'username' in staff && staff.username !== null : false
  );
  const [formData, setFormData] = useState<user>({
    first_name: staff?.first_name || '',
    last_name: staff?.last_name || '',
    photo: staff?.photo || '',
    _role:staff?._role || '',
    username: (staff && 'username' in staff) ? staff.username : '',
    email: (staff && 'email' in staff) ? staff.email : '',
    rba: (staff && 'rba' in staff && staff.rba) ? [...staff.rba] : [],
    is_admin: (staff && 'is_admin' in staff) ? staff.is_admin : false,
    first_logon: (staff && 'first_logon' in staff) ? staff.first_logon : true,
  });

  const isExistingPerson = staff && staff.id;
  const namesEditable = !isExistingPerson;

  const handleSystemUserChange = (checked:boolean) => {
    !checked && setFormData(prev => ({
        ...prev,
        username:'', rba:[], is_admin:false, first_logon:undefined
    }))
    setIsUserAccount(checked)
    }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rba: checked 
        ? role === 'full' ? ['full', 'scenes', 'characters', 'actors', 'rehearsals'] // full => all
        : role === 'readonly' ? ['readonly'] // readonly => readonly only
        : prev.rba // is prev.rba set already?
        ? prev.rba.filter(r => r !== 'readonly').length < 3  // only one or two selected so far
        ? [...prev.rba.filter(r => r !== 'readonly'), role] // so just add the new one
        : [...prev.rba.filter(r => r !== 'readonly'), ...[role, 'full']] // othrwise all selected so also select 'full'
        : [role] // rba hadn't been set so add the first one selected
        : role === 'full'? prev.rba // don't make a change
        : (prev.rba || []).filter(r => r !== role || r === 'full') // finally remove the unchecked one and 'full'
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Clean up data based on whether it's a user account or just a person
    const dataToSave = isUserAccount 
      ? formData 
      : {
          first_name: formData.first_name,
          last_name: formData.last_name,
          _role: formData._role,
        };

    onSave({...dataToSave, id: staff?.id});
  }

  return (
    <div className={twMerge(className, 'p-1 border rounded-lg shadow-xl bg-white relative')}>
      <div className='absolute top-2 right-2'>
        {staff && (
          <SafeAvatar 
            src={`/images/staff/${actorKey(staff)}.png`}
            alt={`${staff.first_name} ${staff.last_name || ''}`}
          />
        )}
      </div>
    

      <form onSubmit={handleSubmit} className="pt-8 pr-18 h-full flex flex-col">
        <div className="flex-1 space-y-2">
          {/* Names Section */}
          <div className="space-y-1">
            <div>
              <label className="text-xs font-semibold text-red-800">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                disabled={!namesEditable}
                required
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  !namesEditable && "bg-gray-100 text-gray-500"
                )}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-red-800">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                disabled={!namesEditable}
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                  !namesEditable && "bg-gray-100 text-gray-500"
                )}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-red-800">
                Role
              </label>
              <input
                type="text"
                value={formData._role || ''}
                onChange={(e) => handleInputChange('_role', e.target.value)}
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                )}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-red-800">
                Photo filename
              </label>
              <input
                type="text"
                value={formData.photo || ''}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                className={twMerge(
                  "w-full text-xs px-1 py-0.5 border rounded text-gray-700",
                )}
              />
            </div>


          </div>

          {/* User Account Toggle */}
          <div className="flex items-center space-x-2">
            <Switch.Root
              checked={isUserAccount}
              onCheckedChange={handleSystemUserChange}
              className="inline-flex h-4 w-7 items-center rounded-full border border-gray-300 bg-gray-100 data-[checked]:bg-red-800"
            >
              <Switch.Thumb className="block h-3 w-3 rounded-full bg-white transition-transform data-[checked]:translate-x-3" />
            </Switch.Root>
            <span className="text-xs text-gray-600">System User</span>
          </div>

          {/* User-specific fields */}
          {isUserAccount && (
            <div className="space-y-1">
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required={isUserAccount}
                  className="w-full text-xs px-1 py-0.5 border rounded text-gray-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full text-xs px-1 py-0.5 border rounded text-gray-700"
                />
              </div>

              {/* Admin Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox.Root
                  checked={formData.is_admin || false}
                  onCheckedChange={(checked: boolean) => handleInputChange('is_admin', checked)}
                  className="flex h-3 w-3 items-center justify-center rounded border border-gray-300 bg-white data-[checked]:bg-red-800 data-[checked]:border-red-800"
                >
                  <Checkbox.Indicator className="text-white text-xs">✓</Checkbox.Indicator>
                </Checkbox.Root>
                <span className="text-xs text-red-700">System Admin</span>
              </div>

              {/* Role Access */}
              <div>
                <span className="text-xs font-semibold text-gray-600">Access Roles:</span>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {ROLE_OPTIONS.map(role => (
                    <div key={role} className="flex items-center space-x-1">
                      <Checkbox.Root
                        checked={(formData.rba || []).includes(role)}
                        onCheckedChange={(checked: boolean) => handleRoleToggle(role, checked)}
                        className="flex h-3 w-3 items-center justify-center rounded border border-gray-300 bg-white data-[checked]:bg-red-800 data-[checked]:border-red-800"
                      >
                        <Checkbox.Indicator className="text-white text-xs">✓</Checkbox.Indicator>
                      </Checkbox.Root>
                      <span className="text-xs text-gray-500">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
          >
            <CancelIcon sx={{ fontSize: 12 }} />
            <span>Cancel</span>
          </button>
          
          <button
            type="submit"
            className="flex items-center space-x-1 px-2 py-1 text-xs text-white bg-red-800 hover:bg-red-900 rounded transition-colors"
          >
            <SaveIcon sx={{ fontSize: 12 }} />
            <span>{isEditMode ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}