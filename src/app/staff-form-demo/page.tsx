'use client';

import React from 'react';
import StaffManager from '../components/StaffManager';
import { user, person } from '../components/types';

// Example existing staff member for demonstration
const exampleUser: user = {
  id: "1",
  first_name: "John",
  last_name: "Doe",
  username: "johndoe",
  email: "john@example.com",
  rba: ["rehearsals", "cast"],
  is_admin: false,
  first_logon: false,
  creator: {
    id: "admin",
    first_name: "Admin",
    last_name: "User"
  }
};

const examplePerson: person = {
  id: "2", 
  first_name: "Jane",
  last_name: "Smith"
};

export default function StaffFormDemoPage() {
  return (
    <div className="w-full p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-red-800 mb-4">Staff Card Form Demo</h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates the StaffCardForm component that can create and edit both persons and system users.
        </p>
      </div>

      {/* Demo with no existing staff */}
      <div>
        <h2 className="text-xl font-semibold text-red-700 mb-4">Create New Staff</h2>
        <StaffManager />
      </div>

      {/* Demo with existing user */}
      <div>
        <h2 className="text-xl font-semibold text-red-700 mb-4">Edit Existing User</h2>
        <StaffManager existingStaff={exampleUser} />
      </div>

      {/* Demo with existing person (non-user) */}
      <div>
        <h2 className="text-xl font-semibold text-red-700 mb-4">Edit Existing Person</h2>
        <StaffManager existingStaff={examplePerson} />
      </div>

      {/* Feature documentation */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Component Features</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Form Capabilities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Create new persons or users</li>
              <li>✅ Edit existing staff (with restrictions)</li>
              <li>✅ Toggle between person and user modes</li>
              <li>✅ Base UI components with consistent styling</li>
              <li>✅ Matches existing staffcard design</li>
              <li>✅ Form validation and error handling</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">User Management</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Username and email fields</li>
              <li>✅ Role-based access control (RBA)</li>
              <li>✅ Admin privilege toggle</li>
              <li>✅ Multiple role selection</li>
              <li>✅ First login status tracking</li>
              <li>✅ Creator relationship</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <h4 className="font-semibold text-yellow-800 mb-2">Important Restrictions</h4>
          <p className="text-sm text-yellow-700">
            <strong>Name Lock:</strong> Once a person is created (has an ID), their first and last names 
            become read-only to maintain data integrity across the system.
          </p>
        </div>
      </div>
    </div>
  );
}