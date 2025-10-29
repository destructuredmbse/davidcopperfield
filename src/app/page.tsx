'use client'
import Image from "next/image";
import * as React from 'react';
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Acts } from "./components/acts";
import { signIn, useSession } from "next-auth/react";
import { SignIn } from "./components/auth/sign-in";


export default function Home() {

  const { data: session, status } = useSession()

  return (
      <main className="flex flex-col gap-4 w-5/6 row-start-2 items-center sm:items-start">
           <div className="flex cols w-full">
            <div className="flex items-centre w-full">
              <Image 
                src='/Houghton_HEW_2.6.15_-_Dickens,_David_Copperfield.jpg'
                alt='The cover of a signed first edition David Copperfield'
                width={348}
                height={599}
              />
            </div>
          </div>
      </main>
  );

}