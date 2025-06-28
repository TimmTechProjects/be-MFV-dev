"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ResultsCard from "./cards/ResultsCard";

import { Plant } from "@/types/plants";
import { searchEverything } from "../lib/utils";
import { authUserLinks, navLinks } from "@/constants/navLinks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { UserResult } from "@/types/users";

const Header = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [plantSuggestions, setPlantSuggestions] = useState<Plant[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserResult[]>([]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { user, logout } = useUser();

  const router = useRouter();
  const pathname = usePathname() || "/";

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Popover
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery) {
        setPlantSuggestions([]);
        setUserSuggestions([]);
        setIsPopoverOpen(false);
        return;
      }

      const { plants, users } = await searchEverything(debouncedQuery);
      setPlantSuggestions(plants);
      setUserSuggestions(users);

      setIsPopoverOpen(plants.length > 0 || users.length > 0);
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/the-vault/results?query=${encodeURIComponent(trimmed)}`);
      setIsPopoverOpen(false);
    }
  };

  const hasSuggestions =
    plantSuggestions.length > 0 || userSuggestions.length > 0;

  return (
    <div className="bg-[#2b2a2a] flex w-full h-24 px-6 md:px-10 md:pt-2 items-center justify-between ">
      {/* Logo */}
      <h1
        className="text-3xl md:text-4xl text-white font-bold tracking-tight cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <span className="text-[#ecfaec]">My</span>
        <span className="bg-gradient-to-r from-[#dab9df] to-[#e5b3ec] bg-clip-text text-transparent">
          Floral
        </span>
        <span className="text-[#81a308]">Vault</span>
      </h1>

      {/* Searchbar */}

      <form
        onSubmit={handleSearch}
        className="relative w-3/4 sm:w-1/2 lg:w-1/3 hidden sm:block"
      >
        <Input
          type="text"
          placeholder="Search plants, users, tags, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (hasSuggestions && debouncedQuery) {
              setIsPopoverOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch(e);
              setIsPopoverOpen(false);
            }
          }}
          onBlur={() => {
            setTimeout(() => setIsPopoverOpen(false), 100);
          }}
          className="pr-10 rounded-2xl bg-white border-0"
        />
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 cursor-pointer" />
        {/* Popover-style dropdown */}
        {isPopoverOpen && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="absolute top-full mt-2 z-50 w-full bg-transparent rounded-md shadow-lg p-2 max-h-[800px] overflow-y-hidden"
          >
            {plantSuggestions.length > 0 && (
              <>
                <p className="bg-[#2b2a2a] text-xs text-gray-400 px-2 pb-1">
                  Plants
                </p>
                {plantSuggestions.map((plant) => (
                  <div
                    key={plant.id}
                    onClick={() => {
                      router.push(
                        `/profiles/${plant.user.username}/plants/${plant.slug}`
                      );
                      setIsPopoverOpen(false);
                    }}
                  >
                    <ResultsCard plant={plant} compact />
                  </div>
                ))}
              </>
            )}

            {/* {plantSuggestions.length > 0 && userSuggestions.length > 0 && (
              <hr className="my-2 bg-[#2b2a2a] border-gray-600" />
            )}

            {userSuggestions.length > 0 && (
              <>
                <p className="bg-[#2b2a2a] text-xs text-gray-400 px-2 pb-1 mt-2">
                  Users
                </p>
                {userSuggestions.map((user) => (
                  <div key={user.id} onClick={() => setIsPopoverOpen(false)}>
                    <ResultsCard user={user} compact />
                  </div>
                ))}
              </>
            )} */}
          </div>
        )}
      </form>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-5">
        {/* NavLinks */}
        <div className="flex text-white gap-5">
          {navLinks.map((link) => {
            let href = link.href;

            if (link.label === "My Collection") {
              href = user
                ? `/profiles/${user.username}/collections`
                : `/login?redirect=/profiles/temp/collections`; // fallback target if not logged in
            }

            return (
              <React.Fragment key={link.href}>
                <Link href={href}>
                  <p className="text-white hover:bg-gradient-to-r from-[#6ca148] to-[#756b56] bg-clip-text hover:text-transparent duration-200 ease-in-out">
                    {link.label}
                  </p>
                </Link>
              </React.Fragment>
            );
          })}
        </div>

        {/* Login */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:group">
                <AvatarImage
                  src={user.avatarUrl || "https://github.com/shadcn.png"}
                />
                <AvatarFallback className="bg-white">
                  {user?.firstName?.slice(0, 1).toLocaleUpperCase()}
                  {user?.lastName?.slice(0, 1).toLocaleUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="flex flex-col bg-[#2b2a2a] text-white justify-center cursor-pointer rounded-2xl w-48 mt-1 mr-5 scrollbar-none">
              <DropdownMenuItem>
                <Link
                  href={`/profiles/${user.username}`}
                  className="hover:text-[#dab9df]"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              {user &&
                authUserLinks.map((link) => (
                  <DropdownMenuItem key={link.href}>
                    <Link href={link.href} className="hover:text-[#dab9df]">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          {link.icon && (
                            <Image
                              src={link.icon}
                              alt={link.label}
                              width={16}
                              height={16}
                              className="invert"
                            />
                          )}
                        </div>

                        <span>{link.label}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuItem>
                <Link href="/membership" className="hover:text-[#dab9df]">
                  Membership
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="hover:text-[#dab9df]">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:text-red-400"
                onClick={logout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href={`/login?redirect=${pathname}`}>
            <Button className="bg-primary text-primary-foreground hover:bg-[#756b56] rounded-2xl px-4 py-2 font-semibold transition-colors duration-200 ease-in-out cursor-pointer">
              Login
            </Button>
          </Link>
        )}
      </div>

      {/* Mobile Nav */}
      <div className="flex lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Menu className="w-6 h-6 text-white" aria-label="Menu" />
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-10 bg-[#2b2a2a] text-white">
            <SheetHeader>
              <SheetTitle className="text-2xl text-white">
                Floral Vault
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Searchbar */}
            <form
              onSubmit={handleSearch}
              className="flex sm:hidden w-full mb-4 items-center justify-center"
            >
              <Input
                type="text"
                placeholder="Search plants, users, tags, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-2xl bg-white text-black border-0 w-11/12 max-w-xs"
              />
              <button type="submit" className="hidden" aria-label="Search" />
            </form>

            <div className="flex flex-col text-white gap-5 pl-10">
              {navLinks.map((link) => {
                let href = link.href;

                if (link.label === "My Collection") {
                  href = user
                    ? `/profiles/${user.username}/collections`
                    : `/login?redirect=/profiles/temp/collections`;
                }

                return (
                  <React.Fragment key={link.href}>
                    <Link href={href}>
                      <p className="text-white hover:bg-gradient-to-r from-[#6ca148] to-[#756b56] bg-clip-text hover:text-transparent duration-200 ease-in-out">
                        {link.label}
                      </p>
                    </Link>
                  </React.Fragment>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Header;
