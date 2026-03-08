export function buildGenerationPrompt(userPrompt, components) {
  const componentSummary = components
    .map((c, index) => {
      const props = Array.isArray(c.props)
        ? c.props
            .map((p) => `${p.name}: ${p.type}${p.description ? ` — ${p.description}` : ''}`)
            .join(' | ')
        : '';

      const variants = Array.isArray(c.variants)
        ? c.variants
            .map((v) => `${v.name}: ${(v.values || []).join(', ')}`)
            .join(' | ')
        : '';

      return `${index + 1}. ${c.component_name}
Category: ${c.category}
Import path: ${c.import_path}
Summary: ${c.embedding_text || c.raw_content || ''}
Props: ${props}
Variants: ${variants}
Generation hints: ${Array.isArray(c.generation_hints) ? c.generation_hints.join(' | ') : ''}
`;
    })
    .join('\n\n');

  return `
You are generating a React Native screen using the fluent-styles package.

User request:
${userPrompt}

Retrieved fluent-styles components:
${componentSummary}

Core rules:
- Prefer fluent-styles components over raw React Native primitives whenever possible
- Prefer declarative component props over style objects whenever the component supports them
- Use theme tokens wherever possible
- Do not invent unsupported props
- Return only code
- Export default the screen component

Language rules:
- Generate plain JavaScript React Native code
- Do not output TypeScript syntax unless explicitly generating TypeScript
- If generating JavaScript, do not use type annotations, \`as\`, interfaces, or typed function params

Import rules:
- Import package components from "fluent-styles"
- Import theme from "fluent-styles" when theme tokens are used
- Prefer package scroll components over raw React Native ScrollView when available
- Do not import ScrollView from fluent-styles
- Use StyledScrollView from fluent-styles for vertical scrolling
- Use HorizontalScrollView from fluent-styles for horizontal scrolling
- Pressable may be imported from fluent-styles
- Do not invent export names that are not present in the retrieved docs or src/index.ts

Hard bans:
- Do not import ScrollView from react-native
- Do not import Pressable from react-native
- Do not import ScrollView from fluent-styles
- Do not use <ScrollView>
- Use <StyledScrollView> for vertical scroll containers

Declarative syntax rules:
- For StyledText, use declarative props instead of style for:
  - color
  - fontWeight
  - fontSize
  - textAlign
  - fontFamily
- For Stack, XStack, YStack, and StyledCard, use declarative props instead of style for:
  - padding
  - paddingHorizontal
  - paddingVertical
  - margin
  - marginHorizontal
  - marginVertical
  - backgroundColor
  - borderRadius
  - alignItems
  - justifyContent
  - gap
  - width
  - height
  - flex
- Only use style={{ ... }} for properties that are not supported declaratively or for rare edge cases

Hard bans:
- Do not write style={{ color: ... }} on StyledText
- Do not write style={{ fontWeight: ... }} on StyledText
- Do not write style={{ fontSize: ... }} on StyledText
- Do not write style={{ textAlign: ... }} on StyledText
- Do not write style={{ padding: ... }} on XStack, YStack, Stack, or StyledCard when padding prop can be used
- Do not write style={{ backgroundColor: ... }} on XStack, YStack, Stack, or StyledCard when backgroundColor prop can be used
- Do not write style={{ borderRadius: ... }} on XStack, YStack, Stack, or StyledCard when borderRadius prop can be used

Theme usage rules:
- Prefer:
  - color={theme.colors.gray[800]}
  - color={theme.colors.blue[500]}
  - fontWeight={theme.fontWeight.bold}
  - fontWeight={theme.fontWeight.medium}
  - fontSize={theme.fontSize.normal}
  - fontSize={theme.fontSize.large}
- Use hex colors only when a theme token is clearly not available

Verified dialog prop rules:
- StyledConfirmDialog supports:
  visible, title, description, cancelLabel, confirmLabel, neutralLabel, showNeutral, row, onCancel, onConfirm, onNeutral, animationType, dialogProps
- StyledOkDialog supports:
  visible, title, description, okLabel, onOk, animationType, dialogProps
- Do not use:
  - message
  - destructive
  - any undocumented dialog prop

Preferred examples:

Good:
<StyledText
  color={theme.colors.gray[800]}
  fontWeight={theme.fontWeight.bold}
  fontSize={theme.fontSize.large}
>
  Revenue
</StyledText>

Bad:
<StyledText style={{ color: '#334155', fontWeight: '700', fontSize: 20 }}>
  Revenue
</StyledText>

Good:
<StyledCard padding={16} borderRadius={12} backgroundColor={theme.colors.gray[50]}>
  <YStack gap={12}>
    <StyledText
      color={theme.colors.gray[900]}
      fontWeight={theme.fontWeight.bold}
      fontSize={theme.fontSize.large}
    >
      Card Title
    </StyledText>
  </YStack>
</StyledCard>

Bad:
<StyledCard style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff' }}>
  ...
</StyledCard>

Good:
<XStack alignItems="center" justifyContent="space-between" gap={8}>
  <StyledText color={theme.colors.gray[700]}>Orders</StyledText>
</XStack>

Bad:
<XStack style={{ alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
  ...
</XStack>

Generation requirements:
- Build a clean production-style screen
- Use YStack for vertical layout
- Use XStack for horizontal groups
- Use StyledCard for panels and dashboard tiles
- Use StyledText for all text
- Use StyledInput for search fields and simple inputs
- Use StyledConfirmDialog only with verified props
- Use StyledOkDialog only with verified props
- Keep the code package-first and declarative

Before returning code, perform this self-check:
- Did I use style on StyledText for color, fontWeight, fontSize, or textAlign? If yes, rewrite declaratively.
- Did I use style on XStack, YStack, Stack, or StyledCard for padding, gap, backgroundColor, borderRadius, alignItems, or justifyContent? If yes, rewrite declaratively.
- Did I use message instead of description on dialog components? If yes, fix it.
- Did I output TypeScript syntax in JavaScript output? If yes, remove it.
- Did I invent unsupported props? If yes, remove them.

Return only the final React Native code.
`;
}