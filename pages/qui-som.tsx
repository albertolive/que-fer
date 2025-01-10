import Link from "next/link";
import Meta from "@components/partials/seo-meta";
import { siteUrl } from "@config/index";
import Image from "next/image";

export default function QuiSom() {
  return (
    <>
      <Meta
        title="Qui som - Esdeveniments.cat"
        description="Qui som? - Esdeveniments.cat és una iniciativa ciutadana per veure en un cop d'ull tots els actes culturals que es fan a Catalunya."
        canonical={`${siteUrl}/qui-som`}
      />
      <div className="w-full flex flex-col justify-start items-center gap-10 px-4 pt-8 sm:w-[580px] md:w-[768px] lg:w-[1024px]">
        <div>
          <h1 className="text-center italic uppercase font-semibold">
            Qui som?
          </h1>
          <h3 className="text-center italic font-normal text-primary">
            esdeveniments.cat
          </h3>
        </div>
        <div className="flex flex-col justify-start items-start gap-6">
          <p>
            Esdeveniments.cat és una iniciativa ciutadana per veure de manera
            fàcil i ràpida tots els actes culturals que es fan a Catalunya.
          </p>
          <p>
            L&apos;agenda és col·laborativa, i cada persona que organitzi un
            acte cultural podrà publicar-lo{" "}
            <Link
              href="/publica"
              prefetch={false}
              className="font-normal text-primary hover:underline"
            >
              aquí
            </Link>{" "}
            pel seu compte.
          </p>
          <p>
            Podreu seguir l&apos;agenda cultural en aquesta pàgina web o
            seguir-nos a les xarxes socials:
          </p>
        </div>
        <div></div>
        <div className="w-full flex flex-col justify-center gap-8 pb-20">
          <h2 className="text-center">El nostre equip</h2>
          <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-8">
            <div className="w-[200px] h-[414px] bg-whiteCorp rounded-md shadow-xl">
              <div className="h-[185px] overflow-hidden">
                <Image
                  className="object-cover object-top rounded-t-md"
                  src="/static/images/linkedin_albert.jpeg"
                  alt="Albert Olivé Corbella"
                  width={200}
                  height={200}
                />
              </div>
              <div className="w-full flex flex-col justify-center items-center gap-6 py-8">
                <div className="w-full flex justify-start items-start gap-2 pt-4">
                  <div className="w-2 h-6 bg-primary"></div>
                  <h2>Albert Olivé Corbella</h2>
                </div>
                <div className="w-full flex flex-col justify-start items-start px-4">
                  <p className="w-full">Senior Full Stack Developer</p>
                  <p className="w-full text-sm font-semibold">CTO Fundador</p>
                </div>
                <a
                  href="https://www.linkedin.com/in/albertolivecorbella/"
                  className="w-full text-center hover:bg-primary hover:text-whiteCorp font-bold px-4 py-3 my-3 ease-in-out duration-300 cursor-pointer"
                >
                  <p>LinkedIn</p>
                </a>
              </div>
            </div>
            <div className="w-[200px] h-[414px] bg-whiteCorp rounded-md shadow-xl">
              <div className="h-[185px] overflow-hidden">
                <Image
                  className="object-cover object-top rounded-t-md"
                  src="/static/images/linkedin_andreu.jpeg"
                  alt="Andreu Benitez Moreno"
                  width={200}
                  height={200}
                />
              </div>
              <div className="w-full flex flex-col justify-center items-center gap-6 py-8">
                <div className="w-full flex justify-start items-start gap-2 pt-4">
                  <div className="w-2 h-6 bg-primary"></div>
                  <h2>Andreu Benítez Moreno</h2>
                </div>
                <div className="w-full flex flex-col justify-start items-start px-4">
                  <p className="w-full">UI Engineer | Graphic Designer</p>
                  <p className="w-full text-sm font-semibold">Co-Fundador</p>
                </div>
                <a
                  href="https://www.linkedin.com/in/andreubenitezmoreno/"
                  className="w-full text-center hover:bg-primary hover:text-whiteCorp font-bold px-4 py-3 my-3 ease-in-out duration-300 cursor-pointer"
                >
                  <p>LinkedIn</p>
                </a>
              </div>
            </div>
            <div className="w-[200px] h-[414px] bg-whiteCorp rounded-md shadow-xl">
              <div className="h-[185px] overflow-hidden">
                <Image
                  className="object-cover object-top rounded-t-md"
                  src="/static/images/linkedin_gerard.jpg"
                  alt="Gerard Rovellat Carbó"
                  width={200}
                  height={200}
                />
              </div>
              <div className="w-full flex flex-col justify-center items-center gap-6 py-8">
                <div className="w-full flex justify-start items-start gap-2 pt-4">
                  <div className="w-2 h-6 bg-primary"></div>
                  <h2>Gerard Rovellat Carbó</h2>
                </div>
                <div className="w-full flex flex-col justify-start items-start px-4">
                  <p className="w-full">
                    Software Engineer | Backend Developer
                  </p>
                  <p className="w-full text-sm font-semibold">Co-Fundador</p>
                </div>
                <a
                  href="https://www.linkedin.com/in/gerardrovellatcarbo/"
                  className="w-full text-center hover:bg-primary hover:text-whiteCorp font-bold px-4 py-3 my-3 ease-in-out duration-300 cursor-pointer"
                >
                  <p>LinkedIn</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
