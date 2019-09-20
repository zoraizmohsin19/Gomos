// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
import axios from "axios";
// opt-in, read http://bit.ly/CRA-PWA.
const serverUrl = 'http://localhost:3992'
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);
// Get public key
const getApplicationServerKey = () => {
 console.log("this is Called getApplicationServerKey" )
  // Fetch from server
  return fetch(`${serverUrl}/serverWorkerKey`)

    // Parse response body as arrayBuffer
    .then(res => res.arrayBuffer())

    // Return arrayBuffer as new UInt8Array
    .then(key => new Uint8Array(key))
}

export function register(config) {
  // process.env.NODE_ENV === 'production' &&
  if ('serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit http://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });


  }
}


function registerValidSW(swUrl, config) {

  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
 console.log("This is registration 1 ", registration)
 registration.pushManager.getSubscription().then( getSubscription => { 
   console.log(getSubscription,"This is getSubscription 1")

if (getSubscription == null) {
  console.log(getSubscription,"This is getSubscription 2")
      // Get applicationServerKey from push server
      getApplicationServerKey().then(applicationServerKey => {

        // Subscribe
        console.log("applicationServerKey", applicationServerKey)
        try{
        registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
          .then(res => res.toJSON())
          .then(subscription => {
            console.log("subscription", subscription)
            // Pass subscription to server

            // console.log("userDetails", userDetails);
            console.log("config", config)
            let body = {
              subscription,
              userId: config
            }
            console.log("body", body)
            axios.post(`${serverUrl}/serverWorkerSubscribe`, body)
              .then(console.log)
              .catch(console.log)

            // Catch subscription error
          }).catch(console.error)
        }catch(err){
        console.log("error", err)
        }
      })
     }
    })
    
    
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {

          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See http://bit.ly/CRA-PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };



    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      if (
        response.status === 404 ||
        response.headers.get('content-type').indexOf('javascript') === -1
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}


export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
// setTimeout(()=>{  window.addEventListener( 'push', (e) => {
//   console.log("hello this is called in push")
//   showNotification()

//    })},3000);
   //setTimeout(()=>{window.pushManager.getSubscription().then( subscription => { console.log("subscription",subscription)})},10000)
