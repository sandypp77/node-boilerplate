module.exports = (sequelize, DataTypes) => {
  const bank = sequelize.define("bank", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    proof_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    opposition_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date_proposed: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    debit: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    credit: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    bank_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  bank.associate = (models) => {
    bank.belongsTo(models.account, {
      foreignKey: "account_id",
      as: "account",
    });
    bank.belongsTo(models.account, {
      foreignKey: "opposition_account_id",
      as: "opposition_account",
    });
    bank.belongsTo(models.banktype, {
      foreignKey: "bank_type_id",
      as: "banktype",
    });
  };

  return bank;
};
