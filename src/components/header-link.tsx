'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type HeaderLinkProps = {
  href: string
  name: string
  className: string
  activeClass: string
  inactiveClass: string
}

export function HeaderLink({ href, name, className, activeClass, inactiveClass }: HeaderLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link href={href} className={cn(className, isActive ? activeClass : inactiveClass)}>
      {name}
    </Link>
  )
}
