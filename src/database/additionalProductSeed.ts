// France: ten starter products per additional retail category. Generic names, no brands or sales ranking.
const names: Record<string, string> = {
  greengrocer:
    'Pommes|Bananes|Oranges|Citrons|Tomates|Carottes|Courgettes|Pommes de terre|Oignons|Salade verte',
  butcher:
    'Steaks hachés|Bavette de bœuf|Rôti de bœuf|Blancs de poulet|Poulet entier|Escalopes de dinde|Côtes de porc|Rôti de porc|Côtelettes d’agneau|Saucisses',
  fishmonger:
    'Filets de saumon|Dos de cabillaud|Filets de lieu noir|Truite|Sardines fraîches|Maquereaux|Crevettes|Moules|Huîtres|Noix de Saint-Jacques',
  cheesemonger:
    'Camembert|Brie|Comté|Emmental|Cantal|Reblochon|Roquefort|Chèvre frais|Beurre demi-sel|Crème fraîche',
  grocery:
    'Pâtes|Riz|Farine|Sucre|Huile d’olive|Vinaigre|Sel|Poivre|Lentilles|Thon en conserve',
  organic:
    'Œufs bio|Lait bio|Yaourts nature bio|Pommes bio|Carottes bio|Riz complet bio|Pâtes complètes bio|Lentilles bio|Flocons d’avoine bio|Huile d’olive bio',
  frozen:
    'Haricots verts surgelés|Petits pois surgelés|Épinards surgelés|Mélange de légumes surgelés|Frites surgelées|Filets de poisson surgelés|Crevettes surgelées|Pizza surgelée|Fruits rouges surgelés|Glace',
  wine: 'Vin rouge|Vin blanc sec|Vin blanc moelleux|Vin rosé|Champagne|Crémant|Bière blonde|Bière ambrée|Cidre|Jus de raisin',
  confectionery:
    'Bonbons aux fruits|Caramels|Réglisse|Guimauves|Pâtes de fruits|Nougat|Dragées|Sucettes|Chocolat noir|Chocolat au lait',
  pastry:
    'Éclair au chocolat|Éclair au café|Mille-feuille|Paris-Brest|Flan pâtissier|Tarte aux pommes|Tarte au citron|Fraisier|Macarons|Gâteau au chocolat',
  deli: 'Jambon blanc|Jambon cru|Saucisson sec|Rosette|Rillettes|Pâté de campagne|Terrine de volaille|Boudin noir|Boudin blanc|Lardons',
  catering:
    'Quiche lorraine|Salade de pâtes|Salade de riz|Taboulé|Carottes râpées|Gratin dauphinois|Lasagnes|Poulet rôti|Ratatouille|Couscous',
  market:
    'Tomates|Pommes de terre|Carottes|Salade verte|Pommes|Poires|Œufs|Fromage de chèvre|Miel|Pain de campagne',
  pets: 'Croquettes pour chat|Croquettes pour chien|Pâtée pour chat|Pâtée pour chien|Litière pour chat|Friandises pour chien|Gamelle|Laisse|Jouet pour chat|Sacs à déjections',
  garden:
    'Terreau universel|Compost|Engrais pour plantes|Graines de légumes|Bulbes de fleurs|Pot de fleurs|Jardinière|Gants de jardinage|Sécateur|Arrosoir',
  florist:
    'Bouquet de roses|Bouquet de saison|Tulipes|Lys|Orchidée|Plante verte|Plante fleurie|Fleurs séchées|Vase|Cache-pot',
  stationery:
    'Cahier|Bloc-notes|Stylo bleu|Stylo noir|Crayon à papier|Gomme|Surligneur|Enveloppes|Papier imprimante|Ruban adhésif',
  books:
    'Roman|Roman policier|Livre de poche|Bande dessinée|Manga|Album jeunesse|Livre de cuisine|Guide de voyage|Dictionnaire|Carnet de lecture',
  newsagent:
    'Journal quotidien|Magazine d’actualité|Magazine de cuisine|Magazine de jardinage|Magazine de décoration|Magazine jeunesse|Mots croisés|Mots fléchés|Sudoku|Programme TV',
  toys: 'Puzzle|Jeu de société|Jeu de cartes|Briques de construction|Poupée|Petite voiture|Peluche|Pâte à modeler|Kit de peinture enfant|Ballon',
  baby: 'Couches bébé|Lingettes bébé|Biberon|Tétines de biberon|Sucette bébé|Bavoir|Body bébé|Gigoteuse|Lange|Anneau de dentition',
  clothing:
    'T-shirt|Chemise|Pull|Gilet|Jean|Pantalon|Robe|Veste|Chaussettes|Sous-vêtements',
  shoes:
    'Baskets|Chaussures de ville|Bottines|Sandales|Chaussons|Bottes de pluie|Lacets|Semelles|Cirage|Imperméabilisant chaussures',
  leather:
    'Sac à main|Sac à dos|Sac de voyage|Portefeuille|Porte-monnaie|Porte-cartes|Ceinture|Trousse de toilette|Valise|Porte-clés',
  jewelry:
    'Bague|Collier|Bracelet|Boucles d’oreilles|Pendentif|Chaîne|Montre|Bracelet de montre|Boîte à bijoux|Chiffon pour bijoux',
  perfume:
    'Eau de parfum|Eau de toilette|Déodorant|Gel douche parfumé|Crème hydratante|Rouge à lèvres|Mascara|Fond de teint|Vernis à ongles|Démaquillant',
  optician:
    'Lunettes de vue|Lunettes de soleil|Étui à lunettes|Chiffon microfibre|Spray nettoyant lunettes|Lingettes pour lunettes|Cordon à lunettes|Lentilles de contact|Solution pour lentilles|Étui à lentilles',
  sports:
    'T-shirt de sport|Short de sport|Legging de sport|Chaussettes de sport|Chaussures de running|Gourde|Tapis de fitness|Élastique de musculation|Ballon de football|Lunettes de natation',
  electronics:
    'Écouteurs|Casque audio|Enceinte Bluetooth|Téléviseur|Câble HDMI|Piles AA|Piles AAA|Chargeur de piles|Télécommande universelle|Carte mémoire',
  computers:
    'Ordinateur portable|Clavier|Souris|Tapis de souris|Écran|Clé USB|Disque dur externe|Câble USB-C|Hub USB|Cartouche d’encre',
  phones:
    'Smartphone|Coque de téléphone|Protection d’écran|Chargeur USB-C|Câble de recharge|Batterie externe|Support de téléphone|Écouteurs sans fil|Chargeur voiture|Adaptateur secteur',
  appliances:
    'Bouilloire|Grille-pain|Cafetière|Mixeur plongeant|Balance de cuisine|Aspirateur|Sacs pour aspirateur|Filtre pour aspirateur|Fer à repasser|Micro-ondes',
  furniture:
    'Chaise|Table|Bureau|Étagère|Bibliothèque|Commode|Table de chevet|Canapé|Matelas|Sommier',
  decoration:
    'Coussin|Housse de coussin|Plaid|Rideaux|Tapis|Cadre photo|Miroir|Bougie|Vase|Lampe de table',
  automotive:
    'Lave-glace|Balais d’essuie-glace|Huile moteur|Liquide de refroidissement|Chiffon microfibre auto|Nettoyant vitres auto|Shampooing auto|Grattoir à givre|Gilet de sécurité|Triangle de signalisation',
  haberdashery:
    'Fil à coudre|Aiguilles à coudre|Épingles|Boutons|Fermeture éclair|Élastique de couture|Ruban|Mètre de couture|Ciseaux de couture|Découd-vite',
};

export const additionalProductSeed = Object.entries(names).flatMap(
  ([category, values]) =>
    values.split('|').map((name, sortOrder) => ({ category, name, sortOrder })),
);
