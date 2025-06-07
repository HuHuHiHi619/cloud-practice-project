const pool = require("../db/index");

const createOrderService = async (userId, items) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // เช็คสินค้า
    const orderItems = [];
    for (const item of items) {
      const [rows] = await connection.execute(
        "SELECT stock, price FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );

      const product = rows[0];
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stock not enough for product ${item.product_id}`);
      }

      orderItems.push({
        ...item,
        price: product.price,
      });
    }

    // สร้าง order
    const [orderResult] = await connection.execute(
      "INSERT INTO orders (user_id) VALUES (?)",
      [userId]
    );
    const orderId = orderResult.insertId;

    // เพิ่ม order items และลด stock
    for (const item of orderItems) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();
    return { success: true, orderId };
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }
    throw error;
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Release error:", releaseError);
      }
    }
  }
};


const getOrderListService = async (userId, queryOptions = {}) => {
  const connection = await pool.getConnection();
  
  try {
    const currentPage = parseInt(queryOptions.currentPage || 1)
    const itemsPerPage = parseInt(queryOptions.itemsPerPage || 10)
    const orderStatus = queryOptions.orderStatus

    if(currentPage < 1 || itemsPerPage < 1 || itemsPerPage > 100){
        throw new Error('Invalid pagination parameters')
    }

    const skipRows = (currentPage - 1) * itemsPerPage

    let findOrderQuery = `SELECT id,status,created_at FROM orders WHERE user_id = ?`
    const queryParameters = [parseInt(userId)]

    console.log('queryParameters1:',queryParameters)
    
    if(orderStatus && orderStatus.trim() !== ''){
        findOrderQuery += ' AND status = ?'
        queryParameters.push(orderStatus.trim())
        console.log('queryParameters2:',queryParameters)
    }

    findOrderQuery += ` ORDER BY created_at DESC LIMIT ${itemsPerPage} OFFSET ${skipRows}`

    const [userOrders] = await connection.execute(findOrderQuery , queryParameters)

    let countQuery = `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`
    const countParameters =[parseInt(userId)]
    console.log('countParameters1:', countParameters)
    
    if(orderStatus && orderStatus.trim() !== ''){
        countQuery += ' AND status = ?'
        countParameters.push(orderStatus.trim())
        console.log('countParameters2', countParameters)
    }

    const [countResult] = await connection.execute(countQuery,countParameters)
    const totalItems = countResult[0].total
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if(userOrders.length === 0){
        return {
            orders : [],
            pagination: {
                currentPage: currentPage,
                itemsPerPage: itemsPerPage,
                totalItems: totalItems,
                totalPages: totalPages
            }
        }
    }

    const ordersWithDetails = []
    for(const singleOrder of userOrders){
        const [orderItems] = await connection.execute(
            `
            SELECT
                oi.product_id,
                oi.quantity,
                oi.price,
                (oi.quantity * oi.price) AS total_amount
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            `,[singleOrder.id]
        )

        const orderTotal = orderItems.reduce(
            (sum,item) => sum + parseInt(item.total_amount),0
        )
        ordersWithDetails.push({
            orderId: singleOrder.id,
            status: singleOrder.status,
            created_at: singleOrder.created_at,
            totalAmount: orderTotal,
            items: orderItems
        })
    }

    return {
        orders: ordersWithDetails,
        pagination: {
            currentPage: currentPage,
            itemsPerPage: itemsPerPage,
            totalItems: totalItems,
            totalPages: totalPages
        }
    }

  } catch (error) {
    console.error('Service error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const getOrderByIdService = async (orderId) => {
  const connection = await pool.getConnection();
  try {
    // 1. ดึง order
    const [orderRows] = await connection.execute(
      "SELECT id, user_id, created_at,status FROM orders WHERE id = ?",
      [orderId]
    );
    if (orderRows.length === 0) {
      throw new Error("Order not found");
    }
    const order = orderRows[0];

    // 2.ดึงรายการต่างๆจาก order
    const [itemRows] = await connection.execute(
      `
            SELECT 
                oi.product_id,
                oi.quantity,
                oi.price,
                p.name AS product_name,
                (oi.quantity * oi.price) AS total_price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `,
      [orderId]
    );

    const totalAmount = itemRows.reduce((sum, item) => {
      sum + item.total_price, 0;
    });
    console.log(totalAmount);
    return {
      order: {
        ...order,
        items: totalAmount,
      },
    };
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    connection.release();
  }
};

const cancelOrderByIdService = async (orderId, cancelReason = null, userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1.check order now
    const [orderRows] = await connection.execute(
      "SELECT id,status,user_id FROM orders WHERE id = ?",
      [orderId]
    );

    if (orderRows.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderRows[0];

    // 2.check can we cancel
    if (order.user_id !== userId) {
      throw new Error("Unauthorized to cancel this order");
    }

    const allowedStatues = ["pending", "paid", "paid_pending_shipping"];
    if (!allowedStatues.includes(order.status)) {
      throw Error(`Cannot cancel order with status: ${order.status}`);
    }

    // 3.update order status
    await connection.execute(
      `
            UPDATE orders
            SET status = 'cancelled',
                cancelled_at = NOW(),
                cancel_reason = ?
            WHERE id = ?
            `,
      [cancelReason, orderId]
    );

    // 4.check stock before คืน stock

    const [orderItems] = await connection.execute(
      `
        SELECT product_id, quantity
        FROM order_items
        WHERE order_id = ?
        `,
      [orderId]
    );
    for (const item of orderItems) {
      const [product] = await connection.execute(
        `
                SELECT name FROM products WHERE id = ?
            `,
        [item.product_id]
      );
      console.log(`Restoring ${item.quantity} items of ${product[0].name}`);
      await connection.execute(
        `
                UPDATE products
                SET stock = stock + ?
                WHERE id = ?    
            `,
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();
    return {
      orderId: orderId,
      status: "cancelled",
      message: "Order cancellde succussfully",
    };
  } catch (error) {
    await connection.rollback();
    console.error(error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrderService,
  cancelOrderByIdService,
  getOrderByIdService,
  getOrderListService
};
