// Utility functions
const createElement = (tag, attributes = {}, textContent = '') => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element[key] = value;
  });
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
};

// Card Class
class Card {
  constructor(data, counter) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.text = data.text;
    this.multiverseid = data.multiverseid;
    this.imageUrl = data.imageUrl || this.getFallbackImage(data);
    this.colors = data.colors;
    this.rarity = data.rarity;
    this.manaCost = data.manaCost;
    this.isSelected = false;
    this.counter = counter;
    this.element = null;
    this.showMore = false;
    this.set = data.set || 'Tenth Edition';
    this.artist = data.artist || 'Pete Venters';
  }

  getFallbackImage(card) {
    if (card.multiverseid) {
      return `https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.multiverseid}&type=card`;
    }

    if (card.name) {
      const formattedName = encodeURIComponent(card.name);
      return `https://api.scryfall.com/cards/named?exact=${formattedName}&format=image`;
    }

    return 'https://via.placeholder.com/223x310?text=No+Image+Available';
  }

  toggleSelection() {
    this.isSelected = !this.isSelected;
    if (this.isSelected) {
      this.counter.increment();
    } else {
      this.counter.decrement();
    }
    this.updateUI();
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
    this.updateShowMoreUI();
  }

  updateUI() {
    if (!this.element) return;

    this.element.classList.toggle('selected', this.isSelected);
    const btn = this.element.querySelector('.select-btn');
    if (btn) {
      btn.textContent = this.isSelected ? 'Deselect' : 'Select';
      btn.className = this.isSelected
        ? 'deselect select-btn'
        : 'select select-btn';
    }
  }

  updateShowMoreUI() {
    if (!this.element) return;

    const moreDetails = this.element.querySelector('.more-details');
    const showMoreBtn = this.element.querySelector('.show-more-btn');

    if (moreDetails) {
      moreDetails.classList.toggle('active', this.showMore);
    }

    if (showMoreBtn) {
      showMoreBtn.textContent = this.showMore ? 'Show Less' : 'Show More';
    }
  }

  createManaSymbols() {
    if (!this.manaCost) return '';

    return this.manaCost.replace(/{([^}]+)}/g, (match, symbol) => {
      const symbolMap = {
        W: 'white',
        U: 'blue',
        B: 'black',
        R: 'red',
        G: 'green',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        X: 'x',
        T: 'tap',
      };

      const symbolName = symbolMap[symbol] || symbol.toLowerCase();
      return `<img src="https://gatherer.wizards.com/Handlers/Image.ashx?size=small&name=${symbolName}&type=symbol" 
               alt="${symbol}" class="mana-symbol" aria-label="${symbol} mana">`;
    });
  }

  getColorClass() {
    if (!this.colors || this.colors.length === 0) return 'color-W';
    return `color-${this.colors[0]}`;
  }

  getRarityClass() {
    switch (this.rarity) {
      case 'Uncommon':
        return 'rarity-uncommon';
      case 'Rare':
        return 'rarity-rare';
      case 'Mythic Rare':
        return 'rarity-mythic';
      default:
        return 'rarity-common';
    }
  }

  render() {
    const cardDiv = createElement('article', {
      className: 'card',
      role: 'listitem',
    });

    const title = createElement('h3', {}, this.name || 'No Name');

    const imageContainer = createElement('div', {
      className: 'image-container',
    });

    if (this.imageUrl) {
      const imgWrapper = createElement('div', {
        className: 'card-image-wrapper',
      });

      const loadingText = createElement(
        'div',
        {
          style:
            'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #666;',
        },
        'Loading...',
      );

      imgWrapper.appendChild(loadingText);

      const img = createElement('img', {
        src: this.imageUrl,
        alt: this.name ? `${this.name} card` : 'Magic card',
        className: 'card-image',
        loading: 'lazy',
        onload: () => {
          imgWrapper.style.background = 'none';
          loadingText.style.display = 'none';
        },
        onerror: (e) => {
          e.target.src = this.getFallbackImage(this);
          e.target.onerror = null;
          imgWrapper.style.background = 'none';
          loadingText.style.display = 'none';
        },
        style: 'opacity: 0; transition: opacity 0.3s;',
      });

      setTimeout(() => {
        img.style.opacity = '1';
      }, 100);

      imgWrapper.appendChild(img);
      imageContainer.appendChild(imgWrapper);
    }

    const metaDiv = createElement('div', { className: 'card-meta' });

    const rarityDiv = createElement('div', {
      className: `card-rarity ${this.getRarityClass()}`,
      textContent: this.rarity || 'Common',
    });

    metaDiv.appendChild(rarityDiv);

    const type = createElement('p', {}, this.type || 'Unknown Type');

    const manaCostDiv = createElement('div', { className: 'mana-cost' });
    manaCostDiv.innerHTML = this.manaCost
      ? `<span>Mana Cost: </span>${this.createManaSymbols()}`
      : 'No mana cost';

    // Create details section
    const details = createElement('details');
    const summary = createElement('summary', {}, 'Card Details');
    const cardText = createElement(
      'p',
      {},
      this.text || 'No description available',
    );

    // Create show more button and details
    const showMoreBtn = createElement('button', {
      className: 'show-more-btn',
      textContent: 'Show More',
    });

    const moreDetails = createElement('div', {
      className: 'more-details',
    });
    moreDetails.innerHTML = `
      <ul>
        <li>Type: ${this.type || 'Unknown'}</li>
        <li>Rarity: ${this.rarity || 'Common'}</li>
        <li>Set: ${this.set || 'Unknown'}</li>
        <li>Artist: ${this.artist || 'Unknown'}</li>
      </ul>
    `;

    showMoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleShowMore();
    });

    details.append(summary, cardText, showMoreBtn, moreDetails);

    const selectButton = createElement('button', {
      className: 'select select-btn',
      textContent: 'Select',
    });

    selectButton.addEventListener('click', () => this.toggleSelection());

    const actionsDiv = createElement('div', {
      className: 'card-actions',
    });
    actionsDiv.append(manaCostDiv, selectButton);

    cardDiv.append(title, imageContainer, metaDiv, type, details, actionsDiv);

    this.element = cardDiv;
    return cardDiv;
  }
}

// CardList Class
class CardList {
  constructor(container, counter) {
    this.container = container;
    this.counter = counter;
    this.cards = [];
  }

  async loadCards(maxCards = 12) {
    try {
      // Add Angel of Mercy card manually
      const angelOfMercy = {
        id: 'angel-of-mercy',
        name: 'Angel of Mercy',
        type: 'Creature - Angel',
        text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhen Angel of Mercy comes into play, you gain 3 life.\nEvery tear shed is a drop of immortality",
        multiverseid: 12345,
        colors: ['W'],
        rarity: 'Uncommon',
        manaCost: '{5}{W}{W}',
        power: '4',
        toughness: '4',
        set: 'Tenth Edition',
        artist: 'Vulkan Raga',
      };

      const response = await fetch(
        `https://api.magicthegathering.io/v1/cards?pageSize=${maxCards * 2}`,
        {
          mode: 'cors',
        },
      );
      const data = await response.json();

      // Filter and slice the cards, then add Angel of Mercy at the beginning
      const apiCards = data.cards
        .filter((card) => card.imageUrl || card.multiverseid || card.name)
        .slice(0, maxCards - 1)
        .map((cardData) => new Card(cardData, this.counter));

      this.cards = [new Card(angelOfMercy, this.counter), ...apiCards];

      this.render();
    } catch (error) {
      console.error('Fetch error:', error);
      this.container.innerHTML =
        '<p>Error loading cards. Please try again later.</p>';
    }
  }

  render() {
    this.container.innerHTML = '';
    this.cards.forEach((card) => {
      this.container.appendChild(card.render());
      if (card.isSelected) {
        card.updateUI();
      }
    });
  }

  selectAll() {
    this.cards.forEach((card) => {
      if (!card.isSelected) {
        card.toggleSelection();
      }
    });
  }

  deselectAll() {
    this.cards.forEach((card) => {
      if (card.isSelected) {
        card.toggleSelection();
      }
    });
  }
}

// Counter Class
class Counter {
  constructor(element) {
    this.element = element;
    this.count = 0;
  }

  increment() {
    this.count++;
    this.update();
  }

  decrement() {
    if (this.count > 0) {
      this.count--;
      this.update();
    }
  }

  reset() {
    this.count = 0;
    this.update();
  }

  update() {
    this.element.textContent = `Selected: ${this.count}`;
    localStorage.setItem('selectedCount', this.count);
  }
}

// Navbar Component
class Navbar {
  constructor() {
    this.menuToggle = document.getElementById('menuToggle');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.themeToggle = document.getElementById('themeToggle');
    this.navThemeToggle = document.getElementById('navThemeToggle');
    this.isLocalStorageAvailable = this.checkLocalStorage();

    this.init();
  }

  checkLocalStorage() {
    try {
      const testKey = 'test';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('LocalStorage is not available');
      return false;
    }
  }

  init() {
    this.menuToggle.addEventListener('click', () => {
      const isExpanded =
        this.menuToggle.getAttribute('aria-expanded') === 'true';
      this.mobileMenu.style.display = isExpanded ? 'none' : 'flex';
      this.menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    });

    const toggleTheme = () => {
      document.body.classList.toggle('light');
      if (this.isLocalStorageAvailable) {
        const theme = document.body.classList.contains('light')
          ? 'light'
          : 'dark';
        localStorage.setItem('theme', theme);
      }
    };

    this.themeToggle?.addEventListener('click', toggleTheme);
    this.navThemeToggle?.addEventListener('click', toggleTheme);
  }
}

// Main App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  new Navbar();

  // Restore theme
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
  }

  // Initialize counter
  const counterElement = document.getElementById('counter');
  const counter = new Counter(counterElement);
  if (localStorage.getItem('selectedCount')) {
    counter.count = parseInt(localStorage.getItem('selectedCount'));
    counter.update();
  }

  // Initialize card list
  const cardGrid = document.getElementById('cardGrid');
  const cardList = new CardList(cardGrid, counter);
  cardList.loadCards();

  // Set up button events
  document.getElementById('selectAll').addEventListener('click', () => {
    cardList.selectAll();
  });

  document.getElementById('deselectAll').addEventListener('click', () => {
    cardList.deselectAll();
    counter.reset();
  });
});
