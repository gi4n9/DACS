import React from "react";

const Header = () => {
  return (
    <header className="fixed top-[-1] z-50 w-full lg:top-0">
      <div className="h-8 transition-all duration-200">
        <div className="mx-auto max-w-full md:px-4 xl:px-12 2xl:px-16 px-4 sm:px-6 lg:px-8 w-full flex h-8 items-center justify-center bg-neutral-500 lg:justify-between">
          <ul className="flex h-full items-center justify-evenly max-lg:flex-1 md:justify-between">
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href=""
                className="block h-full flex-1 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                VỀ HNG
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="block h-full flex-1 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600">
              CXP
              <span className="absolute right-0 z-10 my-2 h-4.5 w-[1px] bg-neutral-300/20 hidden"></span>
            </li>
          </ul>
          <ul className="hidden h-full items-center justify-evenly max-lg:flex-1 md:justify-between lg:flex">
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href=""
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                Coolclub
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href=""
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                Blog
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href=""
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                CSKH
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href=""
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                Đăng nhập
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="h-13 border-b border-b-neutral-300 bg-background shadow-sm lg:h-17">
        <div className="mx-auto max-w-full md:px-4 xl:px-12 2xl:px-16 px-4 sm:px-6 lg:px-8 w-full h-full">
          <div className="relative flex h-full items-center justify-between">
            <figure className="flex flex-1 justify-center lg:justify-start">
              <a
                href="/"
                className="flex h-10 w-10 items-center justify-center"
              >
                <img src="/logoHNGstore.png" alt="" />
              </a>
            </figure>
          </div>
        </div>
      </div>
      <div></div>
    </header>
  );
};

export default Header;
