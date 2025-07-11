
export type Language = 'en' | 'ur';

type Translations = {
    [key: string]: {
        [lang in Language]: string;
    };
};

export const translations: Translations = {
    // App Metadata
    appTitle: { en: 'Neondara History', ur: 'نیوندرا ہسٹری' },
    appDescription: { en: 'Manage and store records for the cultural tradition of Neondara.', ur: 'نیوندرا کی ثقافتی روایت کے لیے ریکارڈز کا نظم اور ذخیرہ کریں۔' },

    // General
    add: { en: 'Add', ur: 'شامل کریں' },
    edit: { en: 'Edit', ur: 'ترمیم' },
    delete: { en: 'Delete', ur: 'حذف کریں' },
    cancel: { en: 'Cancel', ur: 'منسوخ' },
    save: { en: 'Save', ur: 'محفوظ کریں' },
    loading: { en: 'Loading...', ur: 'لوڈ ہو رہا ہے۔۔۔' },
    error: { en: 'Error', ur: 'خرابی' },
    success: { en: 'Success', ur: 'کامیابی' },
    name: { en: 'Name', ur: 'نام' },
    email: { en: 'Email', ur: 'ای میل' },
    password: { en: 'Password', ur: 'پاس ورڈ' },
    notes: { en: 'Notes', ur: 'نوٹس' },
    description: { en: 'Description', ur: 'تفصیل' },
    amount: { en: 'Amount', ur: 'رقم' },
    date: { en: 'Date', ur: 'تاریخ' },
    relation: { en: 'Relation', ur: 'رشتہ' },
    search: { en: 'Search', ur: 'تلاش کریں' },
    or: { en: 'OR', ur: 'یا' },
    
    // Login Page
    loginTitle: { en: 'Login', ur: 'لاگ ان' },
    loginDescription: { en: 'Enter your email below to login to your account.', ur: 'اپنے اکاؤنٹ میں لاگ ان کرنے کے لیے نیچے اپنا ای میل درج کریں۔' },
    signIn: { en: 'Sign In', ur: 'سائن ان کریں' },
    signingIn: { en: 'Signing In...', ur: 'سائن ان ہو رہا ہے۔۔۔' },
    noAccount: { en: "Don't have an account?", ur: 'اکاؤنٹ نہیں ہے؟' },
    signUp: { en: 'Sign up', ur: 'سائن اپ' },

    // Signup Page
    signupTitle: { en: 'Sign Up', ur: 'سائن اپ' },
    signupDescription: { en: 'Create an account to start using the Neondara History.', ur: 'نیوندرا ہسٹری استعمال شروع کرنے کے لیے ایک اکاؤنٹ بنائیں۔' },
    fullName: { en: 'Full Name', ur: 'پورا نام' },
    createAccount: { en: 'Create Account', ur: 'اکاؤنٹ بنائیں' },
    creatingAccount: { en: 'Creating Account...', ur: 'اکاؤنٹ بن رہا ہے۔۔۔' },
    haveAccount: { en: 'Already have an account?', ur: 'پہلے سے اکاؤنٹ ہے؟' },
    logIn: { en: 'Log in', ur: 'لاگ ان کریں' },

    // Layout / Header
    navHistory: { en: 'History', ur: 'ہسٹری' },
    navPeople: { en: 'People', ur: 'لوگ' },
    myAccount: { en: 'My Account', ur: 'میرا اکاؤنٹ' },
    exportData: { en: 'Export Data', ur: 'ڈیٹا برآمد کریں' },
    language: { en: 'Language', ur: 'زبان' },
    english: { en: 'English', ur: 'انگریزی' },
    urdu: { en: 'Urdu', ur: 'اردو' },
    logout: { en: 'Log out', ur: 'لاگ آؤٹ' },

    // History View
    addEntry: { en: 'Add Entry', ur: 'اندراج شامل کریں' },
    loadingHistory: { en: 'Loading history...', ur: 'ہسٹری لوڈ ہو رہی ہے۔۔۔' },
    entryAddedSuccess: { en: 'New entry added to the history.', ur: 'نیا اندراج ہسٹری میں شامل کر دیا گیا ہے۔' },
    entryUpdatedSuccess: { en: 'Entry has been updated.', ur: 'اندراج کو اپ ڈیٹ کر دیا گیا ہے۔' },
    entryDeletedSuccess: { en: 'Entry has been deleted.', ur: 'اندراج کو حذف کر دیا گیا ہے۔' },
    
    // Neondara Timeline / Filters
    searchByGift: { en: 'Search by gift...', ur: 'تحفے کے لحاظ سے تلاش کریں...' },
    allPeople: { en: 'All People', ur: 'تمام لوگ' },
    allOccasions: { en: 'All Occasions', ur: 'تمام مواقع' },
    givenAndReceived: { en: 'Given & Received', ur: 'دیا اور وصول کیا' },
    filterByPerson: { en: 'Filter by person', ur: 'شخص کے لحاظ سے فلٹر کریں' },
    filterByOccasion: { en: 'Filter by occasion', ur: 'موقع کے لحاظ سے فلٹر کریں' },
    filterByDirection: { en: 'Filter by direction', ur: 'سمت کے لحاظ سے فلٹر کریں' },
    noEntriesFound: { en: 'No Entries Found', ur: 'کوئی اندراج نہیں ملا' },
    adjustFilters: { en: 'Try adjusting your search or filters, or add a new entry.', ur: 'اپنی تلاش یا فلٹرز کو ایڈجسٹ کرنے کی کوشش کریں، یا ایک نیا اندراج شامل کریں۔' },
    
    // Neondara Card
    to: { en: 'To', ur: 'بنام' },
    from: { en: 'From', ur: 'منجانب' },
    occasionWedding: { en: 'Wedding', ur: 'شادی' },
    occasionBirth: { en: 'Birth', ur: 'پیدائش' },
    occasionHousewarming: { en: 'Housewarming', ur: 'گھر کی تقریب' },
    occasionOther: { en: 'Other', ur: 'دیگر' },
    directionGiven: { en: 'Given', ur: 'دیا' },
    directionReceived: { en: 'Received', ur: 'وصول کیا' },
    deleteConfirmTitle: { en: 'Are you sure?', ur: 'کیا آپ واقعی حذف کرنا چاہتے ہیں؟' },
    deleteConfirmDescription: { en: 'This action cannot be undone. This will permanently delete this history entry.', ur: 'یہ عمل واپس نہیں کیا جا سکتا۔ یہ اس ہسٹری اندراج کو مستقل طور پر حذف کر دے گا۔' },
    
    // Neondara Entry Sheet
    addNewEntry: { en: 'Add New Entry', ur: 'نیا اندراج شامل کریں' },
    editEntry: { en: 'Edit Entry', ur: 'اندراج میں ترمیم کریں' },
    entrySheetDescription: { en: 'Record a Neondara exchange. Fill in the details below.', ur: 'نیوندرا کے تبادلے کو ریکارڈ کریں۔ نیچے تفصیلات پر کریں۔' },
    direction: { en: 'Direction', ur: 'سمت' },
    person: { en: 'Person', ur: 'شخص' },
    dateOfOccasion: { en: 'Date of Occasion', ur: 'موقع کی تاریخ' },
    occasion: { en: 'Occasion', ur: 'موقع' },
    giftType: { en: 'Gift Type', ur: 'تحفے کی قسم' },
    giftTypeMoney: { en: 'Money', ur: 'پیسے' },
    giftTypeSweets: { en: 'Sweets', ur: 'مٹھائی' },
    giftTypeGift: { en: 'Gift', ur: 'تحفہ' },
    giftTypeOther: { en: 'Other', ur: 'دیگر' },
    currency: { en: 'Currency', ur: 'کرنسی' },
    currencyPlaceholder: { en: 'e.g., USD, CAD', ur: 'مثلاً، USD, CAD' },
    sweetDescriptionPlaceholder: { en: 'e.g., Box of mixed sweets', ur: 'مثلاً، مٹھائی کا ڈبہ' },
    otherDescriptionPlaceholder: { en: 'e.g., Clothes, Watch', ur: 'مثلاً، کپڑے، گھڑی'},
    notesPlaceholder: { en: 'Any additional remarks...', ur: 'کوئی اضافی ریمارکس...' },
    saveChanges: { en: 'Save Changes', ur: 'تبدیلیاں محفوظ کریں' },
    uploadImage: { en: 'Upload an Image', ur: ' تصویر اپلوڈ کریں' },
    giftImage: { en: 'Gift Image', ur: 'تحفہ کی تصویر'},
    giftOrDescription: { en: 'or write a description below', ur: 'یا نیچے تفصیل لکھیں'},
    giftDescription: { en: 'Gift Description', ur: 'تحفے کی تفصیل' },
    giftDescriptionPlaceholder: { en: 'e.g., Dinner Set', ur: 'مثلاً، ڈنر سیٹ' },
    
    // People Page
    backToHistory: { en: 'Back to History', ur: 'ہسٹری پر واپس' },
    peopleAndBalances: { en: 'People & Balances', ur: 'لوگ اور بیلنس' },
    searchByName: { en: 'Search by name...', ur: 'نام سے تلاش کریں...' },
    addPerson: { en: 'Add Person', ur: 'شخص شامل کریں' },
    addNewPersonTitle: { en: 'Add a New Person', ur: 'ایک نیا شخص شامل کریں' },
    addNewPersonDescription: { en: 'Add a new friend or relative to your contact list.', ur: 'اپنی رابطہ فہرست میں ایک نیا دوست یا رشتہ دار شامل کریں۔' },
    savePerson: { en: 'Save person', ur: 'شخص کو محفوظ کریں' },
    loadingContacts: { en: 'Loading your contacts...', ur: 'آپ کے رابطے لوڈ ہو رہے ہیں...' },
    noPeopleAdded: { en: 'No People Added Yet', ur: 'ابھی تک کوئی شخص شامل نہیں کیا گیا' },
    clickAddPerson: { en: 'Click "Add Person" to start building your Neondara network.', ur: 'اپنا نیوندرا نیٹ ورک بنانا شروع کرنے کے لیے "شخص شامل کریں" پر کلک کریں۔' },
    balance: { en: 'Balance', ur: 'بیلنس' },
    viewHistory: { en: 'View History', ur: 'ہسٹری دیکھیں' },
    allSquare: { en: 'All square', ur: 'حساب برابر' },
    youWillReceive: { en: 'You will receive', ur: 'آپ وصول کریں گے' },
    youWillGive: { en: 'You will give', ur: 'آپ دیں گے' },

    // Person Detail Page
    backToPeople: { en: 'Back to People', ur: 'لوگوں کی فہرست پر واپس' },
    balanceSummary: { en: 'Balance Summary', ur: 'بیلنس کا خلاصہ' },
    balanceSummaryDescription: { en: 'Based on monetary gifts exchanged.', ur: 'مالی تحائف کے تبادلے پر مبنی۔' },
    totalGiven: { en: 'Total Given', ur: 'کل دیا گیا' },
    totalReceived: { en: 'Total Received', ur: 'کل وصول کیا گیا' },
    netBalance: { en: 'Net Balance', ur: 'کل بیلنس' },
    transactionHistory: { en: 'Transaction History', ur: 'ٹرانزیکشن ہسٹری' },
    noHistoryYet: { en: 'No History Yet', ur: 'ابھی تک کوئی ہسٹری نہیں' },
    startTracking: { en: 'Add a new entry to start tracking your exchanges with', ur: 'کے ساتھ اپنے تبادلے کا ٹریک رکھنا شروع کرنے کے لیے ایک نیا اندراج شامل کریں۔' },
    loadingDetails: { en: 'Loading details...', ur: 'تفصیلات لوڈ ہو رہی ہیں...' },
    personNotFound: { en: 'Person not found', ur: 'شخص نہیں ملا' },
};

export const useTranslation = (language: Language) => {
    return (key: keyof typeof translations) => {
        return translations[key] ? translations[key][language] : key;
    }
}
