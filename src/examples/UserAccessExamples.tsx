// Example Usage Guide for UserAccessContext

import { useUserAccess } from '../contexts/UserAccessContext';

// Example 1: Basic role checking
function AdminPanel() {
  const { hasRole } = useUserAccess();
  
  if (!hasRole('admin')) {
    return <div>Access denied. Admin privileges required.</div>;
  }
  
  return <div>Welcome to admin panel!</div>;
}

// Example 2: Multiple role checking
function RehearsalActions() {
  const { hasAnyRole } = useUserAccess();
  
  const canEditRehearsals = hasAnyRole(['rehearsals', 'full']);
  
  return (
    <div>
      {canEditRehearsals ? (
        <button>Edit Rehearsal</button>
      ) : (
        <span>View Only</span>
      )}
    </div>
  );
}

// Example 3: Require all roles
function SuperUserFeature() {
  const { hasAllRoles } = useUserAccess();
  
  if (!hasAllRoles(['admin', 'rehearsals', 'cast'])) {
    return null; // Hide feature completely
  }
  
  return <div>Super user feature content</div>;
}

// Example 4: Loading state handling
function UserInfo() {
  const { rba, isLoading } = useUserAccess();
  
  if (isLoading) {
    return <div>Loading user permissions...</div>;
  }
  
  return (
    <div>
      <h3>Your Roles:</h3>
      <ul>
        {rba.map(role => (
          <li key={role}>{role}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 5: Conditional rendering with complex logic
function NavigationMenu() {
  const { hasRole, hasAnyRole, rba } = useUserAccess();
  
  return (
    <nav>
      <a href="/">Home</a>
      
      {hasRole('cast') && (
        <a href="/my-schedule">My Schedule</a>
      )}
      
      {hasAnyRole(['rehearsals', 'full']) && (
        <a href="/rehearsals">Manage Rehearsals</a>
      )}
      
      {hasRole('admin') && (
        <a href="/admin">Admin Panel</a>
      )}
      
      {rba.length === 0 && (
        <span>Limited Access</span>
      )}
    </nav>
  );
}

export {
  AdminPanel,
  RehearsalActions,
  SuperUserFeature,
  UserInfo,
  NavigationMenu
};