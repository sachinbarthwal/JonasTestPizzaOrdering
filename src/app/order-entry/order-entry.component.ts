import { Component } from '@angular/core';

interface Topping {
  name: string;
  price: number;
  type: 'veg' | 'non-veg';
}

interface PizzaSize {
  name: string;
  price: number;
}

interface PizzaOrder {
  size: PizzaSize;
  quantity: number;
  toppings: Topping[];
}

@Component({
  selector: 'app-order-entry',
  templateUrl: './order-entry.component.html',
  styleUrls: ['./order-entry.component.css']
})
export class OrderEntryComponent {
  sizes: PizzaSize[] = [
    { name: 'Small', price: 5 },
    { name: 'Medium', price: 7 },
    { name: 'Large', price: 8 },
    { name: 'Extra Large', price: 9 }
  ];

  toppings: Topping[] = [
    { name: 'Tomatoes', price: 1.00, type: 'veg' },
    { name: 'Onions', price: 0.50, type: 'veg' },
    { name: 'Bell pepper', price: 1.00, type: 'veg' },
    { name: 'Mushrooms', price: 1.20, type: 'veg' },
    { name: 'Pineapple', price: 0.75, type: 'veg' },
    { name: 'Sausage', price: 1.00, type: 'non-veg' },
    { name: 'Pepperoni', price: 2.00, type: 'non-veg' },
    { name: 'Barbecue chicken', price: 3.00, type: 'non-veg' }
  ];

  pizzaOrders: PizzaOrder[] = this.sizes.map(size => ({ size, quantity: 0, toppings: [] }));
  total: number = 0;
  offer: string | null = null;

  increaseQuantity(size: PizzaSize) {
    const order = this.pizzaOrders.find(o => o.size.name === size.name);
    if (order) {
      order.quantity++;
      this.calculateTotal();
    }
  }

  decreaseQuantity(size: PizzaSize) {
    const order = this.pizzaOrders.find(o => o.size.name === size.name);
    if (order && order.quantity > 0) {
      order.quantity--;
      this.calculateTotal();
    }
  }

  getQuantity(size: PizzaSize): number {
    return this.pizzaOrders.find(o => o.size.name === size.name)?.quantity || 0;
  }

  toggleTopping(size: PizzaSize, topping: Topping) {
    const order = this.pizzaOrders.find(o => o.size.name === size.name);
    if (order) {
      const toppingIndex = order.toppings.findIndex(t => t.name === topping.name);
      if (toppingIndex === -1) {
        order.toppings.push(topping);
      } else {
        order.toppings.splice(toppingIndex, 1);
      }
      this.calculateTotal();
    }
  }

  isToppingSelected(size: PizzaSize, toppingName: string): boolean {
    const order = this.pizzaOrders.find(o => o.size.name === size.name);
    return order ? order.toppings.some(t => t.name === toppingName) : false;
  }

  getSizeSubtotal(size: PizzaSize): number {
    const order = this.pizzaOrders.find(o => o.size.name === size.name);
    if (!order) return 0;
    const toppingsTotal = order.toppings.reduce((sum, topping) => sum + topping.price, 0);
    return (order.size.price + toppingsTotal) * order.quantity;
  }

  calculateTotal() {
    let total = 0;
    let mediumPizzas = 0;
    let mediumToppings = 0;
    let largePizzas = 0;
    let largeToppings = 0;
  
    this.pizzaOrders.forEach(order => {
      if (order.size.name === 'Medium') {
        mediumPizzas += order.quantity;
        mediumToppings += order.toppings.length * order.quantity;
      } else if (order.size.name === 'Large') {
        largePizzas += order.quantity;
        largeToppings += order.toppings.length * order.quantity;
        largeToppings += order.toppings.filter(t => t.name === 'Pepperoni' || t.name === 'Barbecue chicken').length * order.quantity;
      }
    });
  
    let appliedOffers: string[] = [];
  
    // Offer 2: 2 Medium Pizzas with 4 toppings each = $9 each
    if (mediumPizzas >= 2 && mediumToppings >= 8) {
      let offerPairs = Math.floor(mediumPizzas / 2);
      total = 18 * offerPairs;
      if (mediumPizzas % 2 !== 0) {
        let remainingPizza = this.pizzaOrders.find(o => o.size.name === 'Medium')!;
        total += remainingPizza.size.price + remainingPizza.toppings.reduce((sum, t) => sum + t.price, 0);
      }
      appliedOffers.push(`Offer 2 applied: ${offerPairs * 2} Medium Pizzas with 4 toppings each = $9 each`);
    }
    // Offer 1: 1 Medium Pizza with 2 toppings = $5
    else if (mediumPizzas >= 1 && mediumToppings >= 2) {
      total = 5 * Math.min(mediumPizzas, Math.floor(mediumToppings / 2));
      appliedOffers.push(`Offer 1 applied: ${Math.min(mediumPizzas, Math.floor(mediumToppings / 2))} Medium Pizza(s) with 2 toppings each = $5 each`);
    }
    // Offer 3: 1 Large with 4 toppings (Pepperoni and Barbecue chicken are counted as 2 toppings) - 50% discount
    else if (largePizzas >= 1 && largeToppings >= 4) {
      let largeOrder = this.pizzaOrders.find(o => o.size.name === 'Large' && o.toppings.length >= 4);
      if (largeOrder) {
        let regularPrice = largeOrder.size.price + largeOrder.toppings.reduce((sum, t) => sum + t.price, 0);
        total = regularPrice / 2;
      }
      appliedOffers.push("Offer 3 applied: 1 Large with 4 toppings - 50% discount");
    }
  
    // Calculate remaining pizzas that don't qualify for offers
    this.pizzaOrders.forEach(order => {
      if (order.size.name !== 'Medium' && order.size.name !== 'Large') {
        total += this.getSizeSubtotal(order.size) * order.quantity;
      } else if (order.size.name === 'Medium' && !appliedOffers.some(o => o.startsWith('Offer 1') || o.startsWith('Offer 2'))) {
        total += this.getSizeSubtotal(order.size) * order.quantity;
      } else if (order.size.name === 'Large' && !appliedOffers.some(o => o.startsWith('Offer 3'))) {
        total += this.getSizeSubtotal(order.size) * order.quantity;
      }
    });
  
    if (appliedOffers.length > 0) {
      this.offer = appliedOffers.join(', ');
    } else {
      this.offer = null;
    }
  
    this.total = total;
  }
}