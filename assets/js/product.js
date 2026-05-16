const products = [
  {
    id: 1,
    category: "vegetables",
    icon: "🥬",
    items: [],
  },
  {
    id: 2,
    category: "grains",
    icon: "🌾",
    items: [
      {
        id: "grains-001",
        name: "Premium Local Rice",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "50kg Bag", price: 112000 },
          { size: "25kg Bag", price: 58000 },
          { size: "10kg Bag", price: 70000 },
        ],
      },
      {
        id: "grains-002",
        name: "Honey Beans (Oloyin)",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "Paint Bucket", price: 14500 },
          { size: "Small Bag", price: 28000 },
        ],
      },
      {
        id: "grains-003",
        name: "Ijebu Garri (White)",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "Small Bag", price: 22000 },
          { size: "Big Bag", price: 40000 },
        ],
      },
    ],
  },
  {
    id: 3,
    category: "tubers",
    icon: "🍠",
    items: [
      {
        id: "tubers-001",
        name: "Large Yam (3-5 Tubers)",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "Small Bundle (3 pcs)", price: 12500 },
          { size: "Large Bundle (5 pcs)", price: 18000 },
        ],
      },
      {
        id: "tubers-002",
        name: "Sweet Potatoes",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "Paint Bucket", price: 4500 },
          { size: "Small Bag", price: 8500 },
        ],
      },
    ],
  },
  {
    id: 4,
    category: "livestock",
    icon: "🐄",
    items: [
      {
        id: "livestock-001",
        name: "Live Local Goat",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "Medium Size", price: 85000 },
          { size: "Large Size", price: 120000 },
        ],
      },
      {
        id: "livestock-002",
        name: "Fresh Beef (Boneless)",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "1 kg", price: 8500 },
          { size: "5 kg", price: 40000 },
        ],
      },
    ],
  },
  {
    id: 5,
    category: "frozen-foods",
    icon: "🧊",
    items: [
      {
        id: "frozen-001",
        name: "Frozen Chicken (Lap)",
        image: "assets/images/genericImg.jpg",
        variants: [
          { size: "1 kg", price: 6500 },
          { size: "5 kg", price: 30000 },
        ],
      },
    ],
  },
  {
    id: 6,
    category: "festive-packages",
    icon: "🎁",
    items: [],
  },
  {
    id: 7,
    category: "oil-and-pantry",
    icon: "🫙",
    items: [],
  },
];
