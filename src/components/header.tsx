import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ButtonConnect } from '@/components/button-connect'
import { HeaderLink } from '@/components/header-link'

export function Header() {
  const navigation = [
    { name: 'Pools', href: '/' },
    { name: 'My Board', href: '/my-board' },
    { name: 'How it works', href: '#' }
  ]

  return (
    <Disclosure as="nav">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Menu className="block size-6 group-data-open:hidden" />
              <X aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-start">
            <div className="ms-12 flex shrink-0 items-center sm:ms-0">
              <Link href="/">
                <img alt="YETO" src="/logo.png" className="h-8 w-auto" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex items-center space-x-4">
                {navigation.map(item => (
                  <HeaderLink
                    key={item.name}
                    href={item.href}
                    name={item.name}
                    className="px-3 py-2 text-sm font-medium"
                    activeClass="text-leah"
                    inactiveClass="text-gray hover:text-white"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <ButtonConnect />
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map(item => (
            <HeaderLink
              key={item.name}
              href={item.href}
              name={item.name}
              className="block rounded-md px-3 py-2 text-base font-medium"
              activeClass="bg-gray-900 text-leah"
              inactiveClass="text-gray hover:bg-gray-700 hover:text-white"
            />
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
