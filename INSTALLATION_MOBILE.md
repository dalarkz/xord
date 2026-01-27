# 📱 Guide d'Installation Mobile - Carte Chasse Québec

## ⭐ Option 1: Transfert Direct (RECOMMANDÉ - Fonctionne Hors Ligne)

### Android
1. Connectez votre téléphone Android à votre PC via USB
2. Activez le "Transfert de fichiers" sur votre téléphone
3. Copiez le dossier complet `quebec-hunting-map` vers:
   - `Documents/` ou `Download/` de votre téléphone
4. Sur votre téléphone, ouvrez **Chrome** ou **Firefox**
5. Allez dans "Fichiers" et naviguez vers le dossier
6. Ouvrez `index.html`
7. ✅ **Fonctionne même sans Internet!**

### iPhone/iPad
1. Connectez votre iPhone à votre PC
2. Ouvrez **iTunes** (Windows) ou **Finder** (Mac)
3. Sélectionnez votre appareil
4. Allez dans "Partage de fichiers"
5. Ajoutez le dossier à une app comme "Fichiers" ou "Documents"
6. Sur votre iPhone, ouvrez **Safari**
7. Naviguez vers le fichier `index.html`
8. ✅ **Fonctionne même sans Internet!**

### 📲 Installer comme Application (PWA)
Une fois le fichier ouvert dans le navigateur:

**Sur Android (Chrome):**
1. Appuyez sur les 3 points ⋮ en haut à droite
2. Sélectionnez "Ajouter à l'écran d'accueil"
3. L'icône 🦌 apparaîtra sur votre écran d'accueil

**Sur iPhone (Safari):**
1. Appuyez sur le bouton Partager 📤
2. Sélectionnez "Sur l'écran d'accueil"
3. L'icône 🦌 apparaîtra sur votre écran d'accueil

---

## 🌐 Option 2: Hébergement en Ligne (Accès Partout)

### A) Netlify Drop (Le Plus Rapide)
1. Allez sur: https://app.netlify.com/drop
2. Glissez-déposez votre dossier `quebec-hunting-map`
3. Vous obtenez une URL: `https://random-name.netlify.app`
4. Ouvrez cette URL sur votre mobile
5. ✅ **Accessible de n'importe où avec Internet**

### B) GitHub Pages (Permanent et Gratuit)
1. Créez un compte sur https://github.com
2. Créez un nouveau repository "quebec-hunting-map"
3. Uploadez tous vos fichiers
4. Dans Settings → Pages, activez GitHub Pages
5. Votre URL: `https://votre-nom.github.io/quebec-hunting-map`
6. ✅ **URL permanente, gratuite**

---

## 🏠 Option 3: Serveur Local WiFi (Même Réseau)

Si votre PC et mobile sont sur le même WiFi:

1. **Sur votre PC**, ouvrez PowerShell dans le dossier du projet:
   ```powershell
   cd "C:\Users\nekro\OneDrive\Bureau\webapps\quebec-hunting-map"
   npx -y http-server -p 8000
   ```

2. **Trouvez l'IP de votre PC**:
   ```powershell
   ipconfig
   ```
   Notez l'adresse IPv4 (ex: `192.168.1.100`)

3. **Sur votre mobile**, ouvrez le navigateur et allez à:
   ```
   http://192.168.1.100:8000
   ```

4. ✅ **Fonctionne tant que le PC est allumé**

---

## 🎯 Recommandation

**Pour la chasse en forêt (sans Internet):**
→ Utilisez **Option 1** (Transfert Direct)

**Pour partager avec d'autres chasseurs:**
→ Utilisez **Option 2B** (GitHub Pages)

**Pour tester rapidement:**
→ Utilisez **Option 3** (Serveur Local)

---

## ⚠️ Important

- Autorisez la géolocalisation quand demandé
- Sur mobile, le GPS sera plus précis qu'sur PC
- Les données WMS nécessitent Internet (sauf si en cache)
- Vos repères personnels fonctionnent hors ligne

## 📞 Besoin d'Aide?

Consultez le fichier `README.md` pour plus d'informations.
