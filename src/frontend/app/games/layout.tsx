import Particles from "@/components/LandingAnimation/Particles";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Particles />
      {children}
    </>
  );
}
