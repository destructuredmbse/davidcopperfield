'use client'
import Image from "next/image";
import * as React from 'react';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'


export default function Page() {

  return (
    <div className="flex items-centre w-full">
      <h3>calendar page</h3>
    </div>
);

}