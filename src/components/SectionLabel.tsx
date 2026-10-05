export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="w-full px-2 font-mono text-xs leading-normal text-fg-muted uppercase">
      {children}
    </h2>
  );
}
