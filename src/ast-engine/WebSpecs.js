const WebSpecs = {
  html: {
    elements: {
      root: ['html'],
      metadata: ['head', 'title', 'base', 'link', 'meta', 'style'],
      sections: ['body', 'article', 'section', 'nav', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer', 'address'],
      grouping: ['p', 'hr', 'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'main', 'div'],
      text: ['a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr'],
      embedded: ['picture', 'source', 'img', 'iframe', 'embed', 'object', 'param', 'video', 'audio', 'track', 'map', 'area'],
      tables: ['table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th'],
      forms: ['form', 'label', 'input', 'button', 'select', 'datalist', 'optgroup', 'option', 'textarea', 'keygen', 'output', 'progress', 'meter', 'fieldset', 'legend'],
      interactive: ['details', 'summary', 'dialog', 'menu', 'menuitem'],
      scripting: ['script', 'noscript', 'template', 'canvas']
    },
    
    globalAttributes: [
      'accesskey', 'class', 'contenteditable', 'contextmenu', 'dir',
      'draggable', 'dropzone', 'hidden', 'id', 'lang', 'spellcheck',
      'style', 'tabindex', 'title', 'translate'
    ],
    
    voidElements: [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ],
    
    validateElement(tagName, attributes = {}) {
      const errors = [];
      const warnings = [];
      
      const allElements = Object.values(this.elements).flat();
      
      if (!allElements.includes(tagName.toLowerCase())) {
        errors.push({
          type: 'InvalidElement',
          message: `未知HTML元素: ${tagName}`,
          severity: 'error'
        });
      }
      
      Object.keys(attributes).forEach(attr => {
        if (!WebSpecs.html.globalAttributes.includes(attr)) {
          warnings.push({
            type: 'UnknownAttribute',
            message: `元素 ${tagName} 上未知属性: ${attr}`,
            severity: 'warning'
          });
        }
      });
      
      return { valid: errors.length === 0, errors, warnings };
    }
  },

  css: {
    properties: {
      layout: [
        'display', 'position', 'top', 'right', 'bottom', 'left',
        'float', 'clear', 'visibility', 'overflow', 'overflow-x', 'overflow-y',
        'z-index', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow',
        'justify-content', 'align-items', 'align-content', 'order',
        'flex-grow', 'flex-shrink', 'flex-basis', 'align-self',
        'grid', 'grid-area', 'grid-auto-columns', 'grid-auto-flow',
        'grid-auto-rows', 'grid-column', 'grid-row', 'gap', 'row-gap', 'column-gap'
      ],
      
      box: [
        'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border', 'border-width', 'border-style', 'border-color',
        'border-radius', 'box-shadow', 'box-sizing'
      ],
      
      typography: [
        'font', 'font-family', 'font-size', 'font-style', 'font-weight',
        'font-variant', 'line-height', 'letter-spacing', 'text-align',
        'text-decoration', 'text-indent', 'text-transform', 'white-space',
        'word-spacing', 'word-wrap', 'color'
      ],
      
      background: [
        'background', 'background-color', 'background-image',
        'background-position', 'background-size', 'background-repeat',
        'background-attachment', 'background-clip', 'background-origin'
      ],
      
      effects: [
        'opacity', 'filter', 'transform', 'transform-origin',
        'transition', 'transition-property', 'transition-duration',
        'transition-timing-function', 'transition-delay',
        'animation', 'animation-name', 'animation-duration',
        'animation-timing-function', 'animation-delay',
        'animation-iteration-count', 'animation-direction',
        'animation-fill-mode', 'animation-play-state'
      ],
      
      other: [
        'content', 'cursor', 'outline', 'list-style',
        'table-layout', 'border-collapse', 'border-spacing',
        'empty-cells', 'caption-side', 'quotes', 'counter-reset',
        'counter-increment', 'resize', 'user-select', 'pointer-events'
      ]
    },

    units: [
      'px', 'em', 'rem', 'vh', 'vw', '%', 'deg', 'rad', 'turn',
      's', 'ms', 'cm', 'mm', 'in', 'pt', 'pc', 'ch', 'ex',
      'fr', 'auto', 'none', 'inherit', 'initial'
    ],

    colors: [
      'transparent', 'currentColor',
      'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
      'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet',
      'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate',
      'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
      'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen',
      'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
      'darkorange', 'darkorchid', 'darkred', 'darksalmon',
      'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey',
      'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue',
      'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite',
      'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold',
      'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew',
      'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
      'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
      'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray',
      'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
      'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
      'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
      'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
      'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
      'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
      'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite',
      'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered',
      'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise',
      'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum',
      'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown',
      'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
      'seashell', 'sienna', 'silver', 'skyblue', 'slateblue',
      'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
      'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet',
      'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'
    ],

    validateProperty(property, value) {
      const errors = [];
      const warnings = [];
      
      const allProperties = Object.values(this.properties).flat();
      
      if (!allProperties.includes(property)) {
        warnings.push({
          type: 'UnknownProperty',
          message: `未知CSS属性: ${property}`,
          severity: 'warning'
        });
      }
      
      if (value && typeof value === 'string') {
        const unitMatch = value.match(/[\d.]+([a-z%]+)$/i);
        if (unitMatch && !WebSpecs.css.units.includes(unitMatch[1])) {
          warnings.push({
            type: 'UnknownUnit',
            message: `未知CSS单位: ${unitMatch[1]}`,
            severity: 'warning'
          });
        }
      }
      
      return { valid: errors.length === 0, errors, warnings };
    }
  },

  javascript: {
    reservedWords: [
      'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
      'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends',
      'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
      'new', 'return', 'super', 'switch', 'this', 'throw', 'try',
      'typeof', 'var', 'void', 'while', 'with', 'yield',
      'enum', 'implements', 'interface', 'package', 'private',
      'protected', 'public', 'static', 'null', 'true', 'false'
    ],

    globalObjects: [
      'Object', 'Function', 'Array', 'Number', 'String', 'Boolean',
      'Symbol', 'BigInt', 'Math', 'Date', 'RegExp', 'Error',
      'AggregateError', 'EvalError', 'RangeError', 'ReferenceError',
      'SyntaxError', 'TypeError', 'URIError', 'JSON', 'Promise',
      'Map', 'Set', 'WeakMap', 'WeakSet', 'Proxy', 'Reflect',
      'Intl', 'WebAssembly', 'console', 'window', 'document'
    ],

    globalFunctions: [
      'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'decodeURI',
      'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
      'eval', 'setTimeout', 'setInterval', 'clearTimeout',
      'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame',
      'fetch', 'alert', 'confirm', 'prompt'
    ],

    domAPI: {
      document: [
        'getElementById', 'getElementsByClassName', 'getElementsByTagName',
        'querySelector', 'querySelectorAll', 'createElement', 'createTextNode',
        'appendChild', 'removeChild', 'insertBefore', 'replaceChild',
        'addEventListener', 'removeEventListener', 'write', 'writeln'
      ],
      
      element: [
        'getAttribute', 'setAttribute', 'removeAttribute',
        'classList', 'style', 'innerHTML', 'textContent',
        'appendChild', 'removeChild', 'cloneNode',
        'addEventListener', 'removeEventListener'
      ],
      
      events: [
        'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
        'mouseover', 'mouseout', 'mouseenter', 'mouseleave',
        'keydown', 'keyup', 'keypress', 'submit', 'change',
        'input', 'focus', 'blur', 'load', 'unload', 'resize', 'scroll'
      ]
    },

    validateIdentifier(name) {
      const errors = [];
      
      if (WebSpecs.javascript.reservedWords.includes(name)) {
        errors.push({
          type: 'ReservedWord',
          message: `不能使用保留字作为标识符: ${name}`,
          severity: 'error'
        });
      }
      
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
        errors.push({
          type: 'InvalidIdentifier',
          message: `无效的标识符: ${name}`,
          severity: 'error'
        });
      }
      
      return { valid: errors.length === 0, errors };
    }
  },

  validate(html, css, javascript) {
    const results = {
      html: { valid: true, errors: [], warnings: [] },
      css: { valid: true, errors: [], warnings: [] },
      javascript: { valid: true, errors: [], warnings: [] }
    };

    return results;
  },

  getSpec(language, category) {
    if (this[language] && this[language][category]) {
      return this[language][category];
    }
    return null;
  },

  listSpecs(language) {
    if (this[language]) {
      return Object.keys(this[language]);
    }
    return [];
  }
};

module.exports = WebSpecs;
