interface TranslateResponse {
  translatedText: string;
  alternatives?: string[];
}

export async function translateText(
  text: string,
  sourceLang: 'tr' | 'en',
  targetLang: 'tr' | 'en'
): Promise<string> {
  // If source and target are the same, return as-is
  if (sourceLang === targetLang) {
    return text;
  }

  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
        api_key: '', // LibreTranslate free tier doesn't require API key
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('Translation API error:', response.status, response.statusText);
      // Return original text if translation fails
      return text;
    }

    const data = (await response.json()) as TranslateResponse;
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation failed:', error);
    // Return original text if translation fails
    return text;
  }
}

export async function translateCategoryName(
  name: string,
  currentLang: 'tr' | 'en'
): Promise<{ nameTr: string; nameEn: string }> {
  const otherLang = currentLang === 'tr' ? 'en' : 'tr';
  const translatedName = await translateText(name, currentLang, otherLang);

  if (currentLang === 'tr') {
    return {
      nameTr: name,
      nameEn: translatedName,
    };
  } else {
    return {
      nameTr: translatedName,
      nameEn: name,
    };
  }
}
