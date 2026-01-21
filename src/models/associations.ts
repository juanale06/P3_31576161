// Define associations after all models are loaded to avoid circular dependencies
import Order from './Order.model.js';
import OrderItem from './OrderItem.model.js';

export function initializeAssociations() {
    // Order hasMany OrderItems
    Order.hasMany(OrderItem, {
        foreignKey: 'orderId',
        as: 'items',
    });

    // OrderItem belongsTo Order
    OrderItem.belongsTo(Order, {
        foreignKey: 'orderId',
        as: 'order',
    });
}
