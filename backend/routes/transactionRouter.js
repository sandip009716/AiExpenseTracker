const express = require("express");
const usersController = require("../controllers/usersCtrl");
const isAuthenticated = require("../middlewares/isAuth");
const categoryController = require("../controllers/categoryCtrl");
const transactionController = require("../controllers/transactionCtrl");
const transactionRouter = express.Router();

//!add
transactionRouter.post(
  "/transactions/create",
  isAuthenticated,
  transactionController.create
);

//! lists
transactionRouter.get(
  "/transactions/lists",
  isAuthenticated,
  transactionController.getFilteredTransactions
);

//! update
// transactionRouter.put(
//   "/transactions/update/:id",
//   isAuthenticated,
//   transactionController.update
// );

//! delete
transactionRouter.delete(
  "/transactions/delete/:id",
  isAuthenticated,
  transactionController.delete
);

module.exports = transactionRouter;