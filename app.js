/* ==========================================================================
   Order Kaaro – Kishanganj Grocery Delivery Application Core JavaScript
   ========================================================================== */

const WA_NUMBER = "919942089120";
const FLAT_DELIVERY_CHARGE = 50;
const FREE_DELIVERY_THRESHOLD = 500;

// ==========================================================================
// COMPLETE 164-ITEM PRODUCT DATABASE
// ==========================================================================
const productsDatabase = [
  // --- ATTA, RICE & GRAINS ---
  { id: "P001", name: "Aashirvaad Shud Chakki Atta", unit: "5 kg", price: 240, category: "Atta, Rice & Grains", emoji: "🌾" },
  { id: "P002", name: "Amrit Bhog Atta", unit: "5 kg", price: 220, category: "Atta, Rice & Grains", emoji: "🌾" },
  { id: "P009", name: "Besan", unit: "1 kg", price: 115, category: "Atta, Rice & Grains", emoji: "🟡" },
  { id: "P055", name: "Katarni Chura", unit: "500 g", price: 50, category: "Atta, Rice & Grains", emoji: "🍚" },
  { id: "P056", name: "Katarni Chura", unit: "1 kg", price: 90, category: "Atta, Rice & Grains", emoji: "🍚" },
  { id: "P071", name: "Sattu", unit: "200 g", price: 31, category: "Atta, Rice & Grains", emoji: "💪" },
  { id: "P072", name: "Sattu", unit: "500 g", price: 70, category: "Atta, Rice & Grains", emoji: "💪" },
  { id: "P075", name: "Amrit Bhog Sooji", unit: "1 kg", price: 60, category: "Atta, Rice & Grains", emoji: "🌾" },
  { id: "P077", name: "Sugar", unit: "1 kg", price: 55, category: "Atta, Rice & Grains", emoji: "🍬" },
  { id: "P083", name: "Chawal", unit: "1 kg", price: 70, category: "Atta, Rice & Grains", emoji: "🍚" },
  { id: "P084", name: "Sooji", unit: "1 kg", price: 60, category: "Atta, Rice & Grains", emoji: "🌾" },
  { id: "P103", name: "Popcorn Makki Loose", unit: "500 g", price: 70, category: "Atta, Rice & Grains", emoji: "🌽" },
  { id: "P115", name: "Vermicelli", unit: "1 kg", price: 120, category: "Atta, Rice & Grains", emoji: "🍜" },
  { id: "P119", name: "Maida", unit: "1 kg", price: 50, category: "Atta, Rice & Grains", emoji: "🌾" },

  // --- PULSES, DAL & CHANA ---
  { id: "P006", name: "Arahar Dal", unit: "1 kg", price: 130, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P007", name: "Arahar Dal", unit: "500 g", price: 65, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P027", name: "Dal Makhani Special Dal", unit: "400 g", price: 70, category: "Pulses & Dal", emoji: "🍛" },
  { id: "P028", name: "Dal Makhani Special Dal", unit: "800 g", price: 140, category: "Pulses & Dal", emoji: "🍛" },
  { id: "P036", name: "Gota Kalai Dal", unit: "500 g", price: 60, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P037", name: "Gota Kalai Dal", unit: "1 kg", price: 120, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P038", name: "Chilka Wali Masoor Dal", unit: "1 kg", price: 140, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P039", name: "Gota Massor Dal", unit: "1 kg", price: 140, category: "Pulses & Dal", emoji: "🟠" },
  { id: "P040", name: "Gota Massor Dal", unit: "500 g", price: 70, category: "Pulses & Dal", emoji: "🟠" },
  { id: "P041", name: "Gota Moong Dal", unit: "500 g", price: 60, category: "Pulses & Dal", emoji: "💛" },
  { id: "P042", name: "Gota Moong Dal", unit: "1 kg", price: 120, category: "Pulses & Dal", emoji: "💛" },
  { id: "P047", name: "Gota Kala Channa", unit: "500 g", price: 45, category: "Pulses & Dal", emoji: "🟤" },
  { id: "P048", name: "Gota Kala Channa", unit: "1 kg", price: 90, category: "Pulses & Dal", emoji: "🟤" },
  { id: "P049", name: "Kabuli Channa", unit: "1 kg", price: 95, category: "Pulses & Dal", emoji: "⚪" },
  { id: "P050", name: "Kabuli Channa", unit: "500 g", price: 50, category: "Pulses & Dal", emoji: "⚪" },
  { id: "P051", name: "Kala Chana", unit: "1 kg", price: 80, category: "Pulses & Dal", emoji: "🟤" },
  { id: "P052", name: "Kala Chana", unit: "500 g", price: 40, category: "Pulses & Dal", emoji: "🟤" },
  { id: "P053", name: "Kalai Dal", unit: "500 g", price: 70, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P054", name: "Kalai Dal", unit: "1 kg", price: 140, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P061", name: "Massor Dal", unit: "500 g", price: 60, category: "Pulses & Dal", emoji: "🟠" },
  { id: "P062", name: "Massor Dal", unit: "1 kg", price: 120, category: "Pulses & Dal", emoji: "🟠" },
  { id: "P063", name: "Moong Dal", unit: "500 g", price: 60, category: "Pulses & Dal", emoji: "💛" },
  { id: "P064", name: "Moth", unit: "1 kg", price: 120, category: "Pulses & Dal", emoji: "🌾" },
  { id: "P086", name: "Mouth", unit: "500 g", price: 45, category: "Pulses & Dal", emoji: "🌾" },
  { id: "P097", name: "Chana Dal", unit: "1 kg", price: 96, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P108", name: "Chana Dal", unit: "500 g", price: 40, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P109", name: "Chole Chana", unit: "500 g", price: 48, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P123", name: "Gota Kalai Dal", unit: "250 g", price: 30, category: "Pulses & Dal", emoji: "🫘" },
  { id: "P124", name: "Kalai Dal", unit: "250 g", price: 35, category: "Pulses & Dal", emoji: "🫘" },

  // --- COOKING OILS & GHEE ---
  { id: "P004", name: "Amul Ghee", unit: "1 kg", price: 649, category: "Cooking Oils & Ghee", emoji: "🧈" },
  { id: "P029", name: "Dhara Kachi Gani", unit: "1 L", price: 179, category: "Cooking Oils & Ghee", emoji: "🛢️" },
  { id: "P030", name: "Fortune Kachi Gani", unit: "1 L", price: 178, category: "Cooking Oils & Ghee", emoji: "🛢️" },
  { id: "P031", name: "Fortune Kachi Ghanni Jar 15kg", unit: "15 kg", price: 3000, category: "Cooking Oils & Ghee", emoji: "🛢️" },
  { id: "P032", name: "Fortune Soya Refine", unit: "1 L", price: 145, category: "Cooking Oils & Ghee", emoji: "🍳" },
  { id: "P057", name: "King Kachi Ghani", unit: "1 L", price: 175, category: "Cooking Oils & Ghee", emoji: "👑" },
  { id: "P058", name: "King Soya Refine", unit: "1 L", price: 130, category: "Cooking Oils & Ghee", emoji: "👑" },
  { id: "P085", name: "Rice Bran Oil", unit: "1 L", price: 175, category: "Cooking Oils & Ghee", emoji: "🌾" },
  { id: "P122", name: "Engine Kacchi Ghani Oil", unit: "1 L", price: 215, category: "Cooking Oils & Ghee", emoji: "🛢️" },

  // --- BISCUITS & COOKIES ---
  { id: "P005", name: "Anmol Dream Lite Salty Butterly Crunch", unit: "1 pcs", price: 5, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P008", name: "Baba Elaichi Toast", unit: "1 pcs", price: 60, category: "Biscuits & Bakery", emoji: "🍞" },
  { id: "P010", name: "Bisk Farm Butter Biscotti", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P011", name: "Bisk Farm Champ Milkuit", unit: "1 pcs", price: 25, category: "Biscuits & Bakery", emoji: "🥛" },
  { id: "P012", name: "Bisk Farm Coco Wonder", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🍫" },
  { id: "P013", name: "Bisk Farm Jeera Wonder", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🌾" },
  { id: "P014", name: "Bisk Farm Mast Jeera", unit: "1 pcs", price: 45, category: "Biscuits & Bakery", emoji: "🌾" },
  { id: "P015", name: "Bisk Farm Ruskit", unit: "1 pcs", price: 35, category: "Biscuits & Bakery", emoji: "🍞" },
  { id: "P016", name: "Bisk Farm Top Gold", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🥇" },
  { id: "P017", name: "Bisk Farm Top Herbs", unit: "1 pcs", price: 35, category: "Biscuits & Bakery", emoji: "🌿" },
  { id: "P018", name: "Britannia 50-50 Golmaal Kala Jeera", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P019", name: "Britannia 50-50 Marie Gold", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P020", name: "Britannia 50-50 Top Butterly Bites", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🧈" },
  { id: "P021", name: "Britannia Bourbon", unit: "1 pcs", price: 35, category: "Biscuits & Bakery", emoji: "🍫" },
  { id: "P022", name: "Britannia GoodDay Butter Cookies", unit: "1 pcs", price: 40, category: "Biscuits & Bakery", emoji: "🧈" },
  { id: "P023", name: "Britannia GoodDay Cashew Almond", unit: "1 pcs", price: 40, category: "Biscuits & Bakery", emoji: "🌰" },
  { id: "P024", name: "Britannia Milk Bikis", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🥛" },
  { id: "P025", name: "Britannia Nutri Choice Digestive High Fibre", unit: "1 pcs", price: 55, category: "Biscuits & Bakery", emoji: "💚" },
  { id: "P026", name: "Coco Wonder", unit: "1 pcs", price: 30, category: "Biscuits & Bakery", emoji: "🍫" },
  { id: "P033", name: "Fruit Cake", unit: "1 pcs", price: 80, category: "Biscuits & Bakery", emoji: "🍰" },
  { id: "P043", name: "Home Bake Premium Cookies Mix Flavours Green", unit: "1 pcs", price: 55, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P044", name: "Home Bake Premium Cookies Mix Flavours Red", unit: "1 pcs", price: 55, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P045", name: "Homebread Cookies", unit: "1 pcs", price: 80, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P060", name: "Malkist Cheese Flavoured", unit: "1 pcs", price: 45, category: "Biscuits & Bakery", emoji: "🧀" },
  { id: "P068", name: "Oreo", unit: "1 pcs", price: 10, category: "Biscuits & Bakery", emoji: "⚫" },
  { id: "P069", name: "Parle Monaco Classic", unit: "1 pcs", price: 70, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P070", name: "Ruskit", unit: "1 pcs", price: 40, category: "Biscuits & Bakery", emoji: "🍞" },
  { id: "P074", name: "Sunfeast Mom's Magic Ghee Roasted", unit: "1 pcs", price: 64, category: "Biscuits & Bakery", emoji: "🍪" },
  { id: "P081", name: "Bisk Farm Mast Jeera", unit: "1 pcs", price: 45, category: "Biscuits & Bakery", emoji: "🌾" },
  { id: "P120", name: "Milk Bikis", unit: "1 pcs", price: 40, category: "Biscuits & Bakery", emoji: "🥛" },
  { id: "P121", name: "Time Pass 50-50", unit: "1 pcs", price: 25, category: "Biscuits & Bakery", emoji: "🍪" },

  // --- TEA, COFFEE & BEVERAGES ---
  { id: "P034", name: "Glucon-D Regular", unit: "1 pcs", price: 39, category: "Tea & Beverages", emoji: "⚡" },
  { id: "P035", name: "Glucon-D Tangy Orange", unit: "1 pcs", price: 55, category: "Tea & Beverages", emoji: "🍊" },
  { id: "P046", name: "Horlicks", unit: "1 kg", price: 264, category: "Tea & Beverages", emoji: "🥛" },
  { id: "P087", name: "Independence Mineral Water", unit: "1.5 L", price: 20, category: "Tea & Beverages", emoji: "💧" },
  { id: "P093", name: "Mogu Mogu", unit: "1 pcs", price: 70, category: "Tea & Beverages", emoji: "🧃" },
  { id: "P125", name: "Special Chaipatti", unit: "1 kg", price: 499, category: "Tea & Beverages", emoji: "☕" },
  { id: "P128", name: "CTC Tea", unit: "1 kg", price: 300, category: "Tea & Beverages", emoji: "☕" },
  { id: "P129", name: "CTC Tea", unit: "500 g", price: 150, category: "Tea & Beverages", emoji: "☕" },
  { id: "P130", name: "CTC Tea", unit: "250 g", price: 75, category: "Tea & Beverages", emoji: "☕" },
  { id: "P131", name: "Darjeeling Mix Tea", unit: "250 g", price: 100, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P132", name: "Darjeeling Mix Tea", unit: "500 g", price: 200, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P133", name: "Darjeeling Mix Tea", unit: "1 kg", price: 400, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P134", name: "Darjeeling Mix Tea (Assam)", unit: "250 g", price: 125, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P135", name: "Darjeeling Mix Tea (Assam)", unit: "500 g", price: 250, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P136", name: "Darjeeling Mix Tea (Assam)", unit: "1 kg", price: 500, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P137", name: "Kesar Tea", unit: "250 g", price: 175, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P138", name: "Kesar Tea", unit: "500 g", price: 350, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P139", name: "Kesar Tea", unit: "1 kg", price: 600, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P140", name: "Masala Tea", unit: "250 g", price: 175, category: "Tea & Beverages", emoji: "☕" },
  { id: "P141", name: "Masala Tea", unit: "500 g", price: 300, category: "Tea & Beverages", emoji: "☕" },
  { id: "P142", name: "Masala Tea", unit: "1 kg", price: 600, category: "Tea & Beverages", emoji: "☕" },
  { id: "P143", name: "Elaichi Tea (Cardamom Chai)", unit: "250 g", price: 120, category: "Tea & Beverages", emoji: "☕" },
  { id: "P144", name: "Elaichi Tea (Cardamom Chai)", unit: "500 g", price: 220, category: "Tea & Beverages", emoji: "☕" },
  { id: "P145", name: "Elaichi Tea (Cardamom Chai)", unit: "1 kg", price: 440, category: "Tea & Beverages", emoji: "☕" },
  { id: "P146", name: "Plain Tea", unit: "250 g", price: 100, category: "Tea & Beverages", emoji: "☕" },
  { id: "P147", name: "Plain Tea", unit: "500 g", price: 200, category: "Tea & Beverages", emoji: "☕" },
  { id: "P148", name: "Plain Tea", unit: "1 kg", price: 400, category: "Tea & Beverages", emoji: "☕" },
  { id: "P149", name: "Rajbari Tea Pouch", unit: "250 g", price: 125, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P150", name: "Rajbari Tea Pouch", unit: "500 g", price: 250, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P151", name: "Rajbari Tea Pouch", unit: "1 kg", price: 500, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P152", name: "Rajbari Tea Jar", unit: "250 g", price: 130, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P153", name: "Rajbari Tea Jar", unit: "500 g", price: 260, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P154", name: "Rajbari Tea Jar", unit: "1 kg", price: 520, category: "Tea & Beverages", emoji: "🫖" },
  { id: "P155", name: "Tea Max Darjeeling Saffron Green Tea", unit: "100 g", price: 600, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P156", name: "Tea Max Darjeeling Green Tea Jar", unit: "50 g", price: 300, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P157", name: "Tea Max Darjeeling Green Tea Jar", unit: "100 g", price: 600, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P158", name: "Lipton Green Tea 25 Tea Bags", unit: "32.5 g", price: 200, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P159", name: "Lipton Green Tea 100 Tea Bags", unit: "130 g", price: 600, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P160", name: "White Tea Super", unit: "100 g", price: 1000, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P161", name: "White Tea", unit: "100 g", price: 500, category: "Tea & Beverages", emoji: "🍵" },
  { id: "P162", name: "Nescafe Classic Instant Coffee Powder", unit: "25 g", price: 124, category: "Tea & Beverages", emoji: "☕" },
  { id: "P163", name: "Nestle Classic Coffee Soluble Instant", unit: "50 g", price: 235, category: "Tea & Beverages", emoji: "☕" },
  { id: "P164", name: "Real Fruit Juice Pomegranate Anar", unit: "1 L", price: 125, category: "Tea & Beverages", emoji: "🧃" },

  // --- SNACKS & INSTANT FOOD ---
  { id: "P059", name: "Kurkure Puffcorn", unit: "1 pcs", price: 10, category: "Snacks & Instant", emoji: "🍿" },
  { id: "P065", name: "Nilon’s Green Chilly Sauce", unit: "90 g", price: 25, category: "Snacks & Instant", emoji: "🌶️" },
  { id: "P066", name: "Nilon’s Red Chilly Sauce", unit: "80 g", price: 25, category: "Snacks & Instant", emoji: "🌶️" },
  { id: "P067", name: "Nilon’s Schezwan Chutney", unit: "80 g", price: 35, category: "Snacks & Instant", emoji: "🌶️" },
  { id: "P079", name: "Bingo Tedhe Medhe", unit: "1 pcs", price: 5, category: "Snacks & Instant", emoji: "🍟" },
  { id: "P080", name: "Lay's Potato Chips - Simple Classic Salted", unit: "1 pcs", price: 20, category: "Snacks & Instant", emoji: "🥔" },
  { id: "P082", name: "Punjabi Tadka", unit: "1 pcs", price: 10, category: "Snacks & Instant", emoji: "🥨" },
  { id: "P094", name: "Maggi", unit: "1 pcs", price: 15, category: "Snacks & Instant", emoji: "🍜" },
  { id: "P106", name: "Haldirams Delhi Bhujiya", unit: "1 kg", price: 280, category: "Snacks & Instant", emoji: "🥨" },
  { id: "P113", name: "Mala Chanachur", unit: "400 g", price: 100, category: "Snacks & Instant", emoji: "🥜" },

  // --- SPICES & DRY FRUITS ---
  { id: "P076", name: "Tata Salt", unit: "1 kg", price: 30, category: "Spices & Dry Fruits", emoji: "🧂" },
  { id: "P090", name: "Everest Chaat Masala", unit: "1 pcs", price: 44, category: "Spices & Dry Fruits", emoji: "🧂" },
  { id: "P098", name: "Dhania Powder", unit: "1 pcs", price: 85, category: "Spices & Dry Fruits", emoji: "🌿" },
  { id: "P099", name: "Mirchi Powder", unit: "1 pcs", price: 130, category: "Spices & Dry Fruits", emoji: "🌶️" },
  { id: "P100", name: "Geera Powder", unit: "1 pcs", price: 180, category: "Spices & Dry Fruits", emoji: "🌾" },
  { id: "P104", name: "Catch Dal Makhani Masala", unit: "1 pcs", price: 80, category: "Spices & Dry Fruits", emoji: "🍛" },
  { id: "P110", name: "Dhani Powder", unit: "1 box", price: 85, category: "Spices & Dry Fruits", emoji: "🌿" },
  { id: "P111", name: "Mirchi Powder", unit: "1 box", price: 130, category: "Spices & Dry Fruits", emoji: "🌶️" },
  { id: "P112", name: "Geera Powder", unit: "1 box", price: 180, category: "Spices & Dry Fruits", emoji: "🌾" },
  { id: "P116", name: "Kismis / Raisins", unit: "250 g", price: 149, category: "Spices & Dry Fruits", emoji: "🍇" },
  { id: "P118", name: "Coconut", unit: "1 pcs", price: 50, category: "Spices & Dry Fruits", emoji: "🥥" },
  { id: "P126", name: "Kaju", unit: "1 kg", price: 999, category: "Spices & Dry Fruits", emoji: "🌰" },
  { id: "P127", name: "Gotta Jeera", unit: "1 kg", price: 260, category: "Spices & Dry Fruits", emoji: "🌾" },

  // --- DAIRY, PERSONAL & HOUSEHOLD ---
  { id: "P003", name: "Amul Cheese Cubes", unit: "1 pcs", price: 22, category: "Dairy & Household", emoji: "🧀" },
  { id: "P073", name: "Surf Excel", unit: "500 g", price: 71, category: "Dairy & Household", emoji: "🧼" },
  { id: "P078", name: "Cetaphil", unit: "1 pcs", price: 414, category: "Dairy & Household", emoji: "🧴" },
  { id: "P088", name: "Vim Bar", unit: "1 pcs", price: 10, category: "Dairy & Household", emoji: "🧼" },
  { id: "P089", name: "Rin Bar", unit: "1 pcs", price: 10, category: "Dairy & Household", emoji: "🧼" },
  { id: "P091", name: "Cellotape", unit: "1 pcs", price: 10, category: "Dairy & Household", emoji: "📦" },
  { id: "P092", name: "Korean Paper", unit: "1 pcs", price: 20, category: "Dairy & Household", emoji: "📄" },
  { id: "P095", name: "Streaks Argan Secrets Hair Colour", unit: "1 pcs", price: 205, category: "Dairy & Household", emoji: "💇" },
  { id: "P096", name: "Streaks Argan Secrets Developer", unit: "1 pcs", price: 130, category: "Dairy & Household", emoji: "💇" },
  { id: "P101", name: "Aerial Surf", unit: "1 kg", price: 140, category: "Dairy & Household", emoji: "🧼" },
  { id: "P102", name: "Girigola", unit: "1 pcs", price: 38, category: "Dairy & Household", emoji: "🛍️" },
  { id: "P107", name: "Eno", unit: "1 pcs", price: 10, category: "Dairy & Household", emoji: "💊" },
  { id: "P114", name: "Lisol", unit: "945 ml", price: 249, category: "Dairy & Household", emoji: "🧹" },
  { id: "P117", name: "Wheel Surf", unit: "1 kg", price: 70, category: "Dairy & Household", emoji: "🧼" }
];

// State Management (Persisted in localStorage)
let cart = JSON.parse(localStorage.getItem('order_kaaro_cart') || '{}');
let wishlist = JSON.parse(localStorage.getItem('order_kaaro_wishlist') || '[]');
let orders = JSON.parse(localStorage.getItem('order_kaaro_orders') || '[]');
let profile = JSON.parse(localStorage.getItem('order_kaaro_profile') || '{"name":"","phone":"","address":""}');

let activeCategory = "All";

// Save States Helpers
function saveCart() {
  localStorage.setItem('order_kaaro_cart', JSON.stringify(cart));
  renderCart();
  updateHeaderBadges();
  renderProducts();
}

function saveWishlist() {
  localStorage.setItem('order_kaaro_wishlist', JSON.stringify(wishlist));
  updateHeaderBadges();
  renderWishlistModal();
  renderProducts();
}

function saveOrders() {
  localStorage.setItem('order_kaaro_orders', JSON.stringify(orders));
  updateHeaderBadges();
  renderOrdersModal();
}

function saveProfile(name, phone, address) {
  profile = { name, phone, address };
  localStorage.setItem('order_kaaro_profile', JSON.stringify(profile));
  renderProfileModal();
}

// Wishlist Toggle
function toggleWishlist(id, event) {
  if (event) event.stopPropagation();
  const idx = wishlist.indexOf(id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(id);
  }
  saveWishlist();
  
  const btn = document.getElementById(`wl_btn_${id}`);
  if (btn) {
    btn.classList.add('pop-anim');
    setTimeout(() => btn.classList.remove('pop-anim'), 300);
  }
}

// ==========================================================================
// RENDER CATEGORY PILLS & SECTIONS
// ==========================================================================
function getUniqueCategories() {
  const cats = ["All"];
  productsDatabase.forEach(p => {
    if (!cats.includes(p.category)) cats.push(p.category);
  });
  return cats;
}

function renderCategories() {
  const catRow = document.getElementById('catRow');
  if (!catRow) return;
  
  const categories = getUniqueCategories();
  catRow.innerHTML = categories.map(cat => `
    <button class="cat-pill ${cat === activeCategory ? 'active' : ''}" onclick="selectCategory('${cat}', this)">
      ${cat}
    </button>
  `).join('');
}

function selectCategory(cat, el) {
  activeCategory = cat;
  renderCategories();
  renderProducts();
  
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

// ==========================================================================
// RENDER PRODUCTS
// ==========================================================================
function renderProducts() {
  const brandSections = document.getElementById('brandSections');
  if (!brandSections) return;
  
  const searchInput = document.getElementById('searchInput');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  
  let filtered = productsDatabase;
  
  if (activeCategory !== "All") {
    filtered = filtered.filter(p => p.category === activeCategory);
  }
  
  if (query) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.unit.toLowerCase().includes(query)
    );
  }
  
  // Group by category for structured sections
  const grouped = {};
  filtered.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });
  
  if (filtered.length === 0) {
    brandSections.innerHTML = `
      <div class="no-results">
        <div style="font-size:3rem;margin-bottom:10px">🔍</div>
        <h3 style="font-size:1.1rem;margin-bottom:6px">No products found for "${query}"</h3>
        <p style="font-size:0.85rem">Try searching for atta, dal, ghee, tea, or biscuits</p>
      </div>
    `;
    return;
  }
  
  brandSections.innerHTML = Object.keys(grouped).map(catName => `
    <div class="section-head" id="sec_${catName.replace(/[^a-zA-Z0-9]/g, '_')}">
      <div class="section-head-left">
        <span class="section-title">${catName}</span>
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
  return `
    <div class="product-card" id="card_${p.id}">
      <span class="product-badge-id">${p.id}</span>
      <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" id="wl_btn_${p.id}" onclick="toggleWishlist('${p.id}', event)" title="Add to Wishlist">
        ${isWishlisted ? '❤️' : '🤍'}
      </button>
      <div class="product-img-wrap">
        <span class="emoji-icon">${p.emoji}</span>
      </div>
      <span class="product-unit">${p.unit}</span>
      <div class="product-name">${p.name}</div>
      <div class="product-price-row">
        <span class="product-price">₹${p.price}</span>
      </div>
      ${qty === 0 ? `
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
  
  const featuredIds = ["P001", "P004", "P006", "P029", "P022", "P125", "P094", "P076", "P080", "P162"];
  const featured = productsDatabase.filter(p => featuredIds.includes(p.id));
  
  dealsRow.innerHTML = featured.map(p => {
    const qty = cart[p.id] || 0;
    const isWishlisted = wishlist.includes(p.id);
    return `
      <div class="deal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span class="product-unit" style="margin-bottom:0">${p.unit}</span>
          <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" id="wl_btn_deal_${p.id}" onclick="toggleWishlist('${p.id}', event)" title="Wishlist" style="position:static;width:24px;height:24px;font-size:0.85rem">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="product-img-wrap" style="height:70px;margin-bottom:8px">
          <span class="emoji-icon" style="font-size:2.4rem">${p.emoji}</span>
        </div>
        <div class="product-name" style="font-size:0.82rem">${p.name}</div>
        <div class="product-price-row" style="margin-bottom:8px">
          <span class="product-price" style="font-size:1rem">₹${p.price}</span>
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
    fbDelivery.innerText = delivery === 0 ? "FREE delivery" : `+ ₹${delivery} delivery`;
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
      <div class="empty-cart-wrap">
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
    const qty = cart[id];
    const itemTotal = p.price * qty;
    subtotal += itemTotal;
    
    return `
      <div class="cart-item-row">
        <div class="ci-emoji">${p.emoji}</div>
        <div class="ci-info">
          <div class="ci-name">${p.name}</div>
          <div class="ci-unit">${p.unit} • ₹${p.price}</div>
          <div class="ci-price">₹${itemTotal}</div>
        </div>
        <div class="ci-qty">
          <button class="ciq-btn" onclick="updateQty('${p.id}', ${qty - 1})">-</button>
          <span class="ciq-num">${qty}</span>
          <button class="ciq-btn" onclick="updateQty('${p.id}', ${qty + 1})">+</button>
        </div>
        <button class="ci-remove" onclick="updateQty('${p.id}', 0)" title="Remove item">✕</button>
      </div>
    `;
  }).join('');
  
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_CHARGE;
  const grandTotal = subtotal + delivery;
  
  cartFooter.innerHTML = `
    <div class="delivery-box">
      <div class="db-row">
        <span class="lbl">Item Subtotal</span>
        <span class="val">₹${subtotal}</span>
      </div>
      <div class="db-row">
        <span class="lbl">Delivery Fee</span>
        <span class="val" style="${delivery === 0 ? 'color:var(--primary)' : ''}">
          ${delivery === 0 ? 'FREE' : '₹' + delivery}
        </span>
      </div>
      ${subtotal < FREE_DELIVERY_THRESHOLD ? `
        <div style="font-size:0.75rem;color:var(--accent);margin-top:4px">
          💡 Add ₹${FREE_DELIVERY_THRESHOLD - subtotal} more for FREE Delivery!
        </div>
      ` : ''}
      <div class="db-row grand">
        <span class="lbl">Grand Total</span>
        <span class="val">₹${grandTotal}</span>
      </div>
    </div>
    <button class="wa-send-btn" onclick="openModal()">
      <span>📲 Proceed to Delivery Details</span>
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
    return `
      <div class="cart-item-row">
        <div class="ci-emoji">${p.emoji}</div>
        <div class="ci-info">
          <div class="ci-name">${p.name}</div>
          <div class="ci-unit">${p.unit}</div>
          <div class="ci-price">₹${p.price}</div>
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
        <button class="product-add-btn" style="height:34px;width:95px;font-size:0.78rem" onclick="reorderItems('${encodeURIComponent(JSON.stringify(order.items))}')">🔄 Reorder</button>
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
  // Auto-fill from saved Profile
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
// SEARCH HANDLERS
// ==========================================================================
function doSearch(val) {
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    if (val.trim()) clearBtn.classList.add('show');
    else clearBtn.classList.remove('show');
  }
  renderProducts();
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  doSearch('');
}

// ==========================================================================
// WHATSAPP CHECKOUT ORDER GENERATOR
// ==========================================================================
function confirmOrder() {
  const nameInput = document.getElementById('custName');
  const addrInput = document.getElementById('custAddress');
  const phoneInput = document.getElementById('custPhone');
  
  const nameErr = document.getElementById('nameErr');
  const addrErr = document.getElementById('addrErr');
  const phoneErr = document.getElementById('phoneErr');
  
  let valid = true;
  
  if (!nameInput.value.trim()) {
    nameInput.classList.add('err');
    if (nameErr) nameErr.style.display = 'block';
    valid = false;
  } else {
    nameInput.classList.remove('err');
    if (nameErr) nameErr.style.display = 'none';
  }
  
  if (!addrInput.value.trim()) {
    addrInput.classList.add('err');
    if (addrErr) addrErr.style.display = 'block';
    valid = false;
  } else {
    addrInput.classList.remove('err');
    if (addrErr) addrErr.style.display = 'none';
  }
  
  const phoneVal = phoneInput.value.trim();
  if (!/^[6-9]\d{9}$/.test(phoneVal)) {
    phoneInput.classList.add('err');
    if (phoneErr) phoneErr.style.display = 'block';
    valid = false;
  } else {
    phoneInput.classList.remove('err');
    if (phoneErr) phoneErr.style.display = 'none';
  }
  
  if (!valid) return;

  // Auto save profile for next time
  saveProfile(nameInput.value.trim(), phoneVal, addrInput.value.trim());

  // Record order history
  const orderItems = [];
  let subtotal = 0;

  let text = `🛒 *NEW GROCERY ORDER - ORDER KAARO*\n`;
  text += `------------------------------------\n`;
  text += `👤 *Customer*: ${nameInput.value.trim()}\n`;
  text += `📞 *Phone*: ${phoneVal}\n`;
  text += `📍 *Address*: ${addrInput.value.trim()}\n`;
  text += `------------------------------------\n`;
  text += `📦 *ORDER ITEMS*:\n`;
  
  Object.keys(cart).forEach(id => {
    const p = productsDatabase.find(item => item.id === id);
    if (p) {
      const qty = cart[id];
      const itemTotal = p.price * qty;
      subtotal += itemTotal;
      text += `• ${p.name} (${p.unit}) x ${qty} = ₹${itemTotal}\n`;
      orderItems.push({ id: p.id, name: p.name, unit: p.unit, price: p.price, qty: qty });
    }
  });
  
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_CHARGE;
  const grandTotal = subtotal + delivery;
  
  text += `------------------------------------\n`;
  text += `💰 *Subtotal*: ₹${subtotal}\n`;
  text += `🚚 *Delivery Fee*: ${delivery === 0 ? "FREE" : "₹" + delivery}\n`;
  text += `💵 *GRAND TOTAL*: ₹${grandTotal}\n`;
  text += `------------------------------------\n`;
  text += `Please confirm my order delivery in Kishanganj. Thank you!`;

  // Save to orders state
  orders.push({
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    items: orderItems,
    subtotal: subtotal,
    delivery: delivery,
    grandTotal: grandTotal
  });
  saveOrders();
  
  const encoded = encodeURIComponent(text);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
  
  // Clear cart upon submitting order
  cart = {};
  saveCart();
  closeModal();
  
  // Open WhatsApp in new tab
  window.open(waUrl, '_blank');
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderTopDeals();
  renderProducts();
  renderCart();
  renderWishlistModal();
  renderOrdersModal();
  renderProfileModal();
  updateHeaderBadges();
});
