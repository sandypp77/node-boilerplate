const catchAsync = require("../utils/catchAsync");
const db = require("../db/models/index");
const { bankDTO } = require("../common/dtos/bank");
const { bankCommand } = require("../common/commands/bank");
const { Op } = require("sequelize");
const XLSX = require("xlsx");
const fs = require("fs");

const getAllBank = catchAsync(async (req, res) => {
  const banks = await db.bank.findAll();
  res.status(200).json({
    status: "success",
    data: banks,
  });
});

const getBank = catchAsync(async (req, res) => {
  const { id } = req.params;
  const bank = await db.bank.findByPk(id);
  if (!bank) {
    return res.status(404).json({
      status: "error",
      message: "Bank not found",
    });
  }
  res.status(200).json({
    status: "success",
    data: bank,
  });
});

const getBankByType = catchAsync(async (req, res) => {
  const { type } = req.params;
  const { count, rows } = await db.bank.findAndCountAll({
    where: {
      bank_type_id: type,
    },
  });
  res.status(200).json({
    status: "success",
    data: rows,
    totalRows: count,
  });
});

const getBankPagination = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    proof_number,
    opposition_coa,
    opposition_account_id,
    start_date,
    end_date,
    description,
  } = req.query;
  const offset = (page - 1) * limit;
  const whereCondition = {};

  if (type) whereCondition.bank_type_id = type;
  if (proof_number) whereCondition.proof_number = proof_number;
  if (opposition_coa) {
    const account = await db.account.findAll({
      where: { coa: opposition_coa },
    });
    whereCondition.opposition_account_id = 0;
    if (account.length > 0) {
      var accounts = [];
      account.forEach((i) => {
        accounts.push(i.dataValues.id);
      });
      console.log(accounts);
      whereCondition.opposition_account_id = { [Op.in]: accounts };
    }
  }
  if (opposition_account_id)
    whereCondition.opposition_account_id = opposition_account_id;
  if (start_date && end_date)
    whereCondition.date_proposed = {
      [Op.between]: [new Date(start_date), new Date(end_date)],
    };
  if (description) whereCondition.description = description;

  const { count, rows } = await db.bank.findAndCountAll({
    where: whereCondition,
    limit: limit,
    offset: offset,
    include: [
      { model: db.account, as: "account" },
      { model: db.account, as: "opposition_account" },
      { model: db.banktype, as: "banktype" },
    ],
    order: [["id", "ASC"]],
  });

  const dtos = rows.map((bank) => bankDTO(bank));
  res.status(200).json({
    status: "success",
    data: dtos,
    pagination: {
      currentPage: parseInt(page, 10),
      pageSize: parseInt(limit, 10),
      totalRows: count,
    },
  });
});

const getExportExcel = catchAsync(async (req, res) => {
  const {
    type,
    proof_number,
    opposition_coa,
    opposition_account_id,
    start_date,
    end_date,
    description,
  } = req.query;
  const { initialBalance } = req.params;
  const whereCondition = {};

  if (type) whereCondition.bank_type_id = type;
  if (proof_number) whereCondition.proof_number = proof_number;
  if (opposition_coa) {
    const account = await db.account.findAll({
      where: { coa: opposition_coa },
    });
    whereCondition.opposition_account_id = 0;
    if (account.length > 0) {
      var accounts = [];
      account.forEach((i) => {
        accounts.push(i.dataValues.id);
      });
      console.log(accounts);
      whereCondition.opposition_account_id = { [Op.in]: accounts };
    }
  }
  if (opposition_account_id)
    whereCondition.opposition_account_id = opposition_account_id;
  if (start_date && end_date)
    whereCondition.date_proposed = {
      [Op.between]: [new Date(start_date), new Date(end_date)],
    };
  if (description) whereCondition.description = description;

  const { count, rows } = await db.bank.findAndCountAll({
    where: whereCondition,
    include: [
      { model: db.account, as: "account" },
      { model: db.account, as: "opposition_account" },
      { model: db.banktype, as: "banktype" },
    ],
    order: [["id", "ASC"]],
  });

  const dtos = rows.map((bank) => bankDTO(bank));
  try {
    // Convert data to JSON
    var data = dtos.map((data) => data);

    // Define the columns you want to include in the export
    const columnsToInclude = [
      "proof_number",
      "opposition_coa",
      "opposition_account",
      "date_proposed",
      "description",
      "debit",
      "credit",
      "coa",
      "account",
      "balance",
    ];

    let balance = Number(initialBalance);

    // Filter the data to include only specified columns
    data = data.map((item) => {
      let filteredData = {};
      let debit = Number(item.debit) || 0;
      let credit = Number(item.credit) || 0;

      balance = balance + debit - credit;

      columnsToInclude.forEach((column) => {
        if (column === "balance") {
          filteredData[column] = balance;
        } else {
          filteredData[column] = item[column];
        }
      });
      return filteredData;
    });

    const headers = {
      proof_number: "NOMOR BUKTI",
      opposition_coa: "COA LAWAN",
      opposition_account: "AKUN LAWAN",
      date_proposed: "TANGGAL",
      description: "KETERANGAN",
      debit: "DEBIT",
      credit: "KREDIT",
      balance: "SALDO",
      coa: "COA",
      account: "AKUN",
    };

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: Object.keys(headers),
    });

    // Add custom headers
    const headerRow = Object.values(headers);
    XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: "A1" });

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
    ];

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `KAS-${Date.now()}`);

    // Write workbook to a buffer
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Set response headers and send file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=KAS-${Date.now()}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

const importExcel = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Read and parse the uploaded Excel file
  const workbook = XLSX.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  for (const row of data) {
    // console.log(row);
    // Mapping data
    const processedRow = {
      proof_number: row["NOMOR BUKTI"],
      opposition_account: row["AKUN LAWAN"],
      date_proposed: new Date((row["TANGGAL"] - (25567 + 2)) * 86400 * 1000), // Convert Excel date to JS date
      description: row["KETERANGAN"],
      debit: row["DEBIT"],
      credit: row["KREDIT"],
      account: row["AKUN"],
    };

    const account = await db.account.findOne({
      where: { name: processedRow.account },
    });
    if (!account) throw new Error(`Account ${processedRow.account} not found`);

    const opposition_account = await db.account.findOne({
      where: { name: processedRow.opposition_account },
    });
    if (!opposition_account)
      throw new Error(
        `Opposition Account ${processedRow.opposition_account} not found`
      );

    const banktype = await db.banktype.findOne({
      where: { name: processedRow.proof_number.split("/")[0] },
    });
    if (!banktype)
      throw new Error(`Cashtype ${processedRow.proof_number} not found`);

    const bank = await db.bank.findOne({
      where: { proof_number: processedRow.proof_number },
    });

    if (bank)
      throw new Error(`Bank ${processedRow.proof_number} is already exist`);

    const command = {
      proof_number: processedRow.proof_number,
      opposition_account_id: opposition_account.dataValues.id,
      account_id: account.dataValues.id,
      date_proposed: processedRow.date_proposed,
      description: processedRow.description,
      debit: processedRow.debit,
      credit: processedRow.credit,
      bank_type_id: banktype.dataValues.id,
    };
    await db.bank.create(command);
  }

  // Delete the uploaded file after processing
  fs.unlink(req.file.path, (err) => {
    if (err) console.error(err);
    console.log("Temporary file deleted");
  });

  res.json({ message: "Data imported successfully" });
});

const createBank = catchAsync(async (req, res) => {
  const {
    proof_number,
    account_id,
    opposition_account_id,
    date_proposed,
    description,
    debit,
    credit,
    bank_type_id,
  } = req.body;

  const bank = await db.bank.findOne({
    where: { proof_number: proof_number },
  });
  if (!bank) {
    const newBank = await db.bank.create({
      proof_number,
      account_id,
      opposition_account_id,
      date_proposed,
      description,
      debit,
      credit,
      bank_type_id,
    });

    res.status(201).json({
      status: "success",
      data: newBank,
    });
  } else {
    res.status(404).json({
      status: "error",
      message: "Bank is already exist",
    });
  }
});

const updateBank = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    proof_number,
    account_id,
    opposition_account_id,
    date_proposed,
    description,
    debit,
    credit,
    bank_flow_num,
  } = req.body;

  const bank = await db.bank.findByPk(id);
  if (!bank) {
    return res.status(404).json({
      status: "error",
      message: "Bank not found",
    });
  }

  // Update bank fields
  bank.proof_number =
    proof_number !== undefined ? proof_number : bank.proof_number;
  bank.account_id =
    account_id !== undefined ? account_id : bank.account_id;
  bank.opposition_account_id =
    opposition_account_id !== undefined
      ? opposition_account_id
      : bank.opposition_account_id;
  bank.date_proposed =
    date_proposed !== undefined ? date_proposed : bank.date_proposed;
  bank.description =
    description !== undefined ? description : bank.description;
  bank.debit = debit !== undefined ? debit : bank.debit;
  bank.credit = credit !== undefined ? credit : bank.credit;
  bank.bank_flow_num =
    bank_flow_num !== undefined ? bank_flow_num : bank.bank_flow_num;

  await bank.save();

  res.status(200).json({
    status: "success",
    data: bank,
  });
});

const deleteBank = catchAsync(async (req, res) => {
  const { id } = req.params;
  const bank = await db.bank.findByPk(id);
  if (!bank) {
    return res.status(404).json({
      status: "error",
      message: "Bank not found",
    });
  }

  await bank.destroy();

  res.status(204).json({
    status: "success",
    message: "Bank deleted successfully",
  });
});

module.exports = {
  getAllBank,
  getBank,
  getBankByType,
  getBankPagination,
  createBank,
  updateBank,
  deleteBank,
  getExportExcel,
  importExcel,
};
