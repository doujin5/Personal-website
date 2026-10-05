import Image from "next/image";
import { experience, type CompanyLogo } from "@/data/experience";
import { SectionLabel } from "./SectionLabel";

function Logo({ logo }: { logo: CompanyLogo }) {
  if (logo.kind === "fill") {
    return (
      <div className="relative size-10 shrink-0 overflow-clip rounded-lg border-[0.5px] border-line">
        {logo.layers.map((src) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="40px"
            className="rounded-lg object-cover"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-clip rounded-lg border-[0.5px] border-line bg-white p-2">
      <Image
        src={logo.src}
        alt=""
        width={logo.size}
        height={logo.size}
        style={{ borderRadius: logo.radius }}
        className="max-w-none shrink-0 object-cover"
      />
    </div>
  );
}

export function Timeline() {
  return (
    <>
      <SectionLabel>Experience Timeline</SectionLabel>
      <ol className="flex w-full flex-col gap-3">
        {experience.map((role) => (
          <li
            key={role.company}
            className="flex items-center gap-4 rounded-md p-2 sm:gap-[77px]"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Logo logo={role.logo} />
              <div className="flex min-w-0 flex-1 flex-col gap-2 leading-normal">
                <p className="text-sm font-medium">{role.company}</p>
                <p className="text-xs text-fg-muted">{role.title}</p>
                <p className="font-mono text-xs text-fg-muted uppercase sm:hidden">
                  {role.period}
                </p>
              </div>
            </div>
            <p className="hidden shrink-0 font-mono text-xs leading-normal whitespace-nowrap text-fg-muted uppercase sm:block">
              {role.period}
            </p>
          </li>
        ))}
      </ol>
    </>
  );
}
