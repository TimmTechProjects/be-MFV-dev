"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ResultsCard from "./cards/ResultsCard";

import { Plant } from "@/types/plants";
import { getAllPlants } from "../lib/utils";
import { navLinks } from "@/constants/navLinks";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useUser } from "@/context/UserContext";

const Header = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Plant[]>([]);
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
        setSuggestions([]);
        setIsPopoverOpen(false);
        return;
      }

      const plantData: Plant[] = await getAllPlants();

      const filtered = plantData
        .filter((plant) => {
          const match =
            plant.commonName?.toLowerCase().includes(debouncedQuery) ||
            plant.botanicalName.toLowerCase().includes(debouncedQuery) ||
            plant.description.toLowerCase().includes(debouncedQuery) ||
            plant.tags.some((tag) =>
              tag.name.toLowerCase().includes(debouncedQuery)
            );
          return match;
        })
        .slice(0, 5);

      setSuggestions(filtered);
      setIsPopoverOpen(filtered.length > 0);
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/results?query=${encodeURIComponent(trimmed)}`);
      setIsPopoverOpen(false);
    }
  };

  return (
    <div className="bg-[#2b2a2a] flex w-full h-24 px-6 md:px-10 md:pt-2 items-center justify-between ">
      {/* Logo */}
      <h1
        className="hidden sm:flex text-3xl md:text-4xl text-white font-bold tracking-tight cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <span className="bg-gradient-to-r from-[#dab9df] to-[#e5b3ec] bg-clip-text text-transparent">
          Floral
        </span>
        <span className="text-[#81a308]">Vault</span>
      </h1>

      {/* Searchbar */}

      <form
        onSubmit={handleSearch}
        className="relative w-3/4 sm:w-1/2 lg:w-1/3 xl:w-1/2"
      >
        <Input
          type="text"
          placeholder="Search plants, users, tags, or ailments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0 && debouncedQuery) {
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
            {suggestions.map((plant: Plant) => (
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
          </div>
        )}
      </form>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-5">
        {/* NavLinks */}
        <div className="flex text-white gap-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <p className="text-white hover:bg-gradient-to-r from-[#6ca148] to-[#756b56] bg-clip-text hover:text-transparent duration-200 ease-in-out">
                {link.label}
              </p>
            </Link>
          ))}
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

            <DropdownMenuContent className=" bg-[#2b2a2a] text-white items-center justify-center cursor-pointer rounded-2xl w-48 mt-1 mr-5 scrollbar-none">
              <DropdownMenuLabel>
                <Link href={`/profiles/${user.username}`} className="text-lg">
                  {user.username}&apos;s Profile
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user && (
                <DropdownMenuItem>
                  <Link href={`/profiles/${user.username}/plants/new`}>
                    Add a Plant
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={logout}>
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

            <div className="flex flex-col text-white gap-5 pl-10">
              {navLinks.map((link) => {
                const isAfterMyCollection =
                  link.label === "My Collection" && user;
                return (
                  <React.Fragment key={link.href}>
                    <Link href={link.href}>
                      <p className="text-white hover:bg-gradient-to-r from-[#6ca148] to-[#756b56] bg-clip-text hover:text-transparent duration-200 ease-in-out">
                        {link.label}
                      </p>
                    </Link>
                    {isAfterMyCollection && (
                      <Link href={`/profiles/${user.username}/plants/new`}>
                        <p className="text-white hover:bg-gradient-to-r from-[#6ca148] to-[#756b56] bg-clip-text hover:text-transparent duration-200 ease-in-out">
                          Add a Plant
                        </p>
                      </Link>
                    )}
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
