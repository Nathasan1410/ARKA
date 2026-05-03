import Image from 'next/image';

type ArkaLogoProps = {
  className?: string;
  title?: string;
};

export function ArkaLogo({ className, title = 'ARKA logo' }: ArkaLogoProps) {
  return (
    <span className={className}>
      <Image
        alt={title}
        className="h-full w-full object-contain"
        height={512}
        priority
        src="/branding/arka-logo.png"
        width={512}
      />
    </span>
  );
}
