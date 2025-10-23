# 📱 MOS Demo Deployment Guide

## 🚀 Quick Demo Setup

### 1. Build the Demo
```bash
cd frontend
npm run build
```

### 2. Deploy to GitHub Pages
1. Go to your GitHub repository
2. Go to Settings → Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages` (create if needed)
5. Folder: `/ (root)`

### 3. Copy Build Files
```bash
# Copy dist folder contents to gh-pages branch
cp -r dist/* ../gh-pages/
```

## 📱 Demo Instructions for Users

### For Mobile (Android/iPhone):
1. **Open in Chrome/Safari**
2. **Tap "Add to Home Screen"** when prompted
3. **App works offline** after first load

### For Desktop:
1. **Open in Chrome/Edge**
2. **Click install button** in address bar
3. **App works offline** after first load

## 🔐 Demo Login Credentials

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | `admin@demo.mos` | `demo123` | Full access to all features |
| **Caregiver** | `caregiver@demo.mos` | `demo123` | Manages assigned residents |
| **Resident** | `resident@demo.mos` | `demo123` | Personal reminders and meals |

## ✨ Demo Features

- ✅ **Offline functionality** - works without internet
- ✅ **Push notifications** - test notification permissions
- ✅ **Responsive design** - works on all devices
- ✅ **Demo data** - pre-populated with realistic content
- ✅ **Multi-role testing** - test different user types

## 🎯 Demo Scenarios

### Admin Demo:
1. Login as admin
2. View all users
3. Create new users
4. Manage permissions

### Caregiver Demo:
1. Login as caregiver
2. View assigned residents
3. Create reminders for residents
4. Manage resident permissions

### Resident Demo:
1. Login as resident
2. View personal reminders
3. Create own reminders
4. View meal suggestions

## 🔧 Technical Notes

- **Service Worker** handles offline functionality
- **Demo data** is cached for offline use
- **PWA manifest** enables app-like experience
- **Responsive design** works on all screen sizes

## 📞 Support

For technical issues or questions about the demo, contact the development team.
