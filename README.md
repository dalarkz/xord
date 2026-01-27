# 🦌 Carte Interactive de Chasse - Québec

Application web interactive pour visualiser les zones de chasse et terres publiques du Québec.

## 🎯 Fonctionnalités

### Données Officielles (WMS)
- **👑 Terres de la Couronne** - Terres publiques/privées (MFFP)
- **🎯 Zones de Chasse** - 29 zones officielles (MERN)
- **🌲 Forêts Publiques** - Forêts provinciales/fédérales (MFFP)
- **🏕️ ZEC** - Zones d'exploitation contrôlée (MERN)
- **🦌 Réserves Fauniques** - Réserves officielles (MERN)

### Repères Personnalisés
Ajoutez vos propres pins avec icônes personnalisées:
- 🦌 Orignal
- 🐻 Ours
- 🦃 Dindon Sauvage
- 🦆 Canard/Sauvagine
- 🦌 Cerf de Virginie
- 🏹 Cache/Stand
- ⛺ Campement
- 📍 Piste/Trace
- 📸 **NOUVEAU:** Ajoutez des photos à vos repères!

### Outils de Mesure
- 📏 **Mesure de distance** - Tracez et mesurez des distances sur la carte
- Affichage en mètres et kilomètres
- Mesure multi-points

### Météo en Temps Réel
- ☁️ **Widget météo** basé sur votre position GPS
- Température actuelle
- Conditions météo
- 💨 **Vitesse et direction du vent** (essentiel pour la chasse!)
- ☀️ Heures de lever/coucher du soleil
- Mise à jour automatique

### Autres Fonctionnalités
- 📍 **GPS en temps réel** - Position automatique
- 🗺️ **Vue Satellite** - Basculer entre carte et satellite
- 💾 **Sauvegarde locale** - Vos repères persistent
- 📱 **Responsive** - Fonctionne sur mobile

## 🚀 Utilisation

1. Ouvrez `index.html` dans votre navigateur
2. Activez/désactivez les couches dans le contrôle en haut à droite
3. Cliquez "Ajouter un Repère" pour marquer un emplacement
4. Vos repères sont sauvegardés automatiquement

## 📁 Structure du Projet

```
quebec-hunting-map/
├── index.html              # Page principale
├── script.js               # Logique de la carte
├── style.css               # Styles
├── ping_orignal-removebg-preview.png
├── ping_ours-removebg-preview.png
├── ping_dindon-removebg-preview.png
└── ping_canard-removebg-preview.png
```

## 🔗 Sources de Données

- **MERN** - Ministère de l'Énergie et des Ressources naturelles
  - `https://servicesvecto3.mern.gouv.qc.ca/geoserver/SmartFaunePub/ows`
  
- **MFFP** - Ministère des Forêts, de la Faune et des Parcs
  - `https://servicescarto.mffp.gouv.qc.ca/pes/services/`

## ⚠️ Avertissement

Vérifiez toujours la réglementation locale avant de chasser. Cette carte est fournie à titre informatif seulement.

## 🛠️ Technologies

- Leaflet.js 1.9.4
- WMS (Web Map Service)
- LocalStorage API
- Geolocation API

---

Créé pour les chasseurs du Québec 🇨🇦
