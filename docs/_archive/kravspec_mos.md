**Requirements Specification -- "Skalman's Food & Sleep Clock" Web App**

**1. Purpose and Objectives**

The purpose of the application is to provide users with an easy-to-use
and reliable digital assistant that helps remind them about medication
intake, meals, movement breaks, and other daily routines.\
It should also be able to provide personalized meal suggestions and
simple recipes, with support for allergies and special diets, as well as
integrate AI to generate tailored meal ideas.

------------------------------------------------------------------------

**2. Target Audience**

- Individuals with mental health conditions (e.g., ADHD, autism,
  depression, anxiety) who need structure and reminders in daily life.

- Family members and support staff who want to assist with planning and
  follow-up.

- Users of all ages, with a particular focus on simplicity, clarity, and
  a sense of security.

------------------------------------------------------------------------

**3. User Roles**

1.  **Primary User** -- The person who follows the clock's schedule and
    receives reminders.

2.  **Support Person/Family Member** -- Can assist in configuring,
    monitoring, and adjusting settings.

3.  **Administrator** -- *(Optional)* Can manage system settings and AI
    modules.

------------------------------------------------------------------------

**4. Functional Requirements**

**4.1. Reminder and Scheduling System**

- Ability to create personal routines for:

  - Medication intake (time and dosage)

  - Meals (breakfast, lunch, dinner, snacks)

  - Movement/breaks (e.g., "take a short walk")

  - Rest/sleep

  - Other activities (e.g., meeting, cleaning, showering)

- Visual and audio-based reminders.

- Option to choose different reminder sounds and visual themes.

- Recurring schedules (daily, weekly).

- "Quick start" function for standard routines.

**4.2. Meal Suggestions and Recipes**

- Integrated AI service (e.g., GPT-based) that can provide:

  - Meal suggestions based on the user's preferences and allergies.

  - Simple recipes (max 6--8 steps, with clear instructions).

  - Nutritional information.

  - Option to save favorite meals.

  - Food categories (quick, budget-friendly, healthy, festive).

  - Offline storage of previously retrieved recipes.

**4.3. Allergies and Special Diets**

- Form to add allergies (e.g., nuts, gluten, lactose).

- Selection of special diets (e.g., vegetarian, vegan, low-carb, halal,
  kosher).

- AI suggestions automatically filtered according to these parameters.

**4.4. Customized Interface Simplification**

- Large buttons, clear color contrasts.

- Option to use symbols and images instead of text.

- Text-to-speech and speech-to-text support.

- Color coding for different types of activities.

**4.5. Family/Support Person Functionality**

- Ability for a family member to log in and view the schedule.

- Push notifications if the user misses an activity (optional).

- Remote editing of the schedule.

**4.6. Statistics and Follow-Up**

- Simple log of completed activities.

- Charts showing meals, medication intake, and movement.

- Export function (PDF/Excel) to share with healthcare providers.

------------------------------------------------------------------------

**5. Non-Functional Requirements**

- **User-Friendliness:** Must be very easy to use, even for individuals
  with limited technical skills.

- **Accessibility:** WCAG 2.1 AA standard compliance, screen reader
  support.

- **Security:** GDPR-compliant data storage, encryption of sensitive
  data (e.g., medication list).

- **Performance:** The app should load within 3 seconds on a normal
  internet connection.

- **Platform Support:** Responsive design for mobile, tablet, and
  desktop.

- **Offline Functionality:** Basic reminders and saved recipes must work
  without internet access.

------------------------------------------------------------------------

**6. Technical Requirements**

- To be determined based on the above requirements and chosen technology
  stack.

------------------------------------------------------------------------

**7. Future Development (Version 2.0)**

- Integration with smartwatches and fitness trackers.

- Voice control via Google Assistant / Alexa.

- Custom reminder sounds recorded by family members.

- Gamification to encourage routine adherence.

- AI-based health reporting.
