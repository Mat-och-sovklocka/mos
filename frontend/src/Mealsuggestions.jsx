import React, { useState, useEffect } from 'react'
import './mealsuggestions.css'
import { FaStar } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import homeIcon from "./images/home.png";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';

// Helper function to translate user types to Swedish (for UI display)
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

// Confirmation modal component
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
  const [defaultServings] = useState(recipe.defaultServings || 2)  // Save original number of servings

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
    // For favorites in string format
    if (typeof ingredient === 'string') return '';
    
    // For ingredients with amount property
    if (ingredient && ingredient.amount) {
      const ratio = servings / defaultServings;
      const adjustedAmount = ingredient.amount * ratio;
      
      // Format number nicely (max 2 decimals, remove unnecessary decimals)
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
                      // Handle simple string format for favorites
                      <span className="ingredient-item">{ingredient}</span>
                    ) : (
                      // Handle object format for search results with quantities
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
  const [showFavorites, setShowFavorites] = useState(true) // Favorites shown directly when page loads
  const [showingFirstSet, setShowingFirstSet] = useState(true) // To toggle between first and second set of recipes
  const [allSearchResults, setAllSearchResults] = useState([]) // Save all search results
  
  const recipesPerPage = 5
  const totalPages = Math.ceil((showFavorites ? favorites : recipes).length / recipesPerPage)
  
  // BACKEND_INTEGRATION: Fetch user's saved favorite recipes from backend
  // GET /api/favorites
  // Response: Array<Recipe>
  useEffect(() => {
    // TODO: Replace this mock with a real API call
    // fetch('/api/favorites')
    //   .then(response => response.json())
    //   .then(data => setFavorites(data))
    //   .catch(error => console.error('Could not fetch favorite recipes:', error));

    // Mock data that simulates response from API
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
        defaultServings: 2,
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

  // BACKEND_INTEGRATION: Search for recipes matching both search term and user's dietary preferences
  // 1. RECIPE SEARCH
  // POST /api/recipes/search
  // Request body: {
  //   query: string,          // User's search text, e.g. "pasta"
  //   preferences: string[],  // Array with dietary preferences, e.g. ["Vegetarisk", "Glutenfri"]
  //   page?: number,         // Page number for pagination (optional)
  //   pageSize?: number      // Number of results per page (optional)
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
  // Example API call:
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
    if (!searchQuery.trim()) return
    
    // Hide favorites and clear search field after search
    setShowFavorites(false)
    setSearchQuery('')

    // TODO: Replace this mock with real API call according to above specification
    // const searchData = {
    //   query: searchQuery,
    //   preferences: dietaryPreferences
    // };
    
    // fetch('/api/recipes/search', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(searchData)
    // })
    //   .then(response => {
    //     if (!response.ok) throw new Error('Sökningen misslyckades');
    //     return response.json();
    //   })
    //   .then(data => {
    //     setRecipes(data);
    //     setCurrentPage(1);
    //     setShowFavorites(false);
    //   })
    //   .catch(error => console.error('Fel vid sökning:', error));

    // TODO: Replace this mock with a real API call
    // const searchParams = new URLSearchParams({
    //   query: searchQuery,
    //   preferences: dietaryPreferences.join(',')
    // });
    
    // fetch(`/api/recipes/search?${searchParams}`)
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('Sökningen misslyckades');
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     setRecipes(data);
    //     setCurrentPage(1);
    //     setShowFavorites(false);
    //   })
    //   .catch(error => {
    //     console.error('Fel vid sökning:', error);
    //     // Här kan vi hantera fel, t.ex. visa ett felmeddelande för användaren
    //   });

    // Mock data that simulates response from API - Two sets of 5 recipes
    const allMockResults = [
      {
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
          { item: "olivolja", amount: 2, unit: "msk" }
        ],
        instructions: [
          "Koka upp saltat vatten och koka pastan enligt anvisningarna.",
          "Skär kycklingen i jämna bitar, krydda med salt och peppar.",
          "Stek kycklingen tills den är genomstekt.",
          "Tillsätt övriga ingredienser och låt småkoka.",
          "Blanda med pastan och servera."
        ],
        tips: "Tillsätt gärna färsk spenat i slutet för extra färg och näring."
      },
      {
        id: 101,
        title: "Kyckling Tikka Masala",
        defaultServings: 2,
        cookingTime: "45 minuter",
        ingredients: [
          { item: "kycklingfilé", amount: 800, unit: "g" },
          { item: "yoghurt", amount: 2, unit: "dl" },
          { item: "garam masala", amount: 2, unit: "msk" },
          { item: "krossade tomater", amount: 400, unit: "g" },
          { item: "grädde", amount: 2, unit: "dl" }
        ],
        instructions: [
          "Marinera kycklingen i yoghurt och kryddor.",
          "Stek kycklingen tills den får färg.",
          "Tillsätt tomater och grädde, låt småkoka.",
          "Servera med ris och nanbröd."
        ],
        tips: "Dubbla gärna kryddmängden för extra smak."
      },
      {
        id: 102,
        title: "Asiatisk kycklingsoppa",
        defaultServings: 2,
        cookingTime: "35 minuter",
        ingredients: [
          { item: "kycklingfilé", amount: 500, unit: "g" },
          { item: "risnudlar", amount: 200, unit: "g" },
          { item: "ingefära", amount: 50, unit: "g" },
          { item: "kokosmjölk", amount: 400, unit: "ml" }
        ],
        instructions: [
          "Koka upp buljong med ingefära.",
          "Tillsätt kyckling och låt sjuda.",
          "Lägg i nudlar och kokosmjölk.",
          "Servera med färska örter."
        ],
        tips: "Tillsätt chili för extra hetta."
      },
      {
        id: 103,
        title: "Kycklingwraps med avokado",
        defaultServings: 2,
        cookingTime: "25 minuter",
        ingredients: [
          { item: "kycklingfilé", amount: 600, unit: "g" },
          { item: "tortillabröd", amount: 8, unit: "st" },
          { item: "avokado", amount: 2, unit: "st" },
          { item: "rödlök", amount: 1, unit: "st" }
        ],
        instructions: [
          "Stek kycklingen med kryddor.",
          "Mosa avokadon med lime och vitlök.",
          "Fyll tortillabröden.",
          "Servera direkt."
        ],
        tips: "Förbered guacamolen precis innan servering."
      },
      {
        id: 104,
        title: "Grillad citronkyckling",
        defaultServings: 2,
        cookingTime: "40 minuter",
        ingredients: [
          { item: "kycklinglårfilé", amount: 800, unit: "g" },
          { item: "citron", amount: 2, unit: "st" },
          { item: "vitlöksklyftor", amount: 4, unit: "st" },
          { item: "rosmarin", amount: 2, unit: "kvistar" }
        ],
        instructions: [
          "Marinera kycklingen i citron och örter.",
          "Grilla eller stek tills genomstekt.",
          "Låt vila några minuter.",
          "Servera med pressad citron."
        ],
        tips: "Fungerar perfekt att förbereda dagen innan."
      },
      // Second set (shown when clicking "Fler förslag")
      {
        id: 105,
        title: "Kyckling Teriyaki",
        defaultServings: 2,
        cookingTime: "30 minuter",
        ingredients: [
          { item: "kycklingfilé", amount: 600, unit: "g" },
          { item: "teriyakisås", amount: 1, unit: "dl" },
          { item: "ris", amount: 4, unit: "dl" },
          { item: "broccoli", amount: 300, unit: "g" }
        ],
        instructions: [
          "Koka riset enligt anvisningar.",
          "Stek kycklingen i teriyakisås.",
          "Ångkoka broccolin.",
          "Servera allt tillsammans."
        ],
        tips: "Strö över sesamfrön före servering."
      },
      {
        id: 106,
        title: "Krämig kycklinggryta",
        defaultServings: 2,
        cookingTime: "45 minuter",
        ingredients: [
          { item: "kycklinglårfilé", amount: 700, unit: "g" },
          { item: "champinjoner", amount: 250, unit: "g" },
          { item: "grädde", amount: 3, unit: "dl" },
          { item: "timjan", amount: 2, unit: "msk" }
        ],
        instructions: [
          "Bryn kycklingen väl.",
          "Tillsätt svamp och kryddor.",
          "Häll i grädde och låt småkoka.",
          "Servera med potatis."
        ],
        tips: "Rör ned lite senap i såsen för extra smak."
      },
      {
        id: 107,
        title: "BBQ Kyckling",
        defaultServings: 2,
        cookingTime: "35 minuter",
        ingredients: [
          { item: "kycklingvingar", amount: 1000, unit: "g" },
          { item: "BBQ-sås", amount: 2, unit: "dl" },
          { item: "vitlökspulver", amount: 1, unit: "msk" },
          { item: "paprikapulver", amount: 1, unit: "msk" }
        ],
        instructions: [
          "Krydda kycklingen ordentligt.",
          "Grilla eller baka i ugn.",
          "Pensla med BBQ-sås.",
          "Servera med coleslaw."
        ],
        tips: "Marinera gärna över natten för bästa smak."
      },
      {
        id: 108,
        title: "Caesarsallad med kyckling",
        defaultServings: 2,
        cookingTime: "25 minuter",
        ingredients: [
          { item: "kycklingfilé", amount: 500, unit: "g" },
          { item: "romansallad", amount: 2, unit: "st" },
          { item: "krutonger", amount: 100, unit: "g" },
          { item: "parmesanost", amount: 50, unit: "g" }
        ],
        instructions: [
          "Grilla kycklingen och skär i skivor.",
          "Blanda salladen.",
          "Tillsätt dressing och krutonger.",
          "Toppa med parmesan."
        ],
        tips: "Gör egen caesardressing för bästa resultat."
      },
      {
        id: 109,
        title: "Kycklingcurry",
        defaultServings: 2,
        cookingTime: "40 minuter",
        ingredients: [
          { item: "kycklingfilé", amount: 600, unit: "g" },
          { item: "kokosmjölk", amount: 400, unit: "ml" },
          { item: "currypasta", amount: 2, unit: "msk" },
          { item: "bambuskott", amount: 200, unit: "g" }
        ],
        instructions: [
          "Fräs currypastan.",
          "Tillsätt kyckling och kokosmjölk.",
          "Låt småkoka tills klart.",
          "Servera med jasminris."
        ],
        tips: "Använd röd eller grön currypasta efter smak."
      }
    ];

    // Reset to first set on new search
    setShowingFirstSet(true);
    
    // Save all results and show first five
    setAllSearchResults(allMockResults);
  setRecipes(allMockResults.slice(0, 5));
  setCurrentPage(1);
  setShowFavorites(false);
  }

  // Convert ingredients from string to object format
  const parseIngredientString = (ingredientStr) => {
    // Regex to match quantity, unit and ingredient
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
    // If string doesn't match format, return only ingredient as item
    return {
      item: ingredientStr.trim()
    };
  }

  // BACKEND_INTEGRATION: Handle favorites
  // Two separate endpoints for adding and removing favorites:
  //
  // 1. ADD FAVORITE
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
  // 2. REMOVE FAVORITE
  // DELETE /api/favorites/{recipeId}
  // Response:
  // - Success: { success: true, message: "Favorit borttagen" }
  // - Error: { success: false, error: string }
  
  const handleToggleFavorite = (recipe) => {
    const isFavorite = favorites.some(fav => fav.id === recipe.id);

    if (isFavorite) {
      // Remove recipe from favorites
      setFavorites(prev => prev.filter(fav => fav.id !== recipe.id));
    } else {
      // Add recipe to favorites if it doesn't already exist
      setFavorites(prev => {
        if (!prev.some(fav => fav.id === recipe.id)) {
          return [...prev, recipe];
        }
        return prev; // If recipe already exists, do nothing
      });
    }
  }

  // Calculate which recipes to display on current page
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
          
          {/* Knappar för att växla mellan första och andra uppsättningen recept samt visa favoriter */}
          {!showFavorites && recipes.length > 0 && (
            <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              {allSearchResults.length > 5 && (
                <button 
                  className="toggle-results-button green-button"
                  style={{ margin: '0' }}
                  onClick={() => {
                    const startIndex = showingFirstSet ? 5 : 0;
                    const endIndex = showingFirstSet ? 10 : 5;
                    setRecipes(allSearchResults.slice(startIndex, endIndex));
                    setShowingFirstSet(!showingFirstSet);
                    setCurrentPage(1); // Reset pagination when switching
                  }}
                >
                  {showingFirstSet ? "Fler förslag" : "Fem första"}
                </button>
              )}
              
              <button 
                className="show-favorites-button green-button"
                style={{ margin: '0' }}
                onClick={() => {
                  setShowFavorites(true);
                  setRecipes([]); // Clear search results
                  setCurrentPage(1);
                }}
              >
                Visa favoriter
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
