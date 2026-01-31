# gezegenselcore Yeni Hesaba Geçiş

Eski hesap adı **gezegenselcores**, yeni hesap **gezegenselcore**. Repo ve işlemler yeni hesapta olacak.

---

## A) GitHub’da yapman gerekenler (tarayıcı)

### 1. Repo’yu yeni hesaba taşımak (tercih: transfer)

**Eski hesap (gezegenselcores) ile giriş yap:**

1. **https://github.com/gezegenselcores** (veya repo’nun şu anki sahibi) → **aura-pro-ephemeris-service** repo’suna gir.
2. **Settings** → en altta **Danger Zone** → **Transfer ownership**.
3. **New owner** kutusuna **gezegenselcore** (yeni hesap adı) yaz.
4. Repo adını yazıp onayla; e-posta ile transfer daveti gidebilir.
5. **Yeni hesap (gezegenselcore)** ile giriş yap → daveti kabul et.

**Sonuç:** Repo artık **github.com/gezegenselcore/aura-pro-ephemeris-service** adresinde.

---

### Alternatif: Yeni hesapta sıfırdan repo açıp push

**Yeni hesap (gezegenselcore) ile giriş yap:**

1. **https://github.com/new**
2. **Repository name:** `aura-pro-ephemeris-service`
3. **Public** seç; **README, .gitignore, license ekleme** (boş repo).
4. **Create repository** tıkla.
5. Sayfada çıkan **remote URL**’i kopyala: `https://github.com/gezegenselcore/aura-pro-ephemeris-service.git`

Sonra yerel bilgisayarda (aşağıdaki B adımları) remote’u bu URL’e çevirip push edeceksin.

---

## B) Yerel bilgisayarda (terminal)

Remote zaten **gezegenselcore** hesabına göre ayarlandı. Sadece şunları yap:

### 1. Yeni hesap için token (workflow dahil)

1. **gezegenselcore** hesabıyla **https://github.com/settings/tokens**
2. **Generate new token (classic)** → **repo** + **workflow** işaretle → token’ı kopyala.

### 2. Windows kimlik bilgisi

- **Kimlik Bilgileri Yöneticisi** → **git:https://github.com** (veya **github.com**) → **Düzenle**
- **Kullanıcı adı:** `gezegenselcore`
- **Parola:** az önce kopyaladığın **token**
- Kaydet.

### 3. Push

```powershell
cd d:\GezegenselGames\Aura\aura-pro-ephemeris-service
git remote -v
git push origin main
```

`git remote -v` çıktısında **gezegenselcore/aura-pro-ephemeris-service** görünmeli. Push’tan sonra kod yeni hesaptaki repo’da olacak.

---

## C) Secret’lar (Actions için)

**https://github.com/gezegenselcore/aura-pro-ephemeris-service** → **Settings** → **Secrets and variables** → **Actions**:

- **GOOGLE_APPLICATION_CREDENTIALS_JSON** (service account JSON tam metni)
- **FIREBASE_WEB_API_KEY** (Firebase Web API key)

Bunlar yoksa smoke workflow çalışmaz; ekle.

---

## Özet

**Yapılan (otomatik):** Proje içinde `git remote` **gezegenselcore/aura-pro-ephemeris-service** olarak ayarlandı; tüm dokümanlardaki repo linkleri yeni hesaba güncellendi.

| Adım | Nerede | Ne yapıyorsun |
|------|--------|----------------|
| 1 | Eski hesap (gezegenselcores) | Repo → Settings → Transfer ownership → gezegenselcore |
| 2 | Yeni hesap (gezegenselcore) | Token oluştur (repo + workflow) |
| 3 | Windows | Kimlik bilgisi: kullanıcı gezegenselcore, parola = token |
| 4 | Terminal | `git push origin main` |
| 5 | Yeni hesap repo Settings | Actions secret’ları ekle |
