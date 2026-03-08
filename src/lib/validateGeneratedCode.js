export function validateGeneratedCode(code) {
  const issues = [];

  if (/import\s*\{\s*[^}]*ScrollView[^}]*\}\s*from\s*['"]react-native['"]/.test(code)) {
    issues.push('Raw React Native ScrollView used instead of package scroll component');
  }

  if (/import\s*\{\s*[^}]*Pressable[^}]*\}\s*from\s*['"]react-native['"]/.test(code)) {
    issues.push('Raw React Native Pressable used instead of package Pressable');
  }

  if (/<StyledText[^>]*style=\{\{[^}]*color:/s.test(code)) {
    issues.push('StyledText uses style.color instead of color prop');
  }

  if (/<StyledText[^>]*style=\{\{[^}]*fontWeight:/s.test(code)) {
    issues.push('StyledText uses style.fontWeight instead of fontWeight prop');
  }

  if (/<StyledText[^>]*style=\{\{[^}]*fontSize:/s.test(code)) {
    issues.push('StyledText uses style.fontSize instead of fontSize prop');
  }

  if (/<StyledText[^>]*style=\{\{[^}]*textAlign:/s.test(code)) {
    issues.push('StyledText uses style.textAlign instead of textAlign prop');
  }

  if (/<(?:XStack|YStack|Stack|StyledCard)[^>]*style=\{\{[^}]*padding:/s.test(code)) {
    issues.push('Layout component uses style.padding instead of declarative prop');
  }

  if (/<(?:XStack|YStack|Stack|StyledCard)[^>]*style=\{\{[^}]*backgroundColor:/s.test(code)) {
    issues.push('Layout component uses style.backgroundColor instead of declarative prop');
  }

  if (/<(?:XStack|YStack|Stack|StyledCard)[^>]*style=\{\{[^}]*borderRadius:/s.test(code)) {
    issues.push('Layout component uses style.borderRadius instead of declarative prop');
  }

  if (/<(?:Stack|XStack|YStack|StyledCard)[^>]*style=\{\{[^}]*flex:/s.test(code)) {
    issues.push('Layout component uses style.flex instead of flex prop');
  }

  if (code.includes('null as null |')) {
    issues.push('TypeScript-only syntax found in JS output');
  }

  if (/useState\(null as .*?\)/.test(code)) {
    issues.push('Invalid TS annotation inside useState for JS output');
  }

  if (/\bmessage=/.test(code)) {
    issues.push('Dialog uses message= instead of description=');
  }

  if (/\bdestructive\b/.test(code)) {
    issues.push('Unsupported dialog prop destructive found');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}