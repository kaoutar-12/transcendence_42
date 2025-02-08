'use client';
import { useEffect } from "react";
import LandingAnimation from '@/components/LandingAnimation/LandingAnimation';
import { useRouter } from 'next/navigation';


export default function Callback()
{
    const router = useRouter();
     useEffect(() => 
        {
            const fetchData = async () =>
                {
                    const urlParams = new URLSearchParams(window.location.search);
                    const code =   urlParams.get('code');
                    if (!code)
                        router.push('/');
                    const res = await fetch('http://localhost:8000/api/oauth/',
                    {
                        method:'POST',
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code }),
                    })
                    const data = await res.json();
                    if (res.ok)
                        if  (data.message==="User entered Successfully;")
                            {
                                router.push('/home');

                            }
                    else
                        router.push('/');
                        
                }
            fetchData();

        },[])

        return <LandingAnimation />;
} 