const catchAsync = require("../utils/catchAsync");
const db = require("../db/models/index");
const {} = require("../common/dtos/banktype.dto.sample");

const getAllBankType = catchAsync(async (req, res) => {
  const banktype = await db.banktype.findAll();
  res.status(200).json({
    status: "success",
    data: banktype,
  });
});

const createBanktype = catchAsync(async (req, res) => {
  const { name, description } = req.body;

  const banktype = await db.banktype.findOne({
    where: { name: name },
  });
  if (!banktype) {
    const newBankType = await db.banktype.create({
      name,
      description,
    });

    res.status(201).json({
      status: "success",
      data: newBankType,
    });
  } else {
    res.status(404).json({
      status: "error",
      message: "Banktype is already exist",
    });
  }
});

const updateBanktype = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const banktype = await db.banktype.findByPk(id);
  if (!banktype) {
    return res.status(404).json({
      status: "error",
      message: "Banktype not found",
    });
  }

  // Update bankflow fields
  banktype.name = name !== undefined ? name : banktype.name;
  banktype.description =
    description !== undefined ? description : banktype.description;

  await banktype.save();

  res.status(200).json({
    status: "success",
    data: banktype,
  });
});

const deleteBanktype = catchAsync(async (req, res) => {
  const { id } = req.params;
  const banktype = await db.banktype.findByPk(id);
  if (!banktype) {
    return res.status(404).json({
      status: "error",
      message: "Banktype not found",
    });
  }

  await banktype.destroy();

  res.status(204).json({
    status: "success",
    message: "Banktype deleted successfully",
  });
});

module.exports = {
  getAllBankType,
  createBanktype,
  updateBanktype,
  deleteBanktype,
};
