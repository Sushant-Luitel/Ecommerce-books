import Image from 'next/image'

type BrandLogoProps = {
  className?: string
  priority?: boolean
}

export default function BrandLogo({ className = 'h-10 w-auto', priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/bookmellow-logo.png"
      alt="Book Mellow"
      width={2172}
      height={724}
      priority={priority}
      className={className}
    />
  )
}
