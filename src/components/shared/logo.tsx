
import Link from "next/link";
import Image from "next/image";

const FOUNDRIE_LOGO_URL = "https://thesiliconhill.com/wp-content/uploads/2026/07/Artboard-103g.png";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <Image
        src={FOUNDRIE_LOGO_URL}
        alt="Foundrie AI"
        width={300}
        height={52}
        priority
        className="h-10 w-auto max-w-[240px] object-contain"
      />
    </Link>
  );
};
