'use client'
import React, { useState } from 'react'
import { Globe, FileText } from 'lucide-react'
import GlassIcon from '../ui/GlassIcon'
import { splitAboutWithGlossary } from '../../lib/glossary'

export default function AboutSection({
  name,
  about,
  website,
  whitepaper
}: {
  name: string
  about: string
  website: string
  whitepaper?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const segments = splitAboutWithGlossary(about)

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold tracking-tight">About {name}</h2>
      <p className={expanded ? 'max-w-2xl text-sm leading-relaxed text-muted-foreground' : 'line-clamp-3 max-w-2xl text-sm leading-relaxed text-muted-foreground'}>
        {segments.map((seg, i) =>
          seg.href ? (
            <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {seg.text}
            </a>
          ) : (
            <React.Fragment key={i}>{seg.text}</React.Fragment>
          )
        )}
      </p>
      <button onClick={() => setExpanded((e) => !e)} className="mt-2 text-sm font-medium text-primary hover:underline">
        {expanded ? 'Show less' : 'Read more'}
      </button>

      <div className="mt-4 flex gap-2">
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} official website`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <GlassIcon icon={Globe} size={14} />
        </a>
        {whitepaper && (
          <a
            href={whitepaper}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} whitepaper`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <GlassIcon icon={FileText} size={14} />
          </a>
        )}
      </div>
    </div>
  )
}
