DOMObserver
===========
Debounces the scroll and resize events and runs a callback inside of rAF when they update, providing the scrollY and viewPort object with width and height properties

Also accepts DOM elements to track changes of their width, height, offsetTop, offsetLeft. Tracks the changes of DOM elements in an interval, runs a callback on updates

Quick example

```
//Add observer
var observer = new DOMObserver();

observer.addElement({
  element: document.querySelector("#container"),
  name:"container"
});

var scrollY = observer.getScrollY();
var containerHeight = observer.getPropertyValue("container", "height")
var containerOffsetTop = observer.getPropertyValue("container", "offsetTop")
var viewportHeight = observer.getViewport().height;

onUpdate();

observer.addCallbacks({
  onScrollYUpdate: onUpdate,
  onViewportUpdate: onUpdate,
  onElementUpdate: onUpdate
});

function onUpdate() {
  //Get new values
  scrollY = observer.getScrollY();
  containerHeight = observer.getPropertyValue("container", "height");
  viewportHeight = observer.getViewport().height;

  //Fire a function when the #container is in viewport on 50% of it's height
  if((containerOffsetTop - scrollY) < (viewportHeight - (containerHeight/2))) doSmething();
}

function doSmething() {
  //Do whatever you want;
  return;
}
```
