import type { Category } from '../models/Catalog';

// France, curated catalogue v1: 100 generic products per category, not a sales ranking.
const names: Record<Category, string> = {
  supermarket: `Lait demi-écrémé|Œufs|Beurre doux|Beurre demi-sel|Yaourts nature|Yaourts aux fruits|Fromage blanc|Crème fraîche|Emmental râpé|Camembert|
Baguette|Pain de mie|Brioche|Croissants|Pains au lait|Céréales|Flocons d’avoine|Confiture|Miel|Pâte à tartiner|
Bananes|Pommes|Oranges|Clémentines|Poires|Citrons|Raisins|Fraises|Pêches|Kiwis|
Tomates|Carottes|Courgettes|Oignons|Concombre|Salade verte|Pommes de terre|Poireaux|Champignons|Poivrons|
Blancs de poulet|Steaks hachés|Jambon blanc|Lardons|Saucisses|Côtes de porc|Escalopes de dinde|Saumon|Cabillaud|Tofu|
Pâtes|Riz|Semoule|Farine|Sucre|Sel|Poivre|Huile d’olive|Huile de tournesol|Vinaigre|
Thon en conserve|Sardines en conserve|Tomates concassées|Sauce tomate|Maïs en conserve|Petits pois en conserve|Haricots verts en conserve|Lentilles|Pois chiches|Moutarde|
Mozzarella|Chèvre|Comté|Pâte feuilletée|Pâte brisée|Pizza surgelée|Frites surgelées|Épinards surgelés|Poisson pané|Glace|
Eau plate|Eau gazeuse|Jus d’orange|Cola|Café|Thé|Chocolat en poudre|Biscuits|Chocolat|Chips|
Papier toilette|Essuie-tout|Lessive|Liquide vaisselle|Pastilles lave-vaisselle|Sacs-poubelle|Nettoyant multi-usages|Savon|Shampooing|Dentifrice`,
  bakery: `Baguette|Baguette tradition|Baguette aux céréales|Baguette complète|Ficelle|Flûte|Pain de campagne|Pain complet|Pain de seigle|Pain au levain|
Pain aux noix|Pain aux raisins|Pain aux figues|Pain aux olives|Pain de maïs|Pain d’épeautre|Pain de mie|Pain sans sel|Pain de petit épeautre|Boule de pain|
Croissant|Pain au chocolat|Pain aux raisins brioché|Chausson aux pommes|Croissant aux amandes|Pain au chocolat aux amandes|Pain au lait|Pain viennois|Chouquettes|Palmier|
Brioche nature|Brioche au sucre|Brioche aux pépites de chocolat|Brioche tressée|Brioche feuilletée|Brioche aux pralines|Pain suisse|Oranais|Roulé à la cannelle|Torsade au chocolat|
Éclair au chocolat|Éclair au café|Religieuse au chocolat|Religieuse au café|Mille-feuille|Paris-Brest|Saint-Honoré|Flan pâtissier|Baba au rhum|Opéra|
Tarte aux pommes|Tarte aux fraises|Tarte aux framboises|Tarte au citron|Tarte au citron meringuée|Tarte aux poires|Tarte aux abricots|Tarte au chocolat|Fraisier|Framboisier|
Cookie au chocolat|Sablés|Madeleines|Financiers|Canelés|Meringues|Macarons|Rochers coco|Brownie|Muffin aux myrtilles|
Sandwich jambon-beurre|Sandwich jambon-fromage|Sandwich poulet-crudités|Sandwich thon-crudités|Sandwich végétarien|Sandwich tomate-mozzarella|Sandwich rosette|Sandwich poulet-curry|Sandwich chèvre-crudités|Sandwich saumon|
Quiche lorraine|Quiche aux légumes|Part de pizza|Croque-monsieur|Croissant au jambon|Feuilleté au fromage|Feuilleté à la saucisse|Fougasse aux olives|Fougasse aux lardons|Pissaladière|
Galette des rois|Couronne des rois|Bûche de Noël|Kouign-amann|Far breton|Gâteau basque|Tropézienne|Kougelhopf|Tarte au sucre|Pain d’épices`,
  pharmacy: `Pansements adhésifs|Pansements imperméables|Pansements pour ampoules|Pansements à découper|Compresses stériles|Compresses non stériles|Sparadrap|Bande de gaze|Bande extensible|Filet de maintien|
Sérum physiologique|Coton hydrophile|Gants à usage unique|Ciseaux à pansements|Pince à échardes|Tire-tique|Poche de froid|Bouillotte|Trousse de secours|Masques chirurgicaux|
Dentifrice|Dentifrice enfant|Brosse à dents souple|Brosse à dents enfant|Brosse à dents électrique|Têtes de brosse à dents|Fil dentaire|Brossettes interdentaires|Gratte-langue|Nettoyant pour prothèse dentaire|
Savon surgras|Gel douche|Huile lavante|Gel lavant intime|Déodorant|Gel hydroalcoolique|Lingettes nettoyantes|Cotons-tiges|Éponge de toilette|Crème lavante|
Crème hydratante visage|Crème hydratante corps|Crème pour les mains|Baume à lèvres|Eau micellaire|Lait démaquillant|Gel nettoyant visage|Cotons démaquillants|Crème solaire visage|Crème solaire corps|
Shampooing doux|Shampooing antipelliculaire|Shampooing sec|Après-shampooing|Masque capillaire|Lotion démêlante|Peigne fin|Brosse à cheveux|Bonnet de douche|Shampooing solide|
Couches bébé|Lingettes bébé|Liniment oléo-calcaire|Crème pour le change|Gel lavant bébé|Shampooing bébé|Mouche-bébé|Thermomètre de bain|Ciseaux à ongles bébé|Brosse à cheveux bébé|
Biberon|Tétines de biberon|Sucette bébé|Coussinets d’allaitement|Sachets de conservation du lait maternel|Serviettes hygiéniques|Tampons|Protège-slips|Préservatifs|Test de grossesse|
Thermomètre médical|Tensiomètre|Pilulier|Coupe-comprimés|Bouchons d’oreilles|Masques FFP2|Boîte pour prothèse dentaire|Étui à lentilles|Solution pour lentilles|Lingettes pour lunettes|
Crème pour les pieds|Pierre ponce|Râpe à pieds|Coupe-ongles|Lime à ongles|Brosse à ongles|Séparateurs d’orteils|Coussinets plantaires|Protections pour cors|Semelles de confort`,
  hardware: `Vis à bois|Vis à placo|Vis à métal|Chevilles universelles|Chevilles pour plaques de plâtre|Chevilles à frapper|Clous|Boulons|Écrous|Rondelles|
Crochets à visser|Pitons|Équerres de fixation|Charnières|Poignée de porte|Bouton de meuble|Coulisses de tiroir|Verrou|Cadenas|Butée de porte|
Tournevis plat|Tournevis cruciforme|Jeu de clés Allen|Clé à molette|Pince multiprise|Pince coupante|Pince universelle|Marteau|Maillet|Cutter|
Mètre ruban|Niveau à bulle|Équerre de menuisier|Crayon de chantier|Scie à main|Scie à métaux|Lames de cutter|Lames de scie sauteuse|Serre-joints|Lime à métaux|
Perceuse-visseuse|Forets à bois|Forets à métal|Forets à béton|Embouts de vissage|Porte-embout|Scie cloche|Fraise à chanfreiner|Papier abrasif|Disques à poncer|
Peinture blanche|Sous-couche|Rouleau de peinture|Manchon de rouleau|Pinceau plat|Pinceau à rechampir|Bac à peinture|Ruban de masquage|Bâche de protection|Enduit de rebouchage|
Colle à bois|Colle multi-usages|Colle cyanoacrylate|Mastic silicone|Mastic acrylique|Pistolet à cartouche|Ruban adhésif double face|Ruban adhésif de réparation|Dégrippant|Lubrifiant silicone|
Ampoule LED|Piles AA|Piles AAA|Rallonge électrique|Multiprise|Prise électrique|Interrupteur|Bornes de connexion|Ruban isolant|Colliers de serrage|
Ruban PTFE|Joints de plomberie|Joint de robinet|Flexible de douche|Pommeau de douche|Mousseur de robinet|Siphon de lavabo|Bonde de lavabo|Ventouse de débouchage|Collier de fixation pour tuyau|
Gants de bricolage|Lunettes de protection|Masque antipoussière|Protection auditive|Genouillères|Seau|Éponge de chantier|Chiffons|Brosse métallique|Sacs à gravats`,
};

export const catalogSeed = Object.entries(names).flatMap(([category, values]) =>
  values
    .split('|')
    .map((name, sortOrder) => ({
      category: category as Category,
      name: name.trim(),
      sortOrder,
    })),
);
