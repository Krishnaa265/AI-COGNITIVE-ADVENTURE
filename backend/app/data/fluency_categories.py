# Large bilingual category sets using Python sets for O(1) lookup
categories = {

    "Animals": {
        "english": {
            "dog","cat","lion","tiger","elephant","horse","cow","goat","rabbit","monkey",
            "bear","deer","wolf","fox","camel","giraffe","zebra","kangaroo","panda","leopard",
            "cheetah","jaguar","crocodile","alligator","snake","lizard","frog","turtle","tortoise",
            "parrot","eagle","owl","peacock","penguin","flamingo","ostrich","swan","duck","hen",
            "rooster","pigeon","sparrow","crow","hawk","vulture","bat","rat","mouse","squirrel",
            "beaver","otter","seal","walrus","dolphin","whale","shark","octopus","jellyfish","crab",
            "lobster","shrimp","fish","salmon","tuna","goldfish","clownfish","starfish","seahorse",
            "ant","bee","butterfly","mosquito","spider","scorpion","cockroach","grasshopper","beetle",
            "ladybug","dragonfly","worm","snail","sheep","pig","donkey","mule","buffalo","bison",
            "yak","llama","alpaca","gorilla","chimpanzee","orangutan","baboon","lemur","rhinoceros",
            "hippopotamus","hyena","meerkat","mongoose","weasel","badger","skunk","porcupine",
            "hedgehog","armadillo","sloth","raccoon","opossum","platypus","koala","wombat",
            "reindeer","moose","elk","caribou","bald eagle","pelican","stork","heron","kingfisher",
            "woodpecker","toucan","macaw","cockatoo","canary","finch","robin","bluejay","magpie",
            "raven","albatross","seagull","puffin","cormorant","ibis","crane","quail","pheasant",
            "turkey","guinea pig","hamster","gerbil","ferret","mink","ermine","lynx","bobcat",
            "cougar","puma","panther","python","boa","cobra","viper","gecko","iguana","chameleon",
            "salamander","newt","toad","axolotl","piranha","catfish","eel","ray","stingray",
            "narwhal","manatee","dugong","beluga","orca","porpoise","manta ray","barracuda",
            "swordfish","marlin","trout","bass","carp","tilapia","cod","herring","sardine","anchovy"
        },
        "hindi": {
            "कुत्ता","बिल्ली","शेर","बाघ","हाथी","घोड़ा","गाय","बकरी","खरगोश","बंदर",
            "भालू","हिरण","भेड़िया","लोमड़ी","ऊँट","जिराफ","ज़ेबरा","कंगारू","पांडा","तेंदुआ",
            "चीता","मगरमच्छ","साँप","छिपकली","मेंढक","कछुआ","तोता","चील","उल्लू","मोर",
            "पेंगुइन","बत्तख","मुर्गी","मुर्गा","कबूतर","गौरैया","कौआ","चमगादड़","चूहा",
            "गिलहरी","डॉल्फिन","व्हेल","शार्क","ऑक्टोपस","केकड़ा","मछली","तितली","मधुमक्खी",
            "चींटी","मकड़ी","बिच्छू","भेड़","सूअर","गधा","भैंस","गोरिल्ला","चिंपांज़ी","गैंडा",
            "दरियाई घोड़ा","लकड़बग्घा","नेवला","साही","छछूंदर","रैकून","कोआला","हिरन","भालू",
            "मोर","सारस","बगुला","किंगफिशर","तोता","कनारी","रॉबिन","अजगर","कोबरा","गेको",
            "गिरगिट","सैलामैंडर","मेंढक","कैटफ़िश","मंटा रे","बेलुगा","ऑर्का","सैल्मन",
            "ट्राउट","कार्प","कॉड","सार्डिन","ऊदबिलाव","लामा","याक","रेनडियर","एल्क"
        }
    },

    "Fruits": {
        "english": {
            "apple","banana","orange","mango","grapes","papaya","pear","peach","watermelon",
            "pineapple","kiwi","guava","lychee","plum","coconut","strawberry","blueberry",
            "raspberry","blackberry","cherry","apricot","fig","date","pomegranate","melon",
            "cantaloupe","honeydew","avocado","lemon","lime","grapefruit","tangerine","clementine",
            "mandarin","passion fruit","dragon fruit","star fruit","jackfruit","durian","rambutan",
            "longan","persimmon","quince","mulberry","elderberry","gooseberry","cranberry",
            "boysenberry","nectarine","plum","damson","olive","tamarind","breadfruit","soursop",
            "custard apple","sapodilla","wood apple","Indian gooseberry","amla","jamun","carambola",
            "kumquat","ugli fruit","feijoa","salak","mangosteen","langsat","ackee","bilberry"
        },
        "hindi": {
            "सेब","केला","आम","संतरा","अंगूर","अमरूद","पपीता","नाशपाती","आड़ू","तरबूज",
            "अनानास","कीवी","लीची","बेर","नारियल","स्ट्रॉबेरी","ब्लूबेरी","चेरी","खुबानी",
            "अंजीर","खजूर","अनार","खरबूज","एवोकाडो","नींबू","चकोतरा","संतरा","जामुन",
            "आंवला","इमली","कटहल","सीताफल","चीकू","करौंदा","शहतूत","नेक्टेरिन","जैतून",
            "ड्रैगन फ्रूट","पैशन फ्रूट","रामबूटान","लोंगान","ख़ुरमा","श्रीफल","आलूबुखारा",
            "क्रैनबेरी","ब्लैकबेरी","रास्पबेरी","अंगूर","किशमिश","मौसमी","कमरख"
        }
    },

    "Vehicles": {
        "english": {
            "car","bus","truck","train","bicycle","motorcycle","scooter","boat","airplane",
            "helicopter","ship","submarine","tractor","ambulance","fire truck","police car",
            "taxi","van","jeep","suv","pickup truck","lorry","minibus","coach","tram","metro",
            "monorail","cable car","ferry","yacht","sailboat","kayak","canoe","rowboat","hovercraft",
            "hydrofoil","cruise ship","aircraft carrier","battleship","destroyer","frigate",
            "rocket","space shuttle","satellite","drone","glider","hang glider","paraglider",
            "hot air balloon","blimp","zeppelin","jet","fighter jet","bomber","cargo plane",
            "seaplane","snowmobile","snowplow","bulldozer","excavator","crane","forklift",
            "tank","armored vehicle","rickshaw","auto rickshaw","e-bike","electric car",
            "hyperloop","maglev","golf cart","quad bike","atv","segway","skateboard",
            "rollerblade","wheelchair","stroller","horse cart","bullock cart"
        },
        "hindi": {
            "कार","बस","ट्रक","ट्रेन","साइकिल","मोटरसाइकिल","स्कूटर","नाव","हवाई जहाज",
            "हेलीकॉप्टर","जहाज","पनडुब्बी","ट्रैक्टर","एम्बुलेंस","टैक्सी","जीप","वैन",
            "ट्राम","मेट्रो","फेरी","याट","रॉकेट","ड्रोन","ग्लाइडर","गर्म हवा का गुब्बारा",
            "फाइटर जेट","बुलडोज़र","क्रेन","फोर्कलिफ्ट","टैंक","रिक्शा","ऑटो रिक्शा",
            "इलेक्ट्रिक कार","व्हीलचेयर","बैलगाड़ी","घोड़ागाड़ी","स्नोमोबाइल","होवरक्राफ्ट",
            "क्रूज जहाज","लड़ाकू जहाज","मालवाहक विमान","समुद्री विमान","माल गाड़ी"
        }
    },

    "Colors": {
        "english": {
            "red","blue","green","yellow","orange","purple","pink","black","white","brown",
            "gray","grey","violet","indigo","cyan","magenta","maroon","navy","teal","olive",
            "coral","salmon","turquoise","aqua","lime","gold","silver","bronze","beige","ivory",
            "cream","lavender","lilac","mauve","rose","crimson","scarlet","ruby","auburn",
            "chestnut","amber","ochre","mustard","khaki","tan","chocolate","coffee","espresso",
            "mint","jade","emerald","sapphire","cobalt","azure","periwinkle","plum","burgundy",
            "wine","fuchsia","hot pink","baby blue","sky blue","forest green","sea green",
            "lemon yellow","peach","apricot","terracotta","rust","copper","platinum","charcoal",
            "slate","ash","snow","pearl","champagne","sand","caramel","walnut","mahogany"
        },
        "hindi": {
            "लाल","नीला","हरा","पीला","नारंगी","बैंगनी","गुलाबी","काला","सफेद","भूरा",
            "धूसर","जामुनी","नील","फ़िरोज़ी","मैजेंटा","मरून","आसमानी","जैतूनी","मूंगा",
            "सामन","फ़िरोज़ा","सुनहरा","चाँदी","कांस्य","बेज","हाथीदाँत","लैवेंडर","गुलाबी",
            "गहरा लाल","लाल","माणिक","सुनहरा","अम्बर","सरसों","खाकी","चॉकलेट","पुदीना",
            "पन्ना","नीलम","कोबाल्ट","आज़ुर","बेर","बरगंडी","फ्यूशिया","आसमानी नीला",
            "वन हरा","नींबू पीला","आड़ू","टेराकोटा","जंग","ताँबा","चारकोल","राख","बर्फ",
            "मोती","शैम्पेन","रेत","कारमेल","महोगनी"
        }
    },

    "Professions": {
        "english": {
            "doctor","nurse","engineer","teacher","lawyer","pilot","chef","actor","singer",
            "dancer","painter","writer","journalist","scientist","architect","dentist","surgeon",
            "pharmacist","psychologist","accountant","economist","banker","judge","police",
            "firefighter","soldier","sailor","farmer","mechanic","plumber","electrician",
            "carpenter","welder","mason","tailor","barber","baker","butcher","fisherman",
            "gardener","driver","postman","librarian","professor","researcher","programmer",
            "designer","photographer","filmmaker","musician","athlete","coach","referee",
            "umpire","astronaut","geologist","biologist","chemist","physicist","mathematician",
            "statistician","historian","philosopher","sociologist","anthropologist","archaeologist",
            "veterinarian","optician","physiotherapist","radiologist","anesthesiologist",
            "cardiologist","neurologist","pediatrician","gynecologist","oncologist","dermatologist",
            "translator","interpreter","social worker","therapist","counselor","dietitian",
            "nutritionist","personal trainer","yoga instructor","lifeguard","paramedic",
            "technician","analyst","consultant","manager","director","ceo","entrepreneur",
            "investor","trader","broker","real estate agent","insurance agent"
        },
        "hindi": {
            "डॉक्टर","नर्स","इंजीनियर","शिक्षक","वकील","पायलट","रसोइया","अभिनेता","गायक",
            "नर्तक","चित्रकार","लेखक","पत्रकार","वैज्ञानिक","वास्तुकार","दंत चिकित्सक",
            "शल्य चिकित्सक","फार्मासिस्ट","मनोवैज्ञानिक","लेखाकार","बैंकर","न्यायाधीश",
            "पुलिस","अग्निशमन","सैनिक","नाविक","किसान","मैकेनिक","प्लंबर","बिजली मिस्त्री",
            "बढ़ई","दर्जी","नाई","बेकर","मछुआरा","माली","चालक","डाकिया","पुस्तकालयाध्यक्ष",
            "प्रोफेसर","शोधकर्ता","प्रोग्रामर","डिज़ाइनर","फोटोग्राफर","संगीतकार","खिलाड़ी",
            "कोच","अंतरिक्ष यात्री","भूवैज्ञानिक","जीवविज्ञानी","रसायनज्ञ","भौतिक विज्ञानी",
            "गणितज्ञ","इतिहासकार","दार्शनिक","पशु चिकित्सक","चिकित्सक","सामाजिक कार्यकर्ता",
            "परामर्शदाता","पोषण विशेषज्ञ","व्यक्तिगत प्रशिक्षक","पैरामेडिक","तकनीशियन",
            "विश्लेषक","सलाहकार","प्रबंधक","निदेशक","उद्यमी","निवेशक","दलाल"
        }
    },

    "Sports": {
        "english": {
            "cricket","football","basketball","tennis","badminton","hockey","volleyball",
            "baseball","rugby","golf","swimming","boxing","wrestling","judo","karate",
            "taekwondo","cycling","running","marathon","sprinting","archery","shooting",
            "fencing","rowing","sailing","surfing","skiing","snowboarding","ice skating",
            "figure skating","gymnastics","athletics","discus","javelin","shot put","hammer",
            "pole vault","high jump","long jump","triple jump","decathlon","pentathlon",
            "triathlon","weightlifting","powerlifting","bodybuilding","crossfit","yoga",
            "pilates","aerobics","zumba","kickboxing","muay thai","bjj","mma","sumo",
            "kabaddi","kho kho","polo","horse riding","equestrian","table tennis","squash",
            "racquetball","handball","water polo","synchronized swimming","diving","canoeing",
            "kayaking","rafting","rock climbing","mountain biking","bmx","skateboarding",
            "parkour","cheerleading","netball","lacrosse","softball","futsal","beach volleyball",
            "beach soccer","snooker","billiards","darts","curling","bobsled","luge","skeleton",
            "biathlon","modern pentathlon","esports","chess boxing"
        },
        "hindi": {
            "क्रिकेट","फुटबॉल","बास्केटबॉल","टेनिस","बैडमिंटन","हॉकी","वॉलीबॉल","बेसबॉल",
            "रग्बी","गोल्फ","तैराकी","मुक्केबाजी","कुश्ती","जूडो","कराटे","ताइक्वांडो",
            "साइकिलिंग","दौड़","मैराथन","तीरंदाजी","निशानेबाजी","तलवारबाजी","रोइंग",
            "सर्फिंग","स्कीइंग","जिमनास्टिक्स","एथलेटिक्स","भाला फेंक","गोला फेंक",
            "ऊँची कूद","लंबी कूद","भारोत्तोलन","कबड्डी","खो-खो","पोलो","घुड़सवारी",
            "टेबल टेनिस","स्क्वैश","हैंडबॉल","वाटर पोलो","डाइविंग","कैनोइंग","रॉक क्लाइंबिंग",
            "स्केटबोर्डिंग","नेटबॉल","सॉफ्टबॉल","स्नूकर","बिलियर्ड्स","कर्लिंग","बायथलॉन",
            "शतरंज","गिल्ली डंडा","मलखंब","पहलवानी"
        }
    },

    "Countries": {
        "english": {
            "india","china","usa","russia","brazil","germany","france","uk","japan","canada",
            "australia","mexico","italy","spain","south korea","indonesia","turkey","saudi arabia",
            "argentina","nigeria","egypt","pakistan","bangladesh","vietnam","philippines",
            "thailand","malaysia","singapore","new zealand","south africa","kenya","ghana",
            "ethiopia","tanzania","morocco","algeria","sudan","angola","mozambique","madagascar",
            "cameroon","ivory coast","niger","mali","zambia","zimbabwe","senegal","guinea",
            "rwanda","ukraine","poland","sweden","norway","denmark","finland","netherlands",
            "belgium","austria","switzerland","portugal","greece","czech republic","hungary",
            "romania","serbia","croatia","slovakia","bulgaria","lithuania","latvia","estonia",
            "ireland","scotland","wales","iceland","luxembourg","malta","cyprus","moldova",
            "georgia","armenia","azerbaijan","kazakhstan","uzbekistan","kyrgyzstan","tajikistan",
            "turkmenistan","mongolia","nepal","bhutan","sri lanka","myanmar","cambodia","laos",
            "taiwan","north korea","iran","iraq","syria","jordan","lebanon","israel","palestine",
            "kuwait","qatar","uae","bahrain","oman","yemen","afghanistan","chile","peru",
            "colombia","venezuela","ecuador","bolivia","paraguay","uruguay","cuba","haiti",
            "dominican republic","jamaica","panama","costa rica","guatemala","honduras","el salvador"
        },
        "hindi": {
            "भारत","चीन","अमेरिका","रूस","ब्राज़ील","जर्मनी","फ्रांस","इंग्लैंड","जापान",
            "कनाडा","ऑस्ट्रेलिया","मैक्सिको","इटली","स्पेन","दक्षिण कोरिया","इंडोनेशिया",
            "तुर्की","सऊदी अरब","अर्जेंटीना","नाइजीरिया","मिस्र","पाकिस्तान","बांग्लादेश",
            "वियतनाम","फिलीपींस","थाईलैंड","मलेशिया","सिंगापुर","न्यूज़ीलैंड","दक्षिण अफ्रीका",
            "केन्या","घाना","इथियोपिया","तंजानिया","मोरक्को","यूक्रेन","पोलैंड","स्वीडन",
            "नॉर्वे","डेनमार्क","फिनलैंड","नीदरलैंड","बेल्जियम","ऑस्ट्रिया","स्विट्जरलैंड",
            "पुर्तगाल","ग्रीस","आयरलैंड","आइसलैंड","जॉर्जिया","आर्मेनिया","कजाकिस्तान",
            "मंगोलिया","नेपाल","भूटान","श्रीलंका","म्यांमार","कंबोडिया","ताइवान","ईरान",
            "इराक","सीरिया","जॉर्डन","लेबनान","इज़राइल","कुवैत","कतर","संयुक्त अरब अमीरात",
            "बहरीन","ओमान","यमन","अफगानिस्तान","चिली","पेरू","कोलंबिया","वेनेजुएला",
            "क्यूबा","पनामा","कोस्टा रिका","ग्वाटेमाला"
        }
    }
}
