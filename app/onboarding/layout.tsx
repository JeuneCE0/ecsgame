import Image from 'next/image';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="ECS GAME"
          width={180}
          height={54}
          priority
        />
      </div>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
