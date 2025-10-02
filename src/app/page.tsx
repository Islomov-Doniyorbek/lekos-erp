'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { refreshAccessToken } from "./api";
import Head from "next/head";

export default function Home() {

   const [ready, setReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = await refreshAccessToken();
      if (!token) {
        // Agar refresh ham ishlamasa -> login sahifaga
        window.location.href = "/auth";
      } else {
        setReady(true); // token tayyor bo‘lgandan keyin appni render qilamiz
      }
    };

    initAuth();
  }, []);

  if (!ready) {
    // window.lo
    return <p>Loading...</p>
  };

  return (
  <>
      <Head>
        <title>CRM Tizim | Bosh sahifa</title>
        <meta name="description" content="Bizning CRM tizim mijozlar va yetkazib beruvchilarni boshqarishda yordam beradi." />
        <meta name="keywords" content="CRM, mijozlar, yetkazib beruvchi, biznes boshqaruv" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="CRM Tizim" />
        <meta property="og:description" content="Mijozlar va yetkazib beruvchilar uchun qulay boshqaruv tizimi." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sizning-sayt.com/" />
        <meta property="og:image" content="https://sizning-sayt.com/preview.png" />
      </Head>
      <button className="px-3 py-2 bg-blue-700 cursor-pointer relative top-3.5 left-3.5">
        <Link className="text-amber-50" href={"/auth"}>Auth</Link>
      </button>
      
      {/* <Dashboard /> */}
  </>
  );
}
