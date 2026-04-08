import {
  METADATA_GROUPS,
  OTHER_GROUP,
  type MetadataGroupDef,
} from "@/app/constants/metadataGroups";

export interface GroupedMetadata {
  group: MetadataGroupDef;
  entries: [string, unknown][];
}

export function groupMetadata(
  entries: [string, unknown][],
): GroupedMetadata[] {
  const buckets = new Map<string, [string, unknown][]>(
    METADATA_GROUPS.map((g) => [g.id, []]),
  );
  const otherEntries: [string, unknown][] = [];

  for (const entry of entries) {
    const [key] = entry;
    const group = METADATA_GROUPS.find((g) => g.keys.has(key));

    if (group) {
      buckets.get(group.id)!.push(entry);
    } else {
      otherEntries.push(entry);
    }
  }

  const result: GroupedMetadata[] = [];

  for (const group of METADATA_GROUPS) {
    const groupEntries = buckets.get(group.id)!;

    if (groupEntries.length > 0) {
      result.push({ group, entries: groupEntries });
    }
  }

  if (otherEntries.length > 0) {
    result.push({ group: OTHER_GROUP, entries: otherEntries });
  }

  return result;
}
