// Transform dashed string into apropraite camel case.
const camelCase = (function (input) {
    return input.toLowerCase().replace(/-(.)/g, function(match, group) {
        return group.toUpperCase();
    });
});

// Styles element
const styleElement = (function (element, style) {
  if (typeof style === "string") {
    element.style.cssText = style;
  } else {
    for (const key in style) {
        if (style.hasOwnProperty(key)) {
            element.style[key] = style[key];
        }
    }
  }
});

// Adds attributes to element
const addAttribute = (function (element, attributes) {
  for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        element.setAttribute(key, attributes[key]);
      }
  }
});

// Adds classes to element
const addClass = (function (element, classes) {
  classes.map(_class => element.classList.add(_class));
});

const createNode = (function (options) {

  // Element creation property pool.
  let {
    type, id, classes,
    text, html, attributes,
    onComplete, children, style,
    animate, before, after, parent
  } = options;
  
  let el = document.createElement(type);

//   let el = type === 'svg'
//   ? document.createElementNS("http://www.w3.org/2000/svg", type)
//   : document.createElement(type);

  // Check if the parent is an element or a selector.
  // if parent is a selector, it goes ahead to select the element from the DOM
  if (typeof parent === "string") parent = document.querySelector(parent);

  if (id) el.id = id;
  if (html) el.innerHTML = html;
  if (text) el.textContent = text;

  if (style) styleElement(el, style);
  if (classes) addClass(el, classes);
  if (attributes) addAttribute(el, attributes);

  if (parent) {
    if (before) {
      parent.insertBefore(el, before);
    } else if (after) {
      parent.insertBefore(el, after.nextElementSibling);
    } else {
      parent.appendChild(el);
    }
  }

  if (animate) {
    let { props, keyframes } = animate;
    el.animate(keyframes, props);
  }

  if (typeof onComplete === "function") onComplete();

  if (children) {
      children.map(child => {
          child.parent = el;
          createNode(child);
      });
  }

  return el;
});

const removeNode = (function(parent, ...children) {
  if (typeof parent === "string") parent = document.querySelector(parent);
  children.map(child => parent.removeChild(child));
});

const Creator = {
  createNode: createNode,
  removeNode: removeNode
};