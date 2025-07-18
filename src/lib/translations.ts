
export type Language = 'en' | 'ur';

type Translations = {
    [key: string]: {
        [lang in Language]: string;
    };
};

export const translations: Translations = {
    // App Metadata
    appTitle: { en: 'Neondara Ledger', ur: 'نیوندرا لیجر' },
    appDescription: { en: 'Manage and store records for the cultural tradition of Niondra.', ur: 'نیوندرا کی ثقافتی روایت کے لیے ریکارڈز کا نظم اور ذخیرہ کریں۔' },

    // General
    add: { en: 'Add', ur: 'شامل کریں' },
    edit: { en: 'Edit', ur: 'ترمیم' },
    delete: { en: 'Delete', ur: 'حذف کریں' },
    deleting: { en: 'Deleting...', ur: 'حذف کیا جا رہا ہے۔۔۔' },
    cancel: { en: 'Cancel', ur: 'منسوخ' },
    save: { en: 'Save', ur: 'محفوظ کریں' },
    saving: { en: 'Saving...', ur: 'محفوظ کیا جا رہا ہے۔..' },
    loading: { en: 'Loading...', ur: 'لوڈ ہو رہا ہے۔۔۔' },
    error: { en: 'Error', ur: 'خرابی' },
    success: { en: 'Success', ur: 'کامیابی' },
    name: { en: 'Name', ur: 'نام' },
    email: { en: 'Email', ur: 'ای میل' },
    yourEmail: { en: 'your email', ur: 'آپ کا ای میل' },
    password: { en: 'Password', ur: 'پاس ورڈ' },
    notes: { en: 'Notes', ur: 'نوٹس' },
    description: { en: 'Description', ur: 'تفصیل' },
    amount: { en: 'Amount', ur: 'رقم' },
    quantityInKg: { en: 'Quantity (kg)', ur: 'مقدار (کلوگرام)'},
    date: { en: 'Date', ur: 'تاریخ' },
    relation: { en: 'Relation', ur: 'رشتہ' },
    search: { en: 'Search', ur: 'تلاش کریں' },
    or: { en: 'OR', ur: 'یا' },
    unknown: { en: 'Unknown', ur: 'نامعلوم' },
    pickDate: { en: 'Pick a date', ur: 'ایک تاریخ منتخب کریں'},
    
    // Login Page
    loginTitle: { en: 'Login', ur: 'لاگ ان' },
    loginDescription: { en: 'Enter your email below to login to your account.', ur: 'اپنے اکاؤنٹ میں لاگ ان کرنے کے لیے نیچے اپنا ای میل درج کریں۔' },
    signIn: { en: 'Sign In', ur: 'سائن ان کریں' },
    signingIn: { en: 'Signing In...', ur: 'سائن ان ہو رہا ہے۔۔۔' },
    noAccount: { en: "Don't have an account?", ur: 'اکاؤنٹ نہیں ہے؟' },
    signUp: { en: 'Sign up', ur: 'سائن اپ' },
    forgotPassword: { en: 'Forgot Password?', ur: 'پاس ورڈ بھول گئے؟' },
    forgotPasswordDescription: { en: 'Enter your email to receive a password reset link.', ur: 'پاس ورڈ ری سیٹ لنک حاصل کرنے کے لیے اپنا ای میل درج کریں۔' },
    passwordResetTitle: { en: 'Reset link sent!', ur: 'ری سیٹ لنک بھیج دیا گیا!' },
    passwordResetDescription: { en: 'Check your email for the reset link.', ur: 'ری سیٹ لنک کے لیے اپنا ای میل چیک کریں۔' },
    sendingLink: { en: 'Sending link...', ur: 'لنک بھیجا جا رہا ہے۔۔۔' },
    sendResetLink: { en: 'Send Reset Link', ur: 'ری سیٹ لنک بھیجیں' },


    // Signup Page
    signupTitle: { en: 'Sign Up', ur: 'سائن اپ' },
    signupDescription: { en: 'Create an account to start using the Niondra Ledger.', ur: 'نیوندرا لیجر استعمال شروع کرنے کے لیے ایک اکاؤنٹ بنائیں۔' },
    fullName: { en: 'Full Name', ur: 'پورا نام' },
    createAccount: { en: 'Create Account', ur: 'اکاؤنٹ بنائیں' },
    creatingAccount: { en: 'Creating Account...', ur: 'اکاؤنٹ بن رہا ہے۔۔۔' },
    haveAccount: { en: 'Already have an account?', ur: 'پہلے سے اکاؤنٹ ہے؟' },
    logIn: { en: 'Log in', ur: 'لاگ ان کریں' },

    // Verify Email Page
    verifyEmailTitle: { en: 'Verify Your Email', ur: 'اپنا ای میل تصدیق کریں' },
    verifyEmailDescription: { en: 'We have sent a verification link to {{email}}. Please check your inbox (and spam folder).', ur: 'ہم نے {{email}} پر ایک تصدیقی لنک بھیجا ہے۔ براہ کرم اپنا ان باکس (اور اسپام فولڈر) چیک کریں۔' },
    verifyEmailInstructions: { en: 'Click the link in the email to activate your account. Once verified, you can log in.', ur: 'اپنا اکاؤنٹ فعال کرنے کے لیے ای میل میں موجود لنک پر کلک کریں۔ تصدیق کے بعد، آپ لاگ ان کر سکتے ہیں۔' },
    resendVerificationEmail: { en: 'Resend Verification Email', ur: 'تصدیقی ای میل دوبارہ بھیجیں' },
    resendCooldown: { en: 'Resend available in {{seconds}}s', ur: '{{seconds}} سیکنڈ میں دوبارہ بھیجیں' },
    sending: { en: 'Sending...', ur: 'بھیجا جا رہا ہے۔۔۔'},
    alreadyVerifiedPrompt: { en: 'Already verified your email?', ur: 'پہلے ہی اپنے ای میل کی تصدیق کر چکے ہیں؟' },
    goToLogin: { en: 'Go to Login', ur: 'لاگ ان پر جائیں' },
    redirecting: { en: 'Redirecting...', ur: 'ری ڈائریکٹ کیا جا رہا ہے۔۔۔' },
    emailVerifiedSuccessTitle: { en: 'Email Verified!', ur: 'ای میل کی تصدیق ہو گئی!' },
    emailVerifiedSuccessDescription: { en: 'You can now access the application.', ur: 'اب آپ ایپلیکیشن تک رسائی حاصل کر سکتے ہیں۔' },


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
    
    // Niondra Timeline / Filters
    searchByGift: { en: 'Search person, gift, notes...', ur: 'شخص، تحفہ، نوٹ تلاش کریں...' },
    allPeople: { en: 'All People', ur: 'تمام لوگ' },
    allEvents: { en: 'All Events', ur: 'تمام تقریبات' },
    givenAndReceived: { en: 'Given & Received', ur: 'دیا اور وصول کیا' },
    filterByPerson: { en: 'Filter by person', ur: 'شخص کے لحاظ سے فلٹر کریں' },
    filterByEvent: { en: 'Filter by event', ur: 'تقریب کے لحاظ سے فلٹر کریں' },
    filterByDirection: { en: 'Filter by direction', ur: 'سمت کے لحاظ سے فلٹر کریں' },
    noEntriesFound: { en: 'No Entries Found', ur: 'کوئی اندراج نہیں ملا' },
    adjustFilters: { en: 'Try adjusting your search or filters, or add a new entry.', ur: 'اپنی تلاش یا فلٹرز کو ایڈجسٹ کرنے کی کوشش کریں، یا ایک نیا اندراج شامل کریں۔' },
    
    // Niondra Card
    to: { en: 'To', ur: 'بنام' },
    from: { en: 'From', ur: 'منجانب' },
    eventWedding: { en: 'Wedding', ur: 'شادی' },
    eventBirth: { en: 'Birth', ur: 'پیدائش' },
    eventHousewarming: { en: 'Housewarming', ur: 'گھر کی تقریب' },
    eventOther: { en: 'Other', ur: 'دیگر' },
    directionGiven: { en: 'Given', ur: 'دیا' },
    directionReceived: { en: 'Received', ur: 'وصول کیا' },
    deleteConfirmTitle: { en: 'Are you sure?', ur: 'کیا آپ واقعی حذف کرنا چاہتے ہیں؟' },
    deleteConfirmDescription: { en: 'This action cannot be undone. This will permanently delete this history entry.', ur: 'یہ عمل واپس نہیں کیا جا سکتا۔ یہ اس ہسٹری اندراج کو مستقل طور پر حذف کر دے گا۔' },
    
    // Niondra Entry Sheet
    addNewEntry: { en: 'Add New Entry', ur: 'نیا اندراج شامل کریں' },
    editEntry: { en: 'Edit Entry', ur: 'اندراج میں ترمیم کریں' },
    entrySheetDescription: { en: 'Record a Niondra exchange. Fill in the details below.', ur: 'نیوندرا کے تبادلے کو ریکارڈ کریں۔ نیچے تفصیلات پر کریں۔' },
    direction: { en: 'Direction', ur: 'سمت' },
    person: { en: 'Person', ur: 'شخص' },
    dateOfEvent: { en: 'Date of Event', ur: 'تقریب کی تاریخ' },
    event: { en: 'Event', ur: 'تقریب' },
    giftType: { en: 'Gift Type', ur: 'تحفے کی قسم' },
    giftTypeMoney: { en: 'Money', ur: 'پیسے' },
    giftTypeSweets: { en: 'Sweets', ur: 'مٹھائی' },
    giftTypeGift: { en: 'Gift', ur: 'تحفہ' },
    giftTypeOther: { en: 'Other', ur: 'دیگر' },
    currencyPlaceholder: { en: 'e.g., USD, CAD', ur: 'مثلاً، USD, CAD' },
    sweetDescriptionPlaceholder: { en: 'e.g., Box of mixed sweets', ur: 'مثلاً، مٹھائی کا ڈبہ' },
    otherDescriptionPlaceholder: { en: 'e.g., Clothes, Watch', ur: 'مثلاً، کپڑے، گھڑی'},
    notesPlaceholder: { en: 'Any additional remarks...', ur: 'کوئی اضافی ریمارکس...' },
    saveChanges: { en: 'Save Changes', ur: 'تبدیلیاں محفوظ کریں' },
    uploadImage: { en: 'Upload an Image', ur: ' تصویر اپلوڈ کریں' },
    giftImage: { en: 'Gift Image', ur: 'تحفہ کی تصویر'},
    giftImageRequired: { en: 'An image or description of the gift is required.', ur: 'تحفے کی تصویر یا تفصیل درکار ہے۔' },
    giftOrDescription: { en: 'or write a description below', ur: 'یا نیچے تفصیل لکھیں'},
    giftDescription: { en: 'Gift Description', ur: 'تحفے کی تفصیل' },
    giftDescriptionPlaceholder: { en: 'e.g., Dinner Set', ur: 'مثلاً، ڈنر سیٹ' },

    // Validation Errors
    errorSelectDirection: { en: "Please select a direction.", ur: "براہ کرم ایک سمت منتخب کریں۔" },
    errorSelectPerson: { en: "Please select a person.", ur: "براہ کرم ایک شخص کو منتخب کریں۔" },
    errorSelectDate: { en: "A date is required.", ur: "تاریخ درکار ہے۔" },
    errorPositiveAmount: { en: "Amount must be positive.", ur: "رقم مثبت ہونی چاہیے۔" },
    errorAmountRequired: { en: "An amount is required for money gifts.", ur: "پیسے کے تحائف کے لیے رقم درکار ہے۔" },
    errorAmountKgRequired: { en: "A quantity in kg is required.", ur: "کلوگرام میں مقدار درکار ہے۔" },
    errorDescriptionRequired: { en: "A description for the gift is required.", ur: "تحفے کے لیے تفصیل درکار ہے۔" },
    errorMin2Chars: { en: "Must be at least 2 characters.", ur: "کم از کم 2 حروف کا ہونا ضروری ہے۔" },
    errorSelectRelation: { en: "Please select a relation.", ur: "براہ کرم ایک رشتہ منتخب کریں۔" },
    emailInUseError: { en: "This email is already registered.", ur: "یہ ای میل پہلے ہی رجسٹرڈ ہے۔" },
    invalidCredentialsError: { en: "Invalid credentials. Please check your email and password.", ur: "غلط اسناد۔ براہ کرم اپنا ای میل اور پاس ورڈ چیک کریں۔" },
    emailNotFoundError: { en: "No account found with this email address.", ur: "اس ای میل ایڈریس کے ساتھ کوئی اکاؤنٹ نہیں ملا۔" },
    errorSelectPayer: { en: 'Please select who paid the bill.', ur: 'براہ کرم منتخب کریں کہ بل کس نے ادا کیا۔'},
    errorAddParticipant: { en: 'Please add at least one participant.', ur: 'براہ کرم کم از کم ایک شریک شامل کریں۔'},
    
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
    clickAddPerson: { en: 'Click "Add Person" to start building your Niondra network.', ur: 'اپنا نیوندرا نیٹ ورک بنانا شروع کرنے کے لیے "شخص شامل کریں" پر کلک کریں۔' },
    balance: { en: 'Balance', ur: 'بیلنس' },
    viewHistory: { en: 'View History', ur: 'ہسٹری دیکھیں' },
    allSquare: { en: 'All square', ur: 'حساب برابر' },
    youAreOwed: { en: 'I have received {{amount}} more', ur: 'میں نے {{amount}} زیادہ وصول کیے ہیں' },
    youHaveGivenMore: { en: 'I have given {{amount}} more', ur: 'میں نے {{amount}} زیادہ دیے ہیں' },
    deletePersonConfirmDescription: { en: 'Are you sure you want to delete {{name}}? This will also delete their entire transaction history. This action cannot be undone.', ur: 'کیا آپ واقعی {{name}} کو حذف کرنا چاہتے ہیں؟ یہ ان کی تمام ٹرانزیکشن ہسٹری کو بھی حذف کر دے گا۔ یہ عمل واپس نہیں کیا جا سکتا۔' },

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

    // Shared Bills Page
    sharedBills: { en: 'Shared Bills', ur: 'مشترکہ بل' },
    addBill: { en: 'Add Bill', ur: 'بل شامل کریں' },
    editBill: { en: 'Edit Bill', ur: 'بل میں ترمیم کریں' },
    loadingBills: { en: 'Loading shared bills...', ur: 'مشترکہ بل لوڈ ہو رہے ہیں...' },
    noBillsAdded: { en: 'No Shared Bills Yet', ur: 'ابھی تک کوئی مشترکہ بل نہیں' },
    clickAddBill: { en: 'Click "Add Bill" to start tracking shared expenses.', ur: 'مشترکہ اخراجات کا ٹریک رکھنا شروع کرنے کے لیے "بل شامل کریں" پر کلک کریں۔' },
    totalAmount: { en: 'Total Amount', ur: 'کل رقم' },
    paidBy: { en: 'Paid by {{name}}', ur: '{{name}} نے ادا کیا' },
    participants: { en: 'Participants', ur: 'شرکاء' },
    shareAmount: { en: 'Share: {{amount}}', ur: 'حصہ: {{amount}}' },
    paid: { en: 'Paid', ur: 'ادا' },
    unpaid: { en: 'Unpaid', ur: 'غیر ادا شدہ' },
    billSettled: { en: 'Settled', ur: 'طے ہو گیا' },
    billUnsettled: { en: 'Unsettled', ur: 'طے نہیں ہوا' },
    deleteBillConfirmDescription: { en: 'This will permanently delete this shared bill and all its details.', ur: 'یہ اس مشترکہ بل اور اس کی تمام تفصیلات کو مستقل طور پر حذف کر دے گا۔' },
    billSheetDescription: { en: 'Track an expense shared with multiple people.', ur: 'متعدد لوگوں کے ساتھ اشتراک کردہ اخراجات کا ٹریک رکھیں۔' },
    billDescriptionPlaceholder: { en: 'e.g., Dinner at BBQ Tonight', ur: 'مثلاً، بی بی کیو ٹونائٹ میں ڈنر' },
    selectPayer: { en: 'Select who paid', ur: 'منتخب کریں کس نے ادا کیا' },
    addParticipant: { en: 'Add Participant', ur: 'شریک شامل کریں' },
    splitEqually: { en: 'Split Equally', ur: 'برابر تقسیم کریں' },
    share: { en: 'Share', ur: 'حصہ' },
    saveBill: { en: 'Save Bill', ur: 'بل محفوظ کریں' },
    
    // Toast Messages
    fetchDataError: { en: "Failed to fetch history data.", ur: "ہسٹری ڈیٹا حاصل کرنے میں ناکامی۔" },
    addEntryError: { en: "Failed to add new entry.", ur: "نیا اندراج شامل کرنے میں ناکامی۔" },
    updateEntryError: { en: "Failed to update entry.", ur: "اندراج کو اپ ڈیٹ کرنے میں ناکامی۔" },
    deleteEntryError: { en: "Failed to delete entry.", ur: "اندراج کو حذف کرنے میں ناکامی۔" },
    personExistsError: { en: "A person named \"{{name}}\" already exists.", ur: "\"{{name}}\" نام کا ایک شخص پہلے سے موجود ہے۔" },
    addPersonError: { en: "Failed to add person.", ur: "شخص کو شامل کرنے میں ناکامی۔" },
    updatePersonError: { en: "Failed to update person.", ur: "شخص کو اپ ڈیٹ کرنے میں ناکامی۔" },
    deletePersonError: { en: "Failed to delete person.", ur: "شخص کو حذف کرنے میں ناکامی۔" },
    noDataToExport: { en: "No Data to Export", ur: "برآمد کرنے کے لیے کوئی ڈیٹا نہیں" },
    noHistoryToExport: { en: "There are no history entries to export.", ur: "برآمد کرنے کے لیے کوئی ہسٹری اندراجات نہیں ہیں۔" },
    exportSuccessTitle: { en: "Export Successful", ur: "برآمد کامیاب" },
    exportSuccessDescription: { en: "Your data has been downloaded as an Excel file.", ur: "آپ کا ڈیٹا ایکسل فائل کے طور پر ڈاؤن لوڈ کر لیا گیا ہے۔" },
    entryAddedSuccess: { en: 'New entry added to the history.', ur: 'نیا اندراج ہسٹری میں شامل کر دیا گیا ہے۔' },
    entryUpdatedSuccess: { en: 'Entry has been updated.', ur: 'اندراج کو اپ ڈیٹ کر دیا گیا ہے۔' },
    entryDeletedSuccess: { en: 'Entry has been deleted.', ur: 'اندراج کو حذف کر دیا گیا ہے۔' },
    personAddedSuccess: { en: "{{name}} has been added.", ur: "{{name}} کو شامل کر دیا گیا ہے۔" },
    personUpdatedSuccess: { en: "{{name}} has been updated.", ur: "{{name}} کو اپ ڈیٹ کر دیا گیا ہے۔" },
    personDeletedSuccess: { en: "Person and their history have been deleted.", ur: "شخص اور ان کی ہسٹری کو حذف کر دیا گیا ہے۔" },
    billAddedSuccess: { en: 'New shared bill has been added.', ur: 'نیا مشترکہ بل شامل کر دیا گیا ہے۔' },
    billUpdatedSuccess: { en: 'Shared bill has been updated.', ur: 'مشترکہ بل کو اپ ڈیٹ کر دیا گیا ہے۔' },
    billDeletedSuccess: { en: 'Shared bill has been deleted.', ur: 'مشترکہ بل کو حذف کر دیا گیا ہے۔' },
    addBillError: { en: 'Failed to add shared bill.', ur: 'مشترکہ بل شامل کرنے میں ناکامی۔' },
    updateBillError: { en: 'Failed to update shared bill.', ur: 'مشترکہ بل کو اپ ڈیٹ کرنے میں ناکامی۔' },
    deleteBillError: { en: 'Failed to delete shared bill.', ur: 'مشترکہ بل کو حذف کرنے میں ناکامی۔' },
    updateParticipantError: { en: 'Failed to update participant status.', ur: 'شریک کی حیثیت کو اپ ڈیٹ کرنے میں ناکامی۔' },
};

export const useTranslation = (language: Language) => {
    return (key: keyof typeof translations, options?: { [key: string]: string | number }) => {
        let translation = translations[key] ? translations[key][language] : key;
        if (options) {
            Object.keys(options).forEach(optionKey => {
                translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
            });
        }
        return translation;
    }
}
