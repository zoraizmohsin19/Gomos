/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */
// LIsten for Notifications


console.log("this service worker called")
importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

if(workbox){
  console.log("YAy ! Workbox is loaded ");
}else{
  console.log(" workbos did't load");
}


// importScripts(
//   "./precache-manifest.56d8f10529d851ee3286e6dd5cab54d8.js"
// );
workbox.routing.registerRoute(
  /\.(?:js|css|html)$/,
  workbox.strategies.networkFirst(),
);

workbox.routing.registerRoute(
  'http://localhost:3000',
  workbox.strategies.networkFirst()
);
// workbox.routing.registerRoute(
//  new  RegExp('http://randomuser.me/api'),
//   workbox.strategies.staleWhileRevalidate()
// );

self.addEventListener( 'push', (e) => {
  console.log("selfObject", e);

  // let notificationOpts = {
  //   body: 'Some notification information.',
  //   icon: '/AS-Agri-Logo-Website1.png'
  // }
  var options = {
    body: e.data.text(),
    icon: '/AS-Agri-Logo-Website1.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    // actions: [
    //   {action: 'explore', title: 'Explore this new world'
    //     // icon: 'images/checkmark.png'
    //   },
    //   {action: 'close', title: 'I don\'t want any of this'
    //     // icon: 'images/xmark.png'
    //   },
    // ]
  };

  let n =   self.registration.showNotification("Gomos Notifications", options);

  n.onclick = () => {
    console.log('Notification Clicked');
}
})


workbox.clientsClaim();
//workbox.routing.registerRoute(/\.js$/,workbox.strategies.networkFirst());
/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute("./index.html", {
  
  blacklist: [/^\/_/,/\/[^\/]+\.[^\/]+$/],
});
