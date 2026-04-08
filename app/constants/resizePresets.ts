export interface ResolutionPreset {
  label: string;
  width: number;
  height: number;
}

export const SCALE_PRESETS = [25, 50, 75, 100] as const;

export const RESOLUTION_PRESETS: Record<string, ResolutionPreset[]> = {
  "16:9": [
    { label: "480p",  width: 854,  height: 480  },
    { label: "720p",  width: 1280, height: 720  },
    { label: "1080p", width: 1920, height: 1080 },
    { label: "1440p", width: 2560, height: 1440 },
    { label: "4K",    width: 3840, height: 2160 },
  ],
  "9:16": [
    { label: "480p",  width: 480,  height: 854  },
    { label: "720p",  width: 720,  height: 1280 },
    { label: "1080p", width: 1080, height: 1920 },
    { label: "1440p", width: 1440, height: 2560 },
  ],
  "4:3": [
    { label: "640×480",   width: 640,  height: 480  },
    { label: "800×600",   width: 800,  height: 600  },
    { label: "1024×768",  width: 1024, height: 768  },
    { label: "1280×960",  width: 1280, height: 960  },
    { label: "1600×1200", width: 1600, height: 1200 },
    { label: "2048×1536", width: 2048, height: 1536 },
  ],
  "3:4": [
    { label: "480×640",   width: 480,  height: 640  },
    { label: "600×800",   width: 600,  height: 800  },
    { label: "768×1024",  width: 768,  height: 1024 },
    { label: "960×1280",  width: 960,  height: 1280 },
    { label: "1200×1600", width: 1200, height: 1600 },
    { label: "1536×2048", width: 1536, height: 2048 },
  ],
  "3:2": [
    { label: "1200×800",  width: 1200, height: 800  },
    { label: "1500×1000", width: 1500, height: 1000 },
    { label: "1800×1200", width: 1800, height: 1200 },
    { label: "2400×1600", width: 2400, height: 1600 },
    { label: "3000×2000", width: 3000, height: 2000 },
  ],
  "2:3": [
    { label: "800×1200",  width: 800,  height: 1200 },
    { label: "1000×1500", width: 1000, height: 1500 },
    { label: "1200×1800", width: 1200, height: 1800 },
    { label: "1600×2400", width: 1600, height: 2400 },
    { label: "2000×3000", width: 2000, height: 3000 },
  ],
  "16:10": [
    { label: "1024×640",  width: 1024, height: 640  },
    { label: "1280×800",  width: 1280, height: 800  },
    { label: "1440×900",  width: 1440, height: 900  },
    { label: "1920×1200", width: 1920, height: 1200 },
    { label: "2560×1600", width: 2560, height: 1600 },
  ],
  "10:16": [
    { label: "640×1024",  width: 640,  height: 1024 },
    { label: "800×1280",  width: 800,  height: 1280 },
    { label: "900×1440",  width: 900,  height: 1440 },
    { label: "1200×1920", width: 1200, height: 1920 },
  ],
  "1:1": [
    { label: "512×512",   width: 512,  height: 512  },
    { label: "1024×1024", width: 1024, height: 1024 },
    { label: "1080×1080", width: 1080, height: 1080 },
    { label: "2048×2048", width: 2048, height: 2048 },
  ],
  "21:9": [
    { label: "1280×540",  width: 1280, height: 540  },
    { label: "2560×1080", width: 2560, height: 1080 },
    { label: "3440×1440", width: 3440, height: 1440 },
  ],
  "5:4": [
    { label: "640×512",   width: 640,  height: 512  },
    { label: "1280×1024", width: 1280, height: 1024 },
    { label: "1600×1280", width: 1600, height: 1280 },
  ],
  "4:5": [
    { label: "512×640",   width: 512,  height: 640  },
    { label: "1024×1280", width: 1024, height: 1280 },
    { label: "1280×1600", width: 1280, height: 1600 },
  ],
};

// Ordered by how commonly they appear, so the first match wins on ties.
const KNOWN_RATIOS: { key: string; value: number }[] = [
  { key: "1:1",   value: 1          },
  { key: "16:9",  value: 16 / 9     },
  { key: "9:16",  value: 9 / 16     },
  { key: "4:3",   value: 4 / 3      },
  { key: "3:4",   value: 3 / 4      },
  { key: "3:2",   value: 3 / 2      },
  { key: "2:3",   value: 2 / 3      },
  { key: "16:10", value: 16 / 10    },
  { key: "10:16", value: 10 / 16    },
  { key: "5:4",   value: 5 / 4      },
  { key: "4:5",   value: 4 / 5      },
  { key: "21:9",  value: 21 / 9     },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Returns a ratio key (e.g. "16:9") for the given dimensions.
 * Tries exact GCD-based matching first, then falls back to a 5% tolerance float comparison.
 */
export function detectAspectRatio(width: number, height: number): string | null {
  // Exact match via GCD (handles most camera and screen photos perfectly)
  const d = gcd(width, height);
  const exactKey = `${width / d}:${height / d}`;

  if (RESOLUTION_PRESETS[exactKey]) {
    return exactKey;
  }

  // Tolerance fallback for slightly-off dimensions (cropped photos, odd sensors)
  const ratio = width / height;
  const match = KNOWN_RATIOS.find(
    (r) => Math.abs(r.value - ratio) / r.value < 0.05,
  );

  return match?.key ?? null;
}
