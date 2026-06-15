export const emitBookingCreated = (io, booking) => {
  if (!io || !booking) return;
  io.to("admin").emit("bookingCreated", { booking });
  io.to(`user_${booking.userId}`).emit("bookingCreated", { booking });
};

export const emitBookingUpdated = (io, booking) => {
  if (!io || !booking) return;
  io.to("admin").emit("bookingUpdated", { booking });
  io.to(`user_${booking.userId}`).emit("bookingUpdated", { booking });
};

export const emitOrderCreated = (io, order) => {
  if (!io || !order) return;
  io.to("admin").emit("orderCreated", { order });
};

export const emitOrderUpdated = (io, order) => {
  if (!io || !order) return;
  io.to("admin").emit("orderUpdated", { order });
  io.to(`user_${order.userId}`).emit("orderUpdated", { order });
  io.to("couriers").emit("orderUpdated", { order });
};
