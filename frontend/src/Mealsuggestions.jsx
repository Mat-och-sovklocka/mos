import React, { useState, useEffect } from 'react'
import './mealsuggestions.css'
import { FaStar } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import homeIcon from "./images/home.png";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';

const FALLBACK_FAVORITES = [
  {
    id: 'fav-1',
    title: 'Laxsoppa med dill',
    defaultServings: 2,
    cookingTime: '30 minuter',
    ingredients: [
      { item: 'laxfilé', amount: 300, unit: 'g' },
      { item: 'potatis', amount: 3, unit: 'st' },
      { item: 'morot', amount: 1, unit: 'st' },
      { item: 'dill', amount: 0.5, unit: 'kruka' },
    ],
    instructions: [
      'Koka potatis och morot mjuka i buljong.',
      'Lägg i laxen och låt sjuda några minuter.',
      'Smaksätt med dill och servera med citron.',
    ],
    tips: 'Toppa med en klick crème fraiche för extra krämighet.',
  },
  {
    id: 'fav-2',
    title: 'Vegetarisk lasagne',
    defaultServings: 4,
    cookingTime: '45 minuter',
    ingredients: [
      { item: 'lasagneplattor', amount: 12, unit: 'st' },
      { item: 'zucchini', amount: 1, unit: 'st' },
      { item: 'krossade tomater', amount: 400, unit: 'g' },
      { item: 'ricotta', amount: 250, unit: 'g' },
    ],
    instructions: [
      'Varva tomatsås, grönsaker och ost med lasagneplattor.',
      'Grädda i ugnen tills osten är gyllene.',
      'Låt stå några minuter innan servering.',
    ],
    tips: 'Byt ut ricotta mot cottage cheese för en lättare variant.',
  },
  {
    id: 'fav-3',
    title: 'Kyckling med ugnsgrönsaker',
    defaultServings: 2,
    cookingTime: '35 minuter',
    ingredients: [
      { item: 'kycklingfilé', amount: 2, unit: 'st' },
      { item: 'sötpotatis', amount: 1, unit: 'st' },
      { item: 'paprika', amount: 1, unit: 'st' },
      { item: 'röd lök', amount: 1, unit: 'st' },
    ],
    instructions: [
      'Skär grönsakerna i bitar och lägg på en plåt.',
      'Krydda kycklingen och lägg ovanpå grönsakerna.',
      'Baka i ugnen tills kycklingen är genomstekt.',
    ],
    tips: 'Servera med en enkel yoghurtsås med citron.',
  },
];

const FALLBACK_SEARCH_RECIPES = [
  {
    id: 'rec-101',
    title: 'Krämig svamprisotto',
    defaultServings: 2,
    cookingTime: '30 minuter',
    keywords: ['risotto', 'svamp', 'vegetariskt'],
    ingredients: [
      { item: 'arborioris', amount: 200, unit: 'g' },
      { item: 'blandade svampar', amount: 250, unit: 'g' },
      { item: 'grönsaksbuljong', amount: 700, unit: 'ml' },
    ],
    instructions: [
      'Fräs svamp och lök i smör.',
      'Tillsätt riset och späd med buljong under omrörning.',
      'Avsluta med parmesan och svartpeppar.',
    ],
    tips: 'Toppa med extra svamp som stekts separat för fin textur.',
  },
  {
    id: 'rec-102',
    title: 'Ugnsbakad lax med örter',
    defaultServings: 2,
    cookingTime: '25 minuter',
    keywords: ['lax', 'fisk', 'snabbt'],
    ingredients: [
      { item: 'laxfilé', amount: 2, unit: 'st' },
      { item: 'citron', amount: 1, unit: 'st' },
      { item: 'färska örter', amount: 1, unit: 'kruka' },
    ],
    instructions: [
      'Lägg laxen i en form och toppa med örter och citron.',
      'Baka i ugnen tills laxen är genomstekt.',
      'Servera med kokt potatis eller sallad.',
    ],
    tips: 'Använd foliepaket för en extra saftig lax.',
  },
  {
    id: 'rec-103',
    title: 'Asiatisk nudelsallad',
    defaultServings: 2,
    cookingTime: '20 minuter',
    keywords: ['nudlar', 'kyckling', 'sallad'],
    ingredients: [
      { item: 'äggenudlar', amount: 200, unit: 'g' },
      { item: 'kycklingfilé', amount: 1, unit: 'st' },
      { item: 'grönsaker i strimlor', amount: 200, unit: 'g' },
    ],
    instructions: [
      'Koka nudlar och låt svalna.',
      'Stek kyckling och skär i tunna skivor.',
      'Blanda med grönsaker och dressing.',
    ],
    tips: 'Toppa med rostade sesamfrön och färsk koriander.',
  },
  {
    id: 'rec-104',
    title: 'Grön ärtsoppa',
    defaultServings: 2,
    cookingTime: '15 minuter',
    keywords: ['soppa', 'vegetariskt', 'ärtor'],
    ingredients: [
      { item: 'frysta ärtor', amount: 400, unit: 'g' },
      { item: 'grönsaksbuljong', amount: 600, unit: 'ml' },
      { item: 'lök', amount: 0.5, unit: 'st' },
    ],
    instructions: [
      'Fräs lök mjuk i lite smör.',
      'Tillsätt ärtor och buljong och låt sjuda.',
      'Mixa slätt och servera med bröd.',
    ],
    tips: 'Pressa i lite citron för frisk syra.',
  },
  {
    id: 'rec-105',
    title: 'Kyckling Teriyaki',
    defaultServings: 2,
    cookingTime: '25 minuter',
    keywords: ['kyckling', 'asiatiskt'],
    ingredients: [
      { item: 'kycklinglårfilé', amount: 400, unit: 'g' },
      { item: 'teriyakisås', amount: 1, unit: 'dl' },
      { item: 'broccoli', amount: 200, unit: 'g' },
    ],
    instructions: [
      'Stek kycklingen tills den är genomstekt.',
      'Tillsätt teriyakisås och låt koka in.',
      'Servera med ris och grönsaker.',
    ],
    tips: 'Strö över rostade sesamfrön före servering.',
  },
  {
    id: 'rec-106',
    title: 'Overnight oats med bär',
    defaultServings: 1,
    cookingTime: '10 minuter',
    keywords: ['frukost', 'havregryn', 'snabbt'],
    ingredients: [
      { item: 'havregryn', amount: 1, unit: 'dl' },
      { item: 'mjölk', amount: 1, unit: 'dl' },
      { item: 'frysta bär', amount: 1, unit: 'dl' },
    ],
    instructions: [
      'Blanda havregryn och mjölk i en burk.',
      'Toppa med bär och låt stå i kylen över natten.',
      'Servera med nötter eller frön.',
    ],
    tips: 'Tillsätt chiafrön för extra fiber.',
  },
];

// Hjälpfunktion för att översätta användarkategorier till svenska
const translateUserType = (userType) => {
  switch (userType) {
    case 'ADMIN':
      return 'Administratör';
    case 'CAREGIVER':
      return 'Vårdgivare';
    case 'RESIDENT':
      return 'Boende';
    default:
      return userType;
  }
};

// Bekräftelsemodal komponent
const ConfirmModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <IoMdClose />
        </button>
        <h3>Ta bort från favoriter</h3>
        <p>Är du säker på att du vill ta bort "{title}" från dina favoriter?</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>Avbryt</button>
          <button className="modal-button confirm" onClick={onConfirm}>Ta bort</button>
        </div>
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, onToggleFavorite, isFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [servings, setServings] = useState(recipe.defaultServings || 2)
  const [defaultServings] = useState(recipe.defaultServings || 2)  // Spara ursprungligt antal portioner

  const handleStarClick = () => {
    if (isFavorite) {
      setShowConfirmModal(true)
    } else {
      onToggleFavorite(recipe)
    }
  }

  const handleConfirmRemove = () => {
    onToggleFavorite(recipe)
    setShowConfirmModal(false)
  }

  const adjustServings = (increment) => {
    const newServings = servings + increment
    if (newServings >= 1 && newServings <= 12) {
      setServings(newServings)
    }
  }

  const calculateAmount = (ingredient) => {
    // För favoriter som är i strängformat
    if (typeof ingredient === 'string') return '';
    
    // För ingredienser med amount property
    if (ingredient && ingredient.amount) {
      const ratio = servings / defaultServings;
      const adjustedAmount = ingredient.amount * ratio;
      
      // Formatera numret snyggt (max 2 decimaler, ta bort onödiga decimaler)
      return Number(adjustedAmount.toFixed(2)).toString();
    }
    
    return '';
  }

  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <h3 onClick={() => setIsExpanded(!isExpanded)}>{recipe.title}</h3>
        <FaStar 
          className={`favorite-star ${isFavorite ? 'favorite' : ''}`}
          onClick={handleStarClick}
        />
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRemove}
        title={recipe.title}
      />
      {isExpanded && (
        <div className="recipe-details">
          <div className="recipe-meta">
            <div className="cooking-time">
              <span className="meta-label">Tillagningstid:</span>
              <span className="meta-value">{recipe.cookingTime}</span>
            </div>
            <div className="servings-control">
              <span className="meta-label">Portioner:</span>
              <div className="servings-buttons">
                <button 
                  onClick={() => adjustServings(-1)}
                  disabled={servings <= 1}
                  className="portion-button"
                >
                  −
                </button>
                <span className="servings-count">{servings}</span>
                <button 
                  onClick={() => adjustServings(1)}
                  disabled={servings >= 12}
                  className="portion-button"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="ingredients">
            <h4>Ingredienser:</h4>
            <ul>
              {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && 
                recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {typeof ingredient === 'string' ? (
                      // Hantera enkelt strängformat för favoriter
                      <span className="ingredient-item">{ingredient}</span>
                    ) : (
                      // Hantera objekt-format för sökresultat med mängder
                      <>
                        {ingredient.amount && (
                          <span className="ingredient-amount">
                            {calculateAmount(ingredient)} {ingredient.unit}
                          </span>
                        )}
                        <span className="ingredient-item">
                          {ingredient.item}
                        </span>
                      </>
                    )}
                  </li>
                ))}
            </ul>
          </div>

          <div className="instructions">
            <h4>Instruktioner:</h4>
            {Array.isArray(recipe.instructions) ? (
              <ol>
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <p>{recipe.instructions}</p>
            )}
          </div>

          {recipe.tips && (
            <div className="recipe-tips">
              <h4>Tips:</h4>
              <p>{recipe.tips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const Mealsuggestions = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminOrCaregiver = user?.userType === 'ADMIN' || user?.userType === 'CAREGIVER';
  const viewedPatientName = location?.state?.viewedPatientName || null;

  // States
  const [searchQuery, setSearchQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFavorites, setShowFavorites] = useState(true) // Favoriter visas direkt när sidan laddas
  const [searchPerformed, setSearchPerformed] = useState(false)

  const recipesPerPage = 3
  const totalPages = Math.ceil((showFavorites ? favorites : recipes).length / recipesPerPage)
  
  // BACKEND_INTEGRATION: Hämta användarens sparade favoritrecept från backend
  // GET /api/favorites
  // Response: Array<Recipe>
  useEffect(() => {
    // TODO: Ersätt denna mock med ett riktigt API-anrop
    // fetch('/api/favorites')
    //   .then(response => response.json())
    //   .then(data => setFavorites(data))
    //   .catch(error => console.error('Kunde inte hämta favoritrecept:', error));

    setFavorites(FALLBACK_FAVORITES);
  }, [])

  // BACKEND_INTEGRATION: Sök efter recept som matchar både söktermen och användarens kostpreferenser
  // 1. SÖKNING AV RECEPT
  // POST /api/recipes/search
  // Request body: {
  //   query: string,          // Användarens söktext, t.ex. "pasta"
  //   preferences: string[],  // Array med kostpreferenser, t.ex. ["Vegetarisk", "Glutenfri"]
  //   page?: number,         // Sidnummer för paginering (optional)
  //   pageSize?: number      // Antal resultat per sida (optional)
  // }
  // Response: {
  //   success: boolean,
  //   data: {
  //     recipes: Array<{
  //       id: number,
  //       title: string,
  //       defaultServings: number,
  //       cookingTime: string,
  //       ingredients: Array<{
  //         item: string,
  //         amount: number,
  //         unit: string
  //       }>,
  //       instructions: Array<string>,
  //       tips?: string
  //     }>,
  //     totalResults: number,
  //     currentPage: number,
  //     totalPages: number
  //   }
  // }
  //
  // Exempel på API-anrop:
  // fetch('/api/recipes/search', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     query: searchQuery,
  //     preferences: dietaryPreferences,
  //     page: currentPage,
  //     pageSize: recipesPerPage
  //   })
  // })
  //   .then(response => response.json())
  //   .then(data => {
  //     if (data.success) {
  //       setRecipes(data.data.recipes);
  //       setTotalPages(data.data.totalPages);
  //       setCurrentPage(data.data.currentPage);
  //     } else {
  //       console.error('Sökningen misslyckades:', data.error);
  //       // Visa eventuellt ett felmeddelande för användaren
  //     }
  //   })
  //   .catch(error => {
  //     console.error('Fel vid sökning:', error);
  //     // Visa eventuellt ett felmeddelande för användaren
  //   });

  const handleSearch = () => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredResults = normalizedQuery
      ? FALLBACK_SEARCH_RECIPES.filter((recipe) => {
          const titleMatch = recipe.title.toLowerCase().includes(normalizedQuery);
          const keywordMatch = Array.isArray(recipe.keywords)
            && recipe.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
          return titleMatch || keywordMatch;
        })
      : FALLBACK_SEARCH_RECIPES;

    setShowFavorites(false);
    setSearchPerformed(true);
    setRecipes(filteredResults);
    setCurrentPage(1);
    setSearchQuery('');
  };

  // BACKEND_INTEGRATION: Hantera favoriter
  // Två separata endpoints för att lägga till och ta bort favoriter:
  //
  // 1. LÄGG TILL FAVORIT
  // POST /api/favorites/add
  // Request body: { 
  //   recipeId: number,
  //   recipe: {
  //     title: string,
  //     defaultServings: number,
  //     cookingTime: string,
  //     ingredients: Array<{
  //       item: string,
  //       amount: number,
  //       unit: string
  //     }>,
  //     instructions: Array<string>,
  //     tips?: string
  //   }
  // }
  // Response: 
  // - Success: { success: true, message: "Favorit sparad" }
  // - Error: { success: false, error: string }
  //
  // 2. TA BORT FAVORIT
  // DELETE /api/favorites/{recipeId}
  // Response:
  // - Success: { success: true, message: "Favorit borttagen" }
  // - Error: { success: false, error: string }
  
  const handleToggleFavorite = (recipe) => {
    const isFavorite = favorites.some(fav => fav.id === recipe.id);

    if (isFavorite) {
      // Ta bort receptet från favoriter
      setFavorites(prev => prev.filter(fav => fav.id !== recipe.id));
    } else {
      // Lägg till receptet i favoriter om det inte redan finns
      setFavorites(prev => {
        if (!prev.some(fav => fav.id === recipe.id)) {
          return [...prev, recipe];
        }
        return prev; // Om receptet redan finns, gör inget
      });
    }
  }

  // Beräkna vilka recept som ska visas på nuvarande sida
  const displayedRecipes = (showFavorites ? favorites : recipes)
    .slice((currentPage - 1) * recipesPerPage, currentPage * recipesPerPage)

  return (
    <div className="mealsuggestions-page">
      {/* Top bar med user info och logout - olika layout för desktop/mobil */}
      <div className="top-bar">
        <div className="user-info-top">
          <div className="user-info-content">
            <div className="user-details">
              <div>
                <span className="text-muted">Inloggad som: </span>
                <strong style={{ color: '#316e70' }}>{user?.displayName || user?.email}</strong>
                <span className="badge bg-primary ms-2" style={{ fontSize: '11px' }}>{translateUserType(user?.userType)}</span>
              </div>
              {viewedPatientName && (
                <div style={{ marginTop: '8px', padding: '6px 8px', backgroundColor: '#e8f4f8', borderRadius: '4px', border: '1px solid #316e70' }}>
                  <strong style={{ color: '#316e70', fontSize: '14px' }}>👤 Patient: {viewedPatientName}</strong>
                </div>
              )}
            </div>
            
            {/* Logout knapp - visas bara på mobil i samma container */}
            {isAdminOrCaregiver && (
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="btn btn-outline-danger btn-sm logout-button-mobile"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        
        {/* Logout knapp - visas bara på desktop som separat element */}
        {isAdminOrCaregiver && (
          <div className="logout-container-desktop">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="btn btn-outline-danger btn-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="mealsuggestions-container">
        <h2 className="mealsuggestions-title">Måltidsförslag</h2>

        {/* Patient context banner */}
        {viewedPatientName && (
          <div style={{ 
            textAlign: 'center', 
            margin: '0 auto 40px auto', 
            padding: '12px 24px', 
            backgroundColor: '#e8f4f8', 
            border: '2px solid #316e70', 
            borderRadius: '8px', 
            maxWidth: '600px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#316e70'
          }}>
            🍜 Du söker måltidsförslag för: <strong>{viewedPatientName}</strong>
          </div>
        )}

        {/* Söksektion */}
        <div className="search-section">
          <label htmlFor="recipe-search">Vad vill du äta?</label>
          <div className="search-input-container">
            <input
              id="recipe-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Skriv t ex kyckling"
            />
            <button onClick={handleSearch}>Sök</button>
          </div>
        </div>

        {/* Resultatlista */}
        <div className={`results-section ${showFavorites ? 'favorites-section' : 'search-results-section'}`}>
          {(showFavorites || recipes.length > 0) && (
            <>
              <label className="section-title">
                {showFavorites && favorites.length > 0 ? `Dina favoritrecept (${favorites.length} sparade)` : recipes.length > 0 ? `Sökresultat (${recipes.length} recept)` : ''}
              </label>
              
              <div className="recipes-list">
                {displayedRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.some(fav => fav.id === recipe.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Visa hjälptext om inga favoriter finns och inga sökresultat */}
          {showFavorites && favorites.length === 0 && recipes.length === 0 && (
            <div className="no-favorites">
              <p>Inga favoriter sparade än</p>
              <p className="favorites-hint">Klicka på stjärnan på ett recept för att spara det som favorit</p>
            </div>
          )}
          
          {!showFavorites && recipes.length > 0 && (
            <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                className="show-favorites-button green-button"
                style={{ margin: '0' }}
                onClick={() => {
                  setShowFavorites(true);
                  setCurrentPage(1);
                  setSearchPerformed(false);
                }}
              >
                Visa favoriter
              </button>
            </div>
          )}

          {!showFavorites && searchPerformed && recipes.length === 0 && (
            <div className="no-favorites">
              <p>Inga recept matchade sökningen.</p>
              <button
                className="show-favorites-button green-button"
                onClick={() => {
                  setShowFavorites(true);
                  setCurrentPage(1);
                  setSearchPerformed(false);
                }}
              >
                Tillbaka till favoriter
              </button>
            </div>
          )}
        </div>

        {/* Paginering */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Föregående
            </button>
            <span>{currentPage} av {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Nästa
            </button>
          </div>
        )}
      </div>

      <div className="row mt-5">
        <div className="col-12 d-flex justify-content-center">
          {isAdminOrCaregiver && !viewedPatientName ? (
            <img src={homeIcon} alt="Hem (otillgänglig)" className="disabled-home" title="Inte tillgänglig för administratörer eller vårdgivare" aria-label="Hem (otillgänglig för administratörer eller vårdgivare)" style={{ width: "80px" }} />
          ) : (
            <Link to="/" state={location.state}>
              <img
                src={homeIcon}
                alt="Tillbaka till startsidan"
                style={{ width: "80px", cursor: "pointer" }}
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Mealsuggestions
