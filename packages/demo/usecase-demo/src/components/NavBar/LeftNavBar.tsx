import { Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Compass, FilePlus, LogOut, User, UserCheck } from 'react-feather';
import useLocalStorageState from 'use-local-storage-state';
import iExecLogo from '@/assets/iexec-logo.svg';
import { AddressChip } from '@/components/NavBar/AddressChip.tsx';
import { useLoginLogout } from '@/components/NavBar/useLoginLogout.ts';
import { Label } from '@/components/ui/label.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useDevModeStore } from '@/stores/devMode.store.ts';
import { useUserStore } from '@/stores/user.store.ts';
import { LOCAL_STORAGE_PREFIX } from '@/utils/localStorage.ts';

export function LeftNavBar() {
  const { address } = useUserStore();
  const { logout } = useLoginLogout();
  const [isStorageDevMode, setStorageDevMode] = useLocalStorageState(
    `${LOCAL_STORAGE_PREFIX}_devMode`,
    { defaultValue: false }
  );
  const { isDevMode, setDevMode } = useDevModeStore();

  // Load value from localStorage
  useEffect(() => {
    setDevMode(isStorageDevMode);
  }, []);

  // Update localStorage value on change
  useEffect(() => {
    setStorageDevMode(isDevMode);
  }, [isDevMode]);

  return (
    <div className="group relative z-30 h-full flex-none md:w-[280px]">
      <label
        className="group/checkbox fixed right-[22px] top-7 z-30 flex size-5 origin-center transform flex-col justify-between md:hidden"
        htmlFor="menu"
      >
        <input
          type="checkbox"
          className="absolute inset-0 appearance-none bg-transparent"
          name="menu"
          id="menu"
        />
        <span className="block h-0.5 w-[26px] origin-right transform rounded-full bg-white duration-200 group-has-[:checked]/checkbox:-rotate-45"></span>
        <span className="block h-0.5 w-[26px] origin-top-right transform rounded-full bg-white duration-200 group-has-[:checked]/checkbox:scale-x-0"></span>
        <span className="block h-0.5 w-[26px] origin-right transform rounded-full bg-white duration-200 group-has-[:checked]/checkbox:rotate-45"></span>
      </label>
      <div className="fixed h-dvh w-full -translate-x-full rounded-r-3xl border-r border-grey-800 bg-grey-900 px-5 pt-10 duration-300 group-has-[:checked]:translate-x-0 md:translate-x-0">
        <div className="-mx-2 flex items-center p-2">
          <Link to={'/'} className="shrink-0">
            <img src={iExecLogo} width="25" height="30" alt="iExec logo" />
          </Link>

          <div className="ml-3">
            <Link to={'/'}>
              <div className="font-mono font-bold leading-5">
                Content Creator
              </div>
            </Link>
            <div className="mt-1 rounded-xl border border-primary px-2.5 py-px text-xs text-primary">
              <span className="font-bold">DEMO</span> for{' '}
              <a
                href="https://documentation-tools.vercel.app/tools/dataProtector.html"
                target="_blank"
                className="inline-flex items-center hover:underline"
              >
                dataprotector-sdk
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center">
          <AddressChip address={address!} />
          <button
            type="button"
            className="-mr-2 ml-2 p-1 hover:drop-shadow-link-hover"
            onClick={() => logout()}
          >
            <LogOut size="20" />
          </button>
        </div>

        <Link
          to={'/explore'}
          className="-mx-1 mt-11 flex items-center gap-3 px-2 py-3 text-grey-400 transition-colors hover:text-white [&.active]:text-primary"
        >
          <Compass size="20" />
          Explore
        </Link>

        <Link
          to={'/rent'}
          className="-mx-1 mt-4 flex items-center gap-3 px-2 py-3 text-grey-400 transition-colors hover:text-white [&.active]:text-primary"
        >
          <FilePlus size="20" />
          Rent
        </Link>

        <Link
          to={'/subscribe'}
          className="-mx-1 mt-4 flex items-center gap-3 px-2 py-3 text-grey-400 transition-colors hover:text-white [&.active]:text-primary"
        >
          <UserCheck size="20" />
          Subscribe
        </Link>

        <Link
          to={'/my-content'}
          className="-mx-1 mt-4 flex items-center gap-3 px-2 py-3 text-grey-400 transition-colors hover:text-white [&.active]:text-primary"
        >
          <User size="20" />
          Manage
        </Link>

        <hr className="mt-10 border-grey-800" />

        <Label
          htmlFor="dev-mode"
          className="mt-8 flex items-center space-x-2 py-1"
        >
          <Switch
            id="dev-mode"
            checked={isDevMode}
            onCheckedChange={setDevMode}
          />
          <span>Dev Mode</span>
        </Label>
      </div>
    </div>
  );
}
