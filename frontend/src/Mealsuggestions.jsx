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
  const [showingFirstSet, setShowingFirstSet] = useState(true) // För att växla mellan första och andra uppsättningen recept
  const [allSearchResults, setAllSearchResults] = useState([]) // Spara alla sökresultat
  
  const recipesPerPage = 5
  const totalPages = Math.ceil((showFavorites ? favorites : recipes).length / recipesPerPage)
  
  // BACKEND_INTEGRATION: Hämta användarens kostpreferenser från backend
  // GET /api/users/preferences
  // Response: Array<string>
  useEffect(() => {
    // TODO: Ersätt denna mock med ett riktigt API-anrop
    // fetch('/api/users/preferences')
    //   .then(response => response.json())
    //   .then(data => setDietaryPreferences(data))
    //   .catch(error => console.error('Kunde inte hämta kostpreferenser:', error));

    const mockDietaryPreferences = ['Vegetarisk', 'Glutenfri', 'Laktosfri']
    setDietaryPreferences(mockDietaryPreferences)
  }, [])

  // BACKEND_INTEGRATION: Hämta användarens sparade favoritrecept från backend
  // GET /api/favorites
  // Response: Array<Recipe>
  useEffect(() => {
    // TODO: Ersätt denna mock med ett riktigt API-anrop
    // fetch('/api/favorites')
    //   .then(response => response.json())
    //   .then(data => setFavorites(data))
    //   .catch(error => console.error('Kunde inte hämta favoritrecept:', error));

    // Mock-data som simulerar response från API
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
    if (!searchQuery.trim()) return
    
    // Dölj favoriter och rensa sökfältet efter sökning
    setShowFavorites(false)
    setSearchQuery('')

    // TODO: Ersätt denna mock med riktigt API-anrop enligt ovan specifikation
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

    // TODO: Ersätt denna mock med ett riktigt API-anrop
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

    // Mock-data som simulerar response från API - Två uppsättningar av 5 recept
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
      // Andra uppsättningen (visas när man klickar på "Fler förslag")
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

    // Återställ till första uppsättningen vid ny sökning
    setShowingFirstSet(true);
    
    // Spara alla resultat och visa första fem
    setAllSearchResults(allMockResults);
    setRecipes(allMockResults.slice(0, 5));
    
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
    const isFavorite = favorites.some(fav => fav.id === recipe.id)
    
    if (isFavorite) {
      // BACKEND_INTEGRATION: Ta bort från favoriter
      // SKICKAR: Endast recept-ID i URL:en
      // API: DELETE /api/favorites/{recipeId}
      // Exempel: DELETE /api/favorites/123
      //
      // TODO: Implementera API-anrop för att ta bort favorit
      // fetch(`/api/favorites/${recipe.id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   }
      // })
      //   .then(response => response.json())
      //   .then(data => {
      //     if (data.success) {
      //       // Uppdatera frontend state först efter lyckat API-anrop
      //       setFavorites(prev => prev.filter(fav => fav.id !== recipe.id));
      //     } else {
      //       console.error('Kunde inte ta bort favorit:', data.error);
      //     }
      //   })
      //   .catch(error => console.error('Fel vid borttagning av favorit:', error));

      // Temporär implementation tills backend är klar
      setFavorites(prev => prev.filter(fav => fav.id !== recipe.id))
    } else {
      // Förbereder receptet för att läggas till i favoriter
      const processedRecipe = {
        ...recipe,
        defaultServings: recipe.defaultServings || 2,
        ingredients: recipe.ingredients.map(ingredient => 
          typeof ingredient === 'string' ? parseIngredientString(ingredient) : ingredient
        )
      }

      // BACKEND_INTEGRATION: Lägg till i favoriter
      // SKICKAR: Helt receptobjekt med följande struktur:
      // {
      //   "recipeId": number,
      //   "recipe": {
      //     "title": string,
      //     "defaultServings": number,
      //     "cookingTime": string,
      //     "ingredients": [
      //       {
      //         "item": string,
      //         "amount": number,
      //         "unit": string
      //       }
      //     ],
      //     "instructions": string[],
      //     "tips": string
      //   }
      // }
      //
      // API: POST /api/favorites/add
      // TODO: Implementera API-anrop för att lägga till favorit
      // fetch('/api/favorites/add', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     recipeId: recipe.id,
      //     recipe: processedRecipe
      //   })
      // })
      //   .then(response => response.json())
      //   .then(data => {
      //     if (data.success) {
      //       // Uppdatera frontend state först efter lyckat API-anrop
      //       setFavorites(prev => [...prev, processedRecipe]);
      //     } else {
      //       console.error('Kunde inte lägga till favorit:', data.error);
      //     }
      //   })
      //   .catch(error => console.error('Fel vid tillägg av favorit:', error));

      // Temporär implementation tills backend är klar
      setFavorites(prev => [...prev, processedRecipe])
    }

    if (isFavorite) {
      // STEG 1: Ta bort från favoriter i frontend
      setFavorites(prev => prev.filter(fav => fav.id !== recipe.id))
    } else {
      // STEG 1: Förbereder receptet för att läggas till i favoriter
      // - Konvertera ingredienser från strängformat till objektformat om det behövs
      // - Säkerställ att defaultServings finns
      const processedRecipe = {
        ...recipe,
        defaultServings: recipe.defaultServings || 2,
        ingredients: recipe.ingredients.map(ingredient => 
          typeof ingredient === 'string' ? parseIngredientString(ingredient) : ingredient
        )
      }
      
      // STEG 2: Uppdatera frontend state med den nya favoriten
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
        
        {/* Knapp för att växla mellan första och andra uppsättningen recept */}
        {!showFavorites && recipes.length > 0 && allSearchResults.length > 5 && (
          <button 
            className="toggle-results-button green-button"
            onClick={() => {
              const startIndex = showingFirstSet ? 5 : 0;
              const endIndex = showingFirstSet ? 10 : 5;
              setRecipes(allSearchResults.slice(startIndex, endIndex));
              setShowingFirstSet(!showingFirstSet);
              setCurrentPage(1); // Återställ paginering vid växling
            }}
          >
            {showingFirstSet ? "Fler förslag" : "Fem första"}
          </button>
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
