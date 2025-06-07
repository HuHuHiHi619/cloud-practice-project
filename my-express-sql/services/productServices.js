const pool = require('../db/index')

const selectProducts = async () => {
  try {
    const query = "SELECT * FROM products";
    const [rows] = await pool.execute(query);
    return rows
  } catch (error) {
    console.error("Error in productService.getProducts:", error);
  }
};

module.exports = {
    selectProducts
}