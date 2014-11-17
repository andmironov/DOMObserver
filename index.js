(function(window, document) {
  function DOMObserver(options) {

    //Init
    var latestScrollY = 0,
        currentScrollY = 0,

        currentViewport = {},

        elementsToObserve = {},

        latestElementDimentions = {},
        currentElementDimentions = {},

        dimentionsIntervalID = false,
        isWorking = false,
        toStart = false,
        isTicking = false,

        self = this;

    //Options
    //FIX
    var intervalDuration = 150;

    //Event handlers
    function onScroll() {
      latestScrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (latestScrollY === currentScrollY)  {
        return;
      }
      currentScrollY = latestScrollY;
      requestTick("scrollY");
    };

    function onResize() {
      currentViewport.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      currentViewport.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      requestTick("viewport");
    };

    //Debouncing
    function requestTick(updateType) {
      if (isTicking) {
        return;
      }
      isTicking = true;
      requestAnimationFrame(handleTick.bind(this, updateType));
    };

    function handleTick(updateType) {
      isTicking = false;
      switch (updateType) {
        case "scrollY":
          self.onScrollYUpdate && self.onScrollYUpdate.call(self);
        break;

        case "viewport":
          self.onViewportUpdate && self.onViewportUpdate.call(self);
        break;

        case "dimensions":
          self.onElementUpdate && self.onElementUpdate.call(self);
        break;
      }
      self.onUpdate && self.onUpdate.call(self);
    };

    //API
    this.onScrollYUpdate = false;
    this.onViewportUpdate = false;
    this.onElementUpdate = false;
    this.onUpdate = false;
    this.onPause = false;

    this.addElement = function(toAdd) {
      //FIX handle error
      if(!toAdd.name) {
        console.error("DOMObserver: Error. Unable to add element. No element name given");
        return;
      }

      //FIX handle error
      if(!isDOMElement(toAdd.element)) { 
        console.error("DOMObserver: Error. Unable to add element. Invalid element to add, please provide a DOM object");
        return;
      }

      if(_.isEmpty(elementsToObserve)) toStart = true;

      if (!elementsToObserve.hasOwnProperty(toAdd.name)) {
        elementsToObserve[toAdd.name] = toAdd.element;

        if(toStart) this.start();
      }

      return this;
    };

    this.getElements = function() {
      return elementsToObserve;
    }

    this.addCallbacks = function(callbacks) {
      this.onScrollYUpdate = callbacks.onScrollYUpdate;
      this.onViewportUpdate = callbacks.onViewportUpdate;
      this.onElementUpdate = callbacks.onElementUpdate;
      this.onUpdate = callbacks.onUpdate;
      this.onPause = callbacks.onPause;

      return this;
    };

    this.getScrollY = function() {
      return currentScrollY;
    };

    this.getViewport = function() {
      return currentViewport;
    };

    this.getElementDimentions = function(force) {
      return latestElementDimentions;
    };

    this.getPropertyValue = function(elementName, propertyName) {
      if(_.isEmpty(currentElementDimentions[elementName])) {
        return;
      }

      switch (propertyName) {
        case "offsetTop":
          return currentElementDimentions[elementName].top;
          break;

        case "offsetLeft":
          return currentElementDimentions[elementName].left;
          break;

        case "height":
          return currentElementDimentions[elementName].height;
          break;

        case "width":
          return currentElementDimentions[elementName].width;
          break;
      }
    };

    this.start = function() {
      isWorking = true;

      //FIX one func reflows another
      onScroll();
      onResize();
      
      //Add listeners
      window.addEventListener('resize', onResize, false);
      window.addEventListener('scroll', onScroll, false);
      
      //Set intervals
      setOneInterval("dimentionsInterval");

      return this;
    };

    this.pause = function() {
      isWorking = false;

      //Remove listeners
      window.removeEventListener('resize', onResize, false);
      window.removeEventListener('scroll', onScroll, false);

      //Clear intervals
      clearOneInterval("dimentionsInterval");

      //Callback
      this.onPause && this.onPause.call(this);

      return this;
    };

    //Utils
    function handleElementDimentions() {
      if(_.isEmpty(elementsToObserve)) {
        return;
      }

      _.forEach(elementsToObserve, function(value, key) {
        latestElementDimentions[key] = getElementDimentions(value);
      });

      if(_.isEqual(latestElementDimentions, currentElementDimentions)) {
        return;
      } 

      currentElementDimentions = _.clone(latestElementDimentions);

      requestTick("dimensions");
    };

    function isDOMElement(obj) {
      return obj && typeof window !== 'undefined' && (obj === window || obj.nodeType);
    };

    function getElementDimentions(el) {
      var rect = el.getBoundingClientRect();
      return {
        top: rect.top + (currentScrollY - document.body.clientTop),
        left: rect.left + document.body.scrollLeft - document.body.clientLeft,
        height: rect.height,
        width: rect.width
      }
    };

    function setOneInterval(intervalType) {
      clearOneInterval(intervalType);
      switch (intervalType) {
        case "dimentionsInterval":
          dimentionsIntervalID = setInterval(handleElementDimentions, intervalDuration);
          break;
      }
    };

    function clearOneInterval(intervalType) {
      switch (intervalType) {
        case "dimentionsInterval":
          clearInterval(dimentionsIntervalID);
          break;
      }
    };
  }

  //Export
  window.DOMObserver = DOMObserver;

}(window, document));