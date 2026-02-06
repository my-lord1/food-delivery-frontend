import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  restaurant: null,
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, restaurant } = action.payload;
      if (state.restaurant && state.restaurant._id !== restaurant._id) {
        state.items = [];
      }
      
      state.restaurant = restaurant;
      
      const existingItem = state.items.find(
        (i) => i._id === item._id && 
        JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
      );
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      
      calculateTotal(state);
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item, index) => index !== action.payload);
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      calculateTotal(state);
    },
    
    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((_, i) => i !== index);
      } else {
        state.items[index].quantity = quantity;
      }
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      calculateTotal(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      state.total = 0;
    },
  },
});

const calculateTotal = (state) => {
  state.total = state.items.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity;
    if (item.customizations) {
      item.customizations.forEach(custom => {
        itemTotal += custom.price * item.quantity;
      });
    }
    return sum + itemTotal;
  }, 0);
};

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;