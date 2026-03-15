"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { Dropdown, DropdownItem } from "./dropdown";

interface TopbarAuthProps {
  variant: "auth";
  rightLink: { label: string; href: string };
}

interface TopbarPublicProps {
  variant: "public";
}

interface TopbarConnectedProps {
  variant: "connected";
  email: string;
  onSignOut: () => void;
}

type TopbarProps = TopbarAuthProps | TopbarPublicProps | TopbarConnectedProps;

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="text-[15px] font-semibold text-gray-50 hover:text-white transition-colors"
    >
      HubSpot Auditor
    </Link>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative text-sm transition-colors ${
        active
          ? "text-gray-50"
          : "text-gray-400 hover:text-gray-100"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-brand-500" />
      )}
    </Link>
  );
}

export function Topbar(props: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-700 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-8">
        <Logo />
        {props.variant === "connected" && (
          <nav className="flex items-center gap-6">
            <NavLink
              href="/dashboard"
              label="Dashboard"
              active={pathname === "/dashboard"}
            />
            <NavLink
              href="/settings"
              label="Paramètres"
              active={pathname === "/settings"}
            />
          </nav>
        )}
      </div>

      <div className="flex items-center">
        {props.variant === "auth" && (
          <Link
            href={props.rightLink.href}
            className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
          >
            {props.rightLink.label}
          </Link>
        )}

        {props.variant === "public" && (
          <Link
            href="/register"
            className="text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors"
          >
            Auditer mon workspace →
          </Link>
        )}

        {props.variant === "connected" && (
          <Dropdown
            trigger={
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-900 text-brand-300 text-xs font-medium cursor-pointer hover:bg-brand-900/80 transition-colors">
                {props.email.charAt(0).toUpperCase()}
              </div>
            }
          >
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 truncate">
              {props.email}
            </div>
            <DropdownItem onClick={() => (window.location.href = "/settings")}>
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </span>
            </DropdownItem>
            <DropdownItem onClick={props.onSignOut} danger>
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </span>
            </DropdownItem>
          </Dropdown>
        )}
      </div>
    </header>
  );
}
