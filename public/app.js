 const catHiMap = {
  "All": "सभी श्रेणी",
  "Atta, Rice & Grains": "आटा, चावल व अनाज",
  "Pulses & Dal": "दाल व चना",
  "Cooking Oils & Ghee": "तेल व घी",
  "Biscuits & Bakery": "बिस्कुट व बेकरी",
  "Tea & Beverages": "चाय व पेय पदार्थ",
  "Snacks & Instant": "स्नैक्स व नमकीन",
  "Spices & Dry Fruits": "मसाले व ड्राई फ्रूट्स",
  "Dairy & Household": "डेयरी व घरेलू सामान",
  "Personal Care & Hygiene": "पर्सनल केयर व स्वच्छता"
};

// Language & PWA & Admin State Globals
let currentLang = localStorage.getItem('orderkaaro_lang') || 'en';
let outOfStockItems = JSON.parse(localStorage.getItem('orderkaaro_outofstock') || '[]');
let orderHistory = JSON.parse(localStorage.getItem('orderkaaro_history') || '[]');

const translations = {
  en: {
    searchPlaceholder: "Search 160+ items (atta, ghee, dal, tea, biscuits...)",
    cartTitle: "Your Shopping Cart 🛒",
    deliveryFee: "Delivery Fee",
    freeDelivery: "FREE Delivery",
    checkoutBtn: "Proceed to Delivery Details →",
    langName: "हिंदी",
    inStock: "In Stock",
    outOfStock: "OUT OF STOCK",
    saveMsg: "Save",
    reorderBtn: "🔁 Reorder All Items"
  },
  hi: {
    searchPlaceholder: "160+ आइटम खोजें (आटा, घी, दाल, चाय...)",
    cartTitle: "आपकी शॉपिंग कार्ट 🛒",
    deliveryFee: "डिलीवरी शुल्क",
    freeDelivery: "मुफ्त डिलीवरी",
    checkoutBtn: "डिलीवरी विवरण भरें →",
    langName: "English",
    inStock: "स्टॉक में है",
    outOfStock: "आउट ऑफ स्टॉक",
    saveMsg: "बचत",
    reorderBtn: "🔁 दोबारा ऑर्डर करें"
  }
};

/* ==========================================================================
   Order Kaaro – Kishanganj Grocery Delivery Application Core JavaScript
   ========================================================================== */

const WA_NUMBER = "919942089120";
const FLAT_DELIVERY_CHARGE = 0;
const FREE_DELIVERY_THRESHOLD = 0;

// ==========================================================================
// COMPLETE 164-ITEM PRODUCT DATABASE
// ==========================================================================
const productsDatabase = [
  // --- SPECIAL SAVINGS BUNDLES & COMBOS ---
  { id: "B001", nameHi: "मंथली फैमिली राशन पैकेज (10 सामान)", name: "Monthly Family Rashan Package", unit: "Combo Pack (10 Items)", price: 1450, mrp: 1650, category: "Atta, Rice & Grains", image: "/Catalog/grains/aashirvaad-shud-chakki-atta.png", emoji: "📦", isBundle: true },
  { id: "B002", nameHi: "त्योहार व पूजा स्पेशल कॉम्बो (6 सामान)", name: "Festive & Puja Special Combo", unit: "Combo Pack (6 Items)", price: 420, mrp: 490, category: "Atta, Rice & Grains", image: "/Catalog/Grains/katarni-chura.png", emoji: "🪔", isBundle: true },
  { id: "B003", nameHi: "चाय व स्नैक्स सुपर सेवर कॉम्बो (5 सामान)", name: "Family Tea & Snacks Super Saver", unit: "Combo Pack (5 Items)", price: 280, mrp: 330, category: "Biscuits & Bakery", image: "/Catalog/tea/masala-tea.png", emoji: "☕", isBundle: true },

  // --- ATTA, RICE & GRAINS ---
  { id: "P001", nameHi: "आशीर्वाद शुद्ध चक्की आटा", name: "Aashirvaad Shud Chakki Atta", unit: "5 kg", price: 240, mrp: 276, category: "Atta, Rice & Grains", image: "/Catalog/grains/aashirvaad-shud-chakki-atta.png", emoji: "🌾" },
  { id: "P002", nameHi: "अमृत भोग आटा", name: "Amrit Bhog Atta", unit: "5 kg", price: 220, mrp: 252, category: "Atta, Rice & Grains", image: "/Catalog/Grains/amirt-bhog-atta.jpg", emoji: "🌾" },
  { id: "P009", nameHi: "बेसन", name: "Besan", unit: "1 kg", price: 115, mrp: 132, category: "Atta, Rice & Grains", image: "/Catalog/Grains/besan.png", emoji: "🟡" },
  { id: "P055", nameHi: "कतरनी चूड़ा", name: "Katarni Chura", unit: "500 g", price: 50, mrp: 60, category: "Atta, Rice & Grains", image: "/Catalog/Grains/katarni-chura.png", emoji: "🍚" },
  { id: "P056", nameHi: "कतरनी चूड़ा", name: "Katarni Chura", unit: "1 kg", price: 90, mrp: 100, category: "Atta, Rice & Grains", image: "/Catalog/Grains/katarni-chura.png", emoji: "🍚" },
  { id: "P071", nameHi: "सत्तू", name: "Sattu", unit: "200 g", price: 31, mrp: 41, category: "Atta, Rice & Grains", image: "/Catalog/Grains/sattu.png", emoji: "💪" },
  { id: "P072", nameHi: "सत्तू", name: "Sattu", unit: "500 g", price: 70, mrp: 80, category: "Atta, Rice & Grains", image: "/Catalog/Grains/sattu.png", emoji: "💪" },
  { id: "P075", nameHi: "अमृत भोग सूजी", name: "Amrit Bhog Sooji", unit: "1 kg", price: 60, mrp: 70, category: "Atta, Rice & Grains", image: "/Catalog/Grains/sooji.png", emoji: "🌾" },
  { id: "P077", nameHi: "चीनी / शक्कर", name: "Sugar", unit: "1 kg", price: 55, mrp: 65, category: "Atta, Rice & Grains", image: "/Catalog/Grains/sugar.png", emoji: "🍬" },
  { id: "P083", nameHi: "चावल", name: "Chawal", unit: "1 kg", price: 70, mrp: 80, category: "Atta, Rice & Grains", image: "/Catalog/chawal.png", emoji: "🍚" },
  { id: "P084", nameHi: "सूजी", name: "Sooji", unit: "1 kg", price: 60, mrp: 70, category: "Atta, Rice & Grains", image: "/Catalog/Grains/sooji.png", emoji: "🌾" },
  { id: "P103", nameHi: "पॉपकॉर्न मक्की", name: "Popcorn Makki Loose", unit: "500 g", price: 70, mrp: 80, category: "Atta, Rice & Grains", image: "/Catalog/Grains/popcorn-makki-loose.jpg", emoji: "🌽" },
  { id: "P115", nameHi: "सेवई (वर्मिसेली)", name: "Vermicelli", unit: "1 kg", price: 120, mrp: 138, category: "Atta, Rice & Grains", image: "/Catalog/noodles/vermicelli.png", emoji: "🍜" },
  { id: "P119", nameHi: "मैदा", name: "Maida", unit: "1 kg", price: 50, mrp: 60, category: "Atta, Rice & Grains", image: "/Catalog/Grains/maida.png", emoji: "🌾" },

  // --- PULSES, DAL & CHANA ---
  { id: "P006", nameHi: "अरहर दाल", name: "Arahar Dal", unit: "1 kg", price: 130, mrp: 149, category: "Pulses & Dal", image: "/Catalog/pulses-chana/arhar-dal.png", emoji: "🫘" },
  { id: "P007", nameHi: "अरहर दाल", name: "Arahar Dal", unit: "500 g", price: 65, mrp: 75, category: "Pulses & Dal", image: "/Catalog/pulses-chana/arhar-dal.png", emoji: "🫘" },
  { id: "P027", nameHi: "दाल मखनी स्पेशल दाल", name: "Dal Makhani Special Dal", unit: "400 g", price: 70, mrp: 80, category: "Pulses & Dal", image: "/Catalog/pulses-chana/mix-dal-dalmakhani-special.png", emoji: "🍛" },
  { id: "P028", nameHi: "दाल मखनी स्पेशल दाल", name: "Dal Makhani Special Dal", unit: "800 g", price: 140, mrp: 161, category: "Pulses & Dal", image: "/Catalog/pulses-chana/mix-dal-dalmakhani-special.png", emoji: "🍛" },
  { id: "P036", nameHi: "गोटा कलाई दाल", name: "Gota Kalai Dal", unit: "500 g", price: 60, mrp: 70, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kalai-dal.png", emoji: "🫘" },
  { id: "P037", nameHi: "गोटा कलाई दाल", name: "Gota Kalai Dal", unit: "1 kg", price: 120, mrp: 138, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kalai-dal.png", emoji: "🫘" },
  { id: "P038", nameHi: "छिलका वाली मसूर दाल", name: "Chilka Wali Masoor Dal", unit: "1 kg", price: 140, mrp: 161, category: "Pulses & Dal", image: "/Catalog/pulses-chana/masoor-dal.png", emoji: "🫘" },
  { id: "P039", nameHi: "गोटा मसूर दाल", name: "Gota Massor Dal", unit: "1 kg", price: 140, mrp: 161, category: "Pulses & Dal", image: "/Catalog/pulses-chana/gota-masoor-dal.png", emoji: "🟠" },
  { id: "P040", nameHi: "गोटा मसूर दाल", name: "Gota Massor Dal", unit: "500 g", price: 70, mrp: 80, category: "Pulses & Dal", image: "/Catalog/pulses-chana/gota-masoor-dal.png", emoji: "🟠" },
  { id: "P041", nameHi: "गोटा मूंग दाल", name: "Gota Moong Dal", unit: "500 g", price: 60, mrp: 70, category: "Pulses & Dal", image: "/Catalog/pulses-chana/moong-dal.png", emoji: "💛" },
  { id: "P042", nameHi: "गोटा मूंग दाल", name: "Gota Moong Dal", unit: "1 kg", price: 120, mrp: 138, category: "Pulses & Dal", image: "/Catalog/pulses-chana/moong-dal.png", emoji: "💛" },
  { id: "P047", nameHi: "गोटा काला चना", name: "Gota Kala Channa", unit: "500 g", price: 45, mrp: 55, category: "Pulses & Dal", image: "/Catalog/pulses-chana/gota-kala-chana.png", emoji: "🟤" },
  { id: "P048", nameHi: "गोटा काला चना", name: "Gota Kala Channa", unit: "1 kg", price: 90, mrp: 100, category: "Pulses & Dal", image: "/Catalog/pulses-chana/gota-kala-chana.png", emoji: "🟤" },
  { id: "P049", nameHi: "काबूली चना", name: "Kabuli Channa", unit: "1 kg", price: 95, mrp: 105, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kabuli-chana.png", emoji: "⚪" },
  { id: "P050", nameHi: "काबूली चना", name: "Kabuli Channa", unit: "500 g", price: 50, mrp: 60, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kabuli-chana.png", emoji: "⚪" },
  { id: "P051", nameHi: "काला चना", name: "Kala Chana", unit: "1 kg", price: 80, mrp: 90, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kala-chana.png", emoji: "🟤" },
  { id: "P052", nameHi: "काला चना", name: "Kala Chana", unit: "500 g", price: 40, mrp: 50, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kala-chana.png", emoji: "🟤" },
  { id: "P053", nameHi: "कलाई दाल", name: "Kalai Dal", unit: "500 g", price: 70, mrp: 80, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kalai-dal.png", emoji: "🫘" },
  { id: "P054", nameHi: "कलाई दाल", name: "Kalai Dal", unit: "1 kg", price: 140, mrp: 161, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kalai-dal.png", emoji: "🫘" },
  { id: "P061", nameHi: "मसूर दाल", name: "Massor Dal", unit: "500 g", price: 60, mrp: 70, category: "Pulses & Dal", image: "/Catalog/pulses-chana/masoor-dal.png", emoji: "🟠" },
  { id: "P062", nameHi: "मसूर दाल", name: "Massor Dal", unit: "1 kg", price: 120, mrp: 138, category: "Pulses & Dal", image: "/Catalog/pulses-chana/masoor-dal.png", emoji: "🟠" },
  { id: "P063", nameHi: "मूंग दाल", name: "Moong Dal", unit: "500 g", price: 60, mrp: 70, category: "Pulses & Dal", image: "/Catalog/pulses-chana/moong-dal.png", emoji: "💛" },
  { id: "P064", nameHi: "मोठ", name: "Moth", unit: "1 kg", price: 120, mrp: 138, category: "Pulses & Dal", image: "/Catalog/Grains/moth.png", emoji: "🌾" },
  { id: "P086", nameHi: "Mouth", name: "Mouth", unit: "500 g", price: 45, mrp: 55, category: "Pulses & Dal", image: "/Catalog/Grains/moth.png", emoji: "🌾" },
  { id: "P097", nameHi: "चना दाल", name: "Chana Dal", unit: "1 kg", price: 96, mrp: 106, category: "Pulses & Dal", image: "/Catalog/pulses-chana/chana-dal.png", emoji: "🫘" },
  { id: "P108", nameHi: "चना दाल", name: "Chana Dal", unit: "500 g", price: 40, mrp: 50, category: "Pulses & Dal", image: "/Catalog/pulses-chana/chana-dal.png", emoji: "🫘" },
  { id: "P109", nameHi: "छोले चना", name: "Chole Chana", unit: "500 g", price: 48, mrp: 58, category: "Pulses & Dal", image: "/Catalog/pulses-chana/chole-chana.png", emoji: "🫘" },
  { id: "P123", nameHi: "गोटा कलाई दाल", name: "Gota Kalai Dal", unit: "250 g", price: 30, mrp: 40, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kalai-dal.png", emoji: "🫘" },
  { id: "P124", nameHi: "कलाई दाल", name: "Kalai Dal", unit: "250 g", price: 35, mrp: 45, category: "Pulses & Dal", image: "/Catalog/pulses-chana/kalai-dal.png", emoji: "🫘" },

  // --- COOKING OILS & GHEE ---
  { id: "P004", nameHi: "अमूल शुद्ध घी", name: "Amul Ghee", unit: "1 kg", price: 649, mrp: 746, category: "Cooking Oils & Ghee", image: "/Catalog/dairy/amul-pure-ghee-1kg.png", emoji: "🧈" },
  { id: "P029", nameHi: "धारा कच्ची घानी सरसों तेल", name: "Dhara Kachi Gani", unit: "1 L", price: 185, mrp: 205, category: "Cooking Oils & Ghee", image: "/Catalog/oil/dhara-kacchi-ghani.png", emoji: "🛢️" },
  { id: "P030", nameHi: "फॉर्च्यून कच्ची घानी सरसों तेल", name: "Fortune Kachi Gani", unit: "1 L", price: 184, mrp: 204, category: "Cooking Oils & Ghee", image: "/Catalog/oil/fortune-kacchi-ghani.png", emoji: "🛢️" },
  { id: "P031", nameHi: "फॉर्च्यून कच्ची घानी ज़ार 15kg", name: "Fortune Kachi Ghanni Jar 15kg", unit: "15 kg", price: 2999, mrp: 3449, category: "Cooking Oils & Ghee", image: "/Catalog/oil/fortune-kacchi-ghani-15l.png", emoji: "🛢️" },
  { id: "P032", nameHi: "फॉर्च्यून सोया रिफाइंड तेल", name: "Fortune Soya Refine", unit: "1 L", price: 145, mrp: 166, category: "Cooking Oils & Ghee", image: "/Catalog/oil/fortune-soya-health.png", emoji: "🍳" },
  { id: "P057", nameHi: "किंग कच्ची घानी तेल", name: "King Kachi Ghani", unit: "1 L", price: 179, mrp: 201, category: "Cooking Oils & Ghee", image: "/Catalog/oil/kings-kacchi-ghani.png", emoji: "👑" },
  { id: "P058", nameHi: "किंग सोया रिफाइंड तेल", name: "King Soya Refine", unit: "1 L", price: 130, mrp: 149, category: "Cooking Oils & Ghee", image: "/Catalog/oil/kings-soyabean-oil.png", emoji: "👑" },
  { id: "P085", nameHi: "राइस ब्रैन ऑयल", name: "Rice Bran Oil", unit: "1 L", price: 175, mrp: 201, category: "Cooking Oils & Ghee", image: "/Catalog/oil/rice-bran-oil.png", emoji: "🌾" },
  { id: "P122", nameHi: "इंजन कच्ची घानी सरसों तेल", name: "Engine Kacchi Ghani Oil", unit: "1 L", price: 215, mrp: 247, category: "Cooking Oils & Ghee", image: "/Catalog/oil/engine-kacchi-ghani.jpg", emoji: "🛢️" },

  // --- BISCUITS & COOKIES ---
  { id: "P005", nameHi: "अनमोल ड्रीम लाइट बिस्कुट", name: "Anmol Dream Lite Salty Butterly Crunch", unit: "1 pcs", price: 5, mrp: 5, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/anmol-dreamlite-salty-butterfly-crunch.png", emoji: "🍪" },
  { id: "P008", nameHi: "बाबा इलाइची टोस्ट / रस्क", name: "Baba Elaichi Toast", unit: "1 pcs", price: 60, mrp: 70, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/baba-elaichi-toast.png", emoji: "🍞" },
  { id: "P010", nameHi: "बिस्क फार्म बटर बिस्कुट", name: "Bisk Farm Butter Biscotti", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-butter-biscotti.png", emoji: "🍪" },
  { id: "P011", nameHi: "बिस्क फार्म मिल्क बिस्कुट", name: "Bisk Farm Champ Milkuit", unit: "1 pcs", price: 25, mrp: 35, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/biskfarm-champ-milkuit.png", emoji: "🥛" },
  { id: "P012", nameHi: "बिस्क फार्म कोको वंडर", name: "Bisk Farm Coco Wonder", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/biskfarm-coco-wonder.png", emoji: "🍫" },
  { id: "P013", nameHi: "बिस्क फार्म जीरा वंडर", name: "Bisk Farm Jeera Wonder", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-jeera-wonder.png", emoji: "🌾" },
  { id: "P014", nameHi: "बिस्क फार्म मस्त जीरा", name: "Bisk Farm Mast Jeera", unit: "1 pcs", price: 45, mrp: 55, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-mast-jeera.png", emoji: "🌾" },
  { id: "P015", nameHi: "बिस्क फार्म रस्क", name: "Bisk Farm Ruskit", unit: "1 pcs", price: 35, mrp: 45, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-ruskit.png", emoji: "🍞" },
  { id: "P016", nameHi: "बिस्क फार्म टॉप गोल्ड", name: "Bisk Farm Top Gold", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-top-gold.png", emoji: "🥇" },
  { id: "P017", nameHi: "बिस्क फार्म हर्ब्स", name: "Bisk Farm Top Herbs", unit: "1 pcs", price: 35, mrp: 45, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-top-farm.png", emoji: "🌿" },
  { id: "P018", nameHi: "ब्रिटानिया 50-50 गोलमाल काला जीरा", name: "Britannia 50-50 Golmaal Kala Jeera", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-50-50-golmaal-kala-jeera.png", emoji: "🍪" },
  { id: "P019", nameHi: "ब्रिटानिया 50-50 मारी गोल्ड", name: "Britannia 50-50 Marie Gold", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-50-50-marie-gold.png", emoji: "🍪" },
  { id: "P020", nameHi: "ब्रिटानिया 50-50 टॉप बटर", name: "Britannia 50-50 Top Butterly Bites", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-50-50-top-butterfly-bites.png", emoji: "🧈" },
  { id: "P021", nameHi: "ब्रिटानिया बार्बन चॉकलेट बिस्कुट", name: "Britannia Bourbon", unit: "1 pcs", price: 35, mrp: 45, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-bourbon.png", emoji: "🍫" },
  { id: "P022", nameHi: "ब्रिटानिया गुडडे बटर कुकीज", name: "Britannia GoodDay Butter Cookies", unit: "1 pcs", price: 40, mrp: 50, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-goodday-butter-cookies.png", emoji: "🧈" },
  { id: "P023", nameHi: "ब्रिटानिया गुडडे काजू बादाम", name: "Britannia GoodDay Cashew Almond", unit: "1 pcs", price: 40, mrp: 50, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-gooday-cashew-almond.png", emoji: "🌰" },
  { id: "P024", nameHi: "ब्रिटानिया मिल्क बिकिस", name: "Britannia Milk Bikis", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-milk-bikis.png", emoji: "🥛" },
  { id: "P025", nameHi: "ब्रिटानिया नूट्री च्वाइस", name: "Britannia Nutri Choice Digestive High Fibre", unit: "1 pcs", price: 55, mrp: 65, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/britannia-nutri-choice-digestive-high-fiber.png", emoji: "💚" },
  { id: "P026", nameHi: "कोको वंडर बिस्कुट", name: "Coco Wonder", unit: "1 pcs", price: 30, mrp: 40, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/biskfarm-coco-wonder.png", emoji: "🍫" },
  { id: "P033", nameHi: "फ्रूट केक", name: "Fruit Cake", unit: "1 pcs", price: 80, mrp: 90, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/fruit-cake.png", emoji: "🍰" },
  { id: "P043", nameHi: "होम बेक प्रीमियम कुकीज (ग्रीन)", name: "Home Bake Premium Cookies Mix Flavours Green", unit: "1 pcs", price: 55, mrp: 65, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/homebread-premium-cookies-mix-flavours-green.png", emoji: "🍪" },
  { id: "P044", nameHi: "होम बेक प्रीमियम कुकीज (रेड)", name: "Home Bake Premium Cookies Mix Flavours Red", unit: "1 pcs", price: 55, mrp: 65, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/homebread-premium-cookies-mix-flavours-red.png", emoji: "🍪" },
  { id: "P045", nameHi: "होमब्रेड कुकीज", name: "Homebread Cookies", unit: "1 pcs", price: 80, mrp: 90, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/homebread-cookies.png", emoji: "🍪" },
  { id: "P060", nameHi: "मालकिस्ट चीज बिस्कुट", name: "Malkist Cheese Flavoured", unit: "1 pcs", price: 45, mrp: 55, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/malkist-cheese-flavoured.png", emoji: "🧀" },
  { id: "P068", nameHi: "ओरियो चॉकलेट बिस्कुट", name: "Oreo", unit: "1 pcs", price: 10, mrp: 20, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/oreo.png", emoji: "⚫" },
  { id: "P069", nameHi: "पारले मोनाको क्लासिक", name: "Parle Monaco Classic", unit: "1 pcs", price: 70, mrp: 80, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/parle-monaco-classic.png", emoji: "🍪" },
  { id: "P070", nameHi: "रस्क", name: "Ruskit", unit: "1 pcs", price: 40, mrp: 50, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-ruskit.png", emoji: "🍞" },
  { id: "P074", nameHi: "सनफीस्ट मॉम्स मैजिक घी रोस्टेड", name: "Sunfeast Mom's Magic Ghee Roasted", unit: "1 pcs", price: 64, mrp: 74, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/sunfeast-moms-magic-ghee-rosted.png", emoji: "🍪" },
  { id: "P081", nameHi: "बिस्क फार्म मस्त जीरा", name: "Bisk Farm Mast Jeera", unit: "1 pcs", price: 45, mrp: 55, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/bisk-farm-mast-jeera.png", emoji: "🌾" },
  { id: "P120", nameHi: "मिल्क बिकिस", name: "Milk Bikis", unit: "1 pcs", price: 40, mrp: 50, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/milk-bikis.webp", emoji: "🥛" },
  { id: "P121", nameHi: "टाइम पास 50-50", name: "Time Pass 50-50", unit: "1 pcs", price: 25, mrp: 35, category: "Biscuits & Bakery", image: "/Catalog/Biscuits/time-pass-50-50.jpg", emoji: "🍪" },

  // --- TEA, COFFEE & BEVERAGES ---
  { id: "P034", nameHi: "ग्लूकोज डी रेगुलर", name: "Glucon-D Regular", unit: "1 pcs", price: 39, mrp: 49, category: "Tea & Beverages", image: "/Catalog/energy/gulcon-d.png", emoji: "⚡" },
  { id: "P035", nameHi: "ग्लूकोज डी ऑरेंज", name: "Glucon-D Tangy Orange", unit: "1 pcs", price: 55, mrp: 65, category: "Tea & Beverages", image: "/Catalog/energy/glucon-d-tangy-orange.png", emoji: "🍊" },
  { id: "P046", nameHi: "हॉरलिक्स क्लासिक माल्ट", name: "Horlicks", unit: "1 kg", price: 264, mrp: 303, category: "Tea & Beverages", image: "/Catalog/milk-powder/horlicks-classic-malt.png", emoji: "🥛" },
  { id: "P087", nameHi: "इंडिपेंडेंस मिनरल वाटर", name: "Independence Mineral Water", unit: "1.5 L", price: 20, mrp: 30, category: "Tea & Beverages", image: "/Catalog/water/independence-mineral-water.png", emoji: "💧" },
  { id: "P093", nameHi: "मोगू मोगू जूस", name: "Mogu Mogu", unit: "1 pcs", price: 70, mrp: 80, category: "Tea & Beverages", image: "/Catalog/cold-drink/mogu-mogu.jpg", emoji: "🧃" },
  { id: "P125", nameHi: "स्पेशल चायपत्ती", name: "Special Chaipatti", unit: "1 kg", price: 499, mrp: 573, category: "Tea & Beverages", image: "/Catalog/tea/special-chaipatti.png", emoji: "☕" },
  { id: "P128", nameHi: "सीटीसी कड़क चाय", name: "CTC Tea", unit: "1 kg", price: 300, mrp: 345, category: "Tea & Beverages", image: "/Catalog/tea/ctc-tea.jpg", emoji: "☕" },
  { id: "P129", nameHi: "सीटीसी कड़क चाय", name: "CTC Tea", unit: "500 g", price: 150, mrp: 172, category: "Tea & Beverages", image: "/Catalog/tea/ctc-tea.jpg", emoji: "☕" },
  { id: "P130", nameHi: "सीटीसी कड़क चाय", name: "CTC Tea", unit: "250 g", price: 75, mrp: 85, category: "Tea & Beverages", image: "/Catalog/tea/ctc-tea.jpg", emoji: "☕" },
  { id: "P131", nameHi: "दार्जिलिंग मिक्स चाय", name: "Darjeeling Mix Tea", unit: "250 g", price: 100, mrp: 110, category: "Tea & Beverages", image: "/Catalog/tea/darjeeling-mix-tea.png", emoji: "🫖" },
  { id: "P132", nameHi: "दार्जिलिंग मिक्स चाय", name: "Darjeeling Mix Tea", unit: "500 g", price: 200, mrp: 229, category: "Tea & Beverages", image: "/Catalog/tea/darjeeling-mix-tea.png", emoji: "🫖" },
  { id: "P133", nameHi: "दार्जिलिंग मिक्स चाय", name: "Darjeeling Mix Tea", unit: "1 kg", price: 400, mrp: 459, category: "Tea & Beverages", image: "/Catalog/tea/darjeeling-mix-tea.png", emoji: "🫖" },
  { id: "P134", nameHi: "दार्जिलिंग असम चाय", name: "Darjeeling Mix Tea (Assam)", unit: "250 g", price: 125, mrp: 143, category: "Tea & Beverages", image: "/Catalog/tea/darjeeling-mix-tea-assam.png", emoji: "🫖" },
  { id: "P135", nameHi: "दार्जिलिंग असम चाय", name: "Darjeeling Mix Tea (Assam)", unit: "500 g", price: 250, mrp: 287, category: "Tea & Beverages", image: "/Catalog/tea/darjeeling-mix-tea-assam.png", emoji: "🫖" },
  { id: "P136", nameHi: "दार्जिलिंग असम चाय", name: "Darjeeling Mix Tea (Assam)", unit: "1 kg", price: 500, mrp: 575, category: "Tea & Beverages", image: "/Catalog/tea/darjeeling-mix-tea-assam.png", emoji: "🫖" },
  { id: "P137", nameHi: "केसर चाय", name: "Kesar Tea", unit: "250 g", price: 175, mrp: 201, category: "Tea & Beverages", image: "/Catalog/tea/kesar-tea.png", emoji: "🍵" },
  { id: "P138", nameHi: "केसर चाय", name: "Kesar Tea", unit: "500 g", price: 350, mrp: 402, category: "Tea & Beverages", image: "/Catalog/tea/kesar-tea.png", emoji: "🍵" },
  { id: "P139", nameHi: "केसर चाय", name: "Kesar Tea", unit: "1 kg", price: 600, mrp: 690, category: "Tea & Beverages", image: "/Catalog/tea/kesar-tea.png", emoji: "🍵" },
  { id: "P140", nameHi: "मसाला चाय", name: "Masala Tea", unit: "250 g", price: 175, mrp: 201, category: "Tea & Beverages", image: "/Catalog/tea/masala-tea.png", emoji: "☕" },
  { id: "P141", nameHi: "मसाला चाय", name: "Masala Tea", unit: "500 g", price: 300, mrp: 345, category: "Tea & Beverages", image: "/Catalog/tea/masala-tea.png", emoji: "☕" },
  { id: "P142", nameHi: "मसाला चाय", name: "Masala Tea", unit: "1 kg", price: 600, mrp: 690, category: "Tea & Beverages", image: "/Catalog/tea/masala-tea.png", emoji: "☕" },
  { id: "P143", nameHi: "इलाइची चाय", name: "Elaichi Tea (Cardamom Chai)", unit: "250 g", price: 120, mrp: 138, category: "Tea & Beverages", image: "/Catalog/tea/elaichi-tea-cardamom-chai.png", emoji: "☕" },
  { id: "P144", nameHi: "इलाइची चाय", name: "Elaichi Tea (Cardamom Chai)", unit: "500 g", price: 220, mrp: 252, category: "Tea & Beverages", image: "/Catalog/tea/elaichi-tea-cardamom-chai.png", emoji: "☕" },
  { id: "P145", nameHi: "इलाइची चाय", name: "Elaichi Tea (Cardamom Chai)", unit: "1 kg", price: 440, mrp: 505, category: "Tea & Beverages", image: "/Catalog/tea/elaichi-tea-cardamom-chai.png", emoji: "☕" },
  { id: "P146", nameHi: "प्लेन चाय", name: "Plain Tea", unit: "250 g", price: 100, mrp: 110, category: "Tea & Beverages", image: "/Catalog/tea/plain-tea.png", emoji: "☕" },
  { id: "P147", nameHi: "प्लेन चाय", name: "Plain Tea", unit: "500 g", price: 200, mrp: 229, category: "Tea & Beverages", image: "/Catalog/tea/plain-tea.png", emoji: "☕" },
  { id: "P148", nameHi: "प्लेन चाय", name: "Plain Tea", unit: "1 kg", price: 400, mrp: 459, category: "Tea & Beverages", image: "/Catalog/tea/plain-tea.png", emoji: "☕" },
  { id: "P149", nameHi: "राजबाड़ी चाय पौच", name: "Rajbari Tea Pouch", unit: "250 g", price: 125, mrp: 143, category: "Tea & Beverages", image: "/Catalog/tea/rajbari-tea-pouch.png", emoji: "🫖" },
  { id: "P150", nameHi: "राजबाड़ी चाय पौच", name: "Rajbari Tea Pouch", unit: "500 g", price: 250, mrp: 287, category: "Tea & Beverages", image: "/Catalog/tea/rajbari-tea-pouch.png", emoji: "🫖" },
  { id: "P151", nameHi: "राजबाड़ी चाय पौच", name: "Rajbari Tea Pouch", unit: "1 kg", price: 500, mrp: 575, category: "Tea & Beverages", image: "/Catalog/tea/rajbari-tea-pouch.png", emoji: "🫖" },
  { id: "P152", nameHi: "राजबाड़ी चाय ज़ार", name: "Rajbari Tea Jar", unit: "250 g", price: 130, mrp: 149, category: "Tea & Beverages", image: "/Catalog/tea/rajbari-tea-jar.png", emoji: "🫖" },
  { id: "P153", nameHi: "राजबाड़ी चाय ज़ार", name: "Rajbari Tea Jar", unit: "500 g", price: 260, mrp: 299, category: "Tea & Beverages", image: "/Catalog/tea/rajbari-tea-jar.png", emoji: "🫖" },
  { id: "P154", nameHi: "राजबाड़ी चाय ज़ार", name: "Rajbari Tea Jar", unit: "1 kg", price: 520, mrp: 598, category: "Tea & Beverages", image: "/Catalog/tea/rajbari-tea-jar.png", emoji: "🫖" },
  { id: "P155", nameHi: "टी मैक्स दार्जिलिंग ग्रीन टी", name: "Tea Max Darjeeling Saffron Green Tea", unit: "100 g", price: 600, mrp: 690, category: "Tea & Beverages", image: "/Catalog/tea/tea-max-darjeeling-saffron-tea-green-tea.png", emoji: "🍵" },
  { id: "P156", nameHi: "टी मैक्स दार्जिलिंग ग्रीन टी ज़ार", name: "Tea Max Darjeeling Green Tea Jar", unit: "50 g", price: 300, mrp: 345, category: "Tea & Beverages", image: "/Catalog/tea/tea-max-darjeeling-saffron-tea-green-tea.png", emoji: "🍵" },
  { id: "P157", nameHi: "टी मैक्स दार्जिलिंग ग्रीन टी ज़ार", name: "Tea Max Darjeeling Green Tea Jar", unit: "100 g", price: 600, mrp: 690, category: "Tea & Beverages", image: "/Catalog/tea/tea-max-darjeeling-saffron-tea-green-tea.png", emoji: "🍵" },
  { id: "P158", nameHi: "लिप्टन ग्रीन टी 25 बैग्स", name: "Lipton Green Tea 25 Tea Bags", unit: "32.5 g", price: 200, mrp: 229, category: "Tea & Beverages", image: "/Catalog/tea/lipton-green-tea-25-tea-bags.png", emoji: "🍵" },
  { id: "P159", nameHi: "लिप्टन ग्रीन टी 100 बैग्स", name: "Lipton Green Tea 100 Tea Bags", unit: "130 g", price: 600, mrp: 690, category: "Tea & Beverages", image: "/Catalog/tea/lipton-green-tea-100-tea-bags.png", emoji: "🍵" },
  { id: "P160", nameHi: "व्हाइट टी सुपर", name: "White Tea Super", unit: "100 g", price: 1000, mrp: 1150, category: "Tea & Beverages", image: "/Catalog/tea/white-tea-super.png", emoji: "🍵" },
  { id: "P161", nameHi: "व्हाइट टी", name: "White Tea", unit: "100 g", price: 500, mrp: 575, category: "Tea & Beverages", image: "/Catalog/tea/white-tea.png", emoji: "🍵" },
  { id: "P162", nameHi: "नेस्केफे क्लासिक कॉफी पाउडर", name: "Nescafe Classic Instant Coffee Powder", unit: "25 g", price: 124, mrp: 142, category: "Tea & Beverages", image: "/Catalog/tea/nescafe-classic-instant-coffee-powder.png", emoji: "☕" },
  { id: "P163", nameHi: "नेस्ले क्लासिक कॉफी", name: "Nestle Classic Coffee Soluble Instant", unit: "50 g", price: 235, mrp: 270, category: "Tea & Beverages", image: "/Catalog/tea/nestle-classic-coffee-soluble-instant-coffee.png", emoji: "☕" },
  { id: "P164", nameHi: "रियल अनार फ्रूट जूस", name: "Real Fruit Juice Pomegranate Anar", unit: "1 L", price: 125, mrp: 143, category: "Tea & Beverages", image: "/Catalog/energy/real-fruit-juice-pomegranate-anar.png", emoji: "🧃" },

  // --- SNACKS & INSTANT FOOD ---
  { id: "P059", nameHi: "कुरकुरे पफकॉर्न", name: "Kurkure Puffcorn", unit: "1 pcs", price: 10, mrp: 20, category: "Snacks & Instant", image: "/Catalog/chips/puffcorn-yummy-cheese.png", emoji: "🍿" },
  { id: "P076", nameHi: "सोया चंक्स", name: "Soya Chunks", unit: "1 kg", price: 120, mrp: 138, category: "Snacks & Instant", image: "/Catalog/Grains/soya-chunk.png", emoji: "🧆" },
  { id: "P078", nameHi: "टाटा समपन्न पोहा", name: "Tata Sampann Poha", unit: "500 g", price: 55, mrp: 65, category: "Snacks & Instant", image: "/Catalog/Grains/tata-sampann-poha.png", emoji: "🥣" },
  { id: "P079", nameHi: "वाइ वाइ नूडल्स (चिकन)", name: "Wai Wai Noodles Chicken", unit: "1 pcs", price: 15, mrp: 20, category: "Snacks & Instant", image: "/Catalog/noodles/wai-wai-noodles-chicken.png", emoji: "🍜" },
  { id: "P080", nameHi: "वाइ वाइ नूडल्स (वेज)", name: "Wai Wai Noodles Veg", unit: "1 pcs", price: 15, mrp: 20, category: "Snacks & Instant", image: "/Catalog/noodles/wai-wai-noodles-veg.png", emoji: "🍜" },
  { id: "P082", nameHi: "मैगी 2-मिनट नूडल्स", name: "Maggi 2-Minute Noodles", unit: "1 pcs", price: 14, mrp: 18, category: "Snacks & Instant", image: "/Catalog/noodles/maggi.png", emoji: "🍜" },
  { id: "P088", nameHi: "किटकैट चॉकलेट", name: "KitKat", unit: "1 pcs", price: 30, mrp: 40, category: "Snacks & Instant", image: "/Catalog/chocolate/kitkat.png", emoji: "🍫" },
  { id: "P089", nameHi: "डेयरी मिल्क फ्रूट एंड नट", name: "Dairy Milk Fruit & Nut", unit: "1 pcs", price: 45, mrp: 55, category: "Snacks & Instant", image: "/Catalog/chocolate/dairy-milk-fruit-and-nut.png", emoji: "🍫" },
  { id: "P090", nameHi: "डेयरी मिल्क रोस्ट आल्मंड", name: "Dairy Milk Roast Almond", unit: "1 pcs", price: 45, mrp: 55, category: "Snacks & Instant", image: "/Catalog/chocolate/dairy-milk-roast-almond.png", emoji: "🍫" },
  { id: "P091", nameHi: "डेयरी मिल्क सिल्क", name: "Dairy Milk Silk", unit: "1 pcs", price: 80, mrp: 90, category: "Snacks & Instant", image: "/Catalog/chocolate/dairy-milk-silk.png", emoji: "🍫" },
  { id: "P092", nameHi: "लेज़ पोटैटो चिप्स", name: "Lay's Chips Classic", unit: "1 pcs", price: 20, mrp: 30, category: "Snacks & Instant", image: "/Catalog/chips/lays.jpg", emoji: "🥔" },
  { id: "P094", nameHi: "हल्दीराम भुजिया सेव", name: "Haldiram Bhujia Sev", unit: "400 g", price: 110, mrp: 125, category: "Snacks & Instant", image: "/Catalog/namkeen/haldiram-bhujia.jpg", emoji: "🥨" },
  { id: "P095", nameHi: "हल्दीराम आलु भुजिया", name: "Haldiram Aloo Bhujia", unit: "400 g", price: 110, mrp: 125, category: "Snacks & Instant", image: "/Catalog/namkeen/haldiram-aloo-bhujia.jpg", emoji: "🥨" },

  // --- SPICES & DRY FRUITS ---
  { id: "P003", nameHi: "अमूल बटर", name: "Amul Butter", unit: "100 g", price: 58, mrp: 68, category: "Spices & Dry Fruits", image: "/Catalog/dairy/amul-butter.png", emoji: "🧈" },
  { id: "P065", nameHi: "एवरेस्ट गरम मसाला", name: "Everest Garam Masala", unit: "100 g", price: 85, mrp: 95, category: "Spices & Dry Fruits", image: "/Catalog/Spices/everest-garam-masala.png", emoji: "🌶️" },
  { id: "P066", nameHi: "एवरेस्ट तीखा लाल मिर्च", name: "Everest Tikhalal Chilly Powder", unit: "100 g", price: 65, mrp: 75, category: "Spices & Dry Fruits", image: "/Catalog/Spices/everest-tikhala-chilly-powder.png", emoji: "🌶️" },
  { id: "P067", nameHi: "एवरेस्ट हल्दी पाउडर", name: "Everest Turmeric Powder", unit: "100 g", price: 42, mrp: 52, category: "Spices & Dry Fruits", image: "/Catalog/Spices/everest-turmeric-powder.png", emoji: "🟡" },
  { id: "P073", nameHi: "टाटा नमक नमकीन", name: "Tata Salt Vacuum Evaporated", unit: "1 kg", price: 28, mrp: 32, category: "Spices & Dry Fruits", image: "/Catalog/Spices/tata-salt.png", emoji: "🧂" },
  { id: "P096", nameHi: "काजू प्रीमियम", name: "Cashew Nuts (Kaju)", unit: "250 g", price: 220, mrp: 250, category: "Spices & Dry Fruits", image: "/Catalog/dry-fruits/kaju.jpg", emoji: "🌰" },
  { id: "P098", nameHi: "बादाम", name: "Almonds (Badam)", unit: "250 g", price: 210, mrp: 240, category: "Spices & Dry Fruits", image: "/Catalog/dry-fruits/badam.jpg", emoji: "🌰" },
  { id: "P099", nameHi: "किशमिश", name: "Raisins (Kishmish)", unit: "250 g", price: 90, mrp: 110, category: "Spices & Dry Fruits", image: "/Catalog/dry-fruits/kishmish.jpg", emoji: "🍇" },
  { id: "P100", nameHi: "अखरोट गिरी", name: "Walnut Kernels (Akhrot)", unit: "250 g", price: 320, mrp: 360, category: "Spices & Dry Fruits", image: "/Catalog/dry-fruits/akhrot.jpg", emoji: "🧠" },
  { id: "P101", nameHi: "एमडीएच चाट मसाला", name: "MDH Chunky Chat Masala", unit: "100 g", price: 72, mrp: 82, category: "Spices & Dry Fruits", image: "/Catalog/Spices/mdh-chat-masala.jpg", emoji: "🧂" },
  { id: "P102", nameHi: "एमडीएच किचन किंग मसाला", name: "MDH Kitchen King Masala", unit: "100 g", price: 82, mrp: 92, category: "Spices & Dry Fruits", image: "/Catalog/Spices/mdh-kitchen-king.jpg", emoji: "🍛" },
  { id: "P104", nameHi: "काली मिर्च गोटा", name: "Black Pepper Whole Loose", unit: "100 g", price: 95, mrp: 110, category: "Spices & Dry Fruits", image: "/Catalog/Spices/black-pepper.jpg", emoji: "🫘" },
  { id: "P105", nameHi: "जीरा साबुत", name: "Cumin Seeds (Jeera Whole)", unit: "200 g", price: 85, mrp: 100, category: "Spices & Dry Fruits", image: "/Catalog/Spices/jeera.jpg", emoji: "🌾" },
  { id: "P106", nameHi: "हरी इलाइची", name: "Green Cardamom (Elaichi)", unit: "50 g", price: 140, mrp: 165, category: "Spices & Dry Fruits", image: "/Catalog/Spices/elaichi.jpg", emoji: "🌿" },
  { id: "P107", nameHi: "लौंग", name: "Cloves (Laung)", unit: "50 g", price: 65, mrp: 75, category: "Spices & Dry Fruits", image: "/Catalog/Spices/laung.jpg", emoji: "🌱" },
  { id: "P110", nameHi: "धनिया पाउडर Loose", name: "Coriander Powder Loose", unit: "200 g", price: 45, mrp: 55, category: "Spices & Dry Fruits", image: "/Catalog/Spices/dhaniya-powder.jpg", emoji: "🌿" },
  { id: "P111", nameHi: "हल्दी पाउडर Loose", name: "Turmeric Powder Loose", unit: "200 g", price: 40, mrp: 50, category: "Spices & Dry Fruits", image: "/Catalog/Spices/haldi-powder.jpg", emoji: "🟡" },
  { id: "P112", nameHi: "लाल मिर्च पाउडर Loose", name: "Red Chilli Powder Loose", unit: "200 g", price: 60, mrp: 70, category: "Spices & Dry Fruits", image: "/Catalog/Spices/mirch-powder.jpg", emoji: "🌶️" },

  // --- DAIRY & HOUSEHOLD ---
  { id: "P113", nameHi: "विम डिशवॉश बार", name: "Vim Dishwash Bar", unit: "200 g", price: 20, mrp: 25, category: "Dairy & Household", image: "/Catalog/cleaners/vim-bar.png", emoji: "🧼" },
  { id: "P114", nameHi: "रिन डिटर्जेंट बार", name: "Rin Detergent Soap Bar", unit: "250 g", price: 30, mrp: 35, category: "Dairy & Household", image: "/Catalog/cleaners/rin-soap.png", emoji: "🧼" },
  { id: "P116", nameHi: "सरफ एक्सेल इजी वॉश", name: "Surf Excel Easy Wash Powder", unit: "1 kg", price: 140, mrp: 155, category: "Dairy & Household", image: "/Catalog/cleaners/surf-excel.jpg", emoji: "🧺" },
  { id: "P117", nameHi: "हारपिक पावर प्लस टॉयलेट क्लीनर", name: "Harpic Power Plus Toilet Cleaner", unit: "500 ml", price: 105, mrp: 120, category: "Dairy & Household", image: "/Catalog/cleaners/harpic.jpg", emoji: "🚽" },
  { id: "P118", nameHi: "ऑलआउट ऑल नाइट मच्छर रिपेलेंट", name: "All Out Mosquito Liquid Refill", unit: "1 pack", price: 85, mrp: 95, category: "Dairy & Household", image: "/Catalog/cleaners/allout.jpg", emoji: "🦟" },
  { id: "P126", nameHi: "अमूल ताजा टोन्ड मिल्क", name: "Amul Taaza Toned Milk Pouch", unit: "500 ml", price: 27, mrp: 27, category: "Dairy & Household", image: "/Catalog/dairy/amul-taaza.jpg", emoji: "🥛" },
  { id: "P127", nameHi: "अमूल मस्ती दही", name: "Amul Masti Dahi Pouch", unit: "400 g", price: 35, mrp: 35, category: "Dairy & Household", image: "/Catalog/dairy/amul-dahi.jpg", emoji: "🥛" }
];

// App State Globals
let cart = JSON.parse(localStorage.getItem('orderkaaro_cart') || '{}');
let wishlist = JSON.parse(localStorage.getItem('orderkaaro_wishlist') || '[]');
let orders = JSON.parse(localStorage.getItem('orderkaaro_orders') || '[]');
let profile = JSON.parse(localStorage.getItem('orderkaaro_profile') || '{}');

let currentCategory = "All";
let searchQuery = "";

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  updateLangUI();
  renderCategoryPills();
  renderProducts();
  renderTopDeals();
  updateHeaderBadges();
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      doSearch(e.target.value);
    });
  }
}

function updateLangUI() {
  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.innerText = translations[currentLang].langName;
  }
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.placeholder = translations[currentLang].searchPlaceholder;
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  localStorage.setItem('orderkaaro_lang', currentLang);
  updateLangUI();
  renderCategoryPills();
  renderProducts();
  renderTopDeals();
  if (document.getElementById('cartDrawer')?.classList.contains('open')) renderCart();
}

function saveCart() {
  localStorage.setItem('orderkaaro_cart', JSON.stringify(cart));
  updateHeaderBadges();
  renderProducts();
  renderTopDeals();
  if (document.getElementById('cartDrawer')?.classList.contains('open')) renderCart();
  if (document.getElementById('wishlistModal')?.classList.contains('open')) renderWishlistModal();
}

function saveWishlist() {
  localStorage.setItem('orderkaaro_wishlist', JSON.stringify(wishlist));
  updateHeaderBadges();
  renderProducts();
  renderTopDeals();
  if (document.getElementById('wishlistModal')?.classList.contains('open')) renderWishlistModal();
}

function toggleWishlist(id, event) {
  if (event) event.stopPropagation();
  const idx = wishlist.indexOf(id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(id);
  }
  saveWishlist();
}

function saveProfile(name, phone, address) {
  profile = { name, phone, address };
  localStorage.setItem('orderkaaro_profile', JSON.stringify(profile));
}

// ==========================================================================
// CATEGORY PILLS RENDER
// ==========================================================================
function renderCategoryPills() {
  const catRow = document.getElementById('catRow');
  if (!catRow) return;

  const categories = ["All", ...new Set(productsDatabase.map(p => p.category))];

  catRow.innerHTML = categories.map(cat => {
    const isActive = cat === currentCategory;
    const catLabel = currentLang === 'hi' ? (catHiMap[cat] || cat) : cat;
    return `
      <button class="cat-pill ${isActive ? 'active' : ''}" onclick="selectCategory('${cat}')">
        ${catLabel}
      </button>
    `;
  }).join('');
}

function selectCategory(category) {
  currentCategory = category;
  renderCategoryPills();
  renderProducts();
}

// ==========================================================================
// SEARCH & PRODUCTS RENDER
// ==========================================================================
function doSearch(val) {
  searchQuery = val.toLowerCase().trim();
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
  }
  renderProducts();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  doSearch('');
}

function renderProducts() {
  const brandSections = document.getElementById('brandSections');
  if (!brandSections) return;

  let filtered = productsDatabase.filter(p => {
    const matchCat = currentCategory === "All" || p.category === currentCategory;
    const matchQuery = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) ||
      (p.nameHi && p.nameHi.includes(searchQuery)) ||
      p.category.toLowerCase().includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery);
    return matchCat && matchQuery;
  });

  const grouped = {};
  filtered.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  if (filtered.length === 0) {
    brandSections.innerHTML = `
      <div class="no-results" style="text-align:center;padding:40px 20px;">
        <div style="font-size:3rem;margin-bottom:10px">🔍</div>
        <h3 style="font-size:1.1rem;margin-bottom:6px">No products found for "${searchQuery}"</h3>
        <p style="font-size:0.85rem">Try searching for atta, dal, ghee, tea, or biscuits</p>
      </div>
    `;
    return;
  }

  brandSections.innerHTML = Object.keys(grouped).map(catName => `
    <div class="section-head" id="sec_${catName.replace(/[^a-zA-Z0-9]/g, '_')}">
      <div class="section-head-left">
        <span class="section-title">${currentLang === "hi" ? (catHiMap[catName] || catName) : catName}</span>
        <span class="section-count">(${grouped[catName].length} items)</span>
      </div>
    </div>
    <div class="products-grid">
      ${grouped[catName].map(productCardHTML).join('')}
    </div>
  `).join('');
}

function productCardHTML(p) {
  const qty = cart[p.id] || 0;
  const isWishlisted = wishlist.includes(p.id);
  const isOutOfStock = outOfStockItems.includes(p.id);
  const mrp = p.mrp || Math.round(p.price * 1.15);
  const savings = mrp - p.price;
  const offPercent = (mrp > p.price && mrp > 0) ? Math.round(((mrp - p.price) / mrp) * 100) : 0;
  const displayName = (currentLang === 'hi' && p.nameHi) ? p.nameHi : p.name;

  return `
    <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" id="card_${p.id}">
      ${isOutOfStock ? `<div class="out-of-stock-overlay">${translations[currentLang].outOfStock}</div>` : ''}
      <span class="product-badge-id">${p.id}</span>
      <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" id="wl_btn_${p.id}" onclick="toggleWishlist('${p.id}', event)" title="Add to Wishlist">
        ${isWishlisted ? '❤️' : '🤍'}
      </button>
      <div class="product-img-wrap">
        ${p.image ? `<img src="${p.image}" alt="${displayName}" class="product-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />` : ''}
        <span class="emoji-icon" style="${p.image ? 'display:none' : ''}">${p.emoji || '📦'}</span>
      </div>
      <span class="product-unit">${p.unit}</span>
      <div class="product-name">${displayName}</div>
      <div class="product-price-row">
        <span class="product-price">₹${p.price}</span>
        ${mrp > p.price ? `<span class="product-mrp">₹${mrp}</span>` : ''}
        ${offPercent > 0 ? `<span class="product-off-badge">${offPercent}% OFF</span>` : ''}
      </div>
      ${isOutOfStock ? `
        <button class="product-add-btn disabled" disabled>${translations[currentLang].outOfStock}</button>
      ` : qty === 0 ? `
        <button class="product-add-btn" onclick="addToCart('${p.id}')">
          <span>+ Add to Cart</span>
        </button>
      ` : `
        <div class="product-qty-ctrl">
          <button class="pqc-btn" onclick="updateQty('${p.id}', ${qty - 1})">-</button>
          <span class="pqc-num">${qty}</span>
          <button class="pqc-btn" onclick="updateQty('${p.id}', ${qty + 1})">+</button>
        </div>
      `}
    </div>
  `;
}

// ==========================================================================
// RENDER TOP DEALS / PICKS
// ==========================================================================
function renderTopDeals() {
  const dealsRow = document.getElementById('dealsRow');
  if (!dealsRow) return;
  
  const featuredIds = ["B001", "B002", "B003", "P001", "P004", "P006", "P029", "P022", "P125", "P094", "P076", "P080", "P162"];
  const featured = productsDatabase.filter(p => featuredIds.includes(p.id));
  
  dealsRow.innerHTML = featured.map(p => {
    const qty = cart[p.id] || 0;
    const isWishlisted = wishlist.includes(p.id);
    const mrp = p.mrp || Math.round(p.price * 1.15);
    const offPercent = (mrp > p.price && mrp > 0) ? Math.round(((mrp - p.price) / mrp) * 100) : 0;
    const displayName = (currentLang === 'hi' && p.nameHi) ? p.nameHi : p.name;
    return `
      <div class="deal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span class="product-unit" style="margin-bottom:0">${p.unit}</span>
          <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" id="wl_btn_deal_${p.id}" onclick="toggleWishlist('${p.id}', event)" title="Wishlist" style="position:static;width:24px;height:24px;font-size:0.85rem">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="product-img-wrap" style="height:70px;margin-bottom:8px">
          ${p.image ? `<img src="${p.image}" alt="${displayName}" class="product-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />` : ''}
          <span class="emoji-icon" style="${p.image ? 'display:none' : ''};font-size:2.4rem">${p.emoji || '📦'}</span>
        </div>
        <div class="product-name" style="font-size:0.82rem">${displayName}</div>
        <div class="product-price-row" style="margin-bottom:8px">
          <span class="product-price" style="font-size:1rem">₹${p.price}</span>
          ${mrp > p.price ? `<span class="product-mrp" style="font-size:0.78rem">₹${mrp}</span>` : ''}
          ${offPercent > 0 ? `<span class="product-off-badge" style="font-size:0.65rem;padding:1px 5px">${offPercent}% OFF</span>` : ''}
        </div>
        ${qty === 0 ? `
          <button class="product-add-btn" style="height:36px;font-size:0.8rem" onclick="addToCart('${p.id}')">Add</button>
        ` : `
          <div class="product-qty-ctrl" style="height:36px">
            <button class="pqc-btn" onclick="updateQty('${p.id}', ${qty - 1})">-</button>
            <span class="pqc-num">${qty}</span>
            <button class="pqc-btn" onclick="updateQty('${p.id}', ${qty + 1})">+</button>
          </div>
        `}
      </div>
    `;
  }).join('');
}

// ==========================================================================
// CART & BADGE UPDATES
// ==========================================================================
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  popCartBadge();
}

function updateQty(id, qty) {
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart();
}

function popCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.classList.add('pop-anim');
    setTimeout(() => badge.classList.remove('pop-anim'), 300);
  }
}

function updateHeaderBadges() {
  const totalCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const badge = document.getElementById('cartBadge');
  const navCartBadge = document.getElementById('navCartBadge');
  const navWishlistBadge = document.getElementById('navWishlistBadge');
  const navOrdersBadge = document.getElementById('navOrdersBadge');
  
  const fbCount = document.getElementById('fbCount');
  const fbTotal = document.getElementById('fbTotal');
  const fbDelivery = document.getElementById('fbDelivery');
  const floatingBar = document.getElementById('floatingBar');
  
  if (badge) badge.innerText = totalCount;
  if (navCartBadge) navCartBadge.innerText = totalCount;
  if (navWishlistBadge) navWishlistBadge.innerText = wishlist.length;
  if (navOrdersBadge) navOrdersBadge.innerText = orders.length;
  
  if (fbCount) fbCount.innerText = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
  
  let subtotal = 0;
  Object.keys(cart).forEach(id => {
    const item = productsDatabase.find(p => p.id === id);
    if (item) subtotal += item.price * cart[id];
  });
  
  if (fbTotal) fbTotal.innerText = subtotal;
  
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : FLAT_DELIVERY_CHARGE;
  if (fbDelivery) {
    fbDelivery.innerText = delivery === 0 ? translations[currentLang].freeDelivery : `+ ₹${delivery} ${translations[currentLang].deliveryFee}`;
  }
  
  if (floatingBar) {
    if (totalCount > 0) {
      floatingBar.classList.add('visible');
    } else {
      floatingBar.classList.remove('visible');
    }
  }
}

function renderCart() {
  const cartList = document.getElementById('cartList');
  const cartFooter = document.getElementById('cartFooter');
  if (!cartList || !cartFooter) return;
  
  const cartItemIds = Object.keys(cart);
  if (cartItemIds.length === 0) {
    cartList.innerHTML = `
      <div class="empty-cart-wrap" style="text-align:center;padding:40px 20px;">
        <div style="font-size:4rem;margin-bottom:12px">🛒</div>
        <h3 style="font-size:1.1rem;color:var(--text-main);margin-bottom:6px">Your Cart is Empty</h3>
        <p style="font-size:0.85rem">Explore our catalogue and add items to your cart</p>
      </div>
    `;
    cartFooter.innerHTML = '';
    return;
  }
  
  let subtotal = 0;
  cartList.innerHTML = cartItemIds.map(id => {
    const p = productsDatabase.find(item => item.id === id);
    if (!p) return '';
    const q = cart[id];
    const itemTotal = p.price * q;
    subtotal += itemTotal;
    const displayName = (currentLang === 'hi' && p.nameHi) ? p.nameHi : p.name;
    return `
      <div class="cart-item-row">
        <div class="ci-emoji">${p.emoji || '📦'}</div>
        <div class="ci-info">
          <div class="ci-name">${displayName}</div>
          <div class="ci-unit">${p.unit} • ₹${p.price}/unit</div>
          <div class="ci-price">₹${itemTotal}</div>
        </div>
        <div class="product-qty-ctrl" style="width:90px;height:34px">
          <button class="pqc-btn" onclick="updateQty('${p.id}', ${q - 1})">-</button>
          <span class="pqc-num">${q}</span>
          <button class="pqc-btn" onclick="updateQty('${p.id}', ${q + 1})">+</button>
        </div>
      </div>
    `;
  }).join('');

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_CHARGE;
  const grandTotal = subtotal + deliveryFee;

  cartFooter.innerHTML = `
    <div class="bill-row">
      <span>Subtotal</span>
      <span>₹${subtotal}</span>
    </div>
    <div class="bill-row">
      <span>Delivery Charge</span>
      <span class="free-text">${deliveryFee === 0 ? translations[currentLang].freeDelivery : `₹${deliveryFee}`}</span>
    </div>
    <div class="bill-row grand">
      <span>Grand Total</span>
      <span>₹${grandTotal}</span>
    </div>
    <button class="checkout-btn" onclick="openModal()">
      ${translations[currentLang].checkoutBtn}
    </button>
  `;
}

// ==========================================================================
// WISHLIST MODAL & RENDERING
// ==========================================================================
function renderWishlistModal() {
  const container = document.getElementById('wishlistList');
  if (!container) return;

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <div style="font-size:3.5rem;margin-bottom:10px">🤍</div>
        <h3 style="font-size:1.05rem;color:var(--text-main);margin-bottom:4px">Your Wishlist is Empty</h3>
        <p style="font-size:0.85rem">Tap the heart icon on any product to save items for later</p>
      </div>
    `;
    return;
  }

  container.innerHTML = wishlist.map(id => {
    const p = productsDatabase.find(item => item.id === id);
    if (!p) return '';
    const qty = cart[p.id] || 0;
    const mrp = p.mrp || Math.round(p.price * 1.15);
    const offPercent = (mrp > p.price && mrp > 0) ? Math.round(((mrp - p.price) / mrp) * 100) : 0;
    const displayName = (currentLang === 'hi' && p.nameHi) ? p.nameHi : p.name;
    return `
      <div class="cart-item-row">
        <div class="ci-emoji">${p.emoji || '📦'}</div>
        <div class="ci-info">
          <div class="ci-name">${displayName}</div>
          <div class="ci-unit">${p.unit}</div>
          <div class="ci-price" style="display:flex;align-items:center;gap:6px">
            <span class="product-price" style="font-size:0.95rem">₹${p.price}</span>
            ${mrp > p.price ? `<span class="product-mrp" style="font-size:0.78rem">₹${mrp}</span>` : ''}
            ${offPercent > 0 ? `<span class="product-off-badge" style="font-size:0.65rem;padding:1px 5px">${offPercent}% OFF</span>` : ''}
          </div>
        </div>
        ${qty === 0 ? `
          <button class="product-add-btn" style="height:36px;width:90px;font-size:0.8rem" onclick="addToCart('${p.id}')">+ Add</button>
        ` : `
          <span style="font-size:0.78rem;font-weight:700;color:var(--primary-dark)">In Cart (${qty})</span>
        `}
        <button class="ci-remove" onclick="toggleWishlist('${p.id}')" title="Remove from wishlist">✕</button>
      </div>
    `;
  }).join('');
}

function openWishlist() {
  closeCart();
  closeOrders();
  closeProfile();
  renderWishlistModal();
  document.getElementById('wishlistModal')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}

function closeWishlist() {
  document.getElementById('wishlistModal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function addAllWishlistToCart() {
  wishlist.forEach(id => {
    cart[id] = (cart[id] || 0) + 1;
  });
  saveCart();
  closeWishlist();
  openCart();
}

// ==========================================================================
// ORDERS HISTORY MODAL & RENDERING
// ==========================================================================
function renderOrdersModal() {
  const container = document.getElementById('ordersList');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <div style="font-size:3.5rem;margin-bottom:10px">📦</div>
        <h3 style="font-size:1.05rem;color:var(--text-main);margin-bottom:4px">No Past Orders Found</h3>
        <p style="font-size:0.85rem">Orders placed via WhatsApp will appear here</p>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.slice().reverse().map((order, idx) => `
    <div style="background:var(--bg-body);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:0.75rem;font-weight:700;color:var(--primary-dark);background:var(--primary-light);padding:3px 8px;border-radius:6px">Order #${orders.length - idx}</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">${order.date}</span>
      </div>
      <div style="font-size:0.85rem;color:var(--text-main);margin-bottom:8px">
        ${order.items.map(i => `<div>• ${i.name} (${i.unit}) x ${i.qty} - ₹${i.price * i.qty}</div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);padding-top:8px">
        <span style="font-size:0.9rem;font-weight:800">Total: ₹${order.grandTotal}</span>
        <button class="product-add-btn" style="height:34px;width:95px;font-size:0.78rem" onclick="reorderItems('${encodeURIComponent(JSON.stringify(order.items))}')">${translations[currentLang].reorderBtn}</button>
      </div>
    </div>
  `).join('');
}

function openOrders() {
  closeCart();
  closeWishlist();
  closeProfile();
  renderOrdersModal();
  document.getElementById('ordersModal')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}

function closeOrders() {
  document.getElementById('ordersModal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function reorderItems(encodedItems) {
  try {
    const items = JSON.parse(decodeURIComponent(encodedItems));
    items.forEach(i => {
      cart[i.id] = (cart[i.id] || 0) + i.qty;
    });
    saveCart();
    closeOrders();
    openCart();
  } catch(e) {
    console.error(e);
  }
}

// ==========================================================================
// ACCOUNT PROFILE MODAL & RENDERING
// ==========================================================================
function renderProfileModal() {
  const nameInp = document.getElementById('profName');
  const phoneInp = document.getElementById('profPhone');
  const addrInp = document.getElementById('profAddress');
  
  if (nameInp) nameInp.value = profile.name || '';
  if (phoneInp) phoneInp.value = profile.phone || '';
  if (addrInp) addrInp.value = profile.address || '';
}

function openProfile() {
  closeCart();
  closeWishlist();
  closeOrders();
  renderProfileModal();
  document.getElementById('profileModal')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}

function closeProfile() {
  document.getElementById('profileModal')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function submitProfileForm() {
  const name = document.getElementById('profName').value.trim();
  const phone = document.getElementById('profPhone').value.trim();
  const address = document.getElementById('profAddress').value.trim();
  
  saveProfile(name, phone, address);
  alert('Profile & Delivery Address saved successfully!');
  closeProfile();
}

// ==========================================================================
// DRAWER & MODAL HANDLERS
// ==========================================================================
function openCart() {
  closeWishlist();
  closeOrders();
  closeProfile();
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('open');
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
}

function openModal() {
  closeCart();
  const nameInput = document.getElementById('custName');
  const addrInput = document.getElementById('custAddress');
  const phoneInput = document.getElementById('custPhone');
  
  if (nameInput && profile.name) nameInput.value = profile.name;
  if (addrInput && profile.address) addrInput.value = profile.address;
  if (phoneInput && profile.phone) phoneInput.value = profile.phone;

  document.getElementById('orderModal')?.classList.add('open');
}

function closeModal() {
  document.getElementById('orderModal')?.classList.remove('open');
}

// ==========================================================================
// WHATSAPP ORDER SUBMISSION
// ==========================================================================
function submitOrder() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const notes = document.getElementById('custNotes').value.trim();
  const paymentMethod = document.querySelector('input[name="payMethod"]:checked')?.value || "COD";

  if (!name || !phone || !address) {
    alert("Please fill in your Name, Phone Number, and Delivery Address.");
    return;
  }

  const cartItemIds = Object.keys(cart);
  if (cartItemIds.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let subtotal = 0;
  const orderItemsList = [];
  let msg = `🛒 *NEW GROCERY ORDER - ORDER KAARO*\n`;
  msg += `📍 Location: Kishanganj, Bihar\n`;
  msg += `------------------------------------\n`;
  msg += `👤 *Customer Details:*\n`;
  msg += `• Name: ${name}\n`;
  msg += `• Phone: ${phone}\n`;
  msg += `• Delivery Address: ${address}\n`;
  if (notes) msg += `• Special Notes: ${notes}\n`;
  msg += `• Payment Choice: ${paymentMethod}\n`;
  msg += `------------------------------------\n`;
  msg += `🛍️ *Order Items:*\n`;

  cartItemIds.forEach((id, idx) => {
    const item = productsDatabase.find(p => p.id === id);
    if (item) {
      const q = cart[id];
      const itemTot = item.price * q;
      subtotal += itemTot;
      msg += `${idx + 1}. *${item.name}* (${item.unit})\n   Qty: ${q} × ₹${item.price} = ₹${itemTot}\n`;
      orderItemsList.push({ id: item.id, name: item.name, unit: item.unit, price: item.price, qty: q });
    }
  });

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_CHARGE;
  const grandTotal = subtotal + deliveryFee;

  msg += `------------------------------------\n`;
  msg += `💵 Subtotal: ₹${subtotal}\n`;
  msg += `🚚 Delivery Fee: ${deliveryFee === 0 ? "FREE" : "₹" + deliveryFee}\n`;
  msg += `💰 *GRAND TOTAL: ₹${grandTotal}*\n`;
  msg += `------------------------------------\n`;
  msg += `Please confirm my order & delivery timing. Thank you!`;

  const newOrderRecord = {
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    items: orderItemsList,
    grandTotal: grandTotal
  };
  orders.push(newOrderRecord);
  localStorage.setItem('orderkaaro_orders', JSON.stringify(orders));

  saveProfile(name, phone, address);

  cart = {};
  saveCart();
  closeModal();
  closeCart();

  const encodedMsg = encodeURIComponent(msg);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodedMsg}`, '_blank');
}