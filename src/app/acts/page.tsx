'use client'
import Image from "next/image";
import * as React from 'react';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Acts } from "../components/acts";

export default function Home() {

  return (
      <main className="flex flex-col gap-[32px] w-4/5 row-start-2 items-center sm:items-start">
        <h2 className="text-red-800 text-3xl">Scenes</h2>
           <div className="flex cols w-full">
            <div className="flex items-centre w-full">
              <Acts />
            </div>
          </div>
      </main>
  );

}