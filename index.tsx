import { GoogleGenAI, Chat, Type } from "@google/genai";
import { marked } from 'marked';

// TODO: Replace with your actual WeatherAPI.com API key
const WEATHER_API_KEY = '4522ecbfce5d46fab22115230251309';

// TODO: Replace 'YOUR_GOOGLE_GENAI_API_KEY' with your actual API key or use a secure method to inject it
const ai = new GoogleGenAI({apiKey: 'AIzaSyCvEfS-nRy8q1Bpx2SQiRIXzoKdVdjKMOA'});
let chat: Chat;

const offlineCropPriceData = {
  "metadata": {
    "region": "Gujarat (demo values)",
    "unit_price": "INR per kg",
    "generated_for": "KisanMitra offline/demo dataset",
    "disclaimer": "Demo/sample values for hackathon; not authoritative market data. Use for demo and offline flows only."
  },
  "crops": [
    { "crop": "rice", "main_season": "Kharif", "state_avg_price_inr_per_kg": 18.5, "cities": { "Ahmedabad": 19, "Surat": 18.5, "Rajkot": 18, "Vadodara": 18.2 } },
    { "crop": "wheat", "main_season": "Rabi", "state_avg_price_inr_per_kg": 21, "cities": { "Ahmedabad": 21.5, "Surat": 21.2, "Rajkot": 20.5, "Vadodara": 21 } },
    { "crop": "sugarcane", "main_season": "Kharif", "state_avg_price_inr_per_kg": 3.5, "cities": { "Ahmedabad": 3.6, "Surat": 3.55, "Rajkot": 3.4, "Vadodara": 3.5 } },
    { "crop": "cotton", "main_season": "Kharif", "state_avg_price_inr_per_kg": 52, "cities": { "Ahmedabad": 53, "Surat": 52.5, "Rajkot": 51, "Vadodara": 52 } },
    { "crop": "pulses", "main_season": "Rabi/Kharif", "state_avg_price_inr_per_kg": 90, "cities": { "Ahmedabad": 93, "Surat": 92, "Rajkot": 88, "Vadodara": 91 } },
    { "crop": "oilseeds", "main_season": "Rabi/Kharif", "state_avg_price_inr_per_kg": 80, "cities": { "Ahmedabad": 82, "Surat": 81.5, "Rajkot": 78, "Vadodara": 81 } },
    { "crop": "maize", "main_season": "Kharif", "state_avg_price_inr_per_kg": 18, "cities": { "Ahmedabad": 18.5, "Surat": 18.3, "Rajkot": 17.6, "Vadodara": 18.2 } },
    { "crop": "potato", "main_season": "Rabi", "state_avg_price_inr_per_kg": 12, "cities": { "Ahmedabad": 12.3, "Surat": 12.2, "Rajkot": 11.8, "Vadodara": 12.1 } },
    { "crop": "onion", "main_season": "Kharif/Rabi", "state_avg_price_inr_per_kg": 20, "cities": { "Ahmedabad": 20.6, "Surat": 20.4, "Rajkot": 19.6, "Vadodara": 20.2 } },
    { "crop": "tomato", "main_season": "Summer/Kharif", "state_avg_price_inr_per_kg": 22, "cities": { "Ahmedabad": 22.6, "Surat": 22.4, "Rajkot": 21.5, "Vadodara": 22.2 } },
    { "crop": "soybean", "main_season": "Kharif", "state_avg_price_inr_per_kg": 45, "cities": { "Ahmedabad": 46, "Surat": 45.8, "Rajkot": 44, "Vadodara": 45.5 } },
    { "crop": "groundnut", "main_season": "Kharif", "state_avg_price_inr_per_kg": 85, "cities": { "Ahmedabad": 87.5, "Surat": 86.5, "Rajkot": 83, "Vadodara": 85.8 } },
    { "crop": "millets", "main_season": "Kharif", "state_avg_price_inr_per_kg": 25, "cities": { "Ahmedabad": 25.7, "Surat": 25.5, "Rajkot": 24.5, "Vadodara": 25.2 } },
    { "crop": "mango", "main_season": "Summer", "state_avg_price_inr_per_kg": 60, "cities": { "Ahmedabad": 61.8, "Surat": 61.2, "Rajkot": 58.8, "Vadodara": 60.6 } },
    { "crop": "banana", "main_season": "Year-round", "state_avg_price_inr_per_kg": 35, "cities": { "Ahmedabad": 36, "Surat": 35.7, "Rajkot": 34.3, "Vadodara": 35.3 } },
    { "crop": "tea", "main_season": "Year-round", "state_avg_price_inr_per_kg": 250, "cities": { "Ahmedabad": 257, "Surat": 255, "Rajkot": 245, "Vadodara": 252 } }
  ]
};

const offlineCityRecommendationData = {
  "Ahmedabad": { "season": "Rabi", "recommendedCrop": "Wheat", "farmerTipNext2h": "Irrigate lightly in the evening to retain soil moisture.", "temp": "30°C" },
  "Surat": { "season": "Kharif", "recommendedCrop": "Cotton", "farmerTipNext2h": "Check for pest activity on leaves and apply neem spray if needed.", "temp": "29°C" },
  "Rajkot": { "season": "Rabi", "recommendedCrop": "Groundnut", "farmerTipNext2h": "Avoid overwatering, keep soil slightly dry for healthy pods.", "temp": "32°C" },
  "Vadodara": { "season": "Summer", "recommendedCrop": "Maize", "farmerTipNext2h": "Weed your maize field now for better growth this season.", "temp": "34°C" },
  "Bhavnagar": { "season": "Kharif", "recommendedCrop": "Bajra", "farmerTipNext2h": "Prepare soil for next sowing with light tilling.", "temp": "31°C" },
  "Junagadh": { "season": "Kharif", "recommendedCrop": "Cotton", "farmerTipNext2h": "Monitor for bollworm and remove infected bolls immediately.", "temp": "28°C" },
  "Jamnagar": { "season": "Rabi", "recommendedCrop": "Wheat", "farmerTipNext2h": "Apply fertilizer top-dressing before irrigation today.", "temp": "29°C" },
  "Gandhinagar": { "season": "Summer", "recommendedCrop": "Vegetables (Okra)", "farmerTipNext2h": "Harvest ripe okra pods in the early morning.", "temp": "33°C" },
  "Anand": { "season": "Rabi", "recommendedCrop": "Rice", "farmerTipNext2h": "Drain excess water from rice field if standing.", "temp": "27°C" },
  "Nadiad": { "season": "Summer", "recommendedCrop": "Maize", "farmerTipNext2h": "Apply organic compost for soil health improvement.", "temp": "34°C" },
  "Bharuch": { "season": "Kharif", "recommendedCrop": "Sugarcane", "farmerTipNext2h": "Check sugarcane shoots for early stem borer damage.", "temp": "30°C" },
  "Navsari": { "season": "Kharif", "recommendedCrop": "Rice", "farmerTipNext2h": "Spray fungicide if you observe leaf spot symptoms.", "temp": "28°C" },
  "Valsad": { "season": "Kharif", "recommendedCrop": "Banana", "farmerTipNext2h": "Support banana plants with bamboo to avoid wind damage.", "temp": "30°C" },
  "Porbandar": { "season": "Summer", "recommendedCrop": "Groundnut", "farmerTipNext2h": "Check soil moisture; irrigate if cracks appear.", "temp": "33°C" },
  "Mehsana": { "season": "Rabi", "recommendedCrop": "Mustard", "farmerTipNext2h": "Remove weeds now to avoid competition for nutrients.", "temp": "26°C" },
  "Palanpur": { "season": "Rabi", "recommendedCrop": "Cumin", "farmerTipNext2h": "Thin seedlings to improve spacing and yield.", "temp": "25°C" },
  "Bhuj": { "season": "Summer", "recommendedCrop": "Millets", "farmerTipNext2h": "Mulch the soil to preserve moisture in hot weather.", "temp": "36°C" },
  "Morbi": { "season": "Rabi", "recommendedCrop": "Cotton", "farmerTipNext2h": "Clean fallen leaves around plants to prevent pests.", "temp": "31°C" },
  "Patan": { "season": "Rabi", "recommendedCrop": "Wheat", "farmerTipNext2h": "Irrigate wheat field in the evening for best results.", "temp": "28°C" },
  "Dahod": { "season": "Kharif", "recommendedCrop": "Maize", "farmerTipNext2h": "Spray organic pest repellent in the evening.", "temp": "27°C" }
};

const translations = {
  en: {
    appName: 'KisanMitra',
    welcome: 'Welcome!',
    selectLang: 'Please select your language',
    cropSelection: {
      title: 'Select crops',
      subtitle: 'Select up to 8 crops you are interested in.',
      subtitle2: 'You can always change it later.',
      next: 'Next',
      counter: (count) => `${count}/8`,
      crops: [
        { name: 'Rice', emoji: '🍚' }, { name: 'Wheat', emoji: '🌾' }, { name: 'Sugarcane', emoji: '🎋' },
        { name: 'Cotton', emoji: '⚪' }, { name: 'Pulses', emoji: '🟡' }, { name: 'Oilseeds', emoji: '🌼' },
        { name: 'Maize', emoji: '🌽' }, { name: 'Potato', emoji: '🥔' }, { name: 'Onion', emoji: '🧅' },
        { name: 'Tomato', emoji: '🍅' }, { name: 'Soybean', emoji: '🌱' }, { name: 'Groundnut', emoji: '🥜' },
        { name: 'Millets', emoji: '🌾' }, { name: 'Mango', emoji: '🥭' }, { name: 'Banana', emoji: '🍌' },
        { name: 'Tea', emoji: '🍵' },
      ],
    },
    locationSelection: {
        title: 'Your Location',
        subtitle: 'Enter your location for personalized weather and market info.',
        placeholder: 'e.g., Pune, Maharashtra',
        confirm: 'Confirm Location',
    },
    nav: { crops: 'Your Crops', market: 'Market', schemes: 'Schemes', diagnose: 'Diagnose', you: 'You' },
    crops: { header: 'Your Farm', weatherTitle: 'Today\'s Weather', cropTitle: 'Recommended Crop', cropReason: (crop) => `Ideal conditions for ${crop}.`, weatherError: 'Could not fetch weather. Please check your location and API key.', aiError: 'Could not get AI recommendation. Showing default.' },
    market: { header: 'Market Prices', subtitle: 'Live prices and trends', perQuintal: 'per quintal', marketError: 'Could not load market prices for your location.', noMarketData: 'No market data found for your selected crops in this location.' },
    schemes: {
      header: 'Government Schemes',
      schemesList: [
        { name: 'PM Kisan Samman Nidhi', benefit: 'Financial support of ₹6,000 per year.' },
        { name: 'Pradhan Mantri Fasal Bima Yojana', benefit: 'Insurance coverage against crop failure.' },
        { name: 'Kisan Credit Card (KCC)', benefit: 'Provides farmers with timely access to credit.' },
        { name: 'Soil Health Card Scheme', benefit: 'Helps improve soil health and productivity.' },
      ],
      learnMore: 'Learn More',
    },
    profile: {
      header: 'Your Profile',
      name: 'Name',
      mockName: 'Ramesh Kumar',
      language: 'Language',
      location: 'Location',
      lastCrop: 'Last Recommendation',
      myCrops: 'My Crops',
      noRecommendation: 'None yet',
      switchLanguage: 'Switch Language',
      farmDetails: 'Farm Details',
      landSize: 'Land Size (Acres)',
      soilType: 'Soil Type',
      irrigation: 'Irrigation Method',
      options: {
        landSize: ['Select...', '< 1', '1 - 5', '> 5'],
        soilType: ['Select...', 'Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay'],
        irrigation: ['Select...', 'Drip', 'Sprinkler', 'Canal', 'Well/Borewell', 'Rain-fed']
      }
    },
    chat: { title: 'AI Assistant', placeholder: 'Ask a question...', send: 'Send' },
    diagnose: {
        header: 'Crop Diagnosis',
        uploadPrompt: 'Upload a photo of a plant to identify diseases and get remedies.',
        uploadBtn: 'Upload Image',
        diagnoseBtn: 'Diagnose',
        analyzing: 'Analyzing...',
        clear: 'Diagnose Another',
        error: 'Sorry, I couldn\'t analyze this image. Please try another one.'
    },
    offline: {
        title: 'Offline Mode',
        description: 'You are offline. Select your city and enter your phone number to get a basic crop recommendation via SMS.',
        selectCity: 'Select your city',
        placeholder: 'Enter phone number',
        button: 'Get Recommendation',
        generating: 'Getting recommendation...',
        sendSms: 'Send via SMS',
        error: 'Could not generate recommendation. Please try again.',
    },
    systemInstruction: "You are 'KisanMitra', a friendly AI for Indian farmers. Respond in simple English. Use farmer-friendly emojis like 🌾, 🌱, 💧, ☀️, 🙏. Keep answers short.",
    explainScheme: (name) => `Explain the '${name}' scheme in simple terms.`,
  },
  hi: {
    appName: 'किसानमित्र',
    welcome: 'स्वागत है!',
    selectLang: 'कृपया अपनी भाषा चुनें',
    cropSelection: {
      title: 'फसलें चुनें',
      subtitle: 'जिन फसलों में आपकी रुचि है, उनमें से 8 तक चुनें।',
      subtitle2: 'आप इसे बाद में कभी भी बदल सकते हैं।',
      next: 'अगला',
      counter: (count) => `${count}/8`,
      crops: [
        { name: 'चावल', emoji: '🍚' }, { name: 'गेहूँ', emoji: '🌾' }, { name: 'गन्ना', emoji: '🎋' },
        { name: 'कपास', emoji: '⚪' }, { name: 'दालें', emoji: '🟡' }, { name: 'तिलहन', emoji: '🌼' },
        { name: 'मक्का', emoji: '🌽' }, { name: 'आलू', emoji: '🥔' }, { name: 'प्याज', emoji: '🧅' },
        { name: 'टमाटर', emoji: '🍅' }, { name: 'सोयाबीन', emoji: '🌱' }, { name: 'मूँगफली', emoji: '🥜' },
        { name: 'बाजरा', emoji: '🌾' }, { name: 'आम', emoji: '🥭' }, { name: 'केला', emoji: '🍌' },
        { name: 'चाय', emoji: '🍵' },
      ],
    },
    locationSelection: {
        title: 'आपका स्थान',
        subtitle: 'व्यक्तिगत मौसम और बाजार की जानकारी के लिए अपना स्थान दर्ज करें।',
        placeholder: 'उदा., पुणे, महाराष्ट्र',
        confirm: 'स्थान की पुष्टि करें',
    },
    nav: { crops: 'आपकी फसलें', market: 'बाजार', schemes: 'योजनाएं', diagnose: 'निदान', you: 'आप' },
    crops: { header: 'आपका खेत', weatherTitle: 'आज का मौसम', cropTitle: 'अनुशंसित फसल', cropReason: (crop) => `${crop} के लिए आदर्श स्थितियाँ।`, weatherError: 'मौसम नहीं मिल सका। कृपया अपना स्थान और एपीआई कुंजी जांचें।', aiError: 'एआई सिफारिश नहीं मिल सकी। डिफ़ॉल्ट दिखाया जा रहा है।' },
    market: { header: 'बाजार मूल्य', subtitle: 'लाइव मूल्य और रुझान', perQuintal: 'प्रति क्विंटल', marketError: 'आपके स्थान के लिए बाजार मूल्य लोड नहीं किए जा सके।', noMarketData: 'इस स्थान पर आपके द्वारा चुनी गई फसलों के लिए कोई बाजार डेटा नहीं मिला।' },
    schemes: {
      header: 'सरकारी योजनाएं',
      schemesList: [
        { name: 'पीएम किसान सम्मान निधि', benefit: 'प्रति वर्ष ₹6,000 की वित्तीय सहायता।' },
        { name: 'प्रधानमंत्री फसल बीमा योजना', benefit: 'फसल खराब होने पर बीमा कवरेज।' },
        { name: 'किसान क्रेडिट कार्ड (KCC)', benefit: 'किसानों को समय पर ऋण उपलब्ध कराना।' },
        { name: 'मृदा स्वास्थ्य कार्ड योजना', benefit: 'मिट्टी के स्वास्थ्य में सुधार करने में मदद करता है।' },
      ],
      learnMore: 'और जानें',
    },
    profile: {
      header: 'आपकी प्रोफ़ाइल',
      name: 'नाम',
      mockName: 'रमेश कुमार',
      language: 'भाषा',
      location: 'स्थान',
      lastCrop: 'पिछली सिफारिश',
      myCrops: 'मेरी फसलें',
      noRecommendation: 'अभी तक कोई नहीं',
      switchLanguage: 'भाषा बदलें',
      farmDetails: 'खेत का विवरण',
      landSize: 'भूमि का आकार (एकड़)',
      soilType: 'मिट्टी का प्रकार',
      irrigation: 'सिंचाई विधि',
      options: {
        landSize: ['चुनें...', '< 1', '1 - 5', '> 5'],
        soilType: ['चुनें...', 'जलोढ़', 'काली', 'लाल', 'लैटेराइट', 'रेतीली', 'चिकनी'],
        irrigation: ['चुनें...', 'ड्रिप', 'स्प्रिंकलर', 'नहर', 'कुआं/बोरवेल', 'वर्षा-आधारित']
      }
    },
    chat: { title: 'एआई सहायक', placeholder: 'एक सवाल पूछें...', send: 'भेजें' },
    diagnose: {
        header: 'फसल निदान',
        uploadPrompt: 'बीमारियों की पहचान करने और उपचार पाने के लिए पौधे की एक तस्वीर अपलोड करें।',
        uploadBtn: 'छवि अपलोड करें',
        diagnoseBtn: 'निदान करें',
        analyzing: 'विश्लेषण हो रहा है...',
        clear: 'दूसरा निदान करें',
        error: 'क्षमा करें, मैं इस छवि का विश्लेषण नहीं कर सका। कृपया दूसरी कोशिश करें।'
    },
    offline: {
        title: 'ऑफ़लाइन मोड',
        description: 'आप ऑफ़लाइन हैं। SMS के माध्यम से फसल की सिफारिश पाने के लिए अपना शहर चुनें और अपना फ़ोन नंबर दर्ज करें।',
        selectCity: 'अपना शहर चुनें',
        placeholder: 'फ़ोन नंबर दर्ज करें',
        button: 'सिफारिश प्राप्त करें',
        generating: 'सिफारिश प्राप्त हो रही है...',
        sendSms: 'SMS द्वारा भेजें',
        error: 'सिफारिश उत्पन्न नहीं की जा सकी। कृपया पुनः प्रयास करें।',
    },
    systemInstruction: "आप 'किसानमित्र' हैं, भारतीय किसानों के लिए एक मित्र एआई। सरल हिंदी में जवाब दें। 🌾, 🌱, 💧, ☀️, 🙏 जैसे किसान-हितैषी इमोजी का प्रयोग करें। उत्तर संक्षिप्त रखें।",
    explainScheme: (name) => `'${name}' योजना को सरल शब्दों में समझाएं।`,
  },
  gu: {
    appName: 'કિસાનમિત્ર',
    welcome: 'સ્વાગત છે!',
    selectLang: 'કૃપા કરીને તમારી ભાષા પસંદ કરો',
    cropSelection: {
      title: 'પાક પસંદ કરો',
      subtitle: 'તમને રુચિ હોય તેવા 8 જેટલા પાક પસંદ કરો.',
      subtitle2: 'તમે તેને પછીથી ગમે ત્યારે બદલી શકો છો.',
      next: 'આગળ',
      counter: (count) => `${count}/8`,
      crops: [
        { name: 'ચોખા', emoji: '🍚' }, { name: 'ઘઉં', emoji: '🌾' }, { name: 'શેરડી', emoji: '🎋' },
        { name: 'કપાસ', emoji: '⚪' }, { name: 'કઠોળ', emoji: '🟡' }, { name: 'તેલીબિયાં', emoji: '🌼' },
        { name: 'મકાઈ', emoji: '🌽' }, { name: 'બટાકા', emoji: '🥔' }, { name: 'ડુંગળી', emoji: '🧅' },
        { name: 'ટામેટા', emoji: '🍅' }, { name: 'સોયાબીન', emoji: '🌱' }, { name: 'મગફળી', emoji: '🥜' },
        { name: 'બાજરી', emoji: '🌾' }, { name: 'કેરી', emoji: '🥭' }, { name: 'કેળા', emoji: '🍌' },
        { name: 'ચા', emoji: '🍵' },
      ],
    },
    locationSelection: {
        title: 'તમારું સ્થાન',
        subtitle: 'વ્યક્તિગત હવામાન અને બજાર માહિતી માટે તમારું સ્થાન દાખલ કરો.',
        placeholder: 'દા.ત., પુણે, મહારાષ્ટ્ર',
        confirm: 'સ્થાનની પુષ્ટિ કરો',
    },
    nav: { crops: 'તમારા પાક', market: 'બજાર', schemes: 'યોજનાઓ', diagnose: 'નિદાન', you: 'તમે' },
    crops: { header: 'તમારું ખેતર', weatherTitle: 'આજનું હવામાન', cropTitle: 'ભલામણ કરેલ પાક', cropReason: (crop) => `${crop} માટે આદર્શ પરિસ્થિતિઓ.`, weatherError: 'હવામાન લાવી શકાયું નથી। કૃપા કરીને તમારું સ્થાન અને API કી તપાસો.', aiError: 'AI ભલામણ મેળવી શકાઈ નથી. ડિફૉલ્ટ બતાવી રહ્યું છે.' },
    market: { header: 'બજાર ભાવ', subtitle: 'લાઇવ ભાવો અને વલણો', perQuintal: 'પ્રતિ ક્વિન્ટલ', marketError: 'તમારા સ્થાન માટે બજાર ભાવ લોડ કરી શકાયા નથી।', noMarketData: 'આ સ્થાન પર તમારા પસંદ કરેલા પાક માટે કોઈ બજાર ડેટા મળ્યો નથી.' },
    schemes: {
      header: 'સરકારી યોજનાઓ',
      schemesList: [
        { name: 'પીએમ કિસાન સન્માન નિધિ', benefit: 'પ્રતિ વર્ષ ₹6,000 ની નાણાકીય સહાય.' },
        { name: 'પ્રધાનમંત્રી ફસલ બીમા યોજના', benefit: 'પાકની નિષ્ફળતા સામે વીમા કવરેજ.' },
        { name: 'કિસાન ક્રેડિટ કાર્ડ (KCC)', benefit: 'ખેડૂતોને સમયસર ધિરાણ પૂરું પાડે છે.' },
        { name: 'સોઇલ હેલ્થ કાર્ડ યોજના', benefit: 'જમીનના સ્વાસ્થ્યને સુધારવામાં મદદ કરે છે.' },
      ],
      learnMore: 'વધુ શીખો',
    },
    profile: {
      header: 'તમારી પ્રોફાઇલ',
      name: 'નામ',
      mockName: 'રમેશ કુમાર',
      language: 'ભાષા',
      location: 'સ્થાન',
      lastCrop: 'છેલ્લી ભલામણ',
      myCrops: 'મારા પાક',
      noRecommendation: 'હજી સુધી કોઈ નથી',
      switchLanguage: 'ભાષા બદલો',
      farmDetails: 'ખેતરની વિગતો',
      landSize: 'જમીનનું કદ (એકર)',
      soilType: 'માટીનો પ્રકાર',
      irrigation: 'સિંચાઈ પદ્ધતિ',
      options: {
        landSize: ['પસંદ કરો...', '< 1', '1 - 5', '> 5'],
        soilType: ['પસંદ કરો...', 'કાંપવાળી', 'કાળી', 'લાલ', 'પડખાઉ', 'રેતાળ', 'માટીવાળી'],
        irrigation: ['પસંદ કરો...', 'ટપક', 'ફુવારો', 'નહેર', 'કૂવો/બોરવેલ', 'વરસાદ આધારિત']
      }
    },
    chat: { title: 'એઆઈ સહાયક', placeholder: 'એક પ્રશ્ન પૂછો...', send: 'મોકલો' },
     diagnose: {
        header: 'પાક નિદાન',
        uploadPrompt: 'રોગોની ઓળખ અને ઉપાયો મેળવવા માટે છોડનો ફોટો અપલોડ કરો.',
        uploadBtn: 'છબી અપલોડ કરો',
        diagnoseBtn: 'નિદાન કરો',
        analyzing: 'વિશ્લેષણ રહ્યું છે...',
        clear: 'બીજું નિદાન કરો',
        error: 'માફ કરશો, હું આ છબીનું વિશ્લેષણ કરી શક્યો નથી. કૃપા કરીને બીજી છબીનો પ્રયાસ કરો.'
    },
    offline: {
        title: 'ઑફલાઇન મોડ',
        description: 'તમે ઑફલાઇન છો. SMS દ્વારા પાકની ભલામણ મેળવવા માટે તમારું શહેર પસંદ કરો અને તમારો ફોન નંબર દાખલ કરો.',
        selectCity: 'તમારું શહેર પસંદ કરો',
        placeholder: 'ફોન નંબર દાખલ કરો',
        button: 'ભલામણ મેળવો',
        generating: 'ભલામણ મેળવી રહ્યાં છીએ...',
        sendSms: 'SMS દ્વારા મોકલો',
        error: 'ભલામણ જનરેટ કરી શકાઈ નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    },
    systemInstruction: "તમે 'કિસાનમિત્ર' છો, ભારતીય ખેડૂતો માટે મૈત્રીપૂર્ણ AI. સરળ ગુજરાતીમાં જવાબ આપો. 🌾, 🌱, 💧, ☀️, 🙏 જેવા ખેડૂત-મૈત્રીપૂર્ણ ઇમોજીનો ઉપયોગ કરો. જવાબો ટૂંકા રાખો.",
    explainScheme: (name) => `'${name}' યોજનાને સરળ શબ્દોમાં સમજાવો.`,
  },
};

const state = {
  language: 'en',
  appView: 'language',
  selectedCrops: [],
  location: null,
  activeTab: 'crops',
  isChatLoading: false,
  isChatOpen: false,
  chatHistory: [],
  weatherData: null,
  marketData: null,
  diagnoseImageFile: null as File | null,
  diagnoseImageBase64: null as string | null,
  isDiagnosing: false,
  diagnoseResult: null as string | null,
  isOnline: navigator.onLine,
  offlineSmsNumber: '',
  offlineSmsSummary: null as string | null,
  isGeneratingSms: false,
  offlineSelectedCity: null as string | null,
  farmLandSize: null as string | null,
  farmSoilType: null as string | null,
  farmIrrigation: null as string | null,
};

const rootEl = document.getElementById('root');

// --- RENDERING ---

function renderCurrentView() {
  if (!state.isOnline) {
    return renderOfflineSmsPage();
  }
  switch (state.appView) {
    case 'language':
      return renderLanguageSelector();
    case 'crop_selection':
      return renderCropSelector();
    case 'location_selection':
        return renderLocationSelector();
    case 'main_app':
      return renderAppShell();
  }
}

function render() {
  const t = translations[state.language];
  document.documentElement.lang = state.language;
  
  const activePage = document.querySelector('.page.active');
  if (activePage) activePage.classList.remove('active');
  const newPage = document.getElementById(state.activeTab);
  if (newPage) newPage.classList.add('active');

  const activeNav = document.querySelector('.nav-btn.active');
  if(activeNav) activeNav.classList.remove('active');
  const newNav = document.querySelector(`.nav-btn[data-tab="${state.activeTab}"]`);
  if(newNav) newNav.classList.add('active');

  switch(state.activeTab) {
    case 'crops': renderCropsPage(t); break;
    case 'market': renderMarketPage(t); break;
    case 'schemes': renderSchemesPage(t); break;
    case 'diagnose': renderDiagnosePage(t); break;
    case 'you': renderProfilePage(t); break;
  }
}

function renderAppShell() {
  const t = translations[state.language];
  rootEl.innerHTML = `
    <div class="app-shell">
      <main class="page-container">
        <div id="crops" class="page"></div>
        <div id="market" class="page"></div>
        <div id="schemes" class="page"></div>
        <div id="diagnose" class="page"></div>
        <div id="you" class="page"></div>
      </main>
      
      <button class="fab-chat" id="fab-chat-btn" aria-label="${t.chat.title}">💬</button>
      
      <nav class="bottom-nav">
        <button class="nav-btn" data-tab="crops" aria-label="${t.nav.crops}">
            <span class="icon">🌿</span>
            <span class="label">${t.nav.crops}</span>
        </button>
        <button class="nav-btn" data-tab="market" aria-label="${t.nav.market}">
            <span class="icon">📈</span>
            <span class="label">${t.nav.market}</span>
        </button>
        <button class="nav-btn" data-tab="schemes" aria-label="${t.nav.schemes}">
            <span class="icon">📜</span>
            <span class="label">${t.nav.schemes}</span>
        </button>
        <button class="nav-btn" data-tab="diagnose" aria-label="${t.nav.diagnose}">
            <span class="icon">🔬</span>
            <span class="label">${t.nav.diagnose}</span>
        </button>
        <button class="nav-btn" data-tab="you" aria-label="${t.nav.you}">
            <span class="icon">👤</span>
            <span class="label">${t.nav.you}</span>
        </button>
      </nav>
      
      <div class="chat-overlay">
        <div class="chat-modal">
          <header class="chat-header">
            <h3>${t.chat.title}</h3>
            <button id="close-chat-btn" aria-label="Close chat">&times;</button>
          </header>
          <div class="chat-messages"></div>
          <form class="chat-form">
            <input type="text" id="chat-input" placeholder="${t.chat.placeholder}" autocomplete="off" />
            <button type="submit" id="send-btn" aria-label="${t.chat.send}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
  addEventListeners();
  render();
}

function renderCropsPage(t) {
  const pageEl = document.getElementById('crops');
  pageEl.innerHTML = `
    <h1 class="page-header">${t.crops.header}</h1>
    <div id="weather-container"></div>
    <div id="crop-container"></div>
  `;
  if (!state.weatherData) {
    fetchWeatherAndCrop();
  } else {
    renderWeatherCard(state.weatherData, t);
    renderCropCard(state.weatherData, t);
  }
}

function renderWeatherCard(data, t) {
  const container = document.getElementById('weather-container');
  if (data.error) {
    container.innerHTML = `
    <div class="card weather-card error">
      <p>${data.error}</p>
    </div>
    `
    return;
  }
  container.innerHTML = `
    <div class="card weather-card">
      <h2 class="card-title">${t.crops.weatherTitle}</h2>
      <div class="content">
        <div>
          <p class="location">${data.city}</p>
          <p class="temp">${data.temp}°C</p>
          <p class="condition">${data.condition}</p>
        </div>
        <div class="icon">${data.emoji}</div>
      </div>
    </div>
  `;
}

function renderCropCard(data, t) {
    if (data.error) {
        document.getElementById('crop-container').innerHTML = '';
        return;
    }
    const container = document.getElementById('crop-container');
    container.innerHTML = `
    <div class="card crop-card">
      <h2 class="card-title">${t.crops.cropTitle}</h2>
      <div class="content">
        <div class="icon">🌱</div>
        <div>
          <p class="crop-name">${data.crop}</p>
          <p class="reason">${data.reason}</p>
        </div>
      </div>
    </div>
    `;
}

function renderMarketPage(t) {
  const pageEl = document.getElementById('market');
  pageEl.innerHTML = `
    <h1 class="page-header">${t.market.header}</h1>
    <div class="card-transparent">
      <p class="page-subtitle">${t.market.subtitle}</p>
      <div id="market-list"></div>
    </div>
  `;
  if (!state.marketData) {
    fetchMarketPrices();
  } else {
    renderMarketList(state.marketData, t);
  }
}

function renderMarketList(data, t) {
    const listEl = document.getElementById('market-list');
    
    if (data.error) {
        listEl.innerHTML = `<p class="error-message">${data.error}</p>`;
        return;
    }
    
    if (data.noData || data.length === 0) {
        listEl.innerHTML = `<p>${t.market.noMarketData}</p>`;
        return;
    }

    listEl.innerHTML = data.map(item => {
        const isPositive = item.trend >= 0;
        const trendClass = isPositive ? 'positive' : 'negative';
        const trendSign = isPositive ? '+' : '';
        const trendIcon = isPositive 
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>`;

        return `
        <div class="market-price-card">
            <div class="crop-details">
                <span class="crop-name">${item.crop}</span>
                <span class="per-quintal">${t.market.perQuintal}</span>
            </div>
            <div class="price-details">
                <span class="price">₹${item.price.toLocaleString('en-IN')}</span>
                <div class="trend ${trendClass}">
                    ${trendIcon}
                    <span>${trendSign}${item.trend}%</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderSchemesPage(t) {
  const pageEl = document.getElementById('schemes');
  pageEl.innerHTML = `
    <h1 class="page-header">${t.schemes.header}</h1>
    ${t.schemes.schemesList.map(scheme => `
      <div class="card scheme-card">
        <h3 class="card-title">${scheme.name}</h3>
        <p>${scheme.benefit}</p>
        <button class="learn-more-btn" data-scheme="${scheme.name}">${t.schemes.learnMore}</button>
      </div>
    `).join('')}
  `;
  document.querySelectorAll('.learn-more-btn').forEach(btn => 
    btn.addEventListener('click', (e) => handleSchemeClick((e.target as HTMLElement).dataset.scheme))
  );
}

function renderDiagnosePage(t) {
    const pageEl = document.getElementById('diagnose');
    let content = `<h1 class="page-header">${t.diagnose.header}</h1>`;

    if (state.isDiagnosing) {
        content += `
            <div class="diagnose-loader-overlay">
                <div class="loader"><div class="dot-flashing"></div></div>
                <p>${t.diagnose.analyzing}</p>
            </div>
        `;
    } else if (state.diagnoseResult) {
        content += `
            <div class="card diagnose-result-card">
                ${marked.parse(state.diagnoseResult)}
            </div>
            <button class="diagnose-btn" id="diagnose-clear-btn">${t.diagnose.clear}</button>
        `;
    } else if (state.diagnoseImageBase64) {
        content += `
            <div class="diagnose-preview-container">
                <img src="${state.diagnoseImageBase64}" alt="Crop preview" id="diagnose-preview-img" />
            </div>
            <button class="diagnose-btn" id="diagnose-confirm-btn">${t.diagnose.diagnoseBtn}</button>
        `;
    } else {
        content += `
            <div class="diagnose-upload-area">
                <input type="file" id="diagnose-upload-input" accept="image/*" style="display: none;" />
                <label for="diagnose-upload-input" class="diagnose-upload-label">
                    <span class="icon">📷</span>
                    <p>${t.diagnose.uploadPrompt}</p>
                    <span class="diagnose-btn-upload">${t.diagnose.uploadBtn}</span>
                </label>
            </div>
        `;
    }

    pageEl.innerHTML = content;

    // Add event listeners for this page
    document.getElementById('diagnose-upload-input')?.addEventListener('change', handleImageUpload);
    document.getElementById('diagnose-confirm-btn')?.addEventListener('click', handleDiagnoseClick);
    document.getElementById('diagnose-clear-btn')?.addEventListener('click', handleClearDiagnosis);
}


function renderProfilePage(t) {
  const pageEl = document.getElementById('you');
  const langMap = { en: 'English', hi: 'हिन्दी', gu: 'ગુજરાતી' };

  const landSizeOptions = t.profile.options.landSize.map(opt => `<option value="${opt}" ${state.farmLandSize === opt ? 'selected' : ''}>${opt}</option>`).join('');
  const soilTypeOptions = t.profile.options.soilType.map(opt => `<option value="${opt}" ${state.farmSoilType === opt ? 'selected' : ''}>${opt}</option>`).join('');
  const irrigationOptions = t.profile.options.irrigation.map(opt => `<option value="${opt}" ${state.farmIrrigation === opt ? 'selected' : ''}>${opt}</option>`).join('');

  pageEl.innerHTML = `
    <h1 class="page-header">${t.profile.header}</h1>
    <div class="card">
      <div class="profile-info-item">
        <span class="label">${t.profile.name}</span>
        <span class="value">${t.profile.mockName}</span>
      </div>
      <div class="profile-info-item">
        <span class="label">${t.profile.language}</span>
        <span class="value">${langMap[state.language]}</span>
      </div>
      <div class="profile-info-item">
        <span class="label">${t.profile.location}</span>
        <span class="value">${state.location}</span>
      </div>
      <div class="profile-info-item">
        <span class="label">${t.profile.lastCrop}</span>
        <span class="value">${state.weatherData?.crop || t.profile.noRecommendation}</span>
      </div>
    </div>
    <div class="card">
        <h2 class="card-title">${t.profile.farmDetails}</h2>
        <div class="profile-info-item">
            <label for="land-size-select" class="label">${t.profile.landSize}</label>
            <select id="land-size-select" class="profile-select">${landSizeOptions}</select>
        </div>
        <div class="profile-info-item">
            <label for="soil-type-select" class="label">${t.profile.soilType}</label>
            <select id="soil-type-select" class="profile-select">${soilTypeOptions}</select>
        </div>
        <div class="profile-info-item">
            <label for="irrigation-select" class="label">${t.profile.irrigation}</label>
            <select id="irrigation-select" class="profile-select">${irrigationOptions}</select>
        </div>
    </div>
    <div class="card">
        <h2 class="card-title">${t.profile.myCrops}</h2>
        <div class="my-crops-list">
            ${state.selectedCrops.length > 0 ? state.selectedCrops.map(c => `<span>${c}</span>`).join(', ') : 'No crops selected.'}
        </div>
    </div>
    <button class="switch-lang-btn" id="switch-lang-btn">${t.profile.switchLanguage}</button>
  `;

  document.getElementById('land-size-select')?.addEventListener('change', (e) => {
    state.farmLandSize = (e.target as HTMLSelectElement).value;
    state.weatherData = null; // Invalidate current recommendation
  });
  document.getElementById('soil-type-select')?.addEventListener('change', (e) => {
    state.farmSoilType = (e.target as HTMLSelectElement).value;
    state.weatherData = null; // Invalidate current recommendation
  });
  document.getElementById('irrigation-select')?.addEventListener('change', (e) => {
    state.farmIrrigation = (e.target as HTMLSelectElement).value;
    state.weatherData = null; // Invalidate current recommendation
  });

  document.getElementById('switch-lang-btn')?.addEventListener('click', () => {
    state.appView = 'language';
    renderCurrentView();
  });
}

function renderChat() {
  const messagesContainer = document.querySelector('.chat-messages');
  messagesContainer.innerHTML = state.chatHistory.map(msg => 
    `<div class="chat-message ${msg.role}"><div>${marked.parse(msg.text)}</div></div>`
  ).join('');
  if (state.isChatLoading) {
    messagesContainer.innerHTML += `<div class="chat-message bot"><div class="loader"><div class="dot-flashing"></div></div></div>`;
  }
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderLanguageSelector() {
  state.selectedCrops = [];
  rootEl.innerHTML = `
    <div class="language-selector-overlay">
      <h1>${translations.en.welcome} / ${translations.hi.welcome} / ${translations.gu.welcome}</h1>
      <p>${translations.en.selectLang} / ${translations.hi.selectLang} / ${translations.gu.selectLang}</p>
      <div class="language-buttons">
        <button class="language-btn" data-lang="en">English</button>
        <button class="language-btn" data-lang="hi">हिन्दी</button>
        <button class="language-btn" data-lang="gu">ગુજરાતી</button>
      </div>
    </div>
  `;
  document.querySelectorAll('.language-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      handleLanguageSelect((e.target as HTMLElement).dataset.lang);
    });
  });
}

function renderCropSelector() {
    const t = translations[state.language];
    const cropTranslations = t.cropSelection;
    rootEl.innerHTML = `
        <div class="crop-selector-page">
            <header class="selection-header">
                <div>
                    <h1>${cropTranslations.title}</h1>
                    <p>${cropTranslations.subtitle}<br/>${cropTranslations.subtitle2}</p>
                </div>
                <span class="selection-counter">${cropTranslations.counter(state.selectedCrops.length)}</span>
            </header>
            <main class="crop-grid">
                ${cropTranslations.crops.map(crop => {
                    const isSelected = state.selectedCrops.includes(crop.name);
                    return `
                    <button class="crop-item ${isSelected ? 'selected' : ''}" data-crop="${crop.name}">
                        <div class="crop-icon-wrapper">
                           <span class="crop-icon">${crop.emoji}</span>
                        </div>
                        <span class="crop-name-label">${crop.name}</span>
                    </button>`;
                }).join('')}
            </main>
            <footer class="selection-footer">
                <button class="next-btn" id="next-from-crops-btn" ${state.selectedCrops.length === 0 ? 'disabled' : ''}>
                    ${cropTranslations.next}
                </button>
            </footer>
        </div>
    `;

    document.querySelectorAll('.crop-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const cropName = (e.currentTarget as HTMLElement).dataset.crop;
            handleCropItemClick(cropName);
        });
    });

    document.getElementById('next-from-crops-btn')?.addEventListener('click', handleNextFromCrops);
}

function renderLocationSelector() {
    const t = translations[state.language].locationSelection;
    rootEl.innerHTML = `
        <div class="location-selector-page">
            <div class="location-content">
                <span class="location-icon">📍</span>
                <h1>${t.title}</h1>
                <p>${t.subtitle}</p>
                <form id="location-form">
                    <input type="text" id="location-input" placeholder="${t.placeholder}" autocomplete="off" />
                    <button type="submit" id="location-confirm-btn" disabled>${t.confirm}</button>
                </form>
            </div>
        </div>
    `;

    const inputEl = document.getElementById('location-input') as HTMLInputElement;
    const btnEl = document.getElementById('location-confirm-btn') as HTMLButtonElement;
    const formEl = document.getElementById('location-form');

    inputEl.addEventListener('input', () => {
        btnEl.disabled = inputEl.value.trim() === '';
    });

    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        if (inputEl.value.trim()) {
            handleLocationConfirm(inputEl.value.trim());
        }
    });
}

function renderOfflineSmsPage() {
    const t = translations[state.language] || translations.en;
    let resultSection = '';

    if (state.isGeneratingSms) {
        resultSection = `<div class="loader"><div class="dot-flashing"></div></div><p>${t.offline.generating}</p>`;
    } else if (state.offlineSmsSummary) {
        resultSection = `
            <pre class="sms-summary">${state.offlineSmsSummary}</pre>
            <a href="sms:${state.offlineSmsNumber}?body=${encodeURIComponent(state.offlineSmsSummary)}" class="send-sms-link">${t.offline.sendSms}</a>
        `;
    }
    
    const cityOptions = Object.keys(offlineCityRecommendationData).map(city =>
        `<option value="${city}" ${state.offlineSelectedCity === city ? 'selected' : ''}>${city}</option>`
    ).join('');

    rootEl.innerHTML = `
        <div class="offline-page">
            <div class="offline-card">
                <h1>${t.offline.title}</h1>
                <p>${t.offline.description}</p>
                <div class="offline-form">
                    <select id="offline-city-select" class="offline-input">
                        <option value="">${t.offline.selectCity}</option>
                        ${cityOptions}
                    </select>
                    <input type="tel" id="sms-phone-input" class="offline-input" placeholder="${t.offline.placeholder}" value="${state.offlineSmsNumber}" />
                    <button id="generate-sms-btn" class="offline-btn" ${!state.offlineSelectedCity || state.offlineSmsNumber.length < 10 ? 'disabled' : ''}>${t.offline.button}</button>
                </div>
                <div id="sms-result-section">
                    ${resultSection}
                </div>
            </div>
        </div>
    `;

    const phoneInput = document.getElementById('sms-phone-input') as HTMLInputElement;
    const generateBtn = document.getElementById('generate-sms-btn') as HTMLButtonElement;
    const citySelect = document.getElementById('offline-city-select') as HTMLSelectElement;

    const updateButtonState = () => {
        generateBtn.disabled = !state.offlineSelectedCity || state.offlineSmsNumber.length < 10;
    };

    phoneInput.addEventListener('input', (e) => {
        state.offlineSmsNumber = (e.target as HTMLInputElement).value;
        updateButtonState();
    });
    
    citySelect.addEventListener('change', (e) => {
        state.offlineSelectedCity = (e.target as HTMLSelectElement).value || null;
        updateButtonState();
    });

    generateBtn.addEventListener('click', handleGenerateSms);
}

// --- API & LOGIC ---

function fileToBase64(file: File): Promise<{mimeType: string, data: string}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.split(':')[1].split(';')[0];
        const data = result.split(',')[1];
        resolve({ mimeType, data });
    };
    reader.onerror = error => reject(error);
  });
}

function getWeatherEmojiFromCode(code) {
    const emojiMap = {
        1000: '☀️', // Sunny
        1003: '🌤️', // Partly cloudy
        1006: '☁️', // Cloudy
        1009: '☁️', // Overcast
        1030: '🌫️', // Mist
        1063: '🌦️', // Patchy rain possible
        1066: '🌨️', // Patchy snow possible
        1069: '🌨️', // Patchy sleet possible
        1072: '🌨️', // Patchy freezing drizzle possible
        1087: '⛈️', // Thundery outbreaks possible
        1114: '❄️', // Blowing snow
        1117: '❄️', // Blizzard
        1135: '🌫️', // Fog
        1147: '🌫️', // Freezing fog
        1150: '🌦️', // Patchy light drizzle
        1153: '🌦️', // Light drizzle
        1168: '🌨️', // Freezing drizzle
        1171: '🌨️', // Heavy freezing drizzle
        1180: '🌦️', // Patchy light rain
        1183: '🌧️', // Light rain
        1186: '🌧️', // Moderate rain at times
        1189: '🌧️', // Moderate rain
        1192: '🌧️', // Heavy rain at times
        1195: '🌧️', // Heavy rain
        1198: '🌨️', // Light freezing rain
        1201: '🌨️', // Moderate or heavy freezing rain
        1204: '🌨️', // Light sleet
        1207: '🌨️', // Moderate or heavy sleet
        1210: '🌨️', // Patchy light snow
        1213: '❄️', // Light snow
        1216: '❄️', // Patchy moderate snow
        1219: '❄️', // Moderate snow
        1222: '❄️', // Patchy heavy snow
        1225: '❄️', // Heavy snow
        1237: '🌨️', // Ice pellets
        1240: '🌦️', // Light rain shower
        1243: '🌧️', // Moderate or heavy rain shower
        1246: '🌧️', // Torrential rain shower
        1249: '🌨️', // Light sleet showers
        1252: '🌨️', // Moderate or heavy sleet showers
        1255: '🌨️', // Light snow showers
        1258: '❄️', // Moderate or heavy snow showers
        1261: '🌨️', // Light showers of ice pellets
        1264: '🌨️', // Moderate or heavy showers of ice pellets
        1273: '⛈️', // Patchy light rain with thunder
        1276: '⛈️', // Moderate or heavy rain with thunder
        1279: '⛈️', // Patchy light snow with thunder
        1282: '⛈️', // Moderate or heavy snow with thunder
    };
    return emojiMap[code] || '🌍';
}

async function getAiCropRecommendation(weather, location, interestedCrops) {
    const t = translations[state.language];
    // Translate selected crops to English for the model
    const cropsToFetchEn = interestedCrops.map(langCrop => {
        const langIndex = t.cropSelection.crops.findIndex(c => c.name === langCrop);
        return translations.en.cropSelection.crops[langIndex].name;
    });

    const farmDetails = [];
    if (state.farmLandSize && state.farmLandSize !== t.profile.options.landSize[0]) {
      farmDetails.push(`- Land Size: ${state.farmLandSize} acres`);
    }
    if (state.farmSoilType && state.farmSoilType !== t.profile.options.soilType[0]) {
      farmDetails.push(`- Soil Type: ${state.farmSoilType}`);
    }
    if (state.farmIrrigation && state.farmIrrigation !== t.profile.options.irrigation[0]) {
      farmDetails.push(`- Irrigation Method: ${state.farmIrrigation}`);
    }
    const farmDetailsPrompt = farmDetails.length > 0 ? `\nFarmer's farm details:\n${farmDetails.join('\n')}` : '';


    const prompt = `You are an expert agricultural advisor for Indian farmers. Your goal is to give advice that is extremely simple and easy to understand. Talk like you are speaking to a local farmer.

    Based on the following information, recommend the single best crop to grow right now.
    - Location: ${location}
    - Current Temperature: ${weather.temp}°C
    - Current Condition: ${weather.condition}
    - Farmer is interested in these crops: ${cropsToFetchEn.join(', ')}
    ${farmDetailsPrompt}

    Your task:
    1.  Analyze the location, weather, and the farmer's specific farm details (if provided).
    2.  From the farmer's list of interested crops, choose the ONE that is most suitable to plant or tend to right now.
    3.  Provide a very short, simple reason for your choice in the user's language (${state.language}). **IMPORTANT: Use very simple words, as if explaining to someone with little formal education. For example, instead of 'ideal for germination', say 'good for planting seeds'.**
    
    Return your answer in JSON format only.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        crop: {
                            type: Type.STRING,
                            description: "The single recommended crop name, in English."
                        },
                        reason: {
                            type: Type.STRING,
                            description: `A short, simple, one-sentence explanation for the recommendation in the user's language (${state.language}), using very simple, farmer-friendly vocabulary.`
                        }
                    }
                },
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        // Translate crop name back to user's language
        const enIndex = translations.en.cropSelection.crops.findIndex(c => c.name.toLowerCase() === jsonResponse.crop.toLowerCase());
        if (enIndex !== -1) {
            jsonResponse.crop = t.cropSelection.crops[enIndex].name;
        }

        return jsonResponse;

    } catch (error) {
        console.error("AI recommendation failed:", error);
        return null;
    }
}


async function fetchWeatherAndCrop() {
    const container = document.getElementById('weather-container');
    container.innerHTML = `<div class="loader"><div class="dot-flashing"></div></div>`;
    
    if (!WEATHER_API_KEY) {
        state.weatherData = { error: 'Weather API Key is not set in index.tsx.' };
        render();
        return;
    }

    try {
        const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${state.location}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Weather data not found.');
        }
        const weather = await response.json();
        const weatherInfo = {
            city: weather.location.name,
            temp: Math.round(weather.current.temp_c),
            condition: weather.current.condition.text,
            emoji: getWeatherEmojiFromCode(weather.current.condition.code),
        };

        const aiRecommendation = await getAiCropRecommendation(weatherInfo, state.location, state.selectedCrops);

        if (aiRecommendation) {
             state.weatherData = { ...weatherInfo, ...aiRecommendation };
        } else {
            // Fallback to old logic if AI fails
            const fallbackCrop = state.selectedCrops[0] || 'Sugarcane';
            state.weatherData = { 
                ...weatherInfo, 
                crop: fallbackCrop, 
                reason: translations[state.language].crops.aiError 
            };
        }
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        state.weatherData = { error: translations[state.language].crops.weatherError };
    }
    render();
}

function fetchMarketPrices() {
    const listEl = document.getElementById('market-list');
    listEl.innerHTML = `<div class="loader"><div class="dot-flashing"></div></div>`;
    const t = translations[state.language];

    setTimeout(() => { // Simulate async operation
        try {
            const locationParts = state.location.toLowerCase().split(',').map(p => p.trim());
            const cityRaw = locationParts[0];
            const city = cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1);

            const cropsToFetchLang = state.selectedCrops.length > 0
                ? state.selectedCrops
                : ['Wheat', 'Rice', 'Cotton'].map(enCrop => {
                    const enIndex = translations.en.cropSelection.crops.findIndex(c => c.name === enCrop);
                    return t.cropSelection.crops[enIndex].name;
                });

            const cropsToFetchEn = cropsToFetchLang.map(langCrop => {
                 const langIndex = t.cropSelection.crops.findIndex(c => c.name === langCrop);
                 return translations.en.cropSelection.crops[langIndex].name.toLowerCase();
            });
            
            const priceData = offlineCropPriceData.crops
                .filter(cropDataItem => cropsToFetchEn.includes(cropDataItem.crop))
                .map(cropDataItem => {
                    const pricePerKg = cropDataItem.cities[city] ?? cropDataItem.state_avg_price_inr_per_kg;
                    const pricePerQuintal = Math.round(pricePerKg * 100);
                    
                    const trend = Math.floor(Math.random() * 16) - 5; // -5 to +10

                    const enIndex = translations.en.cropSelection.crops.findIndex(c => c.name.toLowerCase() === cropDataItem.crop);
                    const translatedCropName = t.cropSelection.crops[enIndex].name;
                    
                    return {
                        crop: translatedCropName,
                        price: pricePerQuintal,
                        trend: trend,
                    };
                });


            if (priceData.length === 0) {
                state.marketData = { noData: true };
            } else {
                state.marketData = priceData;
            }

        } catch (error) {
            console.error("Failed to process market prices:", error);
            state.marketData = { error: t.market.marketError };
        }
        render();
    }, 500);
}


async function handleSendMessage(prompt) {
  if (!prompt.trim() || state.isChatLoading) return;

  state.isChatLoading = true;
  state.chatHistory.push({ role: 'user', text: prompt });
  renderChat();

  const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
  if(sendBtn) sendBtn.disabled = true;

  try {
    const responseStream = await chat.sendMessageStream({ message: prompt });

    let fullResponse = '';
    state.isChatLoading = false;
    state.chatHistory.push({ role: 'bot', text: '' });
    renderChat(); // To show the empty bot message container

    for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        state.chatHistory[state.chatHistory.length - 1].text = fullResponse;
        renderChat();
    }
  } catch (error) {
    console.error(error);
    state.isChatLoading = false;
    state.chatHistory.push({ role: 'bot', text: 'Sorry, something went wrong. Please try again.' });
    renderChat();
  } finally {
    state.isChatLoading = false;
    if(sendBtn) sendBtn.disabled = false;
    (document.getElementById('chat-input') as HTMLInputElement).focus();
  }
}

// --- EVENT HANDLERS ---

function handleLanguageSelect(lang) {
  state.language = lang;
  state.appView = 'crop_selection';
  renderCurrentView();
}

function handleCropItemClick(cropName) {
    const cropIndex = state.selectedCrops.indexOf(cropName);
    if (cropIndex > -1) {
        state.selectedCrops.splice(cropIndex, 1);
    } else {
        if (state.selectedCrops.length < 8) {
            state.selectedCrops.push(cropName);
        }
    }
    renderCropSelector();
}

function handleNextFromCrops() {
    if (state.selectedCrops.length > 0) {
        state.appView = 'location_selection';
        renderCurrentView();
    }
}

function handleLocationConfirm(location: string) {
    state.location = location;
    state.appView = 'main_app';
    
    // Initialize main app state
    state.chatHistory = [];
    state.weatherData = null; 
    state.marketData = null;
    state.activeTab = 'crops';

    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: translations[state.language].systemInstruction,
        },
    });

    renderCurrentView();
}

function handleNavClick(tab) {
  state.activeTab = tab;
  render();
}

function handleSchemeClick(schemeName) {
  const prompt = translations[state.language].explainScheme(schemeName);
  toggleChat(true);
  handleSendMessage(prompt);
}

async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        state.diagnoseImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            state.diagnoseImageBase64 = e.target.result as string;
            render();
        };
        reader.readAsDataURL(file);
    }
}

async function handleDiagnoseClick() {
    if (!state.diagnoseImageFile) return;

    state.isDiagnosing = true;
    render();

    try {
        const { mimeType, data } = await fileToBase64(state.diagnoseImageFile);
        const imagePart = { inlineData: { mimeType, data } };
        const textPart = { text: "You are an expert agricultural assistant for farmers. Analyze the image of this plant.\n\n1.  **Identify the plant.**\n2.  **Identify the disease,** if any. If the plant looks healthy, clearly state that.\n3.  **Explain the symptoms** in very simple, easy-to-understand terms, like you're talking to a local farmer.\n4.  **Provide simple, step-by-step remedies.** Create two sections: 'Organic Remedies' (things they can often make at home) and 'Chemical Remedies' (pesticides or fungicides to buy).\n\nKeep all language extremely simple and use short sentences. Format the final output using markdown with these exact headings: **Plant**, **Disease**, **Symptoms**, **Organic Remedies**, and **Chemical Remedies**." };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        state.diagnoseResult = response.text;
    } catch (error) {
        console.error("Diagnosis failed:", error);
        state.diagnoseResult = translations[state.language].diagnose.error;
    } finally {
        state.isDiagnosing = false;
        render();
    }
}

function handleClearDiagnosis() {
    state.diagnoseImageFile = null;
    state.diagnoseImageBase64 = null;
    state.diagnoseResult = null;
    state.isDiagnosing = false;
    render();
}

async function handleGenerateSms() {
    if (!state.offlineSelectedCity) return;

    state.isGeneratingSms = true;
    state.offlineSmsSummary = null;
    renderOfflineSmsPage(); // Show loader

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const cityData = offlineCityRecommendationData[state.offlineSelectedCity];
        const recommendedCropEn = cityData.recommendedCrop; // e.g., "Wheat"

        // Find market price for the recommended crop
        let priceInfo = '';
        const cropPriceDataItem = offlineCropPriceData.crops.find(
            c => c.crop.toLowerCase() === recommendedCropEn.toLowerCase()
        );

        if (cropPriceDataItem) {
            const pricePerKg = cropPriceDataItem.cities[state.offlineSelectedCity] ?? cropPriceDataItem.state_avg_price_inr_per_kg;
            if (pricePerKg) {
                const pricePerQuintal = Math.round(pricePerKg * 100);
                // Format for Indian locale
                const formattedPrice = pricePerQuintal.toLocaleString('en-IN');
                priceInfo = `Price: ~₹${formattedPrice}/quintal`;
            }
        }

        const summaryParts = [
            `KisanMitra Offline Advice`,
            `City: ${state.offlineSelectedCity}`,
            `Temp: ${cityData.temp}`,
            `Crop: ${cityData.recommendedCrop}`
        ];

        if (priceInfo) {
            summaryParts.push(priceInfo);
        }
        
        summaryParts.push(`Tip: ${cityData.farmerTipNext2h}`);

        const summary = summaryParts.join('\n');
        state.offlineSmsSummary = summary;

    } catch (error) {
        console.error("Offline SMS generation failed:", error);
        state.offlineSmsSummary = translations[state.language].offline.error;
    } finally {
        state.isGeneratingSms = false;
        renderOfflineSmsPage(); // Show result
    }
}

function toggleChat(isOpen) {
  state.isChatOpen = isOpen;
  const overlay = document.querySelector('.chat-overlay');
  if (isOpen) {
    overlay.classList.add('visible');
    (document.getElementById('chat-input') as HTMLInputElement).focus();
  } else {
    overlay.classList.remove('visible');
  }
}

function addEventListeners() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => handleNavClick((btn as HTMLElement).dataset.tab));
  });

  document.getElementById('fab-chat-btn')?.addEventListener('click', () => toggleChat(true));
  document.getElementById('close-chat-btn')?.addEventListener('click', () => toggleChat(false));
  document.querySelector('.chat-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) toggleChat(false);
  });
  
  document.querySelector('.chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input') as HTMLInputElement;
    handleSendMessage(input.value);
    input.value = '';
  });
}

// --- INITIALIZATION ---
function main() {
  window.addEventListener('online', () => {
    if (!state.isOnline) {
      state.isOnline = true;
      if (state.appView !== 'main_app') {
          state.appView = 'language';
      }
      renderCurrentView();
    }
  });
  window.addEventListener('offline', () => {
    if (state.isOnline) {
      state.isOnline = false;
      renderCurrentView();
    }
  });

  renderCurrentView();
}

main();