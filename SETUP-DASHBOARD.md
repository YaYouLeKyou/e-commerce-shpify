pu# 🛠️ Guide de Configuration du Dashboard Shopify + Sanity + Vercel

## 🛠️ Étape 1 : Configuration du Dashboard Shopify

Puisque Shopify gère le catalogue, les stocks, le paiement et les commandes, vous devez préparer votre espace administrateur :

### Créer le compte Shopify
- Activer la boutique (ou utiliser un compte Shopify Partner gratuit pour le développement).

### Créer une "Custom App" (pour les accès Headless)
1. Dans l'admin Shopify, aller dans **Paramètres > Applications et canaux de vente > Développer des applications**.
2. Créer une application personnalisée (ex: "Nextjs Storefront").
3. Dans l'onglet **Configuration** de l'API Headless / Storefront API, accorder les autorisations nécessaires :
   - `unauthenticated_read_product_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_collections`
4. Récupérer le **Storefront API Access Token** et l'**URL du shop** (nécessaires pour le `.env.local`).

### Configurer le Checkout & Paiement
- Activer **Shopify Payments** ou **Stripe** dans Shopify.
- Définir les zones d'expédition, frais de port, devises et règles de taxes.

### Configurer les Webhooks Shopify
- Dans **Paramètres > Notifications > Webhooks**, ajouter un webhook sur l'événement **"Mise à jour de produit"** poinçant vers votre URL de production :
  - [https://votre-site.com/api/revalidate/shopify](https://votre-site.com/api/revalidate/shopify)
  - Avec un **secret partagé**.

---

## 🎨 Étape 2 : Configuration du Dashboard Sanity.io

Sanity gère le contenu de la vitrine (bannières, textes de marque, blog) :

### Créer un compte Sanity
- Sur [sanity.io](https://sanity.io).

### Créer un Projet & Dataset
- Noter le **Project ID** et définir le dataset sur **production**.

### Configurer les règles CORS
1. Dans le dashboard Sanity, aller dans **API Settings > CORS Origins**.
2. Autoriser `http://localhost:3000` (pour le dev) et plus tard votre domaine de production.

### Générer les Tokens & Webhooks
- Générer un **API Read Token** (si le dataset est privé).
- Configurer le **Webhook Sanity** vers [https://votre-site.com/api/revalidate/sanity](https://votre-site.com/api/revalidate/sanity) lors de la publication d'un document.

---

## 🚀 Étape 3 : Déploiement & Hébergement (Vercel)

Next.js 15 s'héberge idéalement sur Vercel :

### Lier le dépôt GitHub à Vercel
- Importer votre projet Next.js.

### Renseigner les Variables d'Environnement
Copier le contenu du fichier `.env.local` dans l'interface Vercel :

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Domaine de la boutique Shopify |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Token d'accès Storefront API |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project ID de Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset de Sanity (ex: `production`) |
| `REVALIDATE_SECRET` | À créer vous-même pour sécuriser les revalidations |

### Connecter le Nom de Domaine
- Acheter un domaine (ex: OVH, Namecheap) et pointer les enregistrements DNS (**CNAME** et **A**) vers Vercel.

---

## 📋 Étape 4 : Saisie des Contenus & Produits (Dans les Back-offices)

Cline crée l'interface, mais c'est à vous (ou à votre client) d'alimenter la base de données :

### Dans Shopify
- Renseigner les fiches produits réelles (titres, prix, images, variantes de taille/couleur, stocks).
- Créer les collections (ex: "Nouveautés", "Meilleures ventes").

### Dans Sanity (via la route `/studio` du site)
- Créer la première **bannière Hero** pour la page d'accueil (titre, sous-titre, image HD).
- Rédiger les premiers **articles de blog** / textes de présentation de la marque.

---

## ⚖️ Étape 5 : Légal, RGPD & E-mails

### Pages légales
- Ajouter les textes des **CGV**, **Mentions Légales** et **Politique de Confidentialité** dans Sanity pour les afficher en footer.

### Bannière Cookies
- Installer une solution de consentement (ex: **Axeptio**) pour être conforme RGPD.

### E-mails transactionnels
- La confirmation de commande et le suivi de livraison sont envoyés automatiquement par Shopify : pensez à **personnaliser les templates e-mail** avec votre logo et vos couleurs directement dans l'admin Shopify.
