import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ButtonConnect } from '@/components/button-connect'

export function Header() {
  const navigation = [
    { name: 'Pools', href: '/', current: true },
    { name: 'My Board', href: '/my-board', current: false },
    { name: 'How it works', href: '#', current: false }
  ]

  return (
    <Disclosure as="nav">
      <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between py-4 sm:py-0">
          <div className="flex items-center justify-between sm:justify-start">
            <div className="flex items-center">
              <div className="flex items-center sm:hidden">
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Menu className="block size-6 group-data-open:hidden" />
                  <X aria-hidden="true" className="hidden size-6 group-data-open:block" />
                </DisclosureButton>
              </div>
              <div className="flex shrink-0 items-center ml-2 sm:ml-0">
                <Link href="/">
                  <img alt="YETO" src="/logo.png" className="h-8 w-auto" />
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={`${item.current ? 'text-white' : 'text-gray-300 hover:text-white'} px-3 py-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map(item => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={`${item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} block rounded-md px-3 py-2 text-base font-medium`}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
          <div className="flex items-center mt-4 sm:mt-0">
            <ButtonConnect />
          </div>
        </div>
      </div>

      
    </Disclosure>
  )
}
