import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { searchComponents } from '../../../lib/rag/searchComponents';
import { buildGenerationPrompt } from '../../../lib/rag/buildGenerationPrompt';
import { validateGeneratedCode } from '../../../lib/validateGeneratedCode';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const components = await searchComponents(prompt, 8);
    const fullPrompt = buildGenerationPrompt(prompt, components);

    const response = await openai.responses.create({
      model: 'gpt-5',
      input: fullPrompt,
    });

    const code =
      response.output_text || 'No code returned';

    const validation = validateGeneratedCode(code);

    let finalCode = code;
    let finalValidation = validation;

    if (!validation.valid) {
      const repairPrompt = `
      The previous generated React Native code failed validation.

      Validation issues:
      ${validation.issues.map((i) => `- ${i}`).join('\n')}

      Rewrite the code to fix all issues.

      Rules:
      - Return only code
      - Do not use ScrollView from react-native
      - Do not use Pressable from react-native
      - Use fluent-styles exports instead
      - Keep declarative props
      - Do not introduce TypeScript syntax
      - Keep the same screen behavior
      `;

      const repairResponse = await openai.responses.create({
        model: 'gpt-5',
        input: `${fullPrompt}\n\nPrevious code:\n${code}\n\n${repairPrompt}`,
      });

      finalCode = repairResponse.output_text || code;
      finalValidation = validateGeneratedCode(finalCode);
    }

    return NextResponse.json({
      ok: true,
      prompt,
      matchedComponents: components.map((c) => ({
        id: c.id,
        componentName: c.component_name,
        category: c.category,
        similarity: c.similarity,
      })),
      code: finalCode,
      validation: finalValidation,
    });
  } catch (error) {
    console.error('Generate screen failed:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Generate screen failed',
      },
      { status: 500 }
    );
  }
}