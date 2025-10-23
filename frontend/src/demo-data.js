// Demo data for offline PWA functionality
export const demoUsers = [
  {
    id: "demo-admin-001",
    email: "admin@demo.mos",
    displayName: "Demo Admin",
    phone: "+46 70 123 4567",
    userType: "ADMIN",
    active: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-caregiver-001", 
    email: "caregiver@demo.mos",
    displayName: "Anna Vårdgivare",
    phone: "+46 70 234 5678",
    userType: "CAREGIVER",
    active: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-resident-001",
    email: "resident@demo.mos", 
    displayName: "Erik Boende",
    phone: "+46 70 345 6789",
    userType: "RESIDENT",
    active: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

export const demoReminders = [
  {
    id: "demo-reminder-001",
    userId: "demo-resident-001",
    title: "Frukost",
    description: "Glöm inte att äta frukost kl 08:00",
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-reminder-002", 
    userId: "demo-resident-001",
    title: "Lunch",
    description: "Lunch kl 12:00",
    scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-reminder-003",
    userId: "demo-resident-001", 
    title: "Middag",
    description: "Middag kl 18:00",
    scheduledTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    isCompleted: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-reminder-004",
    userId: "demo-resident-001",
    title: "Sovtid", 
    description: "Dags att gå och lägga sig kl 22:00",
    scheduledTime: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(), // 16 hours from now
    isCompleted: false,
    createdAt: new Date().toISOString()
  }
];

export const demoMealSuggestions = [
  {
    id: "demo-meal-001",
    title: "Havregrynsgröt med bär",
    description: "Näringsrik frukost med fiber och antioxidanter",
    image: "/images/meal.jpeg",
    category: "breakfast",
    prepTime: "10 min",
    difficulty: "Lätt"
  },
  {
    id: "demo-meal-002", 
    title: "Kyckling med ris och grönsaker",
    description: "Balanserad lunch med protein och kolhydrater",
    image: "/images/meal.jpeg",
    category: "lunch",
    prepTime: "25 min",
    difficulty: "Medium"
  },
  {
    id: "demo-meal-003",
    title: "Lax med potatis och broccoli", 
    description: "Hälsosam middag rik på omega-3",
    image: "/images/meal.jpeg",
    category: "dinner",
    prepTime: "30 min",
    difficulty: "Medium"
  }
];

export const demoAssignments = [
  {
    id: "demo-assignment-001",
    caregiverId: "demo-caregiver-001",
    caretakerId: "demo-resident-001",
    assignedAt: new Date().toISOString()
  }
];

// Demo login credentials for easy testing
export const demoCredentials = {
  admin: { email: "admin@demo.mos", password: "demo123" },
  caregiver: { email: "caregiver@demo.mos", password: "demo123" },
  resident: { email: "resident@demo.mos", password: "demo123" }
};
