const {
  createOrderService,
  cancelOrderByIdService,
  getOrderByIdService,
  getOrderListService,
} = require("../services/orderServices");

const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.session.user.id;
    if (!userId || !items || items.length === 0) {
      return (
        res.status(400),
        json({
          error: "userId and items are required",
        })
      );
    }
    const result = await createOrderService(userId, items);

    res.status(201).json({
      message: "Create order successful!",
      data: result,
    });
  } catch (error) {
    console.error("Create an order error:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.session.user.id;
    const cancelReason = req.body;
    if (!orderId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    const result = await cancelOrderByIdService(orderId, cancelReason, userId);

    res.status(200).json({
      message: "Cancelled order successful",
      data: result,
    });
  } catch (error) {
    console.error("Cancel an order error:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId) {
      return res.status(400).json({
        error: "Order ID is not found",
      });
    }
    const orderData = await getOrderByIdService(orderId);
    res.status(200).json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    console.error("Get order error:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

const getOrderList = async (req, res) => {
  try {
    const userId = req.session.user.id;
     const { 
      page: currentPage = 1, 
      limit: itemsPerPage = 10, 
      status: orderStatus 
    } = req.query;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error:"User ID is required"
        })
    }
    
    const queryOptions = {
      currentPage,
      itemsPerPage,
      orderStatus
    };

    const result = await getOrderListService(userId, queryOptions)
    
    console.log('result',result)
    res.status(200).json({
        success: true ,
        data: result,
    })
  } catch (error) {
    console.error("Get order error:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  cancelOrder,
  getOrder,
  getOrderList
};
