'use client'
import Image from "next/image";
import * as React from 'react';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Characters } from "../components/characters";

export default function Page() {

  return (
      <main className="flex flex-col gap-2 row-start-2 items-center sm:items-start">
          <h2 className="text-red-800 text-3xl">Characters</h2>
          <div className="flex cols w-full">
            <div className="flex items-centre w-full">
              <Characters />
            </div>
          </div>
      </main>
  );

}