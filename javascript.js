  function addItem(name, price){
    const container = document.getElementById('litemContainer');

let existing = container.querySelector(`[data-name='${name}']`);
    if (existing) {
      let 
    }
  }
  // عينات (بدّلها ببياناتك من السيرفر)
const products = [
  {
    _id: "p1",
    name: "Shawarma Jumbo",
    category: "shawarma",
    prices: { inStore: 30000, goFood: 36000, grabFood: 36000, shopeeFood: 36900 },
    addons: [
      { name: "pedas", prices: { inStore: 2000, goFood: 2400, grabFood: 2400, shopeeFood: 2500 } },
      { name: "keju",  prices: { inStore: 4000, goFood: 4800, grabFood: 4800, shopeeFood: 4900 } }
    ],
    imageUrl: "https://img.freepik.com/free-psd/roasted-chicken-dinner-platter-delicious-feast_632498-25445.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    _id: "p2",
    name: "Shawarma Box",
    category: "shawarma",
    prices: { inStore: 60000, goFood: 72000, grabFood: 72000, shopeeFood: 73800 },
    addons: [
      { name: "pedas", prices: { inStore: 2000, goFood: 2400, grabFood: 2400, shopeeFood: 2500 } },
    ],
    imageUrl: "https://img.freepik.com/free-psd/roasted-chicken-dinner-platter-delicious-feast_632498-25445.jpg?semt=ais_hybrid&w=740&q=80"
  }
];


document.querySelectorAll('.card').forEach(card => {
  let num = 0
  card.addEventListener('click', () => {
    const name = card.querySelector('.textsize')?.textContent?.trim()
    const container = document.getElementById('listContainer');
    

    const itemDiv = document.createElement('div');
    itemDiv.classList.add('litem');
    if (name === name){
      num += 1;
      itemDiv.innerHTML = `<p>${name}</p> <span>${num}</span>`;
    } else {
      itemDiv.innerHTML = `<p>${name}</p>`;
    }

    

    container.appendChild(itemDiv);

  })
});