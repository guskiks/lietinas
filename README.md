# Lietiņas

## GitHub Pages PWA

Mape `Lietinas-PWA` ir instalējama PWA versija. Workflow `Lietiņas PWA Pages` to automātiski publicē GitHub Pages.

PWA izmanto tikai ierīces pārlūka `localStorage`: dati netiek sūtīti uz serveri, API vai GitHub un nav publiski. Dzēšot pārlūka vietnes datus, lokālie dati var tikt zaudēti.

Native SwiftUI personal planner for iOS 17, in Latvian. Uses SwiftData, UserNotifications and Files folder backups. Bundle identifier: `lv.lietinas.app`.

## GitHub Actions IPA

1. Izveido GitHub repository un augšupielādē visu `Lietinas` mapes saturu.
2. GitHub atver **Actions → Lietiņas iOS IPA → Run workflow** (vai vienkārši izdari push uz `main`).
3. Pēc workflow pabeigšanas atver konkrēto run un lejupielādē artifact `Lietinas-unsigned-ipa`.

Workflow automātiski palaiž testus, izveido Release iPhone build un iesaiņo `Lietinas-unsigned.ipa`. Apple neļauj GitHub bez tava sertifikāta izveidot instalējamu signed IPA, tāpēc šis fails ir paredzēts Sideloadly — Sideloadly to automātiski paraksta ar tavu Apple ID.

## Local build
Open `Lietinas.xcodeproj` on macOS with Xcode 15 or newer, choose an iOS 17 simulator/device, then Build & Run.

## Sideloadly
Lejupielādē GitHub Actions artifact, atver Sideloadly, ievelc `Lietinas-unsigned.ipa`, ievadi Apple ID, pievieno iPhone un spied **Start**. Nekādi sertifikāti vai manuāla Xcode konfigurācija nav nepieciešama. Bundle identifier remains stable.

## Backups
Profile → Datu drošība → Izvēlēties backup mapi. Choose an iCloud Drive or local Files folder. The app creates versioned JSON backups and can also create one manually. Keep the folder outside the app; after reinstall select it again if iOS asks for authorization.
