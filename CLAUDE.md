# Yakınla video projeleri

## Seslendirme (dış ses)

- Seslendirme her zaman **ElevenLabs** ile yapılır: claude.ai'daki **ElevenLabs** bağlayıcısının
  `mcp__ElevenLabs__creative_generate_speech` aracı. Higgsfield ya da başka bir TTS kullanılmaz.
  Bu kural, `yakinla-tanitim-videosu` skill'indeki seslendirme adımının yerine geçer; skill'in
  senaryo, sahne ve montaj adımları aynen uygulanır.
- **Ses tarzı: doğal ve enerjik.** Samimi, gülümseyen, hızlı akan bir okuma; bağıran reklam spikeri
  tonu değil. Metin `[excited]` ile açılır, sıcak kapanışlarda `[happy]` kullanılır, vurgulu cümleler
  ünlemle biter.
- Ses: **Dilara** (`D2dHiTSPRx6l2bhKGmyJ`, kadın, Türkçe). Başka bir ses gerekirse
  `creative_list_voices` ile `languages: ["tr"]` filtresiyle seçilir. Model `eleven_v4`'tür.
- Üretim akışı:
  1. `creative_generate_speech` → dönen `flow_id` ve `session_ids` saklanır.
  2. `creative_get_flow_run_status` ile `all_completed` olana kadar beklenir.
  3. `creative_get_generations` → `full_res_url` (storage.googleapis.com) `curl` ile projenin
     `build/vo/` klasörüne indirilir. `build/` git'e girmez; ses yalnızca montajlanmış MP4'ün
     içinde depoya girer.
- Her üretim ElevenLabs kredisi harcar. Metin kesinleşmeden ses üretilmez. Üretim çağrısı hata verirse
  aynı çağrı tekrarlanmaz (ikinci kez ücretlendirir): `creative_get_flow` ile düğüm `not_run` ise
  `creative_run_flow_nodes` ile aynı düğüm yeniden çalıştırılır.
- Bu ElevenLabs hesabı aynı anda tek üretime izin veriyor: varsayılan iki kayıttan ikincisi `429`
  ile düşer. `generations_count: 1` verilir; ikinci bir okuma gerekirse ilki bittikten sonra istenir.
  Tek kayıtta da arka arkaya isteklerde `429` gelebilir; düğüm `not_run` kalır ve kısa bir aradan
  sonra `creative_run_flow_nodes` ile çalıştırılır.
- Montajda dış ses müziğin üstünde kalır (müzik konuşma altında kısılır), son miks -14 LUFS'tur.

## ElevenLabs bağlantısı

- Bağlayıcı adresi `https://api.elevenlabs.io/v1/mcp`, giriş ElevenLabs hesabıyla (OAuth) yapılır.
  Trafik Anthropic sunucularından geçtiği için bulut ortamında API anahtarı ya da ağ izni gerekmez.
- Bulut ortamı `api.elevenlabs.io`'ya doğrudan erişemez; yerel `elevenlabs-mcp` sunucusu bu yüzden
  kullanılmaz. API anahtarı hiçbir dosyaya, commit'e ya da PR'a yazılmaz.
