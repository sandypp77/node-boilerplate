const catchAsync = require("../utils/catchAsync");
const db = require("../db/models/index");

const getAllAccounts = catchAsync(async (req, res) => {
  const accounts = await db.account.findAll();
  res.status(200).json({
    status: "success",
    data: accounts,
  });
});

const getAccountPagination = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await db.account.findAndCountAll({
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [["id", "ASC"]],
  });

  res.status(200).json({
    status: "success",
    data: rows,
    pagination: {
      currentPage: parseInt(page, 10),
      pageSize: parseInt(limit, 10),
      totalRows: count,
    },
  });
});

const createAccount = catchAsync(async (req, res) => {
  const { name, coa, description } = req.body;
  try {
    const acc = await db.account.findOne({ where: { name: name } });
    if (!acc) {
      const newAcc = await db.account.create({ name, coa, description });
      res.status(201).json({
        status: "success",
        data: newAcc,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Account COA is already exist",
      });
    }
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

const updateAccount = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, coa, description } = req.body;
  const account = await db.account.findByPk(id);
  if (!account) {
    return res.status(404).json({
      status: "error",
      message: "Account not found",
    });
  }

  account.name = name !== undefined ? name : account.name;
  account.coa = coa !== undefined ? coa : account.coa;
  account.description =
    description !== undefined ? description : account.description;
  await account.save();

  res.status(200).json({
    status: "success",
    data: account,
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  const { id } = req.params;
  const account = await db.account.findByPk(id);
  if (!account) {
    return res.status(404).json({
      status: "error",
      message: "Account not found",
    });
  }

  await account.destroy();

  res.status(204).json({
    status: "success",
    message: "Account deleted successfully",
  });
});

module.exports = {
  getAllAccounts,
  getAccountPagination,
  createAccount,
  updateAccount,
  deleteAccount,
};
