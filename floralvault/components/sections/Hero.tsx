import React from "react";
import { TextEffect } from "@/components/ui/text-effect";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="relative w-full h-[70vh] max-w-[1440px] mx-auto">
      <Image
        src={"/images/herbs-in-jars.jpg"}
        alt="FloralVault Logo"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
      />
      <div className="flex flex-col items-center gap-4 text-white">
        <section className="z-10 flex items-center justify-center ">
          <TextEffect
            per="line"
            as="h1"
            speedReveal={0.5}
            className="z-10 pt-14 font-semibold text-4xl text-center justify-center"
          >
            Welcome to FloralVault
          </TextEffect>
          {/* <span> 🌿</span> */}
        </section>
        <TextEffect
          delay={0.5}
          speedReveal={0.5}
          speedSegment={0.15}
          className="z-10 text-lg"
        >
          Your collection of Eden
        </TextEffect>
      </div>
    </div>
  );
};

export default Hero;
