import { formatValue } from "@/app/utils/formatValue";

interface MetadataPanelProps {
  entries: [string, unknown][];
  hasPersonalMetadata: boolean;
}

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

export const MetadataPanel = ({ entries, hasPersonalMetadata }: MetadataPanelProps) => (
  <div className="w-full rounded-xl border border-overlay bg-surface overflow-hidden">
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
        <div className="max-h-72 overflow-y-auto divide-y divide-overlay/50">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-start gap-4 px-4 py-2.5 hover:bg-overlay/30 transition-colors"
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
        {!hasPersonalMetadata && <StructuralOnlyNotice />}
      </>
    )}
  </div>
);
