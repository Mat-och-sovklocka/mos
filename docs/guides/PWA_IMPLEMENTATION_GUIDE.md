# PWA Implementation Guide - MOS

## 🎯 **Overview**

This document outlines the Progressive Web App (PWA) implementation for the MOS (Mat och Sovklocka) reminder application. The implementation follows a **notification adapter pattern** that allows seamless switching between Web/PWA and native mobile implementations.

## 🏗️ **Architecture**

### **Notification Adapter Pattern**
The core innovation is the **notification adapter pattern** that abstracts notification functionality:

```
┌─────────────────────────────────────┐
│           React Components          │
├─────────────────────────────────────┤
│        useNotifications Hook        │
├─────────────────────────────────────┤
│       NotificationService           │
├─────────────────────────────────────┤
│  WebNotificationAdapter  │  CapacitorNotificationAdapter  │
└─────────────────────────────────────┘
```

### **Benefits**
- ✅ **Environment Detection**: Automatically chooses the right adapter
- ✅ **Future-Proof**: Easy to add Capacitor later
- ✅ **Clean Separation**: Business logic separate from platform specifics
- ✅ **Testable**: Each adapter can be tested independently

## 📁 **File Structure**

```
frontend/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   ├── offline.html               # Offline fallback page
│   └── icons/                     # PWA icons
│       └── generate-icons.html    # Icon generator tool
├── src/
│   ├── notifications/
│   │   ├── NotificationAdapter.ts           # Interface
│   │   ├── WebNotificationAdapter.ts        # Web/PWA implementation
│   │   ├── CapacitorNotificationAdapter.ts  # Future native implementation
│   │   └── NotificationService.ts           # Factory service
│   ├── hooks/
│   │   └── useNotifications.ts    # React hook
│   └── components/
│       └── PWAStatus.jsx          # PWA status component
```

## 🚀 **Current Implementation**

### **1. PWA Foundation**
- ✅ **Manifest**: Complete PWA manifest with Swedish localization
- ✅ **Service Worker**: Basic caching and offline functionality
- ✅ **Icons**: Placeholder icon generator (ready for design)
- ✅ **Meta Tags**: Proper PWA meta tags for iOS/Android

### **2. Notification System**
- ✅ **Interface**: Clean `NotificationAdapter` interface
- ✅ **Web Implementation**: Logs to console, basic browser notifications
- ✅ **Service Factory**: Auto-detects environment
- ✅ **React Hook**: Easy integration with components

### **3. Offline Strategy**
- ✅ **Shell Caching**: Static assets cached for offline use
- ✅ **API Strategy**: API calls always go to network
- ✅ **Fallback Page**: Custom offline page in Swedish

## 🔧 **Usage**

### **In React Components**
```jsx
import { useNotifications } from '../hooks/useNotifications';

function ReminderForm() {
  const { 
    isSupported, 
    hasPermission, 
    requestPermission, 
    scheduleReminder 
  } = useNotifications();

  const handleCreateReminder = async (reminderData) => {
    if (!hasPermission) {
      await requestPermission();
    }
    
    await scheduleReminder(
      reminderData.id,
      new Date(reminderData.dateTime),
      reminderData.title,
      reminderData.note
    );
  };

  return (
    <div>
      {!isSupported && <p>Notifications not supported</p>}
      {!hasPermission && (
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      )}
      {/* Rest of form */}
    </div>
  );
}
```

### **PWA Status Component**
```jsx
import PWAStatus from '../components/PWAStatus';

function App() {
  return (
    <div>
      <PWAStatus />
      {/* Rest of app */}
    </div>
  );
}
```

## 🔮 **Future Capacitor Integration**

### **When Ready for Native**
1. **Install Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. **Update CapacitorNotificationAdapter**:
   - Uncomment the Capacitor imports
   - Implement real local notifications
   - Test on devices

3. **Build Process**:
   - Web build: Uses service worker
   - Native build: Uses Capacitor notifications
   - Same React code for both!

### **Benefits of This Approach**
- ✅ **No Code Changes**: React components stay the same
- ✅ **Gradual Migration**: Can test both approaches
- ✅ **Fallback Support**: Web version still works
- ✅ **Team Efficiency**: Frontend team can focus on UI

## 🧪 **Testing**

### **PWA Testing**
1. **Chrome DevTools**:
   - Application tab → Manifest
   - Application tab → Service Workers
   - Lighthouse audit

2. **Installation Test**:
   - Visit the app in Chrome
   - Look for install prompt
   - Test offline functionality

3. **Notification Test**:
   - Check browser console for logs
   - Test permission requests
   - Verify adapter detection

### **Future Native Testing**
- Use Capacitor's live reload
- Test on physical devices
- Verify local notifications work

## 📱 **Platform Support**

### **Current (Web/PWA)**
- ✅ **Chrome/Edge**: Full PWA support
- ✅ **Firefox**: Basic PWA support
- ⚠️ **Safari**: Limited PWA support
- ⚠️ **iOS**: Home screen only, no push notifications

### **Future (Capacitor)**
- ✅ **Android**: Full native notifications
- ✅ **iOS**: Full native notifications
- ✅ **All Platforms**: Reliable reminder delivery

## 🎨 **Icon Generation**

### **Current**
- Placeholder icons generated via HTML canvas
- Simple clock design
- All required sizes included

### **Production Ready**
1. **Design Proper Icons**:
   - Use design tools (Figma, Sketch)
   - Follow PWA icon guidelines
   - Include maskable icons

2. **Replace Placeholders**:
   - Update `/public/icons/` directory
   - Test on different devices
   - Verify manifest references

## 🔒 **Security Considerations**

### **Service Worker**
- ✅ **HTTPS Required**: PWA features need secure context
- ✅ **Scope Control**: Service worker scoped to app root
- ✅ **Cache Strategy**: Conservative caching approach

### **Notifications**
- ✅ **Permission Based**: User must grant permission
- ✅ **Origin Bound**: Notifications tied to app origin
- ✅ **Secure Context**: Requires HTTPS in production

## 📊 **Performance**

### **Caching Strategy**
- ✅ **Static Assets**: Cached for offline use
- ✅ **API Calls**: Always fresh from network
- ✅ **Fallback**: Graceful offline experience

### **Bundle Size**
- ✅ **Minimal Impact**: Adapter pattern adds ~2KB
- ✅ **Tree Shaking**: Unused adapters excluded
- ✅ **Lazy Loading**: Can be code-split if needed

## 🚀 **Deployment**

### **Current Setup**
- ✅ **Vite Build**: Standard React build process
- ✅ **Static Hosting**: Can be deployed anywhere
- ✅ **HTTPS Ready**: Works with any HTTPS host

### **Production Checklist**
- [ ] **HTTPS**: Ensure secure context
- [ ] **Icons**: Replace with proper design
- [ ] **Testing**: Verify on multiple devices
- [ ] **Analytics**: Add PWA install tracking

## 🎯 **Next Steps**

### **Immediate (Current Sprint)**
1. **Test PWA Features**: Verify installation and offline
2. **Add to Reminder Form**: Integrate notification scheduling
3. **User Testing**: Get feedback on PWA experience

### **Short Term (Next Sprint)**
1. **Design Icons**: Create proper PWA icons
2. **Enhanced Offline**: Cache user data
3. **Push Notifications**: Implement web push (optional)

### **Long Term (Future)**
1. **Capacitor Integration**: Add native notifications
2. **App Store**: Publish to app stores
3. **Advanced Features**: Background sync, etc.

## 📚 **Resources**

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Status**: ✅ **Foundation Complete** - Ready for testing and integration!

**Next**: Test PWA features and integrate with reminder creation flow.

---

## 🇸🇪 Snabbguide för demo (PWA‑simulering)

Den här delen beskriver hur demo‑appen fungerar. Allt fungerar offline och kan installeras som en app på telefonens hemskärm.

### Installera som app (Lägg till på hemskärmen)
- Öppna länken till demon i din mobilwebbläsare (Chrome/Edge/Firefox).
- Godkänn eventuella frågor om aviseringar (notiser).
- Öppna webbläsarens meny och välj “Lägg till på hemskärmen”.
- Starta appen från ikonen som nu ligger på hemskärmen.

### Notiser i demon (simulerade)
- Du kan testa notiser via knappen “Testa notis” i appen.
- Schemalagda påminnelser visas när appen är öppen eller nyligen aktiv.
- Om en påminnelse passerar när appen är stängd visas den nästa gång du öppnar appen ("missad påminnelse").
- Exakta notiser på klockslaget när appen är helt stängd kräver antingen en server (web push) eller en native‑app. I demon är detta simulerat.

### Offline‑läge
- Appen fungerar offline efter första besöket (innehåll och gränssnitt är cachat).
- Du kan skapa/visa/redigera påminnelser utan internet. Datan sparas lokalt i din enhet (ingen server krävs).
- När du öppnar appen igen utan internet kan du fortsatt använda den som vanligt.

### Roller i demon
- **Anna (Boende/Resident)**: Kan se sina påminnelser (läs‑läge).
- **Erik (Vårdgivare/Caregiver)**: Kan skapa, ändra och ta bort påminnelser för tilldelade boende samt skapa/ta bort boende.

### Begränsningar i PWA‑demot
- Exakta bakgrundsnotiser på minutnivå när appen är stängd stöds inte fullt ut i webbläsare utan server/native.
- Push‑notiser kräver en push‑tjänst (t.ex. Web Push via server) och är inte aktiverat i demon.
- iOS har vissa begränsningar för PWA jämfört med Android.

### Tips vid problem
- Om notiser inte syns: Kontrollera att aviseringar är tillåtna för appens webbplats i webbläsarens inställningar.
- Om appen inte startar offline: Öppna den en gång online först så att den hinner cacha innehållet.
- Om något ”fastnar”: Stäng appen helt och starta om, eller rensa cache för just den PWA‑appen och försök igen.

### Vanliga frågor
- "Fungerar det utan internet?" – Ja, hela demon fungerar offline efter första besöket.
- "Kommer notisen exakt 12:00 när appen är stängd?" – I demon: inte garanterat. Den visas när appen öppnas igen (missad påminnelse). För exakt leverans krävs native‑app eller push‑tjänst.
- "Sparas min data någonstans?" – Nej. All demo‑data sparas lokalt i din enhet och delas inte.