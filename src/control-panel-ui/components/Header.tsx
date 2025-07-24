import React, { Fragment } from 'react';
import { Navbar, NavbarContent, NavbarBrand, NavbarItem } from '@heroui/react';
// import ThemeSwitch from './ThemeSwitch';

export default function Header() {
  return (
    <Fragment>
      <Navbar
        classNames={{
          wrapper:
            'max-w-full flex flex-row flex-wrap bg-[#F9FAFB] dark:bg-background border-b border-gray-200 dark:border-gray-800',
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
        {/* <ThemeSwitch /> */}
      </Navbar>
    </Fragment>
  );
} 