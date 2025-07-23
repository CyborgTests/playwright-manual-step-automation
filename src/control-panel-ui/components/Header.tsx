import React from 'react';
import { Card, CardBody, Link, Badge, Navbar, NavbarContent, NavbarBrand, NavbarItem } from '@heroui/react';
import ThemeSwitch from './ThemeSwitch';

export default function Header() {
  return (
    <Navbar
      classNames={{
        wrapper:
          'flex flex-row flex-wrap bg-[#F9FAFB] dark:bg-background border-b border-gray-200 dark:border-gray-800 max-w-full',
      }}
      height="3.75rem"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <div className="flex justify-start items-center gap-1">
            <img src="./logo.svg" alt="Cyborg Logo" className="min-w-10 dark:invert" />
          </div>
        </NavbarBrand>
      </NavbarContent>
      
      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-4">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      {/* mobile view fallback */}
      <NavbarContent className="sm:hidden basis-1 md:min-w-fit min-w-full sm:justify-center justify-end pb-14">
        <ThemeSwitch />
      </NavbarContent>
    </Navbar>
  );
} 