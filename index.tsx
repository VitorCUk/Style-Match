import React, { useState, useEffect, DragEvent } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// --- MOCK DATA & TYPES ---

type ResultItem = {
  name: string;
  price: string;
  imageUrl: string;
  link: string;
};

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  color: string;
  style: string;
};

// --- TRANSLATIONS ---

const translations = {
  pt: {
    home: 'INÍCIO',
    account: 'Conta',
    heroTitle: 'O Seu Estilo. O Melhor Preço. Numa Foto.',
    uploadArea: 'Arraste ou solte uma imagem para descobrir preços incríveis.',
    popularFinds: 'Achados Populares',
    myLastSearches: 'As minhas últimas pesquisas',
    viewItem: 'Ver Artigo',
    loginTitle: 'Login',
    registerTitle: 'Criar Conta',
    profileTitle: 'O Meu Perfil',
    nameLabel: 'Nome',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirmar Password',
    phoneLabel: 'Telefone',
    colorLabel: 'Cor Preferida',
    styleLabel: 'Estilo Preferido',
    loginButton: 'Entrar',
    registerButton: 'Registar',
    googleButton: 'Continuar com Google',
    noAccount: 'Ainda não tem conta? Crie uma aqui.',
    hasAccount: 'Já tem conta? Entre aqui.',
    saveChanges: 'Guardar Alterações',
    logout: 'Sair',
    // Color Names
    '#ffffff': 'Branco',
    '#000000': 'Preto',
    '#ff0000': 'Vermelho',
    '#0000ff': 'Azul',
    '#008000': 'Verde',
    '#ffff00': 'Amarelo',
    '#ffa500': 'Laranja',
    '#800080': 'Roxo',
  },
  en: {
    home: 'HOME',
    account: 'Account',
    heroTitle: 'Your Style. The Best Price. In One Photo.',
    uploadArea: 'Drag or drop an image to discover incredible prices.',
    popularFinds: 'Popular Finds',
    myLastSearches: 'My Last Searches',
    viewItem: 'View Item',
    loginTitle: 'Login',
    registerTitle: 'Create Account',
    profileTitle: 'My Profile',
    nameLabel: 'Name',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    phoneLabel: 'Phone',
    colorLabel: 'Favorite Color',
    styleLabel: 'Favorite Style',
    loginButton: 'Login',
    registerButton: 'Register',
    googleButton: 'Continue with Google',
    noAccount: "Don't have an account? Create one here.",
    hasAccount: 'Already have an account? Login here.',
    saveChanges: 'Save Changes',
    logout: 'Logout',
    // Color Names
    '#ffffff': 'White',
    '#000000': 'Black',
    '#ff0000': 'Red',
    '#0000ff': 'Blue',
    '#008000': 'Green',
    '#ffff00': 'Yellow',
    '#ffa500': 'Orange',
    '#800080': 'Purple',
  },
  fr: {
    home: 'ACCUEIL',
    account: 'Compte',
    heroTitle: 'Votre Style. Le Meilleur Prix. En Une Photo.',
    uploadArea: 'Glissez ou déposez une image pour découvrir des prix incroyables.',
    popularFinds: 'Trouvailles Populaires',
    myLastSearches: 'Mes dernières recherches',
    viewItem: 'Voir l\'article',
    loginTitle: 'Connexion',
    registerTitle: 'Créer un Compte',
    profileTitle: 'Mon Profil',
    nameLabel: 'Nom',
    emailLabel: 'Email',
    passwordLabel: 'Mot de passe',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    phoneLabel: 'Téléphone',
    colorLabel: 'Couleur Préférée',
    styleLabel: 'Style Préféré',
    loginButton: 'Se connecter',
    registerButton: 'S\'inscrire',
    googleButton: 'Continuer avec Google',
    noAccount: "Vous n'avez pas de compte? Créez-en un ici.",
    hasAccount: 'Vous avez déjà un compte? Connectez-vous ici.',
    saveChanges: 'Enregistrer les modifications',
    logout: 'Déconnexion',
    // Color Names
    '#ffffff': 'Blanc',
    '#000000': 'Noir',
    '#ff0000': 'Rouge',
    '#0000ff': 'Bleu',
    '#008000': 'Vert',
    '#ffff00': 'Jaune',
    '#ffa500': 'Orange',
    '#800080': 'Violet',
  },
};

// --- OPTIONS FOR PROFILE ---

const colorOptions = [
  { id: 'white', hex: '#ffffff' },
  { id: 'black', hex: '#000000' },
  { id: 'red', hex: '#ff0000' },
  { id: 'blue', hex: '#0000ff' },
  { id: 'green', hex: '#008000' },
  { id: 'yellow', hex: '#ffff00' },
  { id: 'orange', hex: '#ffa500' },
  { id: 'purple', hex: '#800080' },
];

const styleOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'sporty', label: 'Sporty' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'minimalist', label: 'Minimalist' },
];

// --- MOCK DATA ---
const popularFinds: ResultItem[] = [
    { name: "Classic Trench Coat", price: "€89.99", imageUrl: "https://images.unsplash.com/photo-1572804013341-a3d1d73986e9?q=80&w=1974&auto=format&fit=crop", link: "#" },
    { name: "Leather Ankle Boots", price: "€120.00", imageUrl: "https://images.unsplash.com/photo-1608256249251-c423f36b35e2?q=80&w=1974&auto=format&fit=crop", link: "#" },
    { name: "Minimalist Watch", price: "€250.50", imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop", link: "#" },
    { name: "Silk Scarf", price: "€45.00", imageUrl: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=2069&auto=format&fit=crop", link: "#" },
];

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [image, setImage] = useState<string | null>(null);
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [language, setLanguage] = useState<'pt' | 'en' | 'fr'>('pt');
    const [lastSearches, setLastSearches] = useState<string[]>([]);
    const [activeModal, setActiveModal] = useState<'login' | 'register' | 'profile' | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [hoveredColor, setHoveredColor] = useState<string | null>(null);
    const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);

    const t = translations[language];

    // --- EFFECTS ---

    // Load user session and last searches from localStorage on initial render
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('styleMatchUser');
            if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
            }

            const savedSearches = localStorage.getItem('styleMatchSearches');
            if (savedSearches) {
                setLastSearches(JSON.parse(savedSearches));
            }
        } catch (e) {
            console.error("Failed to parse from localStorage", e);
        }
    }, []);

    // Open profile modal and initialize temp profile
    const handleOpenProfile = () => {
      if (currentUser) {
        // Create a copy to avoid direct state mutation and ensure data integrity
        const profileCopy = { ...currentUser };
        setTempProfile(profileCopy);
        // Safely initialize hoveredColor with a fallback
        setHoveredColor(profileCopy.color || colorOptions[0].hex);
        setActiveModal('profile');
      }
    };
    
    // --- API & DATA HANDLING ---

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageUpload = async (file: File) => {
        if (!process.env.API_KEY) {
            setError("API_KEY environment variable not set.");
            return;
        }
        
        setLoading(true);
        setError('');
        setResults([]);

        const previewUrl = URL.createObjectURL(file);
        setImage(previewUrl);

        // Save search to local storage
        const updatedSearches = [previewUrl, ...lastSearches.slice(0, 3)];
        setLastSearches(updatedSearches);
        localStorage.setItem('styleMatchSearches', JSON.stringify(updatedSearches));

        try {
            const base64Image = await getBase64(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64Image } },
                        { text: "Based on the item in this image, find 3 similar, affordable alternatives. For each item, provide its name, price in EUR, and a URL to a high-quality image of the product." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                price: { type: Type.STRING },
                                imageUrl: { type: Type.STRING },
                                link: { type: Type.STRING }
                            },
                             required: ["name", "price", "imageUrl", "link"]
                        }
                    }
                }
            });

            const jsonResponse = JSON.parse(response.text.trim());
            setResults(jsonResponse);

        } catch (e) {
            console.error(e);
            setError('Failed to fetch results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    };

    // --- AUTH & PROFILE HANDLERS ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login
        const mockUser: UserProfile = { name: "Maria Silva", email: "maria.silva@email.com", phone: "912345678", color: '#0000ff', style: 'casual' };
        setCurrentUser(mockUser);
        localStorage.setItem('styleMatchUser', JSON.stringify(mockUser));
        setActiveModal(null);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock register
        const mockUser: UserProfile = { name: "Novo Utilizador", email: "novo@email.com", phone: "", color: '#ffffff', style: 'casual' };
        setCurrentUser(mockUser);
        localStorage.setItem('styleMatchUser', JSON.stringify(mockUser));
        setActiveModal(null);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('styleMatchUser');
        setActiveModal(null);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (tempProfile) {
            setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
        }
    };
    
    const handleColorChange = (hex: string) => {
        if (tempProfile) {
            setTempProfile({ ...tempProfile, color: hex });
            setHoveredColor(hex);
        }
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempProfile) {
            setCurrentUser(tempProfile);
            localStorage.setItem('styleMatchUser', JSON.stringify(tempProfile));
            setActiveModal(null);
        }
    };

    // --- RENDER METHODS ---

    const renderResults = () => (
        <div className="results-grid">
            {results.map((item, index) => (
                <div key={index} className="result-card">
                    <img src={item.imageUrl} alt={item.name} className="result-image" />
                    <h3>{item.name}</h3>
                    <p>{item.price}</p>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-button">{t.viewItem}</a>
                </div>
            ))}
        </div>
    );

    const renderDiscoverSection = (title: string, items: (ResultItem | string)[]) => (
        <section className="discover-section">
            <h2>{title}</h2>
            <div className="results-grid">
                {items.map((item, index) => (
                    <div key={index} className="result-card">
                        <img
                            src={typeof item === 'string' ? item : item.imageUrl}
                            alt={typeof item === 'string' ? `Search ${index + 1}` : item.name}
                            className="result-image"
                        />
                        {typeof item !== 'string' && (
                            <>
                                <h3>{item.name}</h3>
                                <p>{item.price}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <>
            <header className="top-header">
                <nav className="header-nav left-nav">
                    <a href="#">{t.home}</a>
                </nav>
                <div className="logo">STYLE MATCH</div>
                <nav className="header-nav right-nav">
                    {currentUser ? (
                        <a href="#" onClick={handleOpenProfile}>{currentUser.name}</a>
                    ) : (
                        <a href="#" onClick={() => setActiveModal('login')}>{t.account}</a>
                    )}
                    <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                        <option value="pt">PT</option>
                        <option value="en">EN</option>
                        <option value="fr">FR</option>
                    </select>
                </nav>
            </header>

            <section className="hero-section">
                <h1>{t.heroTitle}</h1>
            </section>

            <main className="content-area">
                {!image && (
                    <div
                        className="upload-area"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        <p>{t.uploadArea}</p>
                        <input type="file" id="file-input" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>
                )}
                
                {loading && <div className="spinner"></div>}
                {error && <p className="error-message">{error}</p>}

                {(image || results.length > 0) && (
                    <div className="search-results-container">
                        <div className="image-preview-wrapper">
                            {image && <img src={image} alt="Uploaded preview" className="image-preview" />}
                        </div>
                        <div className="results-wrapper">
                            {results.length > 0 && renderResults()}
                        </div>
                    </div>
                )}
            </main>

            {!image && (lastSearches.length > 0
                ? renderDiscoverSection(t.myLastSearches, lastSearches)
                : renderDiscoverSection(t.popularFinds, popularFinds)
            )}

            {/* --- MODALS --- */}
            {activeModal && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
                        
                        {activeModal === 'login' && (
                            <form onSubmit={handleLogin}>
                                <h2>{t.loginTitle}</h2>
                                <div className="form-group">
                                    <label>{t.emailLabel}</label>
                                    <input type="email" required />
                                </div>
                                <div className="form-group">
                                    <label>{t.passwordLabel}</label>
                                    <input type="password" required />
                                </div>
                                <button type="submit" className="button-primary">{t.loginButton}</button>
                                <button type="button" className="button-google">{t.googleButton}</button>
                                <p className="form-switch" onClick={() => setActiveModal('register')}>{t.noAccount}</p>
                            </form>
                        )}

                        {activeModal === 'register' && (
                            <form onSubmit={handleRegister}>
                                <h2>{t.registerTitle}</h2>
                                <div className="form-group">
                                    <label>{t.nameLabel}</label>
                                    <input type="text" required />
                                </div>
                                <div className="form-group">
                                    <label>{t.emailLabel}</label>
                                    <input type="email" required />
                                </div>
                                <div className="form-group">
                                    <label>{t.passwordLabel}</label>
                                    <input type="password" required />
                                </div>
                                 <div className="form-group">
                                    <label>{t.confirmPasswordLabel}</label>
                                    <input type="password" required />
                                </div>
                                <button type="submit" className="button-primary">{t.registerButton}</button>
                                <p className="form-switch" onClick={() => setActiveModal('login')}>{t.hasAccount}</p>
                            </form>
                        )}
                        
                        {activeModal === 'profile' && tempProfile && (
                            <form onSubmit={handleSaveChanges}>
                                <h2>{t.profileTitle}</h2>
                                <div className="form-group">
                                    <label>{t.nameLabel}</label>
                                    <input type="text" name="name" value={tempProfile.name} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <label>{t.emailLabel}</label>
                                    <input type="email" name="email" value={tempProfile.email} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <label>{t.phoneLabel}</label>
                                    <input type="tel" name="phone" value={tempProfile.phone} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <div className="color-picker-container">
                                        <div className="color-picker-label">
                                            {t.colorLabel} - {hoveredColor && t[hoveredColor as keyof typeof t] ? t[hoveredColor as keyof typeof t] : ''}
                                        </div>
                                        <div className="color-swatches">
                                            {colorOptions.map(({ id, hex }) => (
                                                <div
                                                    key={id}
                                                    className={`color-swatch ${tempProfile.color === hex ? 'selected' : ''}`}
                                                    style={{ backgroundColor: hex }}
                                                    onClick={() => handleColorChange(hex)}
                                                    onMouseEnter={() => setHoveredColor(hex)}
                                                    onMouseLeave={() => setHoveredColor(tempProfile.color)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                 <div className="form-group">
                                    <label>{t.styleLabel}</label>
                                    <select name="style" value={tempProfile.style} onChange={handleProfileChange}>
                                        {styleOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="button-primary">{t.saveChanges}</button>
                                <a href="#" className="form-switch" onClick={handleLogout}>{t.logout}</a>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);