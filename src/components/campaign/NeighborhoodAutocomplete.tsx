'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Suggestion {
  id: string;
  place_name: string;
  text: string;
}

interface NeighborhoodAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  disabled?: boolean;
}

export function NeighborhoodAutocomplete({
  value,
  onChange,
  placeholder = 'e.g. East Harlem',
  error,
  label = 'Neighborhood *',
  disabled = false,
}: NeighborhoodAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!MAPBOX_TOKEN) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
            `?access_token=${MAPBOX_TOKEN}&limit=5&types=place,neighborhood`
        );
        const data = await res.json();
        const list: Suggestion[] = (data.features ?? []).map(
          (f: { id: string; place_name: string; text: string }) => ({
            id: f.id,
            place_name: f.place_name,
            text: f.text,
          })
        );
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(s: Suggestion) {
    onChange(s.place_name);
    setQuery(s.place_name);
    setSuggestions([]);
    setOpen(false);
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        <p className="mt-1 text-xs text-amber-600">Set NEXT_PUBLIC_MAPBOX_TOKEN for neighborhood suggestions.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full rounded-lg border py-2 pl-9 pr-10 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="neighborhood-listbox"
          id="neighborhood-input"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {open && suggestions.length > 0 && (
        <ul
          id="neighborhood-listbox"
          role="listbox"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((s) => (
            <li
              key={s.id}
              role="option"
              tabIndex={0}
              onClick={() => handleSelect(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(s);
                }
              }}
              className="cursor-pointer px-3 py-2.5 text-sm text-gray-900 hover:bg-green-50 focus:bg-green-50 focus:outline-none"
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
