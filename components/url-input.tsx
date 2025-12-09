"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"

interface UrlInputProps {
  onFetch: (url: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function UrlInput({ onFetch, isLoading, disabled = false }: UrlInputProps) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim() && !disabled) {
      onFetch(url.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="url"
          placeholder="Paste your YouTube link here."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled}
          className="h-12 rounded-xl pl-10 text-base"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !url.trim() || disabled} 
        className="h-12 w-full rounded-xl px-6 sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze"
        )}
      </Button>
    </form>
  )
}
