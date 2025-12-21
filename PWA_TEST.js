// Quick PWA Tester
// Copy and paste this in the DevTools Console to test PWA

console.log('🧪 PWA Test Started...\n');

// 1. Check Service Worker
console.log('1️⃣ Service Worker Status:');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log('✅ Service Worker registered:', registrations[0]);
    } else {
      console.log('❌ No Service Worker registered');
    }
  });
} else {
  console.log('❌ Service Worker not supported');
}

// 2. Check Manifest
console.log('\n2️⃣ Manifest Status:');
fetch('/manifest.json')
  .then(r => r.json())
  .then(manifest => {
    console.log('✅ Manifest loaded:', manifest);
    console.log('  - Name:', manifest.name);
    console.log('  - Display:', manifest.display);
    console.log('  - Icons:', manifest.icons.length, 'icons');
  })
  .catch(e => console.log('❌ Manifest error:', e));

// 3. Check Cache Storage
console.log('\n3️⃣ Cache Storage:');
if ('caches' in window) {
  caches.keys().then(names => {
    if (names.length > 0) {
      console.log('✅ Cache Storage available');
      console.log('  - Caches:', names);
      names.forEach(name => {
        caches.open(name).then(cache => {
          cache.keys().then(keys => {
            console.log(`    - ${name}: ${keys.length} files`);
          });
        });
      });
    } else {
      console.log('⏳ No caches yet (will be created on first use)');
    }
  });
} else {
  console.log('❌ Cache Storage not supported');
}

// 4. Check Install Prompt
console.log('\n4️⃣ Install Prompt:');
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ Install prompt available');
});

// 5. Check Meta Tags
console.log('\n5️⃣ Meta Tags:');
const metaTags = {
  'theme-color': document.querySelector('meta[name="theme-color"]'),
  'apple-mobile-web-app-capable': document.querySelector('meta[name="apple-mobile-web-app-capable"]'),
  'manifest': document.querySelector('link[rel="manifest"]')
};

Object.entries(metaTags).forEach(([tag, element]) => {
  if (element) {
    console.log('✅', tag, '- Present');
  } else {
    console.log('❌', tag, '- Missing');
  }
});

// 6. Offline Test
console.log('\n6️⃣ Offline Mode:');
if (navigator.onLine) {
  console.log('✅ Online');
} else {
  console.log('⚠️ Offline');
}

// 7. HTTPS Check
console.log('\n7️⃣ HTTPS Status:');
if (location.protocol === 'https:') {
  console.log('✅ HTTPS enabled');
} else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('✅ Localhost (OK for testing)');
} else {
  console.log('⚠️ No HTTPS (required for PWA on production)');
}

console.log('\n✅ Test completed!\n');

// Helper functions
function clearCache() {
  caches.keys().then(names => 
    Promise.all(names.map(name => caches.delete(name)))
  ).then(() => console.log('✅ Cache cleared'));
}

function unregisterServiceWorker() {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  }).then(() => console.log('✅ Service Worker unregistered'));
}

console.log('\n🛠️ Helper Functions:');
console.log('- clearCache() - Clear all caches');
console.log('- unregisterServiceWorker() - Remove Service Worker');
