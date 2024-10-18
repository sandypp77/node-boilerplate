const banktypeDTO = (banktype) => {
  return {
    id: banktype.id,
    name: banktype.name,
    desc: banktype.desc,
  };
};

module.exports = { banktypeDTO };
