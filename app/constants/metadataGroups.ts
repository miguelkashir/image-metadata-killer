export interface MetadataGroupDef {
  id: string;
  label: string;
  description: string;
  /** Tailwind color token, e.g. "red", "cyan" */
  color: string;
  keys: Set<string>;
}

export const METADATA_GROUPS: MetadataGroupDef[] = [
  {
    id: "location",
    label: "Location",
    description:
      "GPS coordinates and location data — can pinpoint exactly where the photo was taken.",
    color: "red",
    keys: new Set([
      "GPSVersionID", "GPSLatitudeRef", "GPSLatitude", "GPSLongitudeRef",
      "GPSLongitude", "GPSAltitudeRef", "GPSAltitude", "GPSTimeStamp",
      "GPSSatellites", "GPSStatus", "GPSMeasureMode", "GPSDOP", "GPSSpeedRef",
      "GPSSpeed", "GPSTrackRef", "GPSTrack", "GPSImgDirectionRef",
      "GPSImgDirection", "GPSMapDatum", "GPSDestLatitudeRef", "GPSDestLatitude",
      "GPSDestLongitudeRef", "GPSDestLongitude", "GPSDestBearingRef",
      "GPSDestBearing", "GPSDestDistanceRef", "GPSDestDistance",
      "GPSProcessingMethod", "GPSAreaInformation", "GPSDateStamp",
      "GPSDifferential", "GPSHPositioningError",
    ]),
  },
  {
    id: "camera",
    label: "Camera",
    description:
      "The device and lens used. May include serial numbers that can be traced back to you.",
    color: "cyan",
    keys: new Set([
      "Make", "Model", "LensMake", "LensModel", "LensInfo", "LensSerialNumber",
      "SerialNumber", "BodySerialNumber", "CameraSerialNumber",
      "InternalSerialNumber", "OwnerName", "HostComputer",
    ]),
  },
  {
    id: "capture",
    label: "Capture settings",
    description:
      "Technical details from the moment the shot was taken: aperture, shutter speed, ISO, and more.",
    color: "purple",
    keys: new Set([
      "ExposureTime", "FNumber", "ExposureProgram", "ExposureMode",
      "ExposureCompensation", "ExposureBiasValue", "Flash", "MeteringMode",
      "LightSource", "WhiteBalance", "WhiteBalanceMode", "Sharpness",
      "Saturation", "Contrast", "GainControl", "CustomRendered",
      "SceneCaptureType", "SceneType", "ShutterSpeedValue", "ApertureValue",
      "BrightnessValue", "MaxApertureValue", "FocalLength",
      "FocalLengthIn35mmFormat", "DigitalZoomRatio", "SubjectDistance",
      "SubjectDistanceRange", "SensingMethod", "CFAPattern", "FileSource",
      "SubjectArea", "FlashEnergy", "ISO", "ISOSpeedRatings",
      "FocalPlaneXResolution", "FocalPlaneYResolution",
      "FocalPlaneResolutionUnit", "MeasureMode",
    ]),
  },
  {
    id: "timestamps",
    label: "Timestamps",
    description:
      "When the photo was taken, edited, or digitized.",
    color: "yellow",
    keys: new Set([
      "DateTimeOriginal", "CreateDate", "ModifyDate", "DateTime",
      "DateTimeDigitized", "OffsetTime", "OffsetTimeOriginal",
      "OffsetTimeDigitized", "SubSecTime", "SubSecTimeOriginal",
      "SubSecTimeDigitized", "DateCreated", "TimeCreated",
      "DigitalCreationDate", "DigitalCreationTime", "ReleaseDate", "ReleaseTime",
    ]),
  },
  {
    id: "software",
    label: "Software",
    description:
      "Applications that created or processed the image.",
    color: "green",
    keys: new Set([
      "Software", "ProcessingSoftware", "OriginatingProgram", "ProgramVersion",
      "Converter", "ColorSpace", "ComponentsConfiguration", "ProcessingMethod",
      "ApplicationRecordVersion",
    ]),
  },
  {
    id: "author",
    label: "Author & rights",
    description:
      "Creator attribution, contact details, and copyright claims.",
    color: "pink",
    keys: new Set([
      "Artist", "Copyright", "CopyrightNotice", "Creator", "Rights",
      "UserComment", "ImageDescription", "Credit", "Source", "Contact",
      "Caption", "Headline", "Byline", "BylineTitle", "Writer", "Country",
      "City", "State", "ObjectName", "Category", "Keywords", "Urgency",
      "ObjectTypeReference", "EditStatus", "ContentLocationCode",
      "ContentLocationName", "LanguageIdentifier", "ImageType",
      "ImageOrientation", "AudioType",
    ]),
  },
  {
    id: "structure",
    label: "Image properties",
    description:
      "Structural data baked into the file format — these cannot be stripped.",
    color: "muted",
    keys: new Set([
      "ImageWidth", "ImageHeight", "BitDepth", "ColorType", "Compression",
      "Filter", "Interlace", "JFIFVersion", "ResolutionUnit", "XResolution",
      "YResolution", "ThumbnailWidth", "ThumbnailHeight", "ColorComponents",
      "EncodingProcess", "YCbCrSubSampling", "Orientation", "BitsPerSample",
      "SamplesPerPixel", "PhotometricInterpretation", "RowsPerStrip",
      "YCbCrCoefficients", "YCbCrPositioning",
    ]),
  },
];

/** Fallback group for keys that don't match any known group. */
export const OTHER_GROUP: MetadataGroupDef = {
  id: "other",
  label: "Other",
  description: "Additional metadata that doesn't fit a specific category.",
  color: "orange",
  keys: new Set(),
};
