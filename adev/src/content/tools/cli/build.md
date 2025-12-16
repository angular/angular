import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, setDoc, onSnapshot, collection, query, where, serverTimestamp, setLogLevel, deleteDoc } from 'firebase/firestore';
import { AlertTriangle, Home, Settings, Users, Briefcase, Zap, CheckCircle, Clock, Search, Send, MapPin, TrendingUp, Calendar, Trash2, Edit, Plus, PlusCircle, Link as LinkIcon } from 'lucide-react';

// --- 1. ثوابت الألوان والمستخدمين ---
const COLORS = {
    primary: '#003366', // Navy Blue
    secondary: '#40E0D0', // Turquoise
    accent: '#FF8B13', // Safety Orange
    danger: '#ef4444',
    success: '#10b981',
};

const ROLES = {
    ADMIN: 'مدير النظام',
    CLIENT: 'عميل',
    FIELD_ENGINEER: 'مهندس ميداني'
};

const INITIAL_ASSETS = [
    { name: "نظام طاقة شمسية - مستشفى A", type: "Solar PV", location: "صنعاء", status: "Excellent", performance: 98, nextMaintenance: "2025-12-30" },
    { name: "مضخة مياه شمسية - مشروع C", type: "Water Pump", location: "عدن", status: "Urgent", performance: 65, nextMaintenance: "2025-11-20" },
    { name: "معدات طبية - مركز B", type: "Medical Equipment", location: "تعز", status: "Warning", performance: 82, nextMaintenance: "2026-01-15" },
];

const INITIAL_TICKETS = [
    { title: "عطل في محول النظام الشمسي", priority: "Urgent", status: "InProgress", assetName: "نظام طاقة شمسية - مستشفى A", clientId: 'client_1', assignedTo: 'Engineer_A', createdAt: new Date() },
    { title: "طلب استشارة بخصوص نظام تبريد", priority: "Medium", status: "New", assetName: "معدات طبية - مركز B", clientId: 'client_1', assignedTo: 'Unassigned', createdAt: new Date() },
];


const AssetStatusMap = {
    Excellent: { color: COLORS.success, icon: '🟢', label: 'ممتاز', level: 1 },
    Warning: { color: COLORS.accent, icon: '🟡', label: 'انتباه', level: 2 },
    Urgent: { color: COLORS.danger, icon: '🔴', label: 'عاجل', level: 3 },
};

const TicketStatusMap = {
    New: { color: 'bg-blue-500', label: 'تم الإرسال 📝' },
    UnderReview: { color: 'bg-yellow-500', label: 'قيد المراجعة 👁️' },
    InProgress: { color: 'bg-orange-500', label: 'جاري العمل 🔧' },
    Completed: { color: 'bg-green-500', label: 'مكتمل ✅' },
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'غير محدد';
    // If it's a Firebase Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getCollectionPath = (collectionName, userId, role) => {
    // For Assets, use private user path for the client's data
    if (collectionName === 'assets') {
        return `artifacts/${appId}/users/${userId}/${collectionName}`;
    }
    // For Tickets and services, use public path for shared data
    return `artifacts/${appId}/public/data/${collectionName}`;
};

// --- 2. إعداد Firebase / Context Hooks ---

// Global variables from the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-smart-tech-hub';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let dbInstance = null;
let authInstance = null;


// --- 3. إعداد Gemini API و Helpers ---
const API_KEY = ""; // Canvas will inject key
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

/**
 * Executes a call to the Gemini API with exponential backoff.
 * @param {string} userQuery - The main prompt text.
 * @param {string} [systemPrompt=""] - The system instruction for the model.
 * @param {boolean} [useGrounding=false] - Whether to use Google Search for grounding.
 * @param {number} [maxRetries=5] - Maximum number of retries.
 * @returns {Promise<{text: string, sources: {uri: string, title: string}[]}>} - The generated text and sources.
 */
const fetchGeminiResponse = async (userQuery, systemPrompt = "", useGrounding = false, maxRetries = 5) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        tools: useGrounding ? [{ "google_search": {} }] : undefined,
    };

    let result = null;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }

            const responseJson = await response.json();
            const candidate = responseJson.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const text = candidate.content.parts[0].text;
                
                let sources = [];
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map(attr => ({
                            uri: attr.web?.uri,
                            title: attr.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }
                
                result = { text, sources };
                break; // Success
            } else {
                lastError = new Error("Gemini API response format invalid or missing content.");
                throw lastError;
            }

        } catch (error) {
            lastError = error;
            if (attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    if (result) {
        return result;
    } else {
        console.error("Gemini API failed after multiple retries:", lastError);
        throw new Error(`فشل في الاتصال بمساعد الذكاء الاصطناعي: ${lastError?.message || 'خطأ غير معروف'}`);
    }
};


const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firebaseConfig) {
            console.error("Firebase config is missing.");
            setIsLoading(false);
            return;
        }

        setLogLevel('error');
        const app = initializeApp(firebaseConfig);
        dbInstance = getFirestore(app);
        authInstance = getAuth(app);

        const signIn = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else {
                    await signInAnonymously(authInstance);
                }
            } catch (error) {
                console.error("Authentication Error:", error);
            }
        };
        signIn();

        const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, isLoading, db: dbInstance, auth: authInstance };
};

const useFirestoreData = (collectionName, userId, userRole, filterField = null, filterValue = null) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { db } = useAuth(); // Assume auth is ready by the time this runs

    useEffect(() => {
        if (!db || !userId) return;

        const path = getCollectionPath(collectionName, userId, userRole);
        const colRef = collection(db, path);
        let q = colRef;

        // Simplified filtering for Clients/Engineers
        if (collectionName === 'tickets' && userRole === ROLES.CLIENT) {
            q = query(colRef, where('clientId', '==', `client_${userId}`)); // Mock client ID
        } else if (collectionName === 'tickets' && userRole === ROLES.FIELD_ENGINEER) {
             q = query(colRef, where('assignedTo', '==', `Engineer_A`)); // Mock assigned engineer
        } else if (filterField && filterValue) {
            q = query(colRef, where(filterField, '==', filterValue));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setData(items);
            setLoading(false);
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, userRole, collectionName, filterField, filterValue]);

    return { data, loading, db };
};

// --- 4. مكونات واجهة المستخدم (Shared Components) ---

const Button = ({ children, onClick, className = '', color = 'primary', type = 'button', disabled = false }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 font-semibold rounded-lg transition duration-200 shadow-md flex items-center justify-center space-x-2 space-x-reverse ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
        style={{
            backgroundColor: color === 'primary' ? COLORS.primary : (color === 'accent' ? COLORS.accent : (color === 'danger' ? COLORS.danger : (color === 'success' ? COLORS.success : COLORS.secondary))),
            color: color === 'secondary' || color === 'white' ? COLORS.primary : 'white',
            border: color === 'secondary' ? `2px solid ${COLORS.secondary}` : 'none'
        }}
    >
        {children}
    </button>
);

const Card = ({ title, value, icon: Icon, color, className = '', children }) => (
    <div className={`bg-white p-5 rounded-xl shadow-lg border-b-4 ${className}`} style={{ borderColor: color }}>
        <div className="flex justify-between items-center mb-3">
            <p className="text-lg font-bold text-gray-700">{title}</p>
            {Icon && <Icon size={24} style={{ color }} />}
        </div>
        {value && <div className="text-4xl font-extrabold" style={{ color: color }}>{value}</div>}
        {children}
    </div>
);

const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-700 p-8">
        <i className="fas fa-spinner fa-spin text-5xl mb-4" style={{ color: COLORS.primary }}></i>
        <p className="text-lg font-semibold mb-2">جاري تهيئة منصة سمارت هب...</p>
        <p className="text-sm">يتم الآن تأكيد الهوية وتحميل الأصول من السحابة.</p>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800" style={{ borderRight: `4px solid ${COLORS.secondary}`, paddingRight: '15px' }}>{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        {/* Using Lucide icon for close button */}
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const MessageDisplay = ({ result, title }) => {
    if (!result || !result.text) return null;

    return (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-inner max-h-96 overflow-y-auto">
            <h5 className="font-bold text-md mb-2 border-b pb-1 text-gray-800 flex items-center" style={{ color: COLORS.primary }}>
                <Zap size={18} className="ml-2 text-yellow-500" />
                {title}
            </h5>
            {/* Using dangerouslySetInnerHTML to render potential markdown/line breaks from LLM */}
            <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br/>') }} />
            
            {result.sources && result.sources.length > 0 && (
                <div className="mt-3 border-t pt-2">
                    <p className="text-xs font-semibold text-gray-500">المصادر المستندة (Grounding):</p>
                    <ul className="list-disc pr-5 mt-1 space-y-0.5">
                        {result.sources.map((source, index) => (
                            <li key={index} className="text-xs text-blue-600 transition duration-150">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                                    <LinkIcon size={12} className="ml-1" />{source.title || 'رابط خارجي'}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- 5. واجهة العملاء (Client UI) ---

const ClientDashboard = ({ assets, tickets, userId }) => {
    const activeAssets = assets.filter(a => a.status !== 'Completed');
    const pendingTickets = tickets.filter(t => t.status !== 'Completed');
    const performanceSum = assets.reduce((sum, a) => sum + (a.performance || 0), 0);
    const avgPerformance = assets.length > 0 ? (performanceSum / assets.length).toFixed(1) : 0;
    const isLow = avgPerformance < 85 && assets.length > 0;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">مرحباً يا عميلنا العزيز 👋</h2>

            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="الأصول النشطة" value={activeAssets.length} icon={Briefcase} color={COLORS.primary} />
                <Card title="الطلبات المعلقة" value={pendingTickets.length} icon={Clock} color={COLORS.accent} />
                <Card title="معدل الأداء الكلي" icon={TrendingUp} color={isLow ? COLORS.danger : COLORS.success}>
                    <div className="text-4xl font-extrabold flex items-center" style={{ color: isLow ? COLORS.danger : COLORS.success }}>
                        {avgPerformance}% <span className="text-xl mr-2">({isLow ? 'انتباه' : 'ممتاز'})</span>
                    </div>
                </Card>
            </div>

            {/* الملخص السريع / التنبيهات */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-8" style={{ borderColor: isLow ? COLORS.danger : COLORS.secondary }}>
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-700">
                    <AlertTriangle size={20} className="ml-2" style={{ color: isLow ? COLORS.danger : COLORS.primary }} />
                    ملخص وتنبيهات سريعة
                </h3>
                {assets.filter(a => a.status !== 'Excellent').length > 0 ? (
                    assets.filter(a => a.status !== 'Excellent').slice(0, 3).map(asset => (
                        <div key={asset.id} className="p-3 my-2 rounded-lg bg-red-50 border-r-4 border-red-500 text-sm text-gray-700">
                            <i className="fas fa-bolt ml-2"></i>
                            تنبيه: الأصل **{asset.name}** يحتاج صيانة خلال {Math.ceil((new Date(asset.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24))} يوم.
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">لا توجد تنبيهات حالياً. جميع أصولك تعمل بكفاءة عالية! 🎉</p>
                )}
            </div>

            {/* الخدمات */}
            <ServicesCatalog />
        </div>
    );
};


// --- 6. منصة الصيانة الذكية (STM Platform) ---

const AssetsPlatform = ({ assets, loading, db, userId, userRole }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);

    const handleOpenModal = (asset = null) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const handleSaveAsset = async (assetData) => {
        if (!db || !userId) return;

        const collectionPath = getCollectionPath('assets', userId, userRole);
        
        try {
            if (editingAsset) {
                // Update
                const docRef = doc(db, collectionPath, editingAsset.id);
                await setDoc(docRef, { ...assetData, updatedAt: serverTimestamp() }, { merge: true });
            } else {
                // Add
                await addDoc(collection(db, collectionPath), {
                    ...assetData,
                    performance: 100, // New assets start at 100%
                    status: 'Excellent',
                    clientId: userRole === ROLES.CLIENT ? `client_${userId}` : 'admin_added', // Mock Client ID
                    createdAt: serverTimestamp(),
                });
            }
            setIsModalOpen(false);
        } catch (e) {
            console.error("Error saving asset: ", e);
            // Replace alert() with console log or custom UI
            console.error("فشل حفظ الأصل: " + e.message); 
        }
    };
    
    const handleDeleteAsset = async (id) => {
         if (!db || !userId) return; // Removed window.confirm()
         
         if (!window.confirm("هل أنت متأكد من حذف هذا الأصل؟")) return; // Simple confirm replacement for critical action

         const collectionPath = getCollectionPath('assets', userId, userRole);
         try {
             await deleteDoc(doc(db, collectionPath, id));
         } catch (e) {
             console.error("Error deleting asset: ", e);
             console.error("فشل حذف الأصل: " + e.message);
         }
    };
    
    // Sort assets by performance (lowest first)
    const sortedAssets = useMemo(() => {
        return [...assets].sort((a, b) => (a.performance || 0) - (b.performance || 0));
    }, [assets]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 flex justify-between items-center">
                منصة الصيانة الذكية (STM)
                {(userRole === ROLES.ADMIN || userRole === ROLES.CLIENT) && (
                    <Button onClick={() => handleOpenModal()} color="secondary" className="text-base text-white">
                        <Plus size={18} className="ml-2" /> إضافة أصل
                    </Button>
                )}
            </h2>
            
            {/* Asset Performance Chart Placeholder */}
            <Card title="مخطط الأداء الحي" icon={TrendingUp} color={COLORS.secondary} className="mb-6">
                <div className="h-20 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500">
                    [رسم بياني متحرك يعرض أداء جميع الأنظمة - محاكاة]
                </div>
            </Card>

            {/* Asset List */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                               "test": { … }
        …
      }
    }
  }
}
```

This page discusses usage and options of `@angular-devkit/build-angular:application`.

## Output directory

The result of this build process is output to a directory (`dist/${PROJECT_NAME}` by default).

## Configuring size budgets

As applications grow in functionality, they also grow in size.
The CLI lets you set size thresholds in your configuration to ensure that parts of your application stay within size boundaries that you define.

Define your size boundaries in the CLI configuration file, `angular.json`, in a `budgets` section for each [configured environment](tools/cli/environments).

```json
{
  …
  "configurations": {
    "production": {
      …
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "250kb",
          "maximumError": "500kb"
        },
      ]
    }
  }
}
```

You can specify size budgets for the entire app, and for particular parts.
Each budget entry configures a budget of a given type.
Specify size values in the following formats:

| Size value      | Details                                                                     |
| :-------------- | :-------------------------------------------------------------------------- |
| `123` or `123b` | Size in bytes.                                                              |
| `123kb`         | Size in kilobytes.                                                          |
| `123mb`         | Size in megabytes.                                                          |
| `12%`           | Percentage of size relative to baseline. \(Not valid for baseline values.\) |

When you configure a budget, the builder warns or reports an error when a given part of the application reaches or exceeds a boundary size that you set.

Each budget entry is a JSON object with the following properties:

| Property       | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type           | The type of budget. One of: <table> <thead> <tr> <th> Value </th> <th> Details </th> </tr> </thead> <tbody> <tr> <td> <code>bundle</code> </td> <td> The size of a specific bundle. </td> </tr> <tr> <td> <code>initial</code> </td> <td> The size of JavaScript and CSS needed for bootstrapping the application. Defaults to warning at 500kb and erroring at 1mb. </td> </tr> <tr> <td> <code>allScript</code> </td> <td> The size of all scripts. </td> </tr> <tr> <td> <code>all</code> </td> <td> The size of the entire application. </td> </tr> <tr> <td> <code>anyComponentStyle</code> </td> <td> This size of any one component stylesheet. Defaults to warning at 2kb and erroring at 4kb. </td> </tr> <tr> <td> <code>anyScript</code> </td> <td> The size of any one script. </td> </tr> <tr> <td> <code>any</code> </td> <td> The size of any file. </td> </tr> </tbody> </table> |
| name           | The name of the bundle (for `type=bundle`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| baseline       | The baseline size for comparison.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| maximumWarning | The maximum threshold for warning relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| maximumError   | The maximum threshold for error relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| minimumWarning | The minimum threshold for warning relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| minimumError   | The minimum threshold for error relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| warning        | The threshold for warning relative to the baseline (min & max).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| error          | The threshold for error relative to the baseline (min & max).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Configuring CommonJS dependencies

Always prefer native [ECMAScript modules](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import) (ESM) throughout your application and its dependencies.
ESM is a fully specified web standard and JavaScript language feature with strong static analysis support. This makes bundle optimizations more powerful than other module formats.

Angular CLI also supports importing [CommonJS](https://nodejs.org/api/modules.html) dependencies into your project and will bundle these dependencies automatically.
However, CommonJS modules can prevent bundlers and minifiers from optimizing those modules effectively, which results in larger bundle sizes.
For more information, see [How CommonJS is making your bundles larger](https://web.dev/commonjs-larger-bundles).

Angular CLI outputs warnings if it detects that your browser application depends on CommonJS modules.
When you encounter a CommonJS dependency, consider asking the maintainer to support ECMAScript modules, contributing that support yourself, or using an alternative dependency which meets your needs.
If the best option is to use a CommonJS dependency, you can disable these warnings by adding the CommonJS module name to `allowedCommonJsDependencies` option in the `build` options located in `angular.json`.

```json
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
     "allowedCommonJsDependencies": [
        "lodash"
     ]
     …
   }
   …
},
```

## Configuring browser compatibility

The Angular CLI uses [Browserslist](https://github.com/browserslist/browserslist) to ensure compatibility with different browser versions.
Depending on supported browsers, Angular will automatically transform certain JavaScript and CSS features to ensure the built application does not use a feature which has not been implemented by a supported browser. However, the Angular CLI will not automatically add polyfills to supplement missing Web APIs. Use the `polyfills` option in `angular.json` to add polyfills.

By default, the Angular CLI uses a `browserslist` configuration which [matches browsers supported by Angular](reference/versions#browser-support) for the current major version.

To override the internal configuration, run [`ng generate config browserslist`](cli/generate/config), which generates a `.browserslistrc` configuration file in the project directory matching Angular's supported browsers.

See the [browserslist repository](https://github.com/browserslist/browserslist) for more examples of how to target specific browsers and versions.
Avoid expanding this list to more browsers. Even if your application code more broadly compatible, Angular itself might not be.
You should only ever _reduce_ the set of browsers or versions in this list.

HELPFUL: Use [browsersl.ist](https://browsersl.ist) to display compatible browsers for a `browserslist` query.

## Configuring Tailwind

Angular supports [Tailwind CSS](https://tailwindcss.com/), a utility-first CSS framework.

To integrate Tailwind CSS with Angular CLI, see [Using Tailwind CSS with Angular](guide/tailwind)

## Critical CSS inlining

Angular can inline the critical CSS definitions of your application to improve [First Contentful Paint (FCP)](https://web.dev/first-contentful-paint).
This option is enabled default. You can disable this inlining in the [`styles` customization options](reference/configs/workspace-config#styles-optimization-options).

This optimization extracts the CSS needed to render the initial viewport and inlines it directly into the generated HTML, allowing the browser to display content faster without waiting for the full stylesheets to load. The remaining CSS then loads asynchronously in the background. Angular CLI uses [Beasties](https://github.com/danielroe/beasties) to analyze your application’s HTML and styles.
