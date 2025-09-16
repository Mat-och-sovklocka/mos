import React, { useState, useEffect } from 'react'
import './mealsuggestions.css'
import { FaStar } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import favoritesImage from './images/favorites.jpeg'

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
  const [servings, setServings] = useState(recipe.defaultServings || 4)

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
    const ratio = servings / recipe.defaultServings
    const adjustedAmount = ingredient.amount * ratio
    
    // Formatera numret snyggt (max 2 decimaler, ta bort onödiga decimaler)
    return Number(adjustedAmount.toFixed(2)).toString()
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
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  <span className="ingredient-amount">
                    {calculateAmount(ingredient)} {ingredient.unit}
                  </span>
                  <span className="ingredient-item">
                    {ingredient.item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="instructions">
            <h4>Instruktioner:</h4>
            <ol>
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
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
  // States
  const [dietaryPreferences, setDietaryPreferences] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFavorites, setShowFavorites] = useState(false) // Favoriter visas inte direkt
  
  const recipesPerPage = 5
  const totalPages = Math.ceil((showFavorites ? favorites : recipes).length / recipesPerPage)
  
  // Hämta kostpreferenser
  useEffect(() => {
    const mockDietaryPreferences = ['Vegetarisk', 'Glutenfri', 'Laktosfri']
    setDietaryPreferences(mockDietaryPreferences)
  }, [])

  // Mock-data för favoriter
  useEffect(() => {
    const mockFavorites = [
      {
        id: 1,
        title: "Köttbullar med potatismos",
        ingredients: [
          "500g köttfärs",
          "1 gul lök",
          "1 ägg",
          "1 dl ströbröd",
          "2 dl mjölk",
          "6 potatisar",
          "2 dl grädde",
          "Salt och peppar"
        ],
        instructions: "Blanda färsen med lök, ägg och ströbröd. Forma till bullar och stek. Koka och mosa potatisen, tillsätt grädde och kryddor."
      },
      {
        id: 2,
        title: "Laxsoppa med saffran",
        ingredients: [
          "400g lax",
          "2 morötter",
          "1 purjolök",
          "2 dl grädde",
          "1 påse saffran",
          "Fiskbuljong",
          "Dill"
        ],
        instructions: "Fräs grönsakerna, tillsätt buljong och saffran. Koka upp och lägg i laxbitar. Tillsätt grädde och garnera med dill."
      },
      {
        id: 3,
        title: "Vegetarisk lasagne",
        ingredients: [
          "Lasagneplattor",
          "2 aubergine",
          "3 zucchini",
          "500g krossade tomater",
          "250g ricotta",
          "Riven ost",
          "Basilika"
        ],
        instructions: "Skiva och grilla grönsakerna. Varva med tomatsås, ricotta och lasagneplattor. Toppa med ost och grädda."
      },
      {
        id: 4,
        title: "Krämig kycklinggryta",
        ingredients: [
          "600g kycklingfilé",
          "2 paprika",
          "1 burk champinjoner",
          "3 dl grädde",
          "2 vitlöksklyftor",
          "Timjan"
        ],
        instructions: "Stek kycklingen, tillsätt grönsaker och vitlök. Häll på grädde och låt småkoka med timjan."
      },
      {
        id: 5,
        title: "Halloumiburgare",
        ingredients: [
          "2 halloumi",
          "4 hamburgerbröd",
          "1 avokado",
          "Sallad",
          "Chilimajo"
        ],
        instructions: "Stek halloumin, dela och mosa avokadon. Montera burgaren med sallad och chilimajo."
      },
      {
        id: 6,
        title: "Hemmagjord pizza",
        ingredients: [
          "Pizzadeg",
          "Tomatsås",
          "Mozzarella",
          "Skinka",
          "Champinjoner",
          "Basilika"
        ],
        instructions: "Kavla ut degen, bred på tomatsås. Lägg på toppings och grädda i 225 grader."
      },
      {
        id: 7,
        title: "Dansk smörrebröd",
        ingredients: [
          "Rågbröd",
          "Räkor",
          "Ägg",
          "Majonnäs",
          "Dill",
          "Citron"
        ],
        instructions: "Bred majonnäs på brödet, lägg på ägg och räkor. Garnera med dill och citron."
      },
      {
        id: 8,
        title: "Svensk ärtsoppa",
        ingredients: [
          "Gula ärtor",
          "Rimmat fläsk",
          "Gul lök",
          "Timjan",
          "Senap"
        ],
        instructions: "Blötlägg ärtorna, koka med fläsk och lök. Krydda med timjan och servera med senap."
      }
    ];
    setFavorites(mockFavorites);
  }, [])

  // Hantera sökning efter recept
  const handleSearch = () => {
    if (!searchQuery.trim()) return

    // Mock-sökresultat
    const mockSearchResult = [{
      id: 100,
      title: "Krämig pasta med kyckling och soltorkade tomater",
      defaultServings: 4,
      cookingTime: "30 minuter",
      ingredients: [
        { item: "pasta (penne eller fusilli)", amount: 400, unit: "g" },
        { item: "kycklingfilé", amount: 600, unit: "g" },
        { item: "soltorkade tomater", amount: 100, unit: "g" },
        { item: "vitlöksklyftor", amount: 3, unit: "st" },
        { item: "grädde", amount: 3, unit: "dl" },
        { item: "crème fraiche", amount: 2, unit: "dl" },
        { item: "riven parmesan", amount: 1, unit: "dl" },
        { item: "färsk basilika", amount: 1, unit: "kruka" },
        { item: "olivolja", amount: 2, unit: "msk" },
        { item: "salt", amount: 1, unit: "tsk" },
        { item: "svartpeppar", amount: 0.5, unit: "tsk" }
      ],
      instructions: [
        "Koka upp saltat vatten i en stor kastrull och koka pastan enligt anvisningarna på förpackningen.",
        "Skär kycklingen i jämna bitar, ca 2x2 cm. Krydda med salt och peppar.",
        "Finhacka vitlöken och skär de soltorkade tomaterna i mindre bitar.",
        "Värm olivolja i en stor stekpanna på medelhög värme. Stek kycklingen i 5-6 minuter tills den är genomstekt.",
        "Tillsätt vitlök och soltorkade tomater, stek under omrörning i 2 minuter.",
        "Häll i grädde och crème fraiche. Låt småkoka i 3-4 minuter.",
        "Tillsätt riven parmesan och rör om tills den smält.",
        "Blanda i den nykokta pastan och vänd runt så att såsen täcker all pasta.",
        "Smaka av med salt och peppar.",
        "Garnera med färsk basilika och servera direkt med extra parmesan vid sidan av."
      ],
      tips: "För en grönare variant kan du tillsätta färsk spenat eller blancherad broccoli i slutet."
    }]
    
    setRecipes(mockSearchResult)
    setCurrentPage(1)
    setShowFavorites(false)
  }

  // Hantera favoriter
  const handleToggleFavorite = (recipe) => {
    const isFavorite = favorites.some(fav => fav.id === recipe.id)
    
    if (isFavorite) {
      // Ta bort från favoriter
      setFavorites(prev => prev.filter(fav => fav.id !== recipe.id))
    } else {
      // Lägg till i favoriter
      setFavorites(prev => [...prev, recipe])
    }
  }

  // Beräkna vilka recept som ska visas på nuvarande sida
  const displayedRecipes = (showFavorites ? favorites : recipes)
    .slice((currentPage - 1) * recipesPerPage, currentPage * recipesPerPage)

  return (
    <div className="mealsuggestions-container">
      <h2>Måltidsförslag</h2>
      
      {/* Kostpreferenser */}
      <div className="dietary-preferences">
        <h3>{dietaryPreferences.length === 0 ? 'Du har inte gjort några val' : 'Dina kostpreferenser:'}</h3>
        {dietaryPreferences.length > 0 && (
          <ul>
            {dietaryPreferences.map((preference, index) => (
              <li key={index}>{preference}</li>
            ))}
          </ul>
        )}
      </div>

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

      {/* Favoriter-sektion */}
      <div className="favorites-section">
        <label>Favoriter</label>
        <div 
          className={`favorites-button ${showFavorites ? 'active' : ''}`}
          onClick={() => {
            setShowFavorites(!showFavorites)
            setCurrentPage(1)
            setRecipes([]) // Rensa sökresultat när vi visar favoriter
          }}
        >
          <img 
            src={favoritesImage} 
            alt="Favoriter" 
            className="section-image"
          />
          <div className="favorites-info">
            <div className="favorites-count">{favorites.length} sparade favoriter</div>
            <div className="favorites-hint">
              {showFavorites ? 'Klicka för att dölja favoriter' : 'Klicka för att visa favoriter'}
            </div>
          </div>
        </div>
      </div>

      {/* Resultatlista */}
      <div className="results-section">
        {(showFavorites || recipes.length > 0) && (
          <>
            <h3 className="section-title">
              {showFavorites ? 'Dina favoritrecept' : 'Sökresultat'}
            </h3>
            {displayedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.some(fav => fav.id === recipe.id)}
              />
            ))}
          </>
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
  )
}

export default Mealsuggestions
