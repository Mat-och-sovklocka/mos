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
        defaultServings: 2,
        cookingTime: "45 minuter",
        ingredients: [
          { item: "köttfärs", amount: 500, unit: "g" },
          { item: "gul lök", amount: 1, unit: "st" },
          { item: "vitlöksklyfta", amount: 2, unit: "st" },
          { item: "ägg", amount: 1, unit: "st" },
          { item: "ströbröd", amount: 1, unit: "dl" },
          { item: "mjölk", amount: 1, unit: "dl" },
          { item: "potatis", amount: 800, unit: "g" },
          { item: "smör", amount: 50, unit: "g" },
          { item: "mjölk till moset", amount: 2, unit: "dl" },
          { item: "grädde", amount: 1, unit: "dl" },
          { item: "salt", amount: 1, unit: "tsk" },
          { item: "svartpeppar", amount: 0.5, unit: "tsk" }
        ],
        instructions: [
          "Skala och koka potatisen i saltat vatten tills den är mjuk, ca 20 minuter.",
          "Finhacka lök och vitlök.",
          "Blanda köttfärs, hackad lök, vitlök, ägg, ströbröd och mjölk i en bunke.",
          "Krydda med salt och peppar, blanda väl och låt stå 10 minuter.",
          "Rulla köttbullarna till önskad storlek.",
          "Stek köttbullarna i smör på medelvärme tills de är genomstekta.",
          "Häll av vattnet från potatisen och mosa den med smör och varm mjölk.",
          "Tillsätt grädde och smaka av med salt och peppar.",
          "Servera köttbullarna med potatismoset och valfria tillbehör."
        ],
        tips: "För extra saftiga köttbullar, tillsätt 1 finhackad riven morot i färsen. Servera gärna med rårörda lingon och pressgurka."
      },
      {
        id: 2,
        title: "Laxsoppa med saffran",
        defaultServings: 2,
        cookingTime: "35 minuter",
        ingredients: [
          { item: "laxfilé", amount: 400, unit: "g" },
          { item: "morot", amount: 2, unit: "st" },
          { item: "purjolök", amount: 1, unit: "st" },
          { item: "fänkål", amount: 0.5, unit: "st" },
          { item: "vitlöksklyfta", amount: 2, unit: "st" },
          { item: "grädde", amount: 2, unit: "dl" },
          { item: "fiskbuljong", amount: 1, unit: "l" },
          { item: "saffran", amount: 0.5, unit: "g" },
          { item: "dill", amount: 1, unit: "kruka" },
          { item: "olivolja", amount: 2, unit: "msk" },
          { item: "salt", amount: 1, unit: "tsk" },
          { item: "vitpeppar", amount: 0.5, unit: "tsk" }
        ],
        instructions: [
          "Skär morötter och fänkål i små tärningar, strimla purjolöken.",
          "Fräs grönsakerna i olivolja i en stor kastrull på medelvärme.",
          "Tillsätt vitlök och saffran, fräs ytterligare 1 minut.",
          "Häll i fiskbuljongen och låt sjuda i 10 minuter.",
          "Skär laxen i jämna bitar.",
          "Tillsätt grädde och låt soppan koka upp.",
          "Lägg i laxbitarna och låt sjuda i 5 minuter.",
          "Smaka av med salt och vitpeppar.",
          "Hacka dillen och strö över vid servering."
        ],
        tips: "För en lyxigare variant kan du tillsätta lite räkor eller musslor i slutet av kokningen. Servera med gott bröd!"
      },
      {
        id: 3,
        title: "Vegetarisk lasagne",
        defaultServings: 6,
        cookingTime: "60 minuter",
        ingredients: [
          { item: "lasagneplattor", amount: 12, unit: "st" },
          { item: "aubergine", amount: 2, unit: "st" },
          { item: "zucchini", amount: 2, unit: "st" },
          { item: "krossade tomater", amount: 800, unit: "g" },
          { item: "ricotta", amount: 250, unit: "g" },
          { item: "riven mozzarella", amount: 200, unit: "g" },
          { item: "riven parmesan", amount: 100, unit: "g" },
          { item: "vitlöksklyftor", amount: 4, unit: "st" },
          { item: "gul lök", amount: 1, unit: "st" },
          { item: "färsk basilika", amount: 1, unit: "kruka" },
          { item: "olivolja", amount: 4, unit: "msk" },
          { item: "salt", amount: 2, unit: "tsk" },
          { item: "svartpeppar", amount: 1, unit: "tsk" }
        ],
        instructions: [
          "Sätt ugnen på 200 grader.",
          "Skiva aubergine och zucchini i 0.5 cm tjocka skivor.",
          "Pensla grönsakerna med olivolja och grilla i ugnen i 10-15 minuter.",
          "Finhacka lök och vitlök, fräs i olivolja.",
          "Tillsätt krossade tomater och låt såsen koka ihop i 15 minuter.",
          "Blanda ricotta med hälften av parmesanen och basilika.",
          "Varva i en ugnsform: tomatsås, lasagneplattor, grillade grönsaker, ricottablandning.",
          "Avsluta med tomatsås och resten av osten.",
          "Grädda i ugnen i 25-30 minuter tills osten är gyllene."
        ],
        tips: "För extra smak, marinera grönsakerna i olivolja, vitlök och örter innan grillning. Du kan även använda färsk spenat mellan lagren."
      },
      {
        id: 4,
        title: "Kryddiga tacotacos",
        defaultServings: 2,
        cookingTime: "25 minuter",
        ingredients: [
          { item: "nötfärs", amount: 400, unit: "g" },
          { item: "tacokrydda", amount: 1, unit: "påse" },
          { item: "små tortillabröd", amount: 8, unit: "st" },
          { item: "rödlök", amount: 1, unit: "st" },
          { item: "tomat", amount: 2, unit: "st" },
          { item: "lime", amount: 1, unit: "st" },
          { item: "koriander", amount: 1, unit: "kruka" },
          { item: "avokado", amount: 1, unit: "st" },
          { item: "gräddfil", amount: 1, unit: "dl" },
          { item: "riven ost", amount: 2, unit: "dl" }
        ],
        instructions: [
          "Finhacka rödlöken och lägg i kallt vatten för mildare smak.",
          "Stek färsen i en stekpanna tills den är genomstekt.",
          "Tillsätt tacokryddan och lite vatten, låt puttra enligt förpackningen.",
          "Tärna tomater och avokado.",
          "Värm tortillabröden i stekpanna eller mikro.",
          "Montera tacosen med färs, grönsaker, gräddfil och ost.",
          "Garnera med färsk koriander och limeklyftor."
        ],
        tips: "Gör egen guacamole genom att mosa avokadon med lime, vitlök och salt. För vegetariskt alternativ, använd svarta bönor istället för färs."
      },
      {
        id: 5,
        title: "Asiatisk nudelsoppa",
        defaultServings: 2,
        cookingTime: "20 minuter",
        ingredients: [
          { item: "äggnudlar", amount: 200, unit: "g" },
          { item: "ingefära", amount: 30, unit: "g" },
          { item: "vitlöksklyftor", amount: 2, unit: "st" },
          { item: "röd chili", amount: 1, unit: "st" },
          { item: "vårlök", amount: 2, unit: "st" },
          { item: "grönsaksbuljong", amount: 1, unit: "l" },
          { item: "sojasås", amount: 2, unit: "msk" },
          { item: "sesamolja", amount: 1, unit: "msk" },
          { item: "ägg", amount: 2, unit: "st" },
          { item: "babyspenat", amount: 70, unit: "g" }
        ],
        instructions: [
          "Riv ingefäran och hacka vitlök och chili.",
          "Koka upp buljong med ingefära, vitlök och halva chilin.",
          "Tillsätt sojasås och sesamolja, låt sjuda i 5 minuter.",
          "Koka nudlarna enligt förpackningen.",
          "Knäck äggen försiktigt i soppan och låt dem pocheras.",
          "Tillsätt nudlar och spenat precis före servering.",
          "Toppa med strimlad vårlök och resten av chilin."
        ],
        tips: "Addera protein som tofu, räkor eller strimlad kyckling för en mer mättande måltid. Servera med extra chili och limeklyftor."
      },
      {
        id: 6,
        title: "Krämig svamprisotto",
        defaultServings: 2,
        cookingTime: "40 minuter",
        ingredients: [
          { item: "arborioris", amount: 200, unit: "g" },
          { item: "blandade svampar", amount: 300, unit: "g" },
          { item: "schalottenlök", amount: 2, unit: "st" },
          { item: "vitlöksklyftor", amount: 2, unit: "st" },
          { item: "vitt vin", amount: 1, unit: "dl" },
          { item: "grönsaksbuljong", amount: 1, unit: "l" },
          { item: "smör", amount: 50, unit: "g" },
          { item: "riven parmesan", amount: 50, unit: "g" },
          { item: "färsk timjan", amount: 2, unit: "kvistar" },
          { item: "olivolja", amount: 2, unit: "msk" }
        ],
        instructions: [
          "Värm buljongen i en kastrull.",
          "Finhacka lök och vitlök, stek i olivolja tills löken är mjuk.",
          "Tillsätt riset och rosta det lätt med löken.",
          "Häll i vinet och låt det koka in helt.",
          "Tillsätt buljong lite i taget under konstant omrörning.",
          "Stek svamparna separat i smör med timjan.",
          "När riset är klart, vänd ner svamp och parmesan.",
          "Smaka av med salt och peppar."
        ],
        tips: "Använd gärna karljohansvamp eller kantareller för bästa smak. Spara lite svamp till garnering och toppa med extra parmesan och nymalen svartpeppar."
      },
      {
        id: 7,
        title: "Ugnsbakad lax med örter",
        defaultServings: 2,
        cookingTime: "25 minuter",
        ingredients: [
          { item: "laxfilé", amount: 400, unit: "g" },
          { item: "citron", amount: 1, unit: "st" },
          { item: "färsk dill", amount: 1, unit: "kruka" },
          { item: "färsk persilja", amount: 0.5, unit: "kruka" },
          { item: "vitlöksklyftor", amount: 2, unit: "st" },
          { item: "smör", amount: 50, unit: "g" },
          { item: "färska haricots verts", amount: 200, unit: "g" },
          { item: "körsbärstomater", amount: 200, unit: "g" },
          { item: "potatis", amount: 400, unit: "g" },
          { item: "olivolja", amount: 2, unit: "msk" }
        ],
        instructions: [
          "Sätt ugnen på 200 grader.",
          "Skala och koka potatisen.",
          "Hacka örterna och vitlöken fint.",
          "Blanda örter, vitlök och rumsvarmt smör.",
          "Lägg laxen i en ugnsform, bred örtsmöret på toppen.",
          "Lägg tomater och haricots verts runt laxen.",
          "Ringla över olivolja och pressa över citron.",
          "Baka i ugnen i ca 15-20 minuter.",
          "Servera med kokt potatis och citronklyftor."
        ],
        tips: "För extra saftighet, linda in laxen i foliepaket under bakningen. Örtsmöret kan göras i förväg och förvaras i kylen."
      },
      {
        id: 8,
        title: "Hemgjord pizza bianco",
        defaultServings: 2,
        cookingTime: "50 minuter",
        ingredients: [
          { item: "vetemjöl", amount: 300, unit: "g" },
          { item: "jäst", amount: 12, unit: "g" },
          { item: "olivolja", amount: 2, unit: "msk" },
          { item: "crème fraiche", amount: 2, unit: "dl" },
          { item: "mozzarella", amount: 150, unit: "g" },
          { item: "färsk basilika", amount: 1, unit: "kruka" },
          { item: "vitlöksklyftor", amount: 2, unit: "st" },
          { item: "färsk spenat", amount: 70, unit: "g" },
          { item: "parmaskinka", amount: 80, unit: "g" },
          { item: "pinjenötter", amount: 30, unit: "g" }
        ],
        instructions: [
          "Blanda mjöl, jäst, salt och ljummet vatten till en deg.",
          "Knåda degen i 10 minuter, låt jäsa 30 minuter.",
          "Sätt ugnen på 250 grader med en plåt i.",
          "Kavla ut degen tunt på bakplåtspapper.",
          "Blanda crème fraiche med pressad vitlök.",
          "Bred vitlökscrèmen på pizzan.",
          "Toppa med riven mozzarella och spenat.",
          "Grädda pizzan i 10-12 minuter.",
          "Toppa med parmaskinka, basilika och rostade pinjenötter."
        ],
        tips: "För krispigare botten, använd en pizzasten om du har. Rosta pinjenötterna lätt i torr stekpanna innan servering för mer smak."
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
      defaultServings: 2,
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

  // Konvertera ingredienser från sträng till objekt format
  const parseIngredientString = (ingredientStr) => {
    // Regex för att matcha mängd, enhet och ingrediens
    const regex = /^([\d,.]+)\s*([a-zA-Zåäö]+)?\s*(.+)$/;
    const match = ingredientStr.match(regex);
    
    if (match) {
      const [, amount, unit, item] = match;
      return {
        amount: parseFloat(amount.replace(',', '.')),
        unit: unit || 'st',
        item: item.trim()
      };
    }
    // Om strängen inte matchar formatet, returnera bara ingrediensen som item
    return {
      item: ingredientStr.trim()
    };
  }

  // Hantera favoriter
  const handleToggleFavorite = (recipe) => {
    const isFavorite = favorites.some(fav => fav.id === recipe.id)
    
    if (isFavorite) {
      // Ta bort från favoriter
      setFavorites(prev => prev.filter(fav => fav.id !== recipe.id))
    } else {
      // Konvertera ingredienser om de är i strängformat
      const processedRecipe = {
        ...recipe,
        defaultServings: recipe.defaultServings || 2,
        ingredients: recipe.ingredients.map(ingredient => 
          typeof ingredient === 'string' ? parseIngredientString(ingredient) : ingredient
        )
      }
      // Lägg till i favoriter
      setFavorites(prev => [...prev, processedRecipe])
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
