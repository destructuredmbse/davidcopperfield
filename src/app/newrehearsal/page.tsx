'use client'
import * as React from 'react';
import AddRehearsal from '../components/addrehearsal';

export default function Page() {
  const [showForm, setShowForm] = React.useState(true);

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <div className="flex flex-col items-center w-1/2 gap-4">
        <h2 className="text-red-800 text-3xl">New rehearsal</h2>
      {showForm ? (
        <AddRehearsal onSuccess={handleFormSuccess} />
      ) : (
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="text-lg font-semibold text-green-600">
            ✅ Rehearsal successfully created!
          </div>
          <button
            onClick={handleShowForm}
            className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-blue-50 px-3.5 text-base font-medium text-blue-900 select-none hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-blue-100"
          >
            Create Another Rehearsal
          </button>
        </div>
      )}
    </div>
  );
}







