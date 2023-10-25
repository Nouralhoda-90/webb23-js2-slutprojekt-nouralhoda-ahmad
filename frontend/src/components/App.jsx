
import React, { useState, useEffect } from 'react';

import Navbar from './Navbar';
import CartItem from './CartItem';
import CartPage from './CartPage';
import Product from './Product';
import ProductSearch from './ProductSearch';

import '../css/style.css';

const apiUrl = 'http://localhost:3001/products';

// Fetch function to get the products data from the API
async function fetchProducts() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Network response was not ok.');
  }
}

export default function App() {

  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('products');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('asc');
  const [cartCount, setCartCount] = useState(0);

  // Fetch products data and update the state
  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  // Update the cart count when the cart items change
  useEffect(() => {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(totalCount);
  }, [cart]);

  // Helper function to create a new cart item
  function createCartItem(product, quantity, existingItem) {
    if (existingItem) {
      return {
        ...existingItem,
        quantity: quantity + existingItem.quantity,
      };
    } else {
      return {
        ...product,
        quantity: quantity,
      };
    }
  }

  // Add product to the cart
  function handleAddToCart(product) {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex !== -1) {
      if (cart[existingItemIndex].quantity === product.stock) {
        return; // Quantity has reached the stock limit
      }

      setCart(prevCart => {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      });
    } else {
      const existingQuantity = cart.reduce((total, item) => {
        if (item.id === product.id) {
          return total + item.quantity;
        }
        return total;
      }, 0);

      if (existingQuantity >= product.stock) {
        return; // Quantity has reached the stock limit
      }

      const newCartItem = createCartItem(product, 1);
      setCart(prevCart => [...prevCart, newCartItem]);
    }

    setCartCount(prevCount => prevCount + 1); // Update the cart count
  }

  // Remove item from the cart
  function removeFromCart(item) {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(cartItem => cartItem.id !== item.id);
      return updatedCart;
    });

    setCartCount(prevCount => prevCount - item.quantity); // Update the cart count
  }

  // Increase quantity of an item in the cart
  function increaseQuantity(productId) {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      return updatedCart;
    });

    setCartCount(prevCount => prevCount + 1); // Update the cart count
  }

  // Decrease quantity of an item in the cart
  function decreaseQuantity(productId) {
    setCart(prevCart => {
      const updatedCart = prevCart
        .map(item =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0);
      return updatedCart;
    });

    setCartCount(prevCount => prevCount - 1); // Update the cart count
  }

  // Clear the cart
  function clearCart() {
    setCart([]);
    setCartCount(0); // Reset the cart count
  }

  // Filter the products by name based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the products based on sort type (ascending or descending)
  const sortedProducts = filteredProducts.slice().sort((a, b) => {
    if (sortType === 'asc') {
      return a.price - b.price; // Sort in ascending order
    } else {
      return b.price - a.price; // Sort in descending order
    }
  });

  // Update the stock of a product
  function updateProductStock(productId, newStock) {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product =>
        product.id === productId ? { ...product, stock: newStock } : product
      );
      return updatedProducts;
    });
  }

  // Handle search input change
  function handleSearch(searchTerm) {
    setSearchTerm(searchTerm);
  }

  // Handle sort selection
  function handleSort(sortType) {
    setSortType(sortType);
  }

  // Handle navigation to products page
  function handleProductsClick() {
    setCurrentPage('products');
    setSearchTerm('');
  }

  // Render the UI
  return (
    <div>
      <Navbar
          cartCount={cartCount}
          onProductsClick={handleProductsClick}
          onCartClick={() => setCurrentPage('cart')}
          onSearch={handleSearch}
          onSort={handleSort}
          currentPage={currentPage}
          products={products}
      />

      {error && <div>Error: {error}</div>}

      {currentPage === 'products' && (
        <div className="products">
          {sortedProducts.map(product => (
            <Product
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {currentPage === 'cart' && (
        <div className="cart">
          {cart.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onIncrease={() => increaseQuantity(item.id)}
              onDecrease={() => decreaseQuantity(item.id)}
              onRemove={() => removeFromCart(item)}
            />

           
          ))}
          <CartPage
            cartItems={cart}
            onClearCart={clearCart}
            onNavigateToProducts={() => setCurrentPage('products')}
            setPurchaseMessage={setPurchaseMessage}
            updateProductStock={updateProductStock}
            products={products}
            cartCount={cartCount}
            setCartCount={setCartCount}
          />
         
        </div>
      )}
    </div>
  );
}

