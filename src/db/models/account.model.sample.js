module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define("account", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  account.associate = (models) => {
    account.hasMany(models.cashflow, {
      foreignKey: "account_id",
      as: "cashflows",
    });
    account.hasMany(models.cashflow, {
      foreignKey: "opposition_account_id",
      as: "cashflows_opp",
    });
  };

  return account;
};
