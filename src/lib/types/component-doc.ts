export type ComponentDocType =
  | 'overview'
  | 'props'
  | 'examples'
  | 'best-practices'
  | 'types'
  | 'theme-usage'
  | 'anti-patterns';

export type ComponentCategory =
  | 'layout'
  | 'typography'
  | 'form'
  | 'dialog'
  | 'card'
  | 'button'
  | 'image'
  | 'list'
  | 'navigation'
  | 'helper'
  | 'feedback'
  | 'overlay'
  | 'misc';

export type UsagePriority = 'high' | 'medium' | 'low';
export type RecordStatus = 'seed' | 'inferred' | 'verified';

export interface ComponentPropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue: unknown;
  description: string;
}

export interface ComponentVariantDoc {
  name: string;
  propName?: string | null;
  values: string[];
  description: string;
}

export interface ComponentThemeUsageDoc {
  colors: string[];
  sizes: string[];
  spacing: string[];
  radii: string[];
  typography: string[];
  notes: string[];
}

export interface ComponentExampleDoc {
  title: string;
  description: string;
  code: string;
}

export interface ComponentTypeDefinitionDoc {
  name: string;
  kind?: string | null;
  signature?: string | null;
  summary?: string | null;
}

export interface ComponentRecordMetadata {
  platform?: Array<'react-native' | 'ios' | 'android' | 'web'>;
  packageName: string;
  extractionConfidence: number;
  lastUpdatedFromSource?: string;
  sourcePriority?: string[];
  docsCodeMismatch?: boolean;
  docsCodeMismatchNotes?: string[];
  notes?: string[];
}

export interface ComponentDocRecord {
  id: string;
  componentName: string;
  category: ComponentCategory;
  importPath: string;
  exportName: string;
  docType: ComponentDocType;
  summary: string;
  whenToUse: string[];
  whenNotToUse: string[];
  props: ComponentPropDoc[];
  variants: ComponentVariantDoc[];
  themeUsage: ComponentThemeUsageDoc;
  examples: ComponentExampleDoc[];
  bestPractices: string[];
  antiPatterns: string[];
  relatedComponents: string[];
  retrievalKeywords: string[];
  composesWith: string[];
  generationHints: string[];
  usagePriority: UsagePriority;
  status: RecordStatus;
  tags: string[];
  sourceFiles: string[];
  typeDefinitions: Array<string | ComponentTypeDefinitionDoc>;
  embeddingText?: string;
  rawContent?: string;
  metadata: ComponentRecordMetadata;
}

export interface ComponentDocCollection {
  schemaVersion: string;
  generatedAt: string;
  records: ComponentDocRecord[];
}