import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.loading = false;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status, deliveryPhase } = action.payload;
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.status = status;
        state.currentOrder.deliveryPhase = deliveryPhase;
      }
      const order = state.orders.find(o => o._id === orderId);
      if (order) {
        order.status = status;
        order.deliveryPhase = deliveryPhase;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setOrders,
  setCurrentOrder,
  updateOrderStatus,
  setLoading,
  setError,
} = orderSlice.actions;

export default orderSlice.reducer;