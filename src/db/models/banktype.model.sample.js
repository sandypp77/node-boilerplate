module.exports = (sequalize, DataTypes) => {
  const banktype = sequalize.define("banktype", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  banktype.associate = (models) => {
    banktype.hasMany(models.bank, {
      foreignKey: "bank_type_id",
      as: "banktype",
    });
  };

  return banktype;
};
