"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Search, X } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";

type SearchResult = {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
};

export function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle search dialog
  const toggleSearch = () => {
    setIsOpen(!isOpen);
    setQuery("");
    setResults([]);
  };

  // Handle search input change
  //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setQuery(e.target.value);
  //   };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/items?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  // Navigate to item details
  const navigateToItem = (id: number) => {
    router.push(`/items/${id}`);
    setIsOpen(false);
  };

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/items?search=${encodeURIComponent(debouncedQuery)}&limit=5`
        );
        const data = await response.json();

        setResults(data.items || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Handle keyboard shortcuts (commenting out for now due to bug where if you were to do two searches, the old one still shows up)
  //   useEffect(() => {
  //     const down = (e: KeyboardEvent) => {
  //       if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
  //         e.preventDefault();
  //         setIsOpen((open) => !open);
  //       }
  //     };

  //     document.addEventListener("keydown", down);
  //     return () => document.removeEventListener("keydown", down);
  //   }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (!isOpen) {
      setQuery(""); // reset the input when closing
    }
  };

  return (
    <>
      {/* Desktop search button */}
      {/* <Button
        variant="outline"
        className="hidden md:flex items-center gap-2 w-64 justify-between text-muted-foreground"
        onClick={toggleSearch}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search items...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button> */}

      {/* Mobile search button */}
      <div onClick={toggleSearch} className="flex cursor-pointer gap-1">
        <Search className="h-4 w-4 mt-1" />
        <span className="max-md:hidden">Search</span>
      </div>

      {/* Search dialog */}
      <CommandDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        key={isOpen ? "open" : "closed"}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border-b px-3">
            {/* <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> */}
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search items..."
              className="flex-1 outline-none"
            />
            {/* {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )} */}
          </div>
        </form>
        <CommandList>
          {isLoading ? (
            <div className="py-6 text-center text-sm">Loading...</div>
          ) : (
            <>
              {debouncedQuery && results.length > 0 ? (
                <CommandGroup heading="Items">
                  {results.map((item) => {
                    return (
                      <CommandItem
                        key={item.id}
                        onSelect={() => navigateToItem(item.id)}
                        className="flex items-center gap-2 py-2 cursor-pointer"
                      >
                        {item.name}
                        {/* {item.price.toFixed(2)} */}
                        {/* <div className="flex-shrink-0 w-8 h-12 bg-muted rounded overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col"> 
                        {/* <span className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)}
                        </span> 
                        </div> */}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : debouncedQuery.length >= 2 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : null}

              {/* {debouncedQuery && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Press Enter to search all items
                </div>
              )} */}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
