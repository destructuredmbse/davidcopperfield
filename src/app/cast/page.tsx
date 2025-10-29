'use client'
import Image from "next/image";
import * as React from 'react';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Cast } from "../components/cast";

export default function Page() {

  return (
    <div className="flex flex-col gap-2 items-centre w-full">
        <h2 className="text-red-800 text-3xl">Cast</h2>
        <Cast />
    </div>
);

}