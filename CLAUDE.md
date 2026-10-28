# Yakınla video projeleri

## Seslendirme (dış ses)

- Seslendirme her zaman **ElevenLabs** ile yapılır: `mcp__elevenlabs__text_to_speech`.
  Higgsfield ya da başka bir TTS kullanılmaz. Bu kural, `yakinla-tanitim-videosu` skill'indeki
  seslendirme adımının yerine geçer; skill'in senaryo, sahne ve montaj adımları aynen uygulanır.
- `language: "tr"` mutlaka verilir (araç varsayılan olarak `en` kullanır).
  Model `eleven_multilingual_v2`, daha canlı bir okuma gerekirse `eleven_v3`.
- `output_directory` projenin `build/vo/` klasörüdür (araç varsayılan olarak `$HOME/Desktop`'a yazar).
  `build/` git'e girmez; ses yalnızca montajlanmış MP4'ün içinde depoya girer.
- Her üretim ElevenLabs kredisi harcar. Metin kesinleşmeden ses üretilmez, aynı metin gereksiz yere
  yeniden üretilmez.
- Montajda dış ses müziğin üstünde kalır (müzik konuşma altında kısılır), son miks -14 LUFS'tur.

## ElevenLabs bağlantısı

- Sunucu `.mcp.json` içinde tanımlıdır, `.claude/settings.json` onu otomatik onaylar.
- API anahtarı ortamdaki `ELEVENLABS_API_KEY` değişkeninden okunur. Anahtar hiçbir dosyaya,
  commit'e ya da PR'a yazılmaz.
- Bulut ortamının ağ ayarlarında `api.elevenlabs.io` izinli olmalıdır; değilse araçlar
  `403 Forbidden` döner.
