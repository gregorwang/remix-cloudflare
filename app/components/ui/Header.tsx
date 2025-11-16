import { useState, Fragment } from 'react'
import {
  Dialog,
  DialogPanel,
  Transition,
} from '@headlessui/react'
import { Link, useOutletContext, useFetcher } from '@remix-run/react'
import { isAdmin } from '~/lib/constants';
import type { AppOutletContext } from '~/lib/types';

const navigation = [
  { name: '个人简历', href: '/cv' },
  { name: '影像记忆', href: '/gallery' },
  { name: '音乐之旅', href: '/music' },
  { name: '游戏世界', href: '/game' },
  { name: 'RAG-Nemesis', href: '/chat' },
  { name: '动漫回忆', href: '/anime' },
  { name: '日志更新', href: '/updates' },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { session } = useOutletContext<AppOutletContext>()
  const fetcher = useFetcher()
  
  const user = session?.user
  const userIsAdmin = isAdmin(user?.id, user?.email)
  
  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return null
    return user.name || user.email?.split('@')[0] || 'User'
  }
  
  const handleSignOut = () => {
    fetcher.submit(null, { method: 'post', action: '/auth/sign-out' })
  }

  return (
    <header className="bg-primary-50">
      <nav aria-label="Global" className="mx-auto flex max-w-[90rem] items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2 inline-flex items-center justify-center rounded-md p-2.5 text-primary-950/70 transition-all duration-300 ease-expo-out hover:text-primary-950 hover:bg-primary-100 hover:scale-110 active:scale-100"
          >
            <span className="sr-only">Open main menu</span>
            <span aria-hidden="true" className="h-6 w-6 text-2xl flex items-center justify-center">☰</span>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              prefetch="intent"
              className="px-4 py-2.5 rounded-md text-sm font-medium text-primary-950 hover:text-accent hover:bg-primary-100 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              {item.name}
            </Link>
          ))}
          {userIsAdmin && (
            <Link
              to="/admin/messages"
              prefetch="intent"
              className="px-4 py-2.5 rounded-md text-sm font-medium text-accent hover:text-accent-hover hover:bg-primary-100 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              🛡️ 留言管理
            </Link>
          )}
        </div>
        <div className="hidden lg:flex lg:justify-end items-center gap-3">
          {!user ? (
            <Link
              to="/auth"
              prefetch="intent"
              className="px-4 py-2.5 rounded-md text-sm font-medium text-primary-950 hover:text-accent hover:bg-primary-100 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              登录 <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserDisplayName()?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-primary-950/70">
                  {getUserDisplayName()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                disabled={fetcher.state !== 'idle'}
                className="px-4 py-2.5 rounded-md text-sm font-medium text-accent hover:text-accent-hover hover:bg-primary-100 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {fetcher.state !== 'idle' ? '退出中...' : '退出登录'}
              </button>
            </div>
          )}
        </div>
      </nav>
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog onClose={setMobileMenuOpen} className="lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="duration-600 ease-expo-out motion-reduce:duration-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-600 ease-expo-out motion-reduce:duration-0"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-50 bg-primary-950/10" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="duration-600 ease-expo-out motion-reduce:duration-0"
            enterFrom="opacity-0 translate-x-full"
            enterTo="opacity-100 translate-x-0"
            leave="duration-600 ease-expo-out motion-reduce:duration-0"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-0 translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-primary-50 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-primary-950/10">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 rounded-md p-2.5 text-primary-950/70 transition-opacity duration-300 ease-expo-out hover:text-primary-950"
                >
                  <span className="sr-only">Close menu</span>
                  <span aria-hidden="true" className="h-6 w-6 text-2xl flex items-center justify-center">✕</span>
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-primary-950/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        prefetch="intent"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-950 hover:bg-primary-100 hover:text-accent transition-opacity duration-300 ease-expo-out"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {userIsAdmin && (
                      <Link
                        to="/admin/messages"
                        prefetch="intent"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-sm font-semibold text-accent hover:bg-primary-100 hover:text-accent-hover transition-opacity duration-300 ease-expo-out"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        🛡️ 留言管理
                      </Link>
                    )}
                  </div>
                  <div className="py-6">
                    {!user ? (
                      <Link
                        to="/auth"
                        prefetch="intent"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-950 hover:bg-primary-100 hover:text-accent transition-opacity duration-300 ease-expo-out"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        登录
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 px-3 py-2">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getUserDisplayName()?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-primary-950 flex-1">
                            {getUserDisplayName()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setMobileMenuOpen(false)
                          }}
                          disabled={fetcher.state !== 'idle'}
                          className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-sm font-semibold text-accent hover:bg-primary-100 hover:text-accent-hover transition-opacity duration-300 ease-expo-out disabled:opacity-50"
                        >
                          {fetcher.state !== 'idle' ? '退出中...' : '退出登录'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogPanel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </header>
  )
}
