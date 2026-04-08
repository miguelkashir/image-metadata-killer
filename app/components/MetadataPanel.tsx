"use client";

import { useState } from "react";
import { formatValue } from "@/app/utils/formatValue";
import { groupMetadata } from "@/app/utils/groupMetadata";
import type { MetadataGroupDef } from "@/app/constants/metadataGroups";

interface MetadataPanelProps {
  entries: [string, unknown][];
  hasPersonalMetadata: boolean;
}

const COLOR_CLASSES: Record<
  string,
  { heading: string; badge: string; dot: string }
> = {
  red: { heading: "text-red", badge: "bg-red/10 text-red", dot: "bg-red" },
  cyan: { heading: "text-cyan", badge: "bg-cyan/10 text-cyan", dot: "bg-cyan" },
  purple: {
    heading: "text-purple",
    badge: "bg-purple/10 text-purple",
    dot: "bg-purple",
  },
  yellow: {
    heading: "text-yellow",
    badge: "bg-yellow/10 text-yellow",
    dot: "bg-yellow",
  },
  green: {
    heading: "text-green",
    badge: "bg-green/10 text-green",
    dot: "bg-green",
  },
  pink: { heading: "text-pink", badge: "bg-pink/10 text-pink", dot: "bg-pink" },
  orange: {
    heading: "text-orange",
    badge: "bg-orange/10 text-orange",
    dot: "bg-orange",
  },
  muted: {
    heading: "text-muted",
    badge: "bg-overlay text-muted",
    dot: "bg-muted",
  },
};

function getColor(color: string) {
  return COLOR_CLASSES[color] ?? COLOR_CLASSES.muted;
}

const GroupSection = ({
  group,
  entries,
  collapsed,
  onToggle,
}: {
  group: MetadataGroupDef;
  entries: [string, unknown][];
  collapsed: boolean;
  onToggle: () => void;
}) => {
  const c = getColor(group.color);

  return (
    <div>
      {/* Group header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-2.5 bg-overlay/20 border-b border-overlay/50 hover:bg-overlay/40 transition-colors cursor-pointer text-left"
      >
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-semibold ${c.heading}`}>
              {group.label}
            </span>
            <span
              className={`font-mono text-xs px-1.5 py-0.5 rounded-full ${c.badge}`}
            >
              {entries.length}
            </span>
          </div>
          {!collapsed && (
            <p className="font-mono text-xs text-muted/70 mt-0.5 leading-relaxed">
              {group.description}
            </p>
          )}
        </div>
        <span className="font-mono text-xs text-muted/50 mt-0.5 shrink-0">
          {collapsed ? "▸" : "▾"}
        </span>
      </button>

      {/* Entries */}
      {!collapsed && (
        <div className="divide-y divide-overlay/50">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-start gap-4 px-4 py-2 hover:bg-overlay/30 transition-colors"
            >
              <span className="font-mono text-xs text-muted shrink-0 w-40 pt-px truncate">
                {key}
              </span>
              <span className="font-mono text-xs text-fg break-all">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyMetadataNotice = () => (
  <div className="px-6 py-8 text-center space-y-2">
    <p className="font-mono text-sm text-green">✓ no metadata found</p>
    <p className="font-mono text-xs text-muted leading-relaxed">
      This image carries only the minimal data required by the format — no
      camera info, no GPS, no timestamps.
    </p>
    <p className="font-mono text-xs text-muted/40 leading-relaxed pt-1">
      Did we strip this previously? No idea — we keep absolutely nothing.
      That&apos;s the point.
    </p>
  </div>
);

const StructuralOnlyNotice = () => (
  <div className="px-6 py-4 border-t border-overlay text-center space-y-1">
    <p className="font-mono text-xs text-green">✓ no personal metadata</p>
    <p className="font-mono text-xs text-muted leading-relaxed">
      The fields above are structural — baked into the file format itself and
      impossible to remove. No camera info, no GPS, no timestamps.
    </p>
    <p className="font-mono text-xs text-muted/40 leading-relaxed pt-0.5">
      Did we strip this previously? No idea — we keep absolutely nothing.
      That&apos;s the point.
    </p>
  </div>
);

export const MetadataPanel = ({
  entries,
  hasPersonalMetadata,
}: MetadataPanelProps) => {
  const groups = groupMetadata(entries);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return (
    <div className="w-full rounded-xl border border-overlay bg-surface overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-overlay">
        <span className="font-mono text-xs text-muted uppercase tracking-widest">
          metadata
        </span>
        {entries.length > 0 && (
          <span className="font-mono text-xs text-muted">
            {entries.length} fields
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyMetadataNotice />
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto divide-y divide-overlay/50">
            {groups.map(({ group, entries: groupEntries }) => (
              <GroupSection
                key={group.id}
                group={group}
                entries={groupEntries}
                collapsed={collapsed.has(group.id)}
                onToggle={() => toggle(group.id)}
              />
            ))}
          </div>

          {!hasPersonalMetadata && <StructuralOnlyNotice />}
        </>
      )}
    </div>
  );
};
